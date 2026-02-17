import React, { useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import { TitleBar } from './components/TitleBar/TitleBar';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Editor } from './components/Editor/Editor';
import { EditorHeader } from './components/Editor/EditorHeader';
import { SettingsModal } from './components/Settings/SettingsModal';

function AppContent() {
  const { theme } = useTheme();
  const { state, dispatch, openFile, refreshFileTree } = useApp();

  useEffect(() => {
    async function init() {
      try {
        const config = await window.api.readConfig();
        dispatch({ type: 'SET_CONFIG', payload: config });

        await refreshFileTree();

        const dailyNote = await window.api.openDailyNote();
        dispatch({
          type: 'OPEN_FILE',
          payload: {
            relativePath: dailyNote.relativePath,
            content: dailyNote.content,
          },
        });

        // Refresh tree again after daily note creation
        await refreshFileTree();
      } catch (err) {
        console.error('Init failed:', err);
      }
    }
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh file tree when window regains focus
  useEffect(() => {
    const handleFocus = () => refreshFileTree();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshFileTree]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            // Quick new note
            (async () => {
              const name = prompt('Note name:');
              if (!name) return;
              const fileName = name.endsWith('.md') ? name : `${name}.md`;
              await window.api.ensureFileExists(fileName, `# ${name.replace('.md', '')}\n\n`);
              await refreshFileTree();
              openFile(fileName);
            })();
            break;
          case 'p':
            e.preventDefault();
            // Focus search - toggling sidebar if hidden
            if (!state.sidebarVisible) {
              dispatch({ type: 'TOGGLE_SIDEBAR' });
            }
            // Focus the search input
            setTimeout(() => {
              const input = document.querySelector(
                'input[placeholder="Search notes..."]'
              ) as HTMLInputElement;
              if (input) input.focus();
            }, 100);
            break;
          case ',':
            e.preventDefault();
            dispatch({ type: 'TOGGLE_SETTINGS' });
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.sidebarVisible, dispatch, openFile, refreshFileTree]);

  return (
    <div
      data-theme={theme}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-primary)',
      }}
    >
      <TitleBar />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {state.sidebarVisible && <Sidebar />}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <EditorHeader />
          <Editor />
        </div>
      </div>
      {state.settingsOpen && <SettingsModal />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}
