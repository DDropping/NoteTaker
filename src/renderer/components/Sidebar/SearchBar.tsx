import React from 'react';

interface SearchBarProps {
  query: string;
  onSearch: (query: string) => void;
  onClear: () => void;
}

export function SearchBar({ query, onSearch, onClear }: SearchBarProps) {
  return (
    <div style={styles.container}>
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="var(--text-muted)"
        style={styles.icon}
      >
        <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.1zM12 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z" />
      </svg>
      <input
        style={styles.input}
        type="text"
        placeholder="Search notes..."
        value={query}
        onChange={(e) => onSearch(e.target.value)}
      />
      {query && (
        <button style={styles.clearBtn} onClick={onClear}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
          </svg>
        </button>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    gap: 8,
    borderBottom: '1px solid var(--border-color)',
  },
  icon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontSize: 13,
  },
  clearBtn: {
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    color: 'var(--text-muted)',
  },
};
