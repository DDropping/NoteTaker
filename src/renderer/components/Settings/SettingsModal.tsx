import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { TemplateEditor } from './TemplateEditor';
import { AppConfig } from '../../../shared/types';

export function SettingsModal() {
  const { state, dispatch } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [config, setConfig] = useState<AppConfig>(state.config);
  const [activeTab, setActiveTab] = useState<'general' | 'template'>('general');
  const [notesPath, setNotesPath] = useState('');

  useEffect(() => {
    window.api.readConfig().then(setConfig);
    window.api.getNotesPath().then(setNotesPath);
  }, []);

  const handleClose = () => {
    dispatch({ type: 'TOGGLE_SETTINGS' });
  };

  const handleTemplateSave = async (template: string) => {
    const updated = await window.api.writeConfig({ dailyNoteTemplate: template });
    setConfig(updated);
    dispatch({ type: 'SET_CONFIG', payload: updated });
  };

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Settings</h2>
          <button style={styles.closeBtn} onClick={handleClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
            </svg>
          </button>
        </div>

        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'general' ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'template' ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab('template')}
          >
            Daily Note Template
          </button>
        </div>

        <div style={styles.content}>
          {activeTab === 'general' && (
            <div style={styles.section}>
              <div style={styles.setting}>
                <div>
                  <div style={styles.settingLabel}>Theme</div>
                  <div style={styles.settingDesc}>
                    Switch between light and dark appearance
                  </div>
                </div>
                <button style={styles.settingBtn} onClick={toggleTheme}>
                  {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                </button>
              </div>

              <div style={styles.setting}>
                <div>
                  <div style={styles.settingLabel}>Notes Location</div>
                  <div style={styles.settingDesc}>{notesPath}</div>
                </div>
                <button
                  style={styles.settingBtn}
                  onClick={() => window.api.openInFinder('')}
                >
                  Open in Finder
                </button>
              </div>
            </div>
          )}

          {activeTab === 'template' && (
            <TemplateEditor
              template={config.dailyNoteTemplate}
              onSave={handleTemplateSave}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'var(--modal-overlay)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    width: 600,
    maxHeight: '80vh',
    background: 'var(--modal-bg)',
    borderRadius: 12,
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-color)',
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: 0,
  },
  closeBtn: {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    color: 'var(--text-muted)',
  },
  tabs: {
    display: 'flex',
    padding: '0 20px',
    borderBottom: '1px solid var(--border-color)',
    gap: 0,
  },
  tab: {
    padding: '12px 16px',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--text-muted)',
    borderBottom: '2px solid transparent',
    marginBottom: -1,
    transition: 'color 0.15s',
  },
  activeTab: {
    color: 'var(--accent-color)',
    borderBottomColor: 'var(--accent-color)',
  },
  content: {
    padding: 20,
    overflowY: 'auto',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  setting: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid var(--border-color)',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--text-primary)',
  },
  settingDesc: {
    fontSize: 12,
    color: 'var(--text-muted)',
    marginTop: 2,
  },
  settingBtn: {
    padding: '6px 12px',
    background: 'var(--bg-hover)',
    border: '1px solid var(--border-color)',
    borderRadius: 6,
    fontSize: 12,
    color: 'var(--text-primary)',
    fontWeight: 500,
  },
};
