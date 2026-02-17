import fs from 'node:fs/promises';
import path from 'node:path';
import { format } from 'date-fns';
import { ensureNoteExists } from './fileService';
import { loadConfig } from './configService';
import { getDailyNotesDir, getArchivedDailyNotesDir } from '../utils/paths';

const DAILY_NOTES_FOLDER = 'Daily Notes';

function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || `{{${key}}}`);
}

function getDefaultTemplate(): string {
  return `{{longDate}}

## Tasks
#### High Prioirity
- [ ]

#### Med Prioirity
- [ ]

#### Low Prioirity
- [ ]

#### Completed Yesterday


## Notes
-

## Journal
-

`;
}

/**
 * Find the most recent daily note before today.
 * Daily notes are named YYYY-MM-DD.md, so we sort descending and pick
 * the first one that comes before today's date string.
 */
async function findPreviousDailyNote(todayStr: string): Promise<string | null> {
  try {
    const dailyDir = getDailyNotesDir();
    const archivedDir = getArchivedDailyNotesDir();

    // Scan both the main Daily Notes folder and the Archived subfolder
    const mainEntries = await fs.readdir(dailyDir);
    let archivedEntries: string[] = [];
    try {
      archivedEntries = await fs.readdir(archivedDir);
    } catch {
      // Archived folder may not exist yet
    }

    const allNotes: { dateStr: string; fullPath: string }[] = [];

    for (const e of mainEntries) {
      if (/^\d{4}-\d{2}-\d{2}\.md$/.test(e)) {
        const dateStr = e.replace('.md', '');
        if (dateStr < todayStr) {
          allNotes.push({ dateStr, fullPath: path.join(dailyDir, e) });
        }
      }
    }

    for (const e of archivedEntries) {
      if (/^\d{4}-\d{2}-\d{2}\.md$/.test(e)) {
        const dateStr = e.replace('.md', '');
        if (dateStr < todayStr) {
          allNotes.push({ dateStr, fullPath: path.join(archivedDir, e) });
        }
      }
    }

    if (allNotes.length === 0) return null;

    allNotes.sort((a, b) => b.dateStr.localeCompare(a.dateStr));
    return allNotes[0].fullPath;
  } catch {
    return null;
  }
}

/**
 * Archive daily notes older than 7 days by moving them to the Archived subfolder.
 */
async function archiveOldDailyNotes(): Promise<void> {
  try {
    const dailyDir = getDailyNotesDir();
    const archivedDir = getArchivedDailyNotesDir();
    await fs.mkdir(archivedDir, { recursive: true });

    const entries = await fs.readdir(dailyDir);
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

    for (const entry of entries) {
      const match = entry.match(/^(\d{4})-(\d{2})-(\d{2})\.md$/);
      if (!match) continue;

      const noteDate = new Date(
        parseInt(match[1], 10),
        parseInt(match[2], 10) - 1,
        parseInt(match[3], 10)
      );

      if (noteDate < cutoff) {
        await fs.rename(
          path.join(dailyDir, entry),
          path.join(archivedDir, entry)
        );
      }
    }
  } catch {
    // If archiving fails, don't block the app
  }
}

/**
 * Find the ## heading in a document that contains task items (- [ ] or - [x]).
 * Returns the heading text (e.g. "## Tasks") or null if none found.
 */
function findTaskSectionHeading(content: string): string | null {
  const lines = content.split('\n');
  let currentH2: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^## /.test(trimmed)) {
      currentH2 = trimmed;
    } else if (currentH2 && /^- \[[ xX]\]/.test(trimmed)) {
      return currentH2;
    }
  }

  return null;
}

/**
 * Extract the task section from a daily note's content.
 * Dynamically finds the ## heading that contains task items,
 * then captures everything from after that heading until the next ## heading.
 */
function extractTaskSection(content: string): string | null {
  const heading = findTaskSectionHeading(content);
  if (!heading) return null;

  const lines = content.split('\n');
  let startIdx = -1;
  let endIdx = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (startIdx === -1) {
      if (trimmed === heading) {
        startIdx = i;
      }
    } else {
      if (/^## /.test(trimmed)) {
        endIdx = i;
        break;
      }
    }
  }

  if (startIdx === -1) return null;

  return lines.slice(startIdx + 1, endIdx).join('\n');
}

/**
 * Filter a task section to only keep uncompleted items and their
 * priority subheadings. Drops subheadings that have no uncompleted items
 * beneath them, and removes completed items (- [x]).
 */
