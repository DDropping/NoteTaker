import { EditorView } from '@codemirror/view';
import { Extension } from '@codemirror/state';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

export function createEditorTheme(isDark: boolean): Extension {
  const theme = EditorView.theme(
    {
      '&': {
        fontSize: '14px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        height: '100%',
      },
      '.cm-scroller': {
        overflow: 'auto',
        height: '100%',
      },
      '.cm-content': {
        padding: '20px 40px',
        maxWidth: '800px',
        margin: '0 auto',
        color: isDark ? '#ffffff' : '#1a1a1a',
        caretColor: isDark ? '#ffffff' : '#1a1a1a',
      },
      '.cm-cursor': {
        borderLeftColor: isDark ? '#ffffff' : '#1a1a1a',
      },
      '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
        backgroundColor: isDark ? '#33467c' : '#b3d7ff',
      },
      '.cm-activeLine': {
        backgroundColor: isDark ? 'rgba(49, 50, 68, 0.3)' : 'rgba(0, 0, 0, 0.04)',
      },
      '.cm-gutters': {
        backgroundColor: isDark ? '#1e1e2e' : '#ffffff',
        borderRight: 'none',
      },
      '.cm-lineNumbers .cm-gutterElement': {
        color: isDark ? '#6c7086' : '#999999',
      },
      '&.cm-focused .cm-cursor': {
        borderLeftColor: isDark ? '#ffffff' : '#1a1a1a',
      },
      '&.cm-focused': {
        outline: 'none',
      },
      '.cm-line': {
        padding: '1px 0',
      },
      // Live preview heading styles
      '.cm-heading-1': {
        fontSize: '1.6em',
        fontWeight: '700',
        lineHeight: '1.3',
        color: isDark ? '#a6e3a1' : '#16a34a',
      },
      '.cm-heading-2': {
        fontSize: '1.3em',
        fontWeight: '600',
        lineHeight: '1.3',
        color: isDark ? '#94e2d5' : '#0d9488',
      },
      '.cm-heading-3': {
        fontSize: '1.1em',
        fontWeight: '600',
        lineHeight: '1.3',
        color: isDark ? '#89b4fa' : '#2563eb',
      },
      '.cm-heading-4': {
        fontSize: '1em',
        fontWeight: '600',
        lineHeight: '1.3',
        color: isDark ? '#cba6f7' : '#7c3aed',
      },
      '.cm-heading-5': {
        fontSize: '0.95em',
        fontWeight: '600',
        lineHeight: '1.3',
        color: isDark ? '#f5c2e7' : '#db2777',
      },
      '.cm-strong': {
        fontWeight: '700',
      },
      '.cm-emphasis': {
        fontStyle: 'italic',
      },
      '.cm-strikethrough': {
        textDecoration: 'line-through',
      },
      '.cm-code-inline': {
        fontFamily: '"SF Mono", "JetBrains Mono", "Fira Code", monospace',
        fontSize: '0.9em',
        backgroundColor: isDark ? '#313244' : '#f0f0f0',
        padding: '2px 4px',
        borderRadius: '3px',
      },
      '.cm-link-text': {
        color: isDark ? '#89b4fa' : '#2563eb',
        textDecoration: 'underline',
        textDecorationStyle: 'dotted',
      },
      '.cm-wiki-link': {
        color: isDark ? '#89b4fa' : '#2563eb',
        cursor: 'pointer',
        textDecoration: 'underline',
        textDecorationStyle: 'dotted',
      },
      '.cm-blockquote-line': {
        borderLeft: `3px solid ${isDark ? '#45475a' : '#d0d0d0'}`,
        paddingLeft: '12px',
        color: isDark ? '#bac2de' : '#666666',
      },
      '.cm-hr-line': {
        borderBottom: `2px solid ${isDark ? '#45475a' : '#d0d0d0'}`,
        lineHeight: '0',
        paddingBottom: '8px',
        marginBottom: '8px',
      },
      '.cm-task-checked': {
        textDecoration: 'line-through',
        color: isDark ? '#6c7086' : '#999999',
      },
      '.cm-task-checkbox': {
        appearance: 'none',
        width: '16px',
        height: '16px',
        border: `2px solid ${isDark ? '#7f849c' : '#999999'}`,
        borderRadius: '3px',
        verticalAlign: 'middle',
        marginRight: '4px',
        cursor: 'pointer',
        position: 'relative',
        top: '-1px',
        backgroundColor: 'transparent',
        transition: 'background 0.15s, border-color 0.15s',
      },
      '.cm-task-checkbox:checked': {
        backgroundColor: isDark ? '#7aa2f7' : '#0066cc',
        borderColor: isDark ? '#7aa2f7' : '#0066cc',
      },
      '.cm-task-checkbox:checked::after': {
        content: '""',
        position: 'absolute',
        left: '3px',
        top: '0px',
        width: '5px',
        height: '9px',
        border: 'solid #ffffff',
        borderWidth: '0 2px 2px 0',
        transform: 'rotate(45deg)',
      },
      '.cm-task-checkbox:hover': {
        borderColor: isDark ? '#7aa2f7' : '#0066cc',
      },
      '.cm-code-block': {
        fontFamily: '"SF Mono", "JetBrains Mono", "Fira Code", monospace',
        fontSize: '0.9em',
        backgroundColor: isDark ? '#181825' : '#f5f5f5',
        borderRadius: '0',
      },
      '.cm-code-block-open': {
        borderRadius: '6px 6px 0 0',
        minHeight: '8px',
      },
      '.cm-code-block-close': {
        borderRadius: '0 0 6px 6px',
        minHeight: '8px',
      },
      '.cm-code-block-copy-wrapper': {
        display: 'inline-flex',
        width: '100%',
        justifyContent: 'flex-end',
      },
      '.cm-code-block-copy': {
        appearance: 'none',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: isDark ? '#6c7086' : '#999999',
        padding: '0 2px',
        borderRadius: '4px',
        opacity: '0.6',
        transition: 'opacity 0.15s',
        display: 'inline-flex',
        alignItems: 'center',
        lineHeight: '1',
      },
      '.cm-code-block-copy:hover': {
        opacity: '1',
        color: isDark ? '#cdd6f4' : '#333333',
      },
      '.cm-hidden-markup': {
        fontSize: '0',
        width: '0',
        display: 'inline',
        overflow: 'hidden',
      },
    },
    { dark: isDark }
  );

  const highlightStyle = HighlightStyle.define([
    { tag: tags.heading1, fontSize: '1.6em', fontWeight: '700', color: isDark ? '#a6e3a1' : '#16a34a' },
    { tag: tags.heading2, fontSize: '1.3em', fontWeight: '600', color: isDark ? '#94e2d5' : '#0d9488' },
    { tag: tags.heading3, fontSize: '1.1em', fontWeight: '600', color: isDark ? '#89b4fa' : '#2563eb' },
    { tag: tags.heading4, fontSize: '1em', fontWeight: '600', color: isDark ? '#cba6f7' : '#7c3aed' },
    { tag: tags.heading5, fontSize: '0.95em', fontWeight: '600', color: isDark ? '#f5c2e7' : '#db2777' },
    { tag: tags.strong, fontWeight: '700' },
    { tag: tags.emphasis, fontStyle: 'italic' },
    { tag: tags.strikethrough, textDecoration: 'line-through' },
    { tag: tags.link, color: isDark ? '#89b4fa' : '#2563eb' },
    { tag: tags.url, color: isDark ? '#74c7ec' : '#0284c7' },
    {
      tag: tags.monospace,
      fontFamily: '"SF Mono", "JetBrains Mono", monospace',
      fontSize: '0.9em',
    },
    { tag: tags.meta, color: isDark ? '#6c7086' : '#999999' },
    { tag: tags.comment, color: isDark ? '#6c7086' : '#999999' },
    { tag: tags.processingInstruction, color: isDark ? '#6c7086' : '#999999' },
    { tag: tags.keyword, color: isDark ? '#cba6f7' : '#7c3aed' },
    { tag: tags.string, color: isDark ? '#a6e3a1' : '#16a34a' },
    { tag: tags.number, color: isDark ? '#fab387' : '#ea580c' },
  ]);

  return [theme, syntaxHighlighting(highlightStyle)];
}
