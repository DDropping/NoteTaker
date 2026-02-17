import fs from 'node:fs/promises';
import path from 'node:path';
import { getNotesDir, getConfigDir, getDailyNotesDir, getArchivedDailyNotesDir, resolveSafe } from '../utils/paths';
import { FileNode } from '../../shared/types';

export async function ensureNotesDirectory(): Promise<void> {
  await fs.mkdir(getNotesDir(), { recursive: true });
  await fs.mkdir(getConfigDir(), { recursive: true });
  await fs.mkdir(getDailyNotesDir(), { recursive: true });
  await fs.mkdir(getArchivedDailyNotesDir(), { recursive: true });
}

export async function readNote(relativePath: string): Promise<string> {
  const fullPath = resolveSafe(relativePath);
  return fs.readFile(fullPath, 'utf-8');
}

export async function writeNote(relativePath: string, content: string): Promise<void> {
  const fullPath = resolveSafe(relativePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content, 'utf-8');
}

export async function deleteNote(relativePath: string): Promise<void> {
  const fullPath = resolveSafe(relativePath);
  await fs.unlink(fullPath);
}

export async function renameNote(oldPath: string, newPath: string): Promise<void> {
  const fullOld = resolveSafe(oldPath);
  const fullNew = resolveSafe(newPath);
  await fs.mkdir(path.dirname(fullNew), { recursive: true });
  await fs.rename(fullOld, fullNew);
}

export async function createFolder(relativePath: string): Promise<void> {
  const fullPath = resolveSafe(relativePath);
  await fs.mkdir(fullPath, { recursive: true });
}

export async function deleteFolder(relativePath: string): Promise<void> {
  const fullPath = resolveSafe(relativePath);
  await fs.rm(fullPath, { recursive: true, force: true });
}

export async function ensureNoteExists(
  relativePath: string,
  defaultContent?: string
): Promise<{ created: boolean; content: string }> {
  const fullPath = resolveSafe(relativePath);
  try {
    const content = await fs.readFile(fullPath, 'utf-8');
    return { created: false, content };
  } catch {
    const content = defaultContent || '';
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
    return { created: true, content };
  }
}

export async function listFileTree(dir?: string): Promise<FileNode[]> {
  const targetDir = dir || getNotesDir();
  const entries = await fs.readdir(targetDir, { withFileTypes: true });
  const nodes: FileNode[] = [];

  const sorted = entries
    .filter((e) => !e.name.startsWith('.'))
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

  for (const entry of sorted) {
    const fullPath = path.join(targetDir, entry.name);
    const relativePath = path.relative(getNotesDir(), fullPath);

    if (entry.isDirectory()) {
      const children = await listFileTree(fullPath);
      nodes.push({
        name: entry.name,
        relativePath,
        type: 'folder',
        children,
      });
    } else if (entry.name.endsWith('.md')) {
      nodes.push({
        name: entry.name,
        relativePath,
        type: 'file',
      });
    }
  }

  return nodes;
}
