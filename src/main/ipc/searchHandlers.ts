import { ipcMain, shell } from 'electron';
import path from 'node:path';
import { IPC_CHANNELS } from '../../shared/channels';
import { searchNotes } from '../services/searchService';
import { openOrCreateDailyNote } from '../services/dailyNoteService';
import { getNotesDir } from '../utils/paths';

export function registerSearchHandlers() {
  ipcMain.handle(IPC_CHANNELS.SEARCH_NOTES, async (_event, args: { query: string }) => {
    return searchNotes(args.query);
  });

  ipcMain.handle(IPC_CHANNELS.DAILY_NOTE_OPEN, async () => {
    return openOrCreateDailyNote();
  });

  ipcMain.handle(IPC_CHANNELS.SHELL_OPEN_IN_FINDER, async (_event, args: { relativePath: string }) => {
    const fullPath = path.resolve(getNotesDir(), args.relativePath);
    shell.showItemInFolder(fullPath);
  });

  ipcMain.handle(IPC_CHANNELS.SHELL_OPEN_EXTERNAL, async (_event, args: { url: string }) => {
    const { url } = args;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      await shell.openExternal(url);
    }
  });

  ipcMain.handle(IPC_CHANNELS.GET_NOTES_PATH, () => {
    return getNotesDir();
  });
}
