import React from 'react';
import { FileNode } from '../../../shared/types';
import { FileTreeItem } from './FileTreeItem';

interface FileTreeProps {
  tree: FileNode[];
  currentFile: string | null;
  onFileClick: (relativePath: string) => void;
  onNewNote: (folderPath: string) => void;
  onNewFolder: (folderPath: string) => void;
  onDelete: (relativePath: string, isFolder: boolean) => void;
  onRename: (oldPath: string, newDisplayName: string) => void;
}

export function FileTree({
  tree,
  currentFile,
  onFileClick,
  onNewNote,
  onNewFolder,
  onDelete,
  onRename,
}: FileTreeProps) {
  if (tree.length === 0) {
    return (
      <div style={{ padding: '16px 12px', color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
        No notes yet. Create one to get started.
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
      {tree.map((node) => (
        <FileTreeItem
          key={node.relativePath}
          node={node}
          depth={0}
          currentFile={currentFile}
          onFileClick={onFileClick}
          onNewNote={onNewNote}
          onNewFolder={onNewFolder}
          onDelete={onDelete}
          onRename={onRename}
        />
      ))}
    </div>
  );
}
