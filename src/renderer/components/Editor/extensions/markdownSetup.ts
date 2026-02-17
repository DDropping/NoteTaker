import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';

export function createMarkdownExtension() {
  return markdown({
    base: markdownLanguage,
    codeLanguages: languages,
  });
}
