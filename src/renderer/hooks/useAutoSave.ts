import { useRef, useCallback } from 'react';

export function useAutoSave(delayMs: number = 1000) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');

  const scheduleSave = useCallback(
    (relativePath: string, content: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (content === lastSavedRef.current) return;

      timerRef.current = setTimeout(async () => {
        try {
          await window.api.writeFile(relativePath, content);
          lastSavedRef.current = content;
        } catch (err) {
          console.error('Auto-save failed:', err);
        }
      }, delayMs);
    },
    [delayMs]
  );

  const saveImmediately = useCallback(async (relativePath: string, content: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    try {
      await window.api.writeFile(relativePath, content);
      lastSavedRef.current = content;
    } catch (err) {
      console.error('Immediate save failed:', err);
    }
  }, []);

  const setBaseline = useCallback((content: string) => {
    lastSavedRef.current = content;
  }, []);

  return { scheduleSave, saveImmediately, setBaseline };
}
