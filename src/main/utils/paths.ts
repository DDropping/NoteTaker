import path from 'node:path';
import { app } from 'electron';

// Lazy getters — app.getPath() must not be called before the app 'ready' event.
export function getNotesDir(): string {
  return path.join(app.getPath('documents'), 'NoteTaker');
}

export function getConfigDir(): string {
  return path.join(getNotesDir(), '.notetaker');
}

export function getConfigFile(): string {
  return path.join(getConfigDir(), 'config.json');
}

export function getDailyNotesDir(): string {
  return path.join(getNotesDir(), 'Daily Notes');
}

export function getArchivedDailyNotesDir(): string {
  return path.join(getDailyNotesDir(), 'Archived');
}

export function resolveSafe(relativePath: string): string {
  const notesDir = getNotesDir();
  const resolved = path.resolve(notesDir, relativePath);
  if (!resolved.startsWith(notesDir)) {
    throw new Error('Path traversal detected');
  }
  return resolved;
}
