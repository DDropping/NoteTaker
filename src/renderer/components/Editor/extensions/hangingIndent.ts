import {
  ViewPlugin,
  ViewUpdate,
  Decoration,
  DecorationSet,
  EditorView,
} from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';

// Matches list item prefix: leading whitespace + marker + space + optional task marker + space
const LIST_PREFIX_RE = /^(\s*)([-*+]|\d+[.)])\s(\[[ xX]\]\s)?/;

function buildDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();

  for (const { from, to } of view.visibleRanges) {
    for (let pos = from; pos <= to; ) {
      const line = view.state.doc.lineAt(pos);
      const match = line.text.match(LIST_PREFIX_RE);
      if (match) {
        const indentChars = match[0].length;
        builder.add(
          line.from,
          line.from,
          Decoration.line({
            attributes: {
              style: `padding-left: ${indentChars}ch; text-indent: -${indentChars}ch;`,
            },
          })
        );
      }
      pos = line.to + 1;
    }
  }

  return builder.finish();
}

export const hangingIndentPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildDecorations(update.view);
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);
