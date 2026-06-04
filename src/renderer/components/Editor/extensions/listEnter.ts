import { EditorView } from '@codemirror/view';
import { indentLess } from '@codemirror/commands';

// Matches a line that is an *empty* list item: leading whitespace + marker +
// optional task marker, with no content after it.
const EMPTY_LIST_ITEM_RE = /^(\s*)([-*+]|\d+[.)])(?:\s+\[[ xX]\])?\s*$/;

/**
 * Enter handler for empty list items.
 *
 * When the cursor sits on a bullet that has no content:
 *  - if it is indented, remove one level of indent (same as Shift-Tab)
 *  - once it reaches the base level, remove the marker and break to a new line
 *
 * Bullets with content fall through to the default Enter behavior.
 */
export function listEnter(view: EditorView): boolean {
  const { state } = view;
  const { selection } = state;

  // Only handle a single, empty (non-range) cursor.
  if (selection.ranges.length !== 1 || !selection.main.empty) return false;

  const line = state.doc.lineAt(selection.main.head);
  const match = EMPTY_LIST_ITEM_RE.exec(line.text);
  if (!match) return false;

  const indent = match[1];

  if (indent.length > 0) {
    // Indented: outdent one level, exactly like Shift-Tab.
    return indentLess(view);
  }

  // Base level: drop the marker so the cursor lands on a plain empty line,
  // breaking out of the list.
  view.dispatch({
    changes: { from: line.from, to: line.to, insert: '' },
    selection: { anchor: line.from },
    scrollIntoView: true,
  });
  return true;
}