function filterUncompletedTodos(todoBody: string): string {
  const lines = todoBody.split('\n');
  const result: string[] = [];
  let currentHeading: string | null = null;
  let pendingItems: string[] = [];

  function flushPending() {
    if (pendingItems.length > 0 && currentHeading !== null) {
      result.push(currentHeading);
      result.push(...pendingItems);
    }
    pendingItems = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();

    // Subheading (#### or ###)
    if (/^#{3,6}\s+/.test(trimmed)) {
      flushPending();
      currentHeading = line;
      continue;
    }

    // Uncompleted task with actual content (not just empty "- [ ] ")
    if (/^- \[ \]\s*\S/.test(trimmed)) {
      pendingItems.push(line);
      continue;
    }

    // Empty uncompleted task (just "- [ ]" or "- [ ] ") — skip it
    if (/^- \[ \]\s*$/.test(trimmed)) {
      continue;
    }

    // Completed task — skip it
    if (/^- \[[xX]\]/.test(trimmed)) {
      continue;
    }

    // Any other non-empty line under a heading (could be a sub-item / note)
    if (trimmed.length > 0 && pendingItems.length > 0) {
      pendingItems.push(line);
    }
  }

  flushPending();

  // If no heading was ever set but there are bare uncompleted items, include them
  if (result.length === 0 && currentHeading === null) {
    for (const line of lines) {
      if (/^- \[ \]\s*\S/.test(line.trim())) {
        result.push(line);
      }
    }
  }

  return result.join('\n');
}

/**
 * Find the task section heading in the rendered template.
 * Tries to find a ## heading that contains task items, or falls back
 * to common names like "## TODO" or "## Tasks".
 */
function findTemplateSectionHeading(renderedTemplate: string): string | null {
  // First try to find a heading with actual task items
  const dynamic = findTaskSectionHeading(renderedTemplate);
  if (dynamic) return dynamic;

  // Fall back to common heading names
  const lines = renderedTemplate.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^## (TODO|Tasks|Task)\s*$/i.test(trimmed)) {
      return trimmed;
    }
  }

  return null;
}

/**
 * Merge carried-over task items into the rendered template.
 * Finds the task section in the template and inserts the carried-over
 * items under matching priority subheadings.
 */
function mergeTasksIntoTemplate(
  renderedTemplate: string,
  carriedTodos: string,
  completedYesterday: string = ''
): string {
  if (!carriedTodos.trim() && !completedYesterday.trim()) return renderedTemplate;

  const taskHeading = findTemplateSectionHeading(renderedTemplate);
  const lines = renderedTemplate.split('\n');
  let todoSectionStart = -1;
  let nextSectionStart = -1;

  if (taskHeading) {
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (todoSectionStart === -1) {
        if (trimmed === taskHeading) {
          todoSectionStart = i;
        }
      } else if (/^## /.test(trimmed)) {
        nextSectionStart = i;
        break;
      }
    }
  }

  if (todoSectionStart === -1) {
    // No task section in template — append one at the end
    return renderedTemplate + '\n## Tasks\n' + carriedTodos + '\n';
  }

  const insertAt = nextSectionStart === -1 ? lines.length : nextSectionStart;
  const templateTodoBody = lines.slice(todoSectionStart + 1, insertAt);

  // Check if the template task body has subheadings
  const hasTemplateContent = templateTodoBody.some(
    (l) => /^#{3,6}\s+/.test(l.trim())
  );

  if (hasTemplateContent) {
    // Build ordered subheading lists (excluding "Completed Yesterday")
    const carriedSubheadings = carriedTodos
      .split('\n')
      .filter((l) => /^#{3,6}\s+/.test(l.trim()))
      .map((l) => l.trim());

    const templateSubheadings = templateTodoBody
      .filter((l) => /^#{3,6}\s+/.test(l.trim()) && !/completed yesterday/i.test(l))
      .map((l) => l.trim());

    // Positional mapping: template heading → carried heading
    const templateToCarriedMap = new Map<string, string>();
    for (let j = 0; j < templateSubheadings.length && j < carriedSubheadings.length; j++) {
      templateToCarriedMap.set(templateSubheadings[j], carriedSubheadings[j]);
    }

    const mergedLines: string[] = [];
    let i = todoSectionStart + 1;

    while (i < insertAt) {
      const trimmed = lines[i].trim();
      mergedLines.push(lines[i]);

      if (/^#{3,6}\s+/.test(trimmed)) {
        // Insert completed items under "Completed Yesterday" heading
        if (/^#{3,6}\s+Completed Yesterday\s*$/i.test(trimmed) && completedYesterday.trim()) {
          mergedLines.push(...completedYesterday.trim().split('\n'));
        }

        // Use positional mapping to find carried items for this template heading
        const carriedHeading = templateToCarriedMap.get(trimmed);
        if (carriedHeading) {
          const carriedForHeading = getItemsUnderHeading(carriedTodos, carriedHeading);
          if (carriedForHeading.length > 0) {
            mergedLines.push(...carriedForHeading);
          }
        }
      }
      i++;
    }

    // Append any extra carried headings that didn't have a template match
    const mappedCarried = new Set(templateToCarriedMap.values());
    for (const heading of carriedSubheadings) {
      if (!mappedCarried.has(heading)) {
        const items = getItemsUnderHeading(carriedTodos, heading);
        if (items.length > 0) {
          mergedLines.push(heading);
          mergedLines.push(...items);
        }
      }
    }

    const before = lines.slice(0, todoSectionStart + 1);
    const after = lines.slice(insertAt);
    return [...before, ...mergedLines, ...after].join('\n');
  } else {
    const before = lines.slice(0, todoSectionStart + 1);
    const after = lines.slice(insertAt);
    return [...before, carriedTodos, '', ...after].join('\n');
  }
}

/**
 * Extract completed task items from a task section body.
 * Returns them as a flat list of "- [x] ..." lines (no subheadings).
 */
function filterCompletedTodos(todoBody: string): string {
  const lines = todoBody.split('\n');
  const result: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^- \[[xX]\]\s*\S/.test(trimmed)) {
      result.push(trimmed.replace(/^- \[[xX]\]\s*/, '- '));
    }
  }

  return result.join('\n');
}

