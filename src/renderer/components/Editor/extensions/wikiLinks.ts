import {
  ViewPlugin,
  Decoration,
  DecorationSet,
  WidgetType,
  EditorView,
  ViewUpdate,
} from '@codemirror/view';
import { Range } from '@codemirror/state';

const WIKI_LINK_RE = /\[\[([^\]]+)\]\]/g;

class WikiLinkWidget extends WidgetType {
  constructor(readonly target: string) {
    super();
  }

  toDOM(view: EditorView): HTMLElement {
    const span = document.createElement('span');
    span.className = 'cm-wiki-link';
    span.textContent = this.target;
    span.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      view.dom.dispatchEvent(
        new CustomEvent('wiki-link-click', {
          detail: { target: this.target },
          bubbles: true,
        })
      );
    });
    return span;
  }

  eq(other: WikiLinkWidget) {
    return other.target === this.target;
  }
}

function buildWikiLinkDecorations(view: EditorView): DecorationSet {
  const decorations: Range<Decoration>[] = [];
  const cursor = view.state.selection.main;
  const doc = view.state.doc;

  for (let i = 1; i <= doc.lines; i++) {
    const line = doc.line(i);
    const lineText = line.text;
    let match: RegExpExecArray | null;

    WIKI_LINK_RE.lastIndex = 0;
    while ((match = WIKI_LINK_RE.exec(lineText)) !== null) {
      const from = line.from + match.index;
      const to = from + match[0].length;

      // If cursor is inside this wiki link, show raw syntax
      if (cursor.from <= to && cursor.to >= from) {
        continue;
      }

      decorations.push(
        Decoration.replace({
          widget: new WikiLinkWidget(match[1]),
        }).range(from, to)
      );
    }
  }

  return Decoration.set(decorations, true);
}

export const wikiLinkPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildWikiLinkDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged || update.selectionSet) {
        this.decorations = buildWikiLinkDecorations(update.view);
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);
