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

// Concurrent saveConfig calls would race: each does a read-modify-write, so a
// slow writer can clobber a faster one with a stale snapshot. Chain them so
// reads and writes are strictly serialized. The chain swallows rejections so a
// single failed write doesn't poison every subsequent one.
let writeChain: Promise<unknown> = Promise.resolve();

export async function saveConfig(partial: Partial<AppConfig>): Promise<AppConfig> {
  const next = writeChain.catch(() => undefined).then(async () => {
    const current = await loadConfig();
    const updated = { ...current, ...partial };
    await fs.writeFile(getConfigFile(), JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  });
  writeChain = next;
  return next;
}
