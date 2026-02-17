import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/channels';
import {
  readNote,
  writeNote,
  deleteNote,
  renameNote,
  listFileTree,
  createFolder,
  deleteFolder,
  ensureNoteExists,
} from '../services/fileService';

export function registerFileHandlers() {
  ipcMain.handle(IPC_CHANNELS.FILE_READ, async (_event, args: { relativePath: string }) => {
    const content = await readNote(args.relativePath);
    return { content };
  });

  ipcMain.handle(
    IPC_CHANNELS.FILE_WRITE,
    async (_event, args: { relativePath: string; content: string }) => {
      await writeNote(args.relativePath, args.content);
    }
  );

  ipcMain.handle(IPC_CHANNELS.FILE_DELETE, async (_event, args: { relativePath: string }) => {
    await deleteNote(args.relativePath);
  });

  ipcMain.handle(
    IPC_CHANNELS.FILE_RENAME,
    async (_event, args: { oldPath: string; newPath: string }) => {
      await renameNote(args.oldPath, args.newPath);
    }
  );

  ipcMain.handle(IPC_CHANNELS.FILE_LIST_TREE, async () => {
    return listFileTree();
  });

  ipcMain.handle(
    IPC_CHANNELS.FILE_CREATE_FOLDER,
    async (_event, args: { relativePath: string }) => {
      await createFolder(args.relativePath);
    }
  );

  ipcMain.handle(
    'file:delete-folder',
    async (_event, args: { relativePath: string }) => {
      await deleteFolder(args.relativePath);
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.FILE_ENSURE_EXISTS,
    async (_event, args: { relativePath: string; defaultContent?: string }) => {
      return ensureNoteExists(args.relativePath, args.defaultContent);
    }
  );
}
