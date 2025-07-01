import React, { useMemo } from 'react';
import styled from 'styled-components';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

const PreviewContainer = styled.div`
  flex: 1;
  height: 100%;
  overflow-y: auto;
  background-color: var(--bg-primary);
  padding: 40px 40px;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--text-tertiary);
  }
`;

const PreviewContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-primary);
  letter-spacing: -0.011em;

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    margin-top: 24px;
    margin-bottom: 16px;
    line-height: 1.25;
  }

  h1 {
    font-size: 2.5em;
    font-weight: 700;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.3em;
  }

  h2 {
    font-size: 2em;
    font-weight: 600;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.3em;
  }

  h3 {
    font-size: 1.5em;
  }

  h4 {
    font-size: 1.25em;
  }

  h5 {
    font-size: 1.125em;
  }

  h6 {
    font-size: 1em;
    color: var(--text-secondary);
  }

  p {
    margin-top: 0;
    margin-bottom: 16px;
  }

  a {
    color: var(--accent-color);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
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
    color: var(--text-secondary);
    border-left: 4px solid var(--border-color);
  }

  code {
    background-color: var(--bg-secondary);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'SF Mono', Menlo, Monaco, 'Courier New', monospace;
    font-size: 0.875em;
  }

  pre {
    background-color: var(--bg-secondary);
    padding: 16px;
    border-radius: 6px;
    overflow-x: auto;
    margin-bottom: 16px;
    
    code {
      background-color: transparent;
      padding: 0;
      border-radius: 0;
      font-size: 0.875em;
    }
  }

  hr {
    height: 1px;
    margin: 24px 0;
    background-color: var(--border-color);
    border: none;
  }

  table {
    border-collapse: collapse;
    margin-bottom: 16px;
    width: 100%;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;
  }

  th, td {
    border: 1px solid var(--border-color);
    padding: 12px 16px;
    text-align: left;
  }

  th {
    background-color: var(--bg-secondary);
    font-weight: 600;
    border-bottom: 2px solid var(--border-color);
  }

  tr:nth-child(even) {
    background-color: var(--bg-secondary);
  }
  
  tr:hover {
    background-color: var(--bg-hover);
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }

  input[type="checkbox"] {
    margin-right: 0.5em;
    cursor: pointer;
  }
  
  li.task-list-item {
    list-style: none;
    margin-left: -1.5em;
  }
  
  .math {
    overflow-x: auto;
    overflow-y: hidden;
  }
  
  .math-display {
    margin: 16px 0;
    text-align: center;
  }
`;

interface PreviewProps {
  content: string;
}

const Preview: React.FC<PreviewProps> = ({ content }) => {
  const htmlContent = useMemo(() => {
    try {
      const result = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkMath)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeKatex)
        .use(rehypeStringify)
        .processSync(content);
      
      return result.toString();
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return '<p>Error parsing markdown</p>';
    }
  }, [content]);

  return (
    <PreviewContainer>
      <PreviewContent dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </PreviewContainer>
  );
};

export default Preview;