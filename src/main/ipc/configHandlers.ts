import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/channels';
import { loadConfig, saveConfig } from '../services/configService';
import { AppConfig } from '../../shared/types';

export function registerConfigHandlers() {
  ipcMain.handle(IPC_CHANNELS.CONFIG_READ, async () => {
    return loadConfig();
  });

  ipcMain.handle(IPC_CHANNELS.CONFIG_WRITE, async (_event, partial: Partial<AppConfig>) => {
    return saveConfig(partial);
  });
}
