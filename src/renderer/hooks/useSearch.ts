import { useState, useRef, useCallback } from 'react';
import { SearchResult } from '../../shared/types';

export function useSearch(delayMs: number = 300) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(
    (q: string) => {
      setQuery(q);

      if (timerRef.current) clearTimeout(timerRef.current);

      if (!q || q.length < 2) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      timerRef.current = setTimeout(async () => {
        try {
          const res = await window.api.searchNotes(q);
          setResults(res);
        } catch (err) {
          console.error('Search failed:', err);
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      }, delayMs);
    },
    [delayMs]
  );

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsSearching(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return { query, results, isSearching, search, clearSearch };
}
