import {
  ViewPlugin,
  Decoration,
  DecorationSet,
  WidgetType,
  EditorView,
  ViewUpdate,
} from '@codemirror/view';
import { Range } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

class LinkWidget extends WidgetType {
  constructor(readonly text: string, readonly url: string) {
    super();
  }

  toDOM(): HTMLElement {
    const span = document.createElement('span');
    span.className = 'cm-link-text';
    span.textContent = this.text;
    span.style.cursor = 'pointer';
    span.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.api && window.api.openExternal) {
        window.api.openExternal(this.url);
      }
    });
    return span;
  }

  eq(other: LinkWidget) {
    return other.text === this.text && other.url === this.url;
  }

  ignoreEvent() {
    return false;
  }
}

class BulletWidget extends WidgetType {
  toDOM(): HTMLElement {
    const span = document.createElement('span');
    span.className = 'cm-bullet';
    span.textContent = '•';
    return span;
  }

  eq() {
    return true;
  }

  ignoreEvent() {
    return true;
  }
}

const COPY_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
const CHECK_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

class CodeBlockCopyWidget extends WidgetType {
  constructor(readonly code: string) {
    super();
  }

  toDOM(): HTMLElement {
    const wrapper = document.createElement('span');
    wrapper.className = 'cm-code-block-copy-wrapper';

    const button = document.createElement('button');
    button.className = 'cm-code-block-copy';
    button.title = 'Copy code';
    button.innerHTML = COPY_ICON;
    button.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      navigator.clipboard.writeText(this.code);
      button.innerHTML = CHECK_ICON;
      setTimeout(() => {
        button.innerHTML = COPY_ICON;
      }, 1500);
    });

    wrapper.appendChild(button);
    return wrapper;
  }

  eq(other: CodeBlockCopyWidget) {
    return other.code === this.code;
  }

  ignoreEvent() {
    return false;
  }
}

class CheckboxWidget extends WidgetType {
  constructor(readonly checked: boolean, readonly pos: number) {
    super();
  }

  toDOM(view: EditorView): HTMLElement {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = this.checked;
    input.className = 'cm-task-checkbox';
    input.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const newText = this.checked ? '[ ]' : '[x]';
      view.dispatch({
        changes: { from: this.pos, to: this.pos + 3, insert: newText },
      });
    });
    return input;
  }

  eq(other: CheckboxWidget) {
    return other.checked === this.checked && other.pos === this.pos;
  }

  ignoreEvent() {
    return false;
  }
}

