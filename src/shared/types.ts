export interface FileNode {
  name: string;
  relativePath: string;
  type: "file" | "folder";
  children?: FileNode[];
}

export interface TabInfo {
  relativePath: string;
  content: string;
  isDirty: boolean;
  saveStatus: "saved" | "saving" | "unsaved";
  // True when the user explicitly opened this tab in the current session
  // (e.g. clicking it in the sidebar). Used to decide whether to auto-close
  // stale daily notes when today's note is created.
  openedManually?: boolean;
}

export interface AppConfig {
  theme: "light" | "dark";
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
  theme: "dark",
  dailyNoteTemplate: `# {{longDate}}

## Tasks
#### High Priority
- [ ] 

#### Med Priority
- [ ] 

#### Low Priority
- [ ] 

#### Completed Yesterday
- 

## Notes
- 

## Journal
- 

`,
  sidebarWidth: 250,
  lastOpenedFile: null,
  openTabs: [],
};