/**
 * Get the task lines under a specific heading in a task section body.
 */
function getItemsUnderHeading(todoBody: string, targetHeading: string): string[] {
  const lines = todoBody.split('\n');
  const items: string[] = [];
  let inTarget = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^#{3,6}\s+/.test(trimmed)) {
      inTarget = trimmed === targetHeading;
      continue;
    }
    if (inTarget && trimmed.length > 0) {
      items.push(line);
    }
  }

  return items;
}

export async function openOrCreateDailyNote(): Promise<{
  relativePath: string;
  content: string;
  isNew: boolean;
}> {
  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  const relativePath = path.join(DAILY_NOTES_FOLDER, `${todayStr}.md`);

  const config = await loadConfig();
  const template = config.dailyNoteTemplate || getDefaultTemplate();

  const renderedTemplate = renderTemplate(template, {
    date: format(now, 'yyyy-MM-dd'),
    longDate: format(now, 'EEEE, MMMM do, yyyy'),
    time: format(now, 'HH:mm'),
    year: format(now, 'yyyy'),
    month: format(now, 'MMMM'),
    day: format(now, 'dd'),
    weekday: format(now, 'EEEE'),
  });

  // Check if today's note already exists — if so, just open it
  try {
    const existingContent = await fs.readFile(
      path.join(getDailyNotesDir(), `${todayStr}.md`),
      'utf-8'
    );
    return { relativePath, content: existingContent, isNew: false };
  } catch {
    // Doesn't exist yet — create it with carried-over tasks
  }

  // Find and carry over uncompleted tasks from the previous daily note
  let finalContent = renderedTemplate;
  const previousNotePath = await findPreviousDailyNote(todayStr);

  if (previousNotePath) {
    try {
      const previousContent = await fs.readFile(previousNotePath, 'utf-8');
      const taskSection = extractTaskSection(previousContent);

      if (taskSection) {
        const uncompleted = filterUncompletedTodos(taskSection);
        const completed = filterCompletedTodos(taskSection);
        if (uncompleted.trim() || completed.trim()) {
          finalContent = mergeTasksIntoTemplate(renderedTemplate, uncompleted, completed);
        }
      }
    } catch {
      // If reading previous note fails, just use the template as-is
    }
  }

  const { content } = await ensureNoteExists(relativePath, finalContent);

  // Archive old daily notes after creating today's note
  await archiveOldDailyNotes();

  return { relativePath, content, isNew: true };
}
