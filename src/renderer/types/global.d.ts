import { FileNode, AppConfig, SearchResult } from '../../shared/types';

interface NoteTakerAPI {
  readFile(relativePath: string): Promise<{ content: string }>;
  writeFile(relativePath: string, content: string): Promise<void>;
  deleteFile(relativePath: string): Promise<void>;
  renameFile(oldPath: string, newPath: string): Promise<void>;
  listFileTree(): Promise<FileNode[]>;
  createFolder(relativePath: string): Promise<void>;
  deleteFolder(relativePath: string): Promise<void>;
  ensureFileExists(
    relativePath: string,
    defaultContent?: string
  ): Promise<{ created: boolean; content: string }>;

  readConfig(): Promise<AppConfig>;
  writeConfig(config: Partial<AppConfig>): Promise<AppConfig>;

  searchNotes(query: string): Promise<SearchResult[]>;

  openDailyNote(): Promise<{
    relativePath: string;
    content: string;
    isNew: boolean;
  }>;

  openInFinder(relativePath: string): Promise<void>;
  openExternal(url: string): Promise<void>;
  getNotesPath(): Promise<string>;
}

declare global {
  interface Window {
    api: NoteTakerAPI;
  }
}

export {};
