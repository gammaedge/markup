export interface FormatAction {
  bold: () => void;
  italic: () => void;
  strikethrough: () => void;
  heading: (level: number) => void;
  link: () => void;
  image: () => void;
  code: () => void;
  codeBlock: () => void;
  quote: () => void;
  orderedList: () => void;
  unorderedList: () => void;
  horizontalRule: () => void;
}

export function createFormatActions(
  getSelection: () => { from: number; to: number; text: string },
  replaceSelection: (text: string) => void,
  getLine: (pos: number) => { from: number; to: number; text: string }
): FormatAction {
  const wrapSelection = (before: string, after: string = before) => {
    const { text } = getSelection();
    replaceSelection(`${before}${text || 'text'}${after}`);
  };

  const prefixLine = (prefix: string) => {
    const { from } = getSelection();
    const line = getLine(from);
    const newText = line.text.startsWith(prefix)
      ? line.text.slice(prefix.length)
      : prefix + line.text;
    replaceSelection(newText);
  };

  return {
    bold: () => wrapSelection('**'),
    italic: () => wrapSelection('*'),
    strikethrough: () => wrapSelection('~~'),
    heading: (level: number) => {
      const prefix = '#'.repeat(level) + ' ';
      prefixLine(prefix);
    },
    link: () => {
      const { text } = getSelection();
      replaceSelection(`[${text || 'link text'}](url)`);
    },
    image: () => {
      const { text } = getSelection();
      replaceSelection(`![${text || 'alt text'}](image-url)`);
    },
    code: () => wrapSelection('`'),
    codeBlock: () => {
      const { text } = getSelection();
      replaceSelection(`\`\`\`\n${text || 'code'}\n\`\`\``);
    },
    quote: () => prefixLine('> '),
    orderedList: () => prefixLine('1. '),
    unorderedList: () => prefixLine('- '),
    horizontalRule: () => replaceSelection('\n---\n'),
  };
}