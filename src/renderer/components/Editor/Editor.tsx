import React, { useRef, useCallback, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useCodeMirror } from './useCodeMirror';

export function Editor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, dispatch, openFile, refreshFileTree } = useApp();
  const { theme } = useTheme();
  const { scheduleSave, saveImmediately, setBaseline } = useAutoSave();
  const currentFileRef = useRef(state.currentFile);
  currentFileRef.current = state.currentFile;

  const handleContentChange = useCallback(
    (content: string) => {
      dispatch({ type: 'SET_CONTENT', payload: content });
      const file = currentFileRef.current;
      if (file) {
        dispatch({ type: 'SET_SAVE_STATUS', payload: 'unsaved' });
        scheduleSave(file, content);
        setTimeout(() => {
          dispatch({ type: 'SET_SAVE_STATUS', payload: 'saved' });
        }, 1200);
      }
    },
    [dispatch, scheduleSave]
  );

  const handleWikiLinkClick = useCallback(
    async (target: string) => {
      const relativePath = target.endsWith('.md') ? target : `${target}.md`;
      await window.api.ensureFileExists(relativePath, `# ${target}\n\n`);
      await refreshFileTree();
      openFile(relativePath);
    },
    [openFile, refreshFileTree]
  );

  const viewRef = useCodeMirror({
    containerRef,
    isDark: theme === 'dark',
    onContentChange: handleContentChange,
    onWikiLinkClick: handleWikiLinkClick,
  });

  // When the current file changes, load its content into CodeMirror
  useEffect(() => {
    const view = viewRef.current;
    if (!view || !state.currentFile) return;

    setBaseline(state.currentContent);

    // Replace the entire document with the new file's content
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: state.currentContent,
      },
    });
  }, [state.currentFile]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save immediately before window unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (state.currentFile && state.isDirty) {
        saveImmediately(state.currentFile, state.currentContent);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.currentFile, state.isDirty, state.currentContent, saveImmediately]);

  return (
    <div style={styles.wrapper}>
      {/* Always render the editor container so CodeMirror can mount */}
      <div
        ref={containerRef}
        style={{
          ...styles.editor,
          display: state.currentFile ? 'block' : 'none',
        }}
      />
      {!state.currentFile && (
        <div style={styles.empty}>
          <div style={styles.emptyTitle}>NoteTaker</div>
          <div style={styles.emptyHint}>
            Open a file from the sidebar or create a new note
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    flex: 1,
    height: '100%',
    overflow: 'hidden',
    background: 'var(--editor-bg)',
    position: 'relative',
  },
  editor: {
    width: '100%',
    height: '100%',
  },
  empty: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--text-muted)',
  },
  emptyHint: {
    fontSize: 14,
    color: 'var(--text-muted)',
  },
};
