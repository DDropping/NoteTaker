import React, { useState, useEffect } from 'react';

interface TemplateEditorProps {
  template: string;
  onSave: (template: string) => Promise<void> | void;
}

const VARIABLES_HELP = `Available variables: {{date}}, {{longDate}}, {{time}}, {{year}}, {{month}}, {{day}}, {{weekday}}`;

export function TemplateEditor({ template, onSave }: TemplateEditorProps) {
  const [value, setValue] = useState(template);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setValue(template);
  }, [template]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleSave = async () => {
    try {
      await onSave(value);
      setToast({ message: 'Template saved', type: 'success' });
    } catch {
      setToast({ message: 'Failed to save template', type: 'error' });
    }
  };

  return (
    <div style={styles.container}>
      <label style={styles.label}>Daily Note Template</label>
      <p style={styles.help}>{VARIABLES_HELP}</p>
      <textarea
        style={styles.textarea}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={12}
        spellCheck={false}
      />
      <div style={styles.footer}>
        {toast && (
          <div
            style={{
              ...styles.toast,
              background: toast.type === 'success' ? 'var(--success-color)' : 'var(--danger-color)',
            }}
          >
            {toast.message}
          </div>
        )}
        <button style={styles.saveBtn} onClick={handleSave}>
          Save Template
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  help: {
    fontSize: 12,
    color: 'var(--text-muted)',
    lineHeight: 1.4,
  },
  textarea: {
    width: '100%',
    padding: 12,
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: 6,
    color: 'var(--text-primary)',
    fontSize: 13,
    fontFamily: '"SF Mono", "JetBrains Mono", "Fira Code", monospace',
    resize: 'vertical',
    outline: 'none',
    lineHeight: 1.6,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  toast: {
    padding: '6px 14px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    color: '#ffffff',
    animation: 'fadeIn 0.2s ease',
  },
  saveBtn: {
    padding: '8px 16px',
    background: 'var(--accent-color)',
    color: '#ffffff',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
  },
};
