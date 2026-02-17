import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { FileNode, AppConfig, DEFAULT_CONFIG } from '../../shared/types';

interface AppState {
  currentFile: string | null;
  currentContent: string;
  fileTree: FileNode[];
  isDirty: boolean;
  sidebarVisible: boolean;
  config: AppConfig;
  settingsOpen: boolean;
  saveStatus: 'saved' | 'saving' | 'unsaved';
}

type AppAction =
  | { type: 'OPEN_FILE'; payload: { relativePath: string; content: string } }
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_FILE_TREE'; payload: FileNode[] }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_CONFIG'; payload: AppConfig }
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'SET_SAVE_STATUS'; payload: 'saved' | 'saving' | 'unsaved' };

const initialState: AppState = {
  currentFile: null,
  currentContent: '',
  fileTree: [],
  isDirty: false,
  sidebarVisible: true,
  config: DEFAULT_CONFIG,
  settingsOpen: false,
  saveStatus: 'saved',
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'OPEN_FILE':
      return {
        ...state,
        currentFile: action.payload.relativePath,
        currentContent: action.payload.content,
        isDirty: false,
        saveStatus: 'saved',
      };
    case 'SET_CONTENT':
      return {
        ...state,
        currentContent: action.payload,
        isDirty: true,
        saveStatus: 'unsaved',
      };
    case 'SET_FILE_TREE':
      return { ...state, fileTree: action.payload };
    case 'SET_DIRTY':
      return { ...state, isDirty: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarVisible: !state.sidebarVisible };
    case 'SET_CONFIG':
      return { ...state, config: action.payload };
    case 'TOGGLE_SETTINGS':
      return { ...state, settingsOpen: !state.settingsOpen };
    case 'SET_SAVE_STATUS':
      return { ...state, saveStatus: action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  openFile: (relativePath: string) => Promise<void>;
  refreshFileTree: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({
  state: initialState,
  dispatch: () => {},
  openFile: async () => {},
  refreshFileTree: async () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const openFile = useCallback(async (relativePath: string) => {
    try {
      const { content } = await window.api.readFile(relativePath);
      dispatch({ type: 'OPEN_FILE', payload: { relativePath, content } });
      window.api.writeConfig({ lastOpenedFile: relativePath });
    } catch (err) {
      console.error('Failed to open file:', err);
    }
  }, []);

  const refreshFileTree = useCallback(async () => {
    try {
      const tree = await window.api.listFileTree();
      dispatch({ type: 'SET_FILE_TREE', payload: tree });
    } catch (err) {
      console.error('Failed to refresh file tree:', err);
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, openFile, refreshFileTree }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