function buildLivePreviewDecorations(view: EditorView): DecorationSet {
  const decorations: Range<Decoration>[] = [];
  const doc = view.state.doc;
  const cursorHead = view.state.selection.main.head;
  const cursorLine = doc.lineAt(cursorHead).number;

  syntaxTree(view.state).iterate({
    enter(node) {
      const nodeStartLine = doc.lineAt(node.from).number;
      const nodeEndLine = doc.lineAt(node.to).number;
      const cursorOnNode = cursorLine >= nodeStartLine && cursorLine <= nodeEndLine;

      switch (node.name) {
        case 'ATXHeading1':
        case 'ATXHeading2':
        case 'ATXHeading3':
        case 'ATXHeading4':
        case 'ATXHeading5':
        case 'ATXHeading6': {
          const level = node.name.charAt(node.name.length - 1);
          decorations.push(
            Decoration.line({ class: `cm-heading-${level}` }).range(
              doc.lineAt(node.from).from
            )
          );

          if (!cursorOnNode) {
            // Find and hide the # markers (HeaderMark nodes)
            const tree = syntaxTree(view.state);
            tree.iterate({
              from: node.from,
              to: node.to,
              enter(child) {
                if (child.name === 'HeaderMark') {
                  // Hide the ### and trailing space
                  const hideEnd = Math.min(child.to + 1, node.to);
                  decorations.push(
                    Decoration.replace({}).range(child.from, hideEnd)
                  );
                }
              },
            });
          }
          break;
        }

        case 'StrongEmphasis': {
          decorations.push(
            Decoration.mark({ class: 'cm-strong' }).range(node.from, node.to)
          );

          if (!cursorOnNode) {
            // Hide the ** markers
            const tree = syntaxTree(view.state);
            tree.iterate({
              from: node.from,
              to: node.to,
              enter(child) {
                if (child.name === 'EmphasisMark') {
                  decorations.push(
                    Decoration.replace({}).range(child.from, child.to)
                  );
                }
              },
            });
          }
          break;
        }

        case 'Emphasis': {
          decorations.push(
            Decoration.mark({ class: 'cm-emphasis' }).range(node.from, node.to)
          );

          if (!cursorOnNode) {
            const tree = syntaxTree(view.state);
            tree.iterate({
              from: node.from,
              to: node.to,
              enter(child) {
                if (child.name === 'EmphasisMark') {
                  decorations.push(
                    Decoration.replace({}).range(child.from, child.to)
                  );
                }
              },
            });
          }
          break;
        }

        case 'Strikethrough': {
          decorations.push(
            Decoration.mark({ class: 'cm-strikethrough' }).range(
              node.from,
              node.to
            )
          );

          if (!cursorOnNode) {
            const tree = syntaxTree(view.state);
            tree.iterate({
              from: node.from,
              to: node.to,
              enter(child) {
                if (child.name === 'StrikethroughMark') {
                  decorations.push(
                    Decoration.replace({}).range(child.from, child.to)
                  );
                }
              },
            });
          }
          break;
        }

        case 'InlineCode': {
          decorations.push(
            Decoration.mark({ class: 'cm-code-inline' }).range(
              node.from,
              node.to
            )
          );

          if (!cursorOnNode) {
            // Hide the backtick markers (CodeMark nodes)
            const tree = syntaxTree(view.state);
            tree.iterate({
              from: node.from,
              to: node.to,
              enter(child) {
                if (child.name === 'CodeMark') {
                  decorations.push(
                    Decoration.replace({}).range(child.from, child.to)
                  );
                }
              },
            });
          }
          break;
        }

        case 'FencedCode': {
          for (let l = nodeStartLine; l <= nodeEndLine; l++) {
            decorations.push(
              Decoration.line({ class: 'cm-code-block' }).range(
                doc.line(l).from
              )
            );
          }

          if (!cursorOnNode) {
            // Extract code content (lines between fences)
            const codeLines: string[] = [];
            for (let l = nodeStartLine + 1; l < nodeEndLine; l++) {
              codeLines.push(doc.line(l).text);
            }
            const codeContent = codeLines.join('\n');

            // Opening fence line: replace content with copy widget
            const openLine = doc.line(nodeStartLine);
            decorations.push(
              Decoration.line({ class: 'cm-code-block-open' }).range(openLine.from)
            );
            if (openLine.to > openLine.from) {
              decorations.push(
                Decoration.replace({
                  widget: new CodeBlockCopyWidget(codeContent),
                }).range(openLine.from, openLine.to)
              );
            }

            // Closing fence line: replace content with nothing
            const closeLine = doc.line(nodeEndLine);
            decorations.push(
              Decoration.line({ class: 'cm-code-block-close' }).range(closeLine.from)
            );
            if (closeLine.to > closeLine.from) {
              decorations.push(
                Decoration.replace({}).range(closeLine.from, closeLine.to)
              );
            }
          }
          break;
        }

        case 'Blockquote': {
          for (let l = nodeStartLine; l <= nodeEndLine; l++) {
            decorations.push(
              Decoration.line({ class: 'cm-blockquote-line' }).range(
                doc.line(l).from
              )
            );
          }
          break;
        }

        case 'HorizontalRule': {
          if (!cursorOnNode) {
            decorations.push(
              Decoration.line({ class: 'cm-hr-line' }).range(
                doc.lineAt(node.from).from
              )
            );
          }
          break;
        }

        case 'Link': {
          if (!cursorOnNode) {
            // Parse [text](url) structure from the syntax tree
            const fullText = view.state.sliceDoc(node.from, node.to);
            const match = fullText.match(/^\[([^\]]*)\]\(([^)]*)\)$/);
            if (match) {
              const linkText = match[1];
              const linkUrl = match[2];
              decorations.push(
                Decoration.replace({
                  widget: new LinkWidget(linkText, linkUrl),
                }).range(node.from, node.to)
              );
            } else {
              // Fallback: just style it
              decorations.push(
                Decoration.mark({ class: 'cm-link-text' }).range(node.from, node.to)
              );
            }
          } else {
            decorations.push(
              Decoration.mark({ class: 'cm-link-text' }).range(node.from, node.to)
            );
          }
          break;
        }

        case 'ListMark': {
          const markerText = view.state.sliceDoc(node.from, node.to);
          // Only replace unordered list markers (-, *, +), not ordered (1., 2., etc.)
          if (/^[-*+]$/.test(markerText)) {
            // Skip if this is a task list item (followed by space + "[")
            const afterMark = view.state.sliceDoc(node.to, node.to + 2);
            if (afterMark !== ' [') {
              decorations.push(
                Decoration.replace({
                  widget: new BulletWidget(),
                }).range(node.from, node.to)
              );
            }
          }
          break;
        }

        case 'TaskMarker': {
          const markerText = view.state.sliceDoc(node.from, node.to);
          const isChecked = markerText.includes('x') || markerText.includes('X');

          if (isChecked) {
            const line = doc.lineAt(node.from);
            decorations.push(
              Decoration.line({ class: 'cm-task-checked' }).range(line.from)
            );
          }

          // Always replace "- [ ]" or "- [x]" with a clickable checkbox widget
          {
            const replaceFrom = node.from >= 2 && view.state.sliceDoc(node.from - 2, node.from) === '- '
              ? node.from - 2
              : node.from;
            decorations.push(
              Decoration.replace({
                widget: new CheckboxWidget(isChecked, node.from),
              }).range(replaceFrom, node.to)
            );
          }
          break;
        }
      }
    },
  });

  // Sort decorations by position to avoid CM6 ordering errors
  decorations.sort((a, b) => a.from - b.from || a.value.startSide - b.value.startSide);

  return Decoration.set(decorations, true);
}

export const livePreviewPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildLivePreviewDecorations(view);
    }

    update(update: ViewUpdate) {
      if (
        update.docChanged ||
        update.viewportChanged ||
        update.selectionSet
      ) {
        this.decorations = buildLivePreviewDecorations(update.view);
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);
