import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import styled from 'styled-components';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { ViewUpdate } from '@codemirror/view';

const EditorContainer = styled.div<{ $fullWidth: boolean }>`
  flex: ${props => props.$fullWidth ? '1' : '0 0 50%'};
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  border-right: ${props => props.$fullWidth ? 'none' : '1px solid var(--border-color)'};
  transition: flex 0.3s ease;

  .cm-editor {
    height: 100%;
    font-size: 15px;
    
    .cm-content {
      padding: 40px 60px;
      font-family: 'SF Mono', Menlo, Monaco, 'Courier New', monospace;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      width: 100%;
    }

    .cm-line {
      padding-left: 0;
      padding-right: 0;
    }

    .cm-gutters {
      background-color: var(--bg-primary);
      border-right: none;
      color: var(--text-tertiary);
    }

    .cm-activeLineGutter {
      background-color: var(--bg-secondary);
    }

    .cm-cursor {
      border-left-color: var(--accent-color);
      border-left-width: 2px;
    }

    .cm-focused .cm-selectionBackground,
    ::selection {
      background-color: var(--accent-color);
      opacity: 0.3;
    }
  }

  [data-theme='dark'] & {
    .cm-editor {
      color-scheme: dark;
    }
  }
`;

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  showPreview: boolean;
}

export interface EditorHandle {
  format: (action: string, value?: any) => void;
}

const Editor = forwardRef<EditorHandle, EditorProps>(({ content, onChange, showPreview }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const themeConfig = useRef(new Compartment());

  useEffect(() => {
    if (!editorRef.current) return;

    const theme = document.documentElement.getAttribute('data-theme');
    const isDark = theme === 'dark';

    const startState = EditorState.create({
      doc: content,
      extensions: [
        basicSetup,
        markdown(),
        themeConfig.current.of(isDark ? oneDark : []),
        EditorView.updateListener.of((update: ViewUpdate) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '15px',
          },
          '.cm-content': {
            fontFamily: "'SF Mono', Menlo, Monaco, 'Courier New', monospace",
          },
          '.cm-focused': {
            outline: 'none',
          },
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  useEffect(() => {
    if (viewRef.current && content !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: content,
        },
      });
    }
  }, [content]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const theme = document.documentElement.getAttribute('data-theme');
      const isDark = theme === 'dark';
      
      if (viewRef.current) {
        viewRef.current.dispatch({
          effects: themeConfig.current.reconfigure(isDark ? oneDark : [])
        });
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  useImperativeHandle(ref, () => ({
    format: (action: string, value?: any) => {
      if (!viewRef.current) return;
      
      const view = viewRef.current;
      const { from, to } = view.state.selection.main;
      const selectedText = view.state.doc.sliceString(from, to);
      
      const wrapSelection = (before: string, after: string = before) => {
        const text = selectedText || 'text';
        view.dispatch({
          changes: { from, to, insert: `${before}${text}${after}` },
          selection: { anchor: from + before.length + text.length + after.length }
        });
      };

      const prefixLine = (prefix: string) => {
        const line = view.state.doc.lineAt(from);
        const lineText = view.state.doc.sliceString(line.from, line.to);
        const newText = lineText.startsWith(prefix)
          ? lineText.slice(prefix.length)
          : prefix + lineText;
        view.dispatch({
          changes: { from: line.from, to: line.to, insert: newText }
        });
      };

      switch (action) {
        case 'bold':
          wrapSelection('**');
          break;
        case 'italic':
          wrapSelection('*');
          break;
        case 'strikethrough':
          wrapSelection('~~');
          break;
        case 'heading':
          prefixLine('#'.repeat(value || 1) + ' ');
          break;
        case 'link':
          view.dispatch({
            changes: { from, to, insert: `[${selectedText || 'link text'}](url)` }
          });
          break;
        case 'code':
          wrapSelection('`');
          break;
        case 'codeBlock':
          view.dispatch({
            changes: { from, to, insert: `\`\`\`\n${selectedText || 'code'}\n\`\`\`` }
          });
          break;
        case 'quote':
          prefixLine('> ');
          break;
        case 'orderedList':
          prefixLine('1. ');
          break;
        case 'unorderedList':
          prefixLine('- ');
          break;
        case 'horizontalRule':
          view.dispatch({
            changes: { from, to, insert: '\n---\n' }
          });
          break;
      }
      
      view.focus();
    }
  }), []);

  return (
    <EditorContainer ref={editorRef} $fullWidth={!showPreview} />
  );
});

Editor.displayName = 'Editor';

export default Editor;