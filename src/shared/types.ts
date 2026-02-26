export interface FileNode {
  name: string;
  relativePath: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

export interface TabInfo {
  relativePath: string;
  content: string;
  isDirty: boolean;
  saveStatus: 'saved' | 'saving' | 'unsaved';
}

export interface AppConfig {
  theme: 'light' | 'dark';
  dailyNoteTemplate: string;
  sidebarWidth: number;
  lastOpenedFile: string | null;
  openTabs: string[];
}

export interface SearchResult {
  relativePath: string;
  name: string;
  matchLine: string;
  lineNumber: number;
}

export const DEFAULT_CONFIG: AppConfig = {
  theme: 'dark',
  dailyNoteTemplate: `# {{longDate}}

## TODO
#### High Priority
- [ ]
#### Med Priority
- [ ]
#### Low Priority
- [ ]

## Notes
-

## Journal
-

`,
  sidebarWidth: 250,
  lastOpenedFile: null,
  openTabs: [],
};
