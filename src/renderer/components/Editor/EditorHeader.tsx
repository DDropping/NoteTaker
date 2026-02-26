import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export function EditorHeader() {
  const { state, openFile, closeTab, reorderTabs, saveStatus } = useApp();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);

  if (state.tabs.length === 0) return null;

  const handleTabClick = (relativePath: string) => {
    if (relativePath !== state.activeTabPath) {
      openFile(relativePath);
    }
  };

  const handleClose = (e: React.MouseEvent, relativePath: string) => {
    e.stopPropagation();
    closeTab(relativePath);
  };

  const handleMiddleClick = (e: React.MouseEvent, relativePath: string) => {
    if (e.button === 1) {
      e.preventDefault();
      closeTab(relativePath);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragIndex !== null && index !== dragIndex) {
      setDropTarget(index);
    }
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== toIndex) {
      reorderTabs(dragIndex, toIndex);
    }
    setDragIndex(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDropTarget(null);
  };

  return (
    <div style={styles.tabBar}>
      <div style={styles.tabList}>
        {state.tabs.map((tab, index) => {
          const isActive = tab.relativePath === state.activeTabPath;
          const fileName = tab.relativePath.replace(/\.md$/, '').split('/').pop() || '';
          const isDragging = dragIndex === index;
          const isDropTarget = dropTarget === index;

          return (
            <div
              key={tab.relativePath}
              draggable
              onClick={() => handleTabClick(tab.relativePath)}
              onAuxClick={(e) => handleMiddleClick(e, tab.relativePath)}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              style={{
                ...styles.tab,
                ...(isActive ? styles.tabActive : {}),
                ...(isDragging ? { opacity: 0.4 } : {}),
                ...(isDropTarget ? { borderLeftColor: 'var(--accent-color)', borderLeftWidth: 2 } : {}),
              }}
            >
              <span style={styles.tabName}>
                {tab.isDirty && <span style={styles.dirtyDot} />}
                {fileName}
              </span>
              <button
                style={styles.closeBtn}
                onClick={(e) => handleClose(e, tab.relativePath)}
                title="Close tab"
              >
                <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
      <div style={styles.status}>
        <span
          style={{
            ...styles.indicator,
            color:
              saveStatus === 'saved'
                ? 'var(--save-indicator)'
                : saveStatus === 'saving'
                ? 'var(--warning-color)'
                : 'var(--text-muted)',
          }}
        >
          {saveStatus === 'saved'
            ? 'Saved'
            : saveStatus === 'saving'
            ? 'Saving...'
            : 'Unsaved'}
        </span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  tabBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border-color)',
    background: 'var(--bg-primary)',
    minHeight: 36,
  },
  tabList: {
    display: 'flex',
    flex: 1,
    overflowX: 'auto',
    overflowY: 'hidden',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 8px 6px 12px',
    fontSize: 12,
    cursor: 'pointer',
    userSelect: 'none',
    borderRight: '1px solid var(--border-color)',
    borderLeft: '2px solid transparent',
    color: 'var(--text-muted)',
    background: 'transparent',
    whiteSpace: 'nowrap',
    transition: 'background 0.1s',
    flexShrink: 0,
  },
  tabActive: {
    background: 'var(--editor-bg)',
    color: 'var(--text-primary)',
    fontWeight: 500,
  },
  tabName: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  dirtyDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--accent-color)',
    display: 'inline-block',
    flexShrink: 0,
  },
  closeBtn: {
    width: 16,
    height: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    color: 'var(--text-muted)',
    flexShrink: 0,
    opacity: 0.5,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  status: {
    padding: '0 12px',
    flexShrink: 0,
  },
  indicator: {
    fontSize: 11,
  },
};
