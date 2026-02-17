import React from 'react';
import { useApp } from '../../context/AppContext';

export function EditorHeader() {
  const { state } = useApp();

  if (!state.currentFile) return null;

  const fileName = state.currentFile.replace(/\.md$/, '').split('/').pop() || '';
  const folderPath = state.currentFile.split('/').slice(0, -1).join('/');

  return (
    <div style={styles.header}>
      <div style={styles.path}>
        {folderPath && <span style={styles.folder}>{folderPath} /</span>}
        <span style={styles.name}>{fileName}</span>
      </div>
      <div style={styles.status}>
        <span
          style={{
            ...styles.indicator,
            color:
              state.saveStatus === 'saved'
                ? 'var(--save-indicator)'
                : state.saveStatus === 'saving'
                ? 'var(--warning-color)'
                : 'var(--text-muted)',
          }}
        >
          {state.saveStatus === 'saved'
            ? 'Saved'
            : state.saveStatus === 'saving'
            ? 'Saving...'
            : 'Unsaved'}
        </span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 20px',
    borderBottom: '1px solid var(--border-color)',
    background: 'var(--bg-primary)',
  },
  path: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 13,
  },
  folder: {
    color: 'var(--text-muted)',
  },
  name: {
    fontWeight: 500,
    color: 'var(--text-primary)',
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  indicator: {
    fontSize: 11,
  },
};
