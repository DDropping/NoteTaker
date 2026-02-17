import fs from 'node:fs/promises';
import { getConfigFile } from '../utils/paths';
import { AppConfig, DEFAULT_CONFIG } from '../../shared/types';

export async function loadConfig(): Promise<AppConfig> {
  try {
    const raw = await fs.readFile(getConfigFile(), 'utf-8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function saveConfig(partial: Partial<AppConfig>): Promise<AppConfig> {
  const current = await loadConfig();
  const updated = { ...current, ...partial };
  await fs.writeFile(getConfigFile(), JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}
