import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import rehypePrism from 'rehype-prism-plus';

export interface ExportOptions {
  includeStyles?: boolean;
  includeHighlighting?: boolean;
  pageSize?: 'A4' | 'Letter';
  margins?: 'normal' | 'narrow' | 'wide';
}

const getPageStyles = (options: ExportOptions) => {
  const margins = {
    narrow: '10mm',
    normal: '20mm',
    wide: '30mm'
  };

  const marginSize = margins[options.margins || 'normal'];

  return `
    @page {
      size: ${options.pageSize || 'A4'};
      margin: ${marginSize};
    }
    
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      
      .no-print {
        display: none !important;
      }
    }
  `;
};

const getBaseStyles = () => `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-size: 16px;
    line-height: 1.8;
    color: #1a1a1a;
    max-width: 800px;
    margin: 0 auto;
    padding: 40px;
    background: white;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    margin-top: 24px;
    margin-bottom: 16px;
    line-height: 1.25;
  }
  
  h1 {
    font-size: 2.5em;
    font-weight: 700;
    border-bottom: 1px solid #e1e4e8;
    padding-bottom: 0.3em;
  }
  
  h2 {
    font-size: 2em;
    font-weight: 600;
    border-bottom: 1px solid #e1e4e8;
    padding-bottom: 0.3em;
  }
  
  h3 { font-size: 1.5em; }
  h4 { font-size: 1.25em; }
  h5 { font-size: 1.125em; }
  h6 { font-size: 1em; color: #6a737d; }
  
  p {
    margin-top: 0;
    margin-bottom: 16px;
  }
  
  a {
    color: #0366d6;
    text-decoration: none;
  }
  
  a:hover {
    text-decoration: underline;
  }
  
  ul, ol {
    margin-top: 0;
    margin-bottom: 16px;
    padding-left: 2em;
  }
  
  li {
    margin-bottom: 4px;
  }
  
  blockquote {
    margin: 0 0 16px 0;
    padding: 0 1em;
    color: #6a737d;
    border-left: 4px solid #dfe2e5;
  }
  
  code {
    background-color: #f6f8fa;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'SF Mono', Menlo, Monaco, 'Courier New', monospace;
    font-size: 0.875em;
  }
  
  pre {
    background-color: #f6f8fa;
    padding: 16px;
    border-radius: 6px;
    overflow-x: auto;
    margin-bottom: 16px;
  }
  
  pre code {
    background-color: transparent;
    padding: 0;
    border-radius: 0;
    font-size: 0.875em;
  }
  
  hr {
    height: 1px;
    margin: 24px 0;
    background-color: #e1e4e8;
    border: none;
  }
  
  table {
    border-collapse: collapse;
    margin-bottom: 16px;
    width: 100%;
    border: 1px solid #dfe2e5;
  }
  
  th, td {
    border: 1px solid #dfe2e5;
    padding: 12px 16px;
    text-align: left;
  }
  
  th {
    background-color: #f6f8fa;
    font-weight: 600;
  }
  
  tr:nth-child(even) {
    background-color: #f6f8fa;
  }
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }
  
  input[type="checkbox"] {
    margin-right: 0.5em;
  }
  
  li.task-list-item {
    list-style: none;
    margin-left: -1.5em;
  }
  
  /* KaTeX styles */
  .katex {
    font-size: 1.1em;
  }
  
  .katex-display {
    margin: 16px 0;
    text-align: center;
  }
`;

const getHighlightingStyles = () => `
  /* Prism.js syntax highlighting */
  pre[class*="language-"] {
    background: #f6f8fa;
    border-radius: 6px;
    padding: 16px;
    overflow: auto;
  }
  
  code[class*="language-"] {
    color: #24292e;
    font-family: 'SF Mono', Consolas, Monaco, 'Andale Mono', monospace;
  }
  
  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #6a737d;
  }
  
  .token.punctuation {
    color: #24292e;
  }
  
  .token.property,
  .token.tag,
  .token.boolean,
  .token.number,
  .token.constant,
  .token.symbol,
  .token.deleted {
    color: #005cc5;
  }
  
  .token.selector,
  .token.attr-name,
  .token.string,
  .token.char,
  .token.builtin,
  .token.inserted {
    color: #032f62;
  }
  
  .token.operator,
  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string {
    color: #d73a49;
  }
  
  .token.atrule,
  .token.attr-value,
  .token.keyword {
    color: #d73a49;
  }
  
  .token.function,
  .token.class-name {
    color: #6f42c1;
  }
  
  .token.regex,
  .token.important,
  .token.variable {
    color: #e36209;
  }
`;

export async function convertMarkdownToHTML(
  markdown: string,
  options: ExportOptions = {}
): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeKatex);

  if (options.includeHighlighting) {
    processor.use(rehypePrism);
  }

  processor.use(rehypeStringify);

  const result = await processor.process(markdown);
  const htmlContent = result.toString();

  if (!options.includeStyles) {
    return htmlContent;
  }

  const styles = [
    getPageStyles(options),
    getBaseStyles(),
    options.includeHighlighting ? getHighlightingStyles() : '',
    `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css">`
  ].join('\n');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Document</title>
  <style>${styles}</style>
</head>
<body>
  ${htmlContent}
</body>
</html>
  `.trim();
}

export async function convertMarkdownToDocx(markdown: string): Promise<ArrayBuffer> {
  // For Word export, we'll convert to HTML first and let the browser handle the conversion
  // In a real implementation, you'd use a library like docx.js
  const html = await convertMarkdownToHTML(markdown, {
    includeStyles: true,
    includeHighlighting: true
  });
  
  // Create a blob with the HTML content
  const blob = new Blob([html], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  
  // Convert to ArrayBuffer
  return blob.arrayBuffer();
}