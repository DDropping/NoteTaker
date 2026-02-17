import React, { useCallback, useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { useSearch } from "../../hooks/useSearch";
import { SearchBar } from "./SearchBar";
import { SearchResults } from "./SearchResults";
import { FileTree } from "./FileTree";

type NewItemMode = null | "note" | "folder";

export function Sidebar() {
  const { state, openFile, refreshFileTree } = useApp();
  const { query, results, isSearching, search, clearSearch } = useSearch();
  const [newItemMode, setNewItemMode] = useState<NewItemMode>(null);
  const [newItemFolder, setNewItemFolder] = useState("");
  const newItemRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (newItemMode && newItemRef.current) {
      newItemRef.current.focus();
    }
  }, [newItemMode]);

  const handleFileClick = useCallback(
    (relativePath: string) => {
      openFile(relativePath);
      clearSearch();
    },
    [openFile, clearSearch],
  );

  const commitNewItem = useCallback(
    async (name: string, mode: "note" | "folder", folderPath: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      if (mode === "note") {
        const fileName = trimmed.endsWith(".md") ? trimmed : `${trimmed}.md`;
        const relativePath = folderPath
          ? `${folderPath}/${fileName}`
          : fileName;
        await window.api.ensureFileExists(
          relativePath,
          `# ${trimmed.replace(/\.md$/, "")}\n\n`,
        );
        await refreshFileTree();
        openFile(relativePath);
      } else {
        const relativePath = folderPath ? `${folderPath}/${trimmed}` : trimmed;
        await window.api.createFolder(relativePath);
        await refreshFileTree();
      }
    },
    [refreshFileTree, openFile],
  );

  const handleNewNote = useCallback(async (folderPath: string) => {
    setNewItemFolder(folderPath);
    setNewItemMode("note");
  }, []);

  const handleNewFolder = useCallback(async (folderPath: string) => {
    setNewItemFolder(folderPath);
    setNewItemMode("folder");
  }, []);

  const handleDelete = useCallback(
    async (relativePath: string, isFolder: boolean) => {
      const confirmed = confirm(`Delete "${relativePath}"?`);
      if (!confirmed) return;
      if (isFolder) {
        await window.api.deleteFolder(relativePath);
      } else {
        await window.api.deleteFile(relativePath);
      }
      await refreshFileTree();
    },
    [refreshFileTree],
  );

  const handleRename = useCallback(
    async (oldPath: string, newDisplayName: string) => {
      const parts = oldPath.split("/");
      const oldFullName = parts.pop() || "";
      const isMarkdown = oldFullName.endsWith(".md");
      const newFullName =
        isMarkdown && !newDisplayName.endsWith(".md")
          ? `${newDisplayName}.md`
          : newDisplayName;
      const newPath = [...parts, newFullName].join("/");
      await window.api.renameFile(oldPath, newPath);
      await refreshFileTree();
      if (state.currentFile === oldPath) {
        openFile(newPath);
      }
    },
    [refreshFileTree, state.currentFile, openFile],
  );

  const handleDailyNote = useCallback(async () => {
    const result = await window.api.openDailyNote();
    await refreshFileTree();
    openFile(result.relativePath);
  }, [refreshFileTree, openFile]);

  const handleNewItemKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const val = e.currentTarget.value;
      const mode = newItemMode!;
      const folder = newItemFolder;
      setNewItemMode(null);
      setNewItemFolder("");
      commitNewItem(val, mode, folder);
    } else if (e.key === "Escape") {
      setNewItemMode(null);
      setNewItemFolder("");
    }
  };

  const handleNewItemBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.currentTarget.value;
    const mode = newItemMode!;
    const folder = newItemFolder;
    setNewItemMode(null);
    setNewItemFolder("");
    if (val.trim()) {
      commitNewItem(val, mode, folder);
    }
  };

  const isSearchActive = query.length >= 2;

  return (
    <div style={styles.sidebar}>
      <SearchBar query={query} onSearch={search} onClear={clearSearch} />
      {isSearchActive ? (
        <SearchResults
          results={results}
          isSearching={isSearching}
          onSelect={handleFileClick}
        />
      ) : (
        <>
          <div style={styles.header}>
            <span style={styles.headerTitle}>Files</span>
            <div style={styles.headerActions}>
              <button
                style={styles.headerBtn}
                onClick={handleDailyNote}
                title="Today's Daily Note"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M3.5 0a.5.5 0 01.5.5V1h8V.5a.5.5 0 011 0V1h1a2 2 0 012 2v11a2 2 0 01-2 2H2a2 2 0 01-2-2V3a2 2 0 012-2h1V.5a.5.5 0 01.5-.5zM1 4v10a1 1 0 001 1h12a1 1 0 001-1V4H1z" />
                </svg>
              </button>
              <button
                style={styles.headerBtn}
                onClick={() => { setNewItemFolder(""); setNewItemMode("note"); }}
                title="New Note"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M8 2a.5.5 0 01.5.5v5h5a.5.5 0 010 1h-5v5a.5.5 0 01-1 0v-5h-5a.5.5 0 010-1h5v-5A.5.5 0 018 2z" />
                </svg>
              </button>
              <button
                style={styles.headerBtn}
                onClick={() => { setNewItemFolder(""); setNewItemMode("folder"); }}
                title="New Folder"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M.54 3.87L.5 3a2 2 0 012-2h3.672a2 2 0 011.414.586l.828.828A2 2 0 009.828 3H13.5a2 2 0 012 2v.5H.54zM1.059 5.5H14.94a.5.5 0 01.497.55l-.5 5.5A2 2 0 0112.95 13.5H3.05a2 2 0 01-1.987-1.95l-.5-5.5a.5.5 0 01.497-.55z" />
                </svg>
              </button>
            </div>
          </div>
          {newItemMode && (
            <div style={styles.newItemRow}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="var(--text-muted)"
                style={{ flexShrink: 0 }}
              >
                {newItemMode === "note" ? (
                  <path d="M4 0a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4.707A1 1 0 0013.707 4L10 .293A1 1 0 009.293 0H4zm5.5 1.5v2a1 1 0 001 1h2l-3-3zM4.5 8a.5.5 0 010 1h7a.5.5 0 010-1h-7zm0 2a.5.5 0 010 1h7a.5.5 0 010-1h-7z" />
                ) : (
                  <path d="M.54 3.87L.5 3a2 2 0 012-2h3.672a2 2 0 011.414.586l.828.828A2 2 0 009.828 3H13.5a2 2 0 012 2v.5H.54zM1.059 5.5H14.94a.5.5 0 01.497.55l-.5 5.5A2 2 0 0112.95 13.5H3.05a2 2 0 01-1.987-1.95l-.5-5.5a.5.5 0 01.497-.55z" />
                )}
              </svg>
              <input
                ref={newItemRef}
                style={styles.newItemInput}
                placeholder={
                  newItemMode === "note" ? "Note name..." : "Folder name..."
                }
                onKeyDown={handleNewItemKeyDown}
                onBlur={handleNewItemBlur}
              />
            </div>
          )}
          <FileTree
            tree={state.fileTree}
            currentFile={state.currentFile}
            onFileClick={handleFileClick}
            onNewNote={handleNewNote}
            onNewFolder={handleNewFolder}
            onDelete={handleDelete}
            onRename={handleRename}
          />
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 250,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    background: "var(--bg-sidebar)",
    borderRight: "1px solid var(--border-color)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "var(--text-muted)",
  },
  headerActions: {
    display: "flex",
    gap: 4,
  },
  headerBtn: {
    width: 24,
    height: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    color: "var(--text-muted)",
  },
  newItemRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 16px",
    margin: "0 4px 2px",
  },
  newItemInput: {
    flex: 1,
    fontSize: 13,
    padding: "2px 6px",
    border: "1px solid var(--accent-color)",
    borderRadius: 3,
    background: "var(--input-bg)",
    color: "var(--text-primary)",
    outline: "none",
    fontFamily: "inherit",
    minWidth: 0,
  },
};
