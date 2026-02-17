import { useEffect, useRef } from 'react';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, drawSelection } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentMore, indentLess } from '@codemirror/commands';
import { searchKeymap } from '@codemirror/search';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { bracketMatching, indentUnit } from '@codemirror/language';
import { createMarkdownExtension } from './extensions/markdownSetup';
import { createEditorTheme } from './extensions/theme';
import { wikiLinkPlugin } from './extensions/wikiLinks';
import { livePreviewPlugin } from './extensions/livePreview';

const themeCompartment = new Compartment();
const languageCompartment = new Compartment();

interface UseCodeMirrorConfig {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isDark: boolean;
  onContentChange: (content: string) => void;
  onWikiLinkClick: (target: string) => void;
}

export function useCodeMirror({
  containerRef,
  isDark,
  onContentChange,
  onWikiLinkClick,
}: UseCodeMirrorConfig) {
  const viewRef = useRef<EditorView | null>(null);
  const onContentChangeRef = useRef(onContentChange);
  const onWikiLinkClickRef = useRef(onWikiLinkClick);

  // Keep refs current without re-running effects
  onContentChangeRef.current = onContentChange;
  onWikiLinkClickRef.current = onWikiLinkClick;

  // Create editor on mount — containerRef is always rendered now
  useEffect(() => {
    if (!containerRef.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: '',
        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          drawSelection(),
          history(),
          closeBrackets(),
          bracketMatching(),
          indentUnit.of('  '),

          languageCompartment.of(createMarkdownExtension()),
          themeCompartment.of(createEditorTheme(isDark)),

          livePreviewPlugin,
          wikiLinkPlugin,

          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onContentChangeRef.current(update.state.doc.toString());
            }
          }),

          keymap.of([
            { key: 'Tab', run: indentMore },
            { key: 'Shift-Tab', run: indentLess },
            ...defaultKeymap,
            ...historyKeymap,
            ...searchKeymap,
            ...closeBracketsKeymap,
          ]),

          EditorView.lineWrapping,

          // Auto-close ``` code fences
          EditorView.inputHandler.of((view, from, to, text) => {
            if (text !== '`') return false;
            const line = view.state.doc.lineAt(from);
            const beforeCursor = view.state.sliceDoc(line.from, from);
            const afterCursor = view.state.sliceDoc(to, line.to);
            if (/^\s*``$/.test(beforeCursor) && afterCursor === '') {
              view.dispatch({
                changes: { from, to, insert: '`\n\n```' },
                selection: { anchor: from + 2 },
              });
              return true;
            }
            return false;
          }),
        ],
      }),
      parent: containerRef.current,
    });

    // Listen for wiki-link clicks
    const container = containerRef.current;
    const handleWikiLink = (e: Event) => {
      const ce = e as CustomEvent;
      onWikiLinkClickRef.current(ce.detail.target);
    };
    container.addEventListener('wiki-link-click', handleWikiLink);

    viewRef.current = view;

    return () => {
      container.removeEventListener('wiki-link-click', handleWikiLink);
      view.destroy();
      viewRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update theme when isDark changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    view.dispatch({
      effects: themeCompartment.reconfigure(createEditorTheme(isDark)),
    });
  }, [isDark]);

  // Return the view ref so Editor.tsx can dispatch changes on file switch
  return viewRef;
}
