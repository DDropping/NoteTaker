import fs from 'node:fs/promises';
import path from 'node:path';
import { getNotesDir } from '../utils/paths';
import { SearchResult } from '../../shared/types';

export async function searchNotes(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();

  async function searchDir(dirPath: string) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;

      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        await searchDir(fullPath);
      } else if (entry.name.endsWith('.md')) {
        const relativePath = path.relative(getNotesDir(), fullPath);
        const nameMatch = entry.name.toLowerCase().includes(lowerQuery);

        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          const lines = content.split('\n');
          let contentMatchFound = false;

          for (let i = 0; i < lines.length; i++) {
            if (lines[i].toLowerCase().includes(lowerQuery)) {
              results.push({
                relativePath,
                name: entry.name.replace('.md', ''),
                matchLine: lines[i].trim(),
                lineNumber: i + 1,
              });
              contentMatchFound = true;
              break;
            }
          }

          if (nameMatch && !contentMatchFound) {
            results.push({
              relativePath,
              name: entry.name.replace('.md', ''),
              matchLine: lines[0]?.trim() || '',
              lineNumber: 1,
            });
          }
        } catch {
          // Skip unreadable files
        }
      }
    }
  }

  await searchDir(getNotesDir());
  return results.slice(0, 50);
}
