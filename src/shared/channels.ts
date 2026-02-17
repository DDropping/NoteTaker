export const IPC_CHANNELS = {
  FILE_READ: 'file:read',
  FILE_WRITE: 'file:write',
  FILE_DELETE: 'file:delete',
  FILE_RENAME: 'file:rename',
  FILE_LIST_TREE: 'file:list-tree',
  FILE_CREATE_FOLDER: 'file:create-folder',
  FILE_ENSURE_EXISTS: 'file:ensure-exists',

  CONFIG_READ: 'config:read',
  CONFIG_WRITE: 'config:write',

  SEARCH_NOTES: 'search:notes',

  DAILY_NOTE_OPEN: 'daily-note:open',

  SHELL_OPEN_IN_FINDER: 'shell:open-in-finder',
  SHELL_OPEN_EXTERNAL: 'shell:open-external',

  GET_NOTES_PATH: 'app:get-notes-path',
} as const;
