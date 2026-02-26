import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import { FileNode, AppConfig, TabInfo, DEFAULT_CONFIG } from '../../shared/types';

interface AppState {
  tabs: TabInfo[];
  activeTabPath: string | null;
  fileTree: FileNode[];
  sidebarVisible: boolean;
  config: AppConfig;
  settingsOpen: boolean;
}

type AppAction =
  | { type: 'OPEN_FILE'; payload: { relativePath: string; content: string } }
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_FILE_TREE'; payload: FileNode[] }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_CONFIG'; payload: AppConfig }
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'SET_SAVE_STATUS'; payload: 'saved' | 'saving' | 'unsaved' }
  | { type: 'CLOSE_TAB'; payload: string }
  | { type: 'SWITCH_TAB'; payload: string }
  | { type: 'REORDER_TABS'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'RENAME_TAB'; payload: { oldPath: string; newPath: string } };

const initialState: AppState = {
  tabs: [],
  activeTabPath: null,
  fileTree: [],
  sidebarVisible: true,
  config: DEFAULT_CONFIG,
  settingsOpen: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'OPEN_FILE': {
      const { relativePath, content } = action.payload;
      const existingIndex = state.tabs.findIndex(t => t.relativePath === relativePath);
      if (existingIndex >= 0) {
        const updatedTabs = state.tabs.map((t, i) =>
          i === existingIndex ? { ...t, content, isDirty: false, saveStatus: 'saved' as const } : t
        );
        return { ...state, tabs: updatedTabs, activeTabPath: relativePath };
      }
      const activeIndex = state.tabs.findIndex(t => t.relativePath === state.activeTabPath);
      const insertAt = activeIndex >= 0 ? activeIndex + 1 : state.tabs.length;
      const newTab: TabInfo = { relativePath, content, isDirty: false, saveStatus: 'saved' };
      const newTabs = [...state.tabs.slice(0, insertAt), newTab, ...state.tabs.slice(insertAt)];
      return { ...state, tabs: newTabs, activeTabPath: relativePath };
    }
    case 'SET_CONTENT': {
      return {
        ...state,
        tabs: state.tabs.map(t =>
          t.relativePath === state.activeTabPath
            ? { ...t, content: action.payload, isDirty: true, saveStatus: 'unsaved' as const }
            : t
        ),
      };
    }
    case 'SET_FILE_TREE':
      return { ...state, fileTree: action.payload };
    case 'SET_DIRTY': {
      return {
        ...state,
        tabs: state.tabs.map(t =>
          t.relativePath === state.activeTabPath
            ? { ...t, isDirty: action.payload }
            : t
        ),
      };
    }
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarVisible: !state.sidebarVisible };
    case 'SET_CONFIG':
      return { ...state, config: action.payload };
    case 'TOGGLE_SETTINGS':
      return { ...state, settingsOpen: !state.settingsOpen };
    case 'SET_SAVE_STATUS': {
      return {
        ...state,
        tabs: state.tabs.map(t =>
          t.relativePath === state.activeTabPath
            ? { ...t, saveStatus: action.payload }
            : t
        ),
      };
    }
    case 'CLOSE_TAB': {
      const closingPath = action.payload;
      const closingIndex = state.tabs.findIndex(t => t.relativePath === closingPath);
      if (closingIndex < 0) return state;
      const newTabs = state.tabs.filter(t => t.relativePath !== closingPath);
      let newActive = state.activeTabPath;
      if (state.activeTabPath === closingPath) {
        if (newTabs.length === 0) {
          newActive = null;
        } else if (closingIndex < newTabs.length) {
          newActive = newTabs[closingIndex].relativePath;
        } else {
          newActive = newTabs[newTabs.length - 1].relativePath;
        }
      }
      return { ...state, tabs: newTabs, activeTabPath: newActive };
    }
    case 'SWITCH_TAB':
      return { ...state, activeTabPath: action.payload };
    case 'REORDER_TABS': {
      const { fromIndex, toIndex } = action.payload;
      const newTabs = [...state.tabs];
      const [moved] = newTabs.splice(fromIndex, 1);
      newTabs.splice(toIndex, 0, moved);
      return { ...state, tabs: newTabs };
    }
    case 'RENAME_TAB': {
      const { oldPath, newPath } = action.payload;
      return {
        ...state,
        tabs: state.tabs.map(t =>
          t.relativePath === oldPath ? { ...t, relativePath: newPath } : t
        ),
        activeTabPath: state.activeTabPath === oldPath ? newPath : state.activeTabPath,
      };
    }
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  openFile: (relativePath: string) => Promise<void>;
  closeTab: (relativePath: string) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  refreshFileTree: () => Promise<void>;
  currentFile: string | null;
  currentContent: string;
  isDirty: boolean;
  saveStatus: 'saved' | 'saving' | 'unsaved';
}

const AppContext = createContext<AppContextType>({
  state: initialState,
  dispatch: () => {},
  openFile: async () => {},
  closeTab: () => {},
  reorderTabs: () => {},
  refreshFileTree: async () => {},
  currentFile: null,
  currentContent: '',
  isDirty: false,
  saveStatus: 'saved',
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const activeTab = useMemo(
    () => state.tabs.find(t => t.relativePath === state.activeTabPath) ?? null,
    [state.tabs, state.activeTabPath]
  );

  const currentFile = state.activeTabPath;
  const currentContent = activeTab?.content ?? '';
  const isDirty = activeTab?.isDirty ?? false;
  const saveStatus = activeTab?.saveStatus ?? 'saved';

  const openFile = useCallback(async (relativePath: string) => {
    try {
      const { content } = await window.api.readFile(relativePath);
      dispatch({ type: 'OPEN_FILE', payload: { relativePath, content } });
      window.api.writeConfig({ lastOpenedFile: relativePath });
    } catch (err) {
      console.error('Failed to open file:', err);
    }
  }, []);

  const closeTab = useCallback((relativePath: string) => {
    dispatch({ type: 'CLOSE_TAB', payload: relativePath });
  }, []);

  const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
    dispatch({ type: 'REORDER_TABS', payload: { fromIndex, toIndex } });
  }, []);

  const refreshFileTree = useCallback(async () => {
    try {
      const tree = await window.api.listFileTree();
      dispatch({ type: 'SET_FILE_TREE', payload: tree });
    } catch (err) {
      console.error('Failed to refresh file tree:', err);
    }
  }, []);

  // Persist open tabs whenever the tab list changes
  const prevTabKeysRef = useRef('');
  useEffect(() => {
    const tabKeys = state.tabs.map(t => t.relativePath).join('\0');
    if (tabKeys !== prevTabKeysRef.current) {
      prevTabKeysRef.current = tabKeys;
      window.api.writeConfig({ openTabs: state.tabs.map(t => t.relativePath) });
    }
  }, [state.tabs]);

  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      openFile,
      closeTab,
      reorderTabs,
      refreshFileTree,
      currentFile,
      currentContent,
      isDirty,
      saveStatus,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
