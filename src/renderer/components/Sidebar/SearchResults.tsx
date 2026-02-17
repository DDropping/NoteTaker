import React from 'react';
import { SearchResult } from '../../../shared/types';

interface SearchResultsProps {
  results: SearchResult[];
  isSearching: boolean;
  onSelect: (relativePath: string) => void;
}

export function SearchResults({ results, isSearching, onSelect }: SearchResultsProps) {
  if (isSearching) {
    return <div style={styles.message}>Searching...</div>;
  }

  if (results.length === 0) {
    return <div style={styles.message}>No results found</div>;
  }

  return (
    <div style={styles.container}>
      {results.map((result, i) => (
        <button
          key={`${result.relativePath}-${i}`}
          style={styles.item}
          onClick={() => onSelect(result.relativePath)}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.background = 'var(--bg-hover)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.background = 'transparent';
          }}
        >
          <div style={styles.name}>{result.name}</div>
          <div style={styles.matchLine}>{result.matchLine}</div>
        </button>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    overflowY: 'auto',
  },
  message: {
    padding: '16px 12px',
    color: 'var(--text-muted)',
    fontSize: 13,
    textAlign: 'center',
  },
  item: {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    textAlign: 'left',
    borderRadius: 0,
    transition: 'background 0.1s',
  },
  name: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--text-primary)',
    marginBottom: 2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  matchLine: {
    fontSize: 11,
    color: 'var(--text-muted)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};
