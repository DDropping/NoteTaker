import React, { useState, useEffect, useRef } from 'react';
import { FileNode } from '../../../shared/types';

interface FileTreeItemProps {
  node: FileNode;
  depth: number;
  currentFile: string | null;
  onFileClick: (relativePath: string) => void;
  onNewNote: (folderPath: string) => void;
  onNewFolder: (folderPath: string) => void;
  onDelete: (relativePath: string, isFolder: boolean) => void;
  onRename: (oldPath: string, newDisplayName: string) => void;
}

export function FileTreeItem({
  node,
  depth,
  currentFile,
  onFileClick,
  onNewNote,
  onNewFolder,
  onDelete,
  onRename,
}: FileTreeItemProps) {
  const [expanded, setExpanded] = useState(node.name !== 'Archived');
  const [showContext, setShowContext] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const contextRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const isActive = node.type === 'file' && node.relativePath === currentFile;

  const displayName = node.type === 'file' ? node.name.replace(/\.md$/, '') : node.name;

  // Close context menu when clicking anywhere outside
  useEffect(() => {
    if (!showContext) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (contextRef.current && !contextRef.current.contains(e.target as Node)) {
        setShowContext(false);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showContext]);

  // Focus and select text when entering rename mode
  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenaming]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowContext(true);
  };

  const handleClick = () => {
    if (showContext || isRenaming) return;
    if (node.type === 'folder') {
      setExpanded(!expanded);
    } else {
      onFileClick(node.relativePath);
    }
  };

  const handleStartRename = () => {
    setShowContext(false);
    setIsRenaming(true);
  };

  const handleCommitRename = (newName: string) => {
    const trimmed = newName.trim();
    setIsRenaming(false);
    if (!trimmed || trimmed === displayName) return;
    onRename(node.relativePath, trimmed);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommitRename(e.currentTarget.value);
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
    }
  };

  return (
    <div>
      <div
        style={{
          ...styles.item,
          paddingLeft: 12 + depth * 16,
          background: isActive ? 'var(--bg-active)' : 'transparent',
        }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={(e) => {
          if (!isActive)
            (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
        }}
        onMouseLeave={(e) => {
          if (!isActive)
            (e.currentTarget as HTMLElement).style.background = 'transparent';
        }}
      >
        {node.type === 'folder' && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="var(--text-muted)"
            style={{
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s',
              flexShrink: 0,
            }}
          >
            <path d="M6 12.796V3.204L11.481 8 6 12.796zm.659.753l5.48-4.796a1 1 0 000-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 001.659.753z" />
          </svg>
        )}
        {node.type === 'file' && (
          <svg width="12" height="12" viewBox="0 0 16 16" fill="var(--text-muted)" style={{ flexShrink: 0 }}>
            <path d="M4 0a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4.707A1 1 0 0013.707 4L10 .293A1 1 0 009.293 0H4zm5.5 1.5v2a1 1 0 001 1h2l-3-3zM4.5 8a.5.5 0 010 1h7a.5.5 0 010-1h-7zm0 2a.5.5 0 010 1h7a.5.5 0 010-1h-7z" />
          </svg>
        )}
        {isRenaming ? (
          <input
            ref={renameInputRef}
            style={styles.renameInput}
            defaultValue={displayName}
            onBlur={(e) => handleCommitRename(e.currentTarget.value)}
            onKeyDown={handleRenameKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span style={styles.name}>{displayName}</span>
        )}
        {showContext && (
          <div
            ref={contextRef}
            style={styles.contextMenu}
            onClick={(e) => e.stopPropagation()}
          >
            {node.type === 'folder' && (
              <>
                <button
                  style={styles.contextItem}
                  onClick={() => { onNewNote(node.relativePath); setShowContext(false); }}
                >
                  New Note
                </button>
                <button
                  style={styles.contextItem}
                  onClick={() => { onNewFolder(node.relativePath); setShowContext(false); }}
                >
                  New Folder
                </button>
              </>
            )}
            <button
              style={styles.contextItem}
              onClick={handleStartRename}
            >
              Rename
            </button>
            <button
              style={{ ...styles.contextItem, color: 'var(--danger-color)' }}
              onClick={() => { onDelete(node.relativePath, node.type === 'folder'); setShowContext(false); }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
      {node.type === 'folder' && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.relativePath}
              node={child}
              depth={depth + 1}
              currentFile={currentFile}
              onFileClick={onFileClick}
              onNewNote={onNewNote}
              onNewFolder={onNewFolder}
              onDelete={onDelete}
              onRename={onRename}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 12px',
    cursor: 'pointer',
    fontSize: 13,
    color: 'var(--text-primary)',
    userSelect: 'none',
    position: 'relative',
    borderRadius: 4,
    margin: '1px 4px',
    transition: 'background 0.1s',
  },
  name: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
  },
  renameInput: {
    flex: 1,
    fontSize: 13,
    padding: '1px 4px',
    border: '1px solid var(--accent-color)',
    borderRadius: 3,
    background: 'var(--input-bg)',
    color: 'var(--text-primary)',
    outline: 'none',
    fontFamily: 'inherit',
    minWidth: 0,
  },
  contextMenu: {
    position: 'absolute',
    right: 4,
    top: '100%',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 6,
    padding: 4,
    zIndex: 100,
    minWidth: 120,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  contextItem: {
    display: 'block',
    width: '100%',
    padding: '6px 12px',
    textAlign: 'left',
    fontSize: 12,
    borderRadius: 4,
    color: 'var(--text-primary)',
  },
};
