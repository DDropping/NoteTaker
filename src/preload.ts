import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from './shared/channels';
import { AppConfig } from './shared/types';

contextBridge.exposeInMainWorld('api', {
  readFile: (relativePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_READ, { relativePath }),
  writeFile: (relativePath: string, content: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_WRITE, { relativePath, content }),
  deleteFile: (relativePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_DELETE, { relativePath }),
  renameFile: (oldPath: string, newPath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_RENAME, { oldPath, newPath }),
  listFileTree: () =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_LIST_TREE),
  createFolder: (relativePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_CREATE_FOLDER, { relativePath }),
  deleteFolder: (relativePath: string) =>
    ipcRenderer.invoke('file:delete-folder', { relativePath }),
  ensureFileExists: (relativePath: string, defaultContent?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_ENSURE_EXISTS, { relativePath, defaultContent }),

  readConfig: () => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_READ),
  writeConfig: (config: Partial<AppConfig>) =>
    ipcRenderer.invoke(IPC_CHANNELS.CONFIG_WRITE, config),

  searchNotes: (query: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SEARCH_NOTES, { query }),

  openDailyNote: () =>
    ipcRenderer.invoke(IPC_CHANNELS.DAILY_NOTE_OPEN),

  openInFinder: (relativePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SHELL_OPEN_IN_FINDER, { relativePath }),

  openExternal: (url: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SHELL_OPEN_EXTERNAL, { url }),

  getNotesPath: () => ipcRenderer.invoke(IPC_CHANNELS.GET_NOTES_PATH),
});
