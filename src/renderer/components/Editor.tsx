import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import styled from 'styled-components';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Compartment, Transaction, Annotation } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { ViewUpdate } from '@codemirror/view';

const EditorContainer = styled.div<{ $fullWidth: boolean }>`
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);

  .cm-editor {
    height: 100%;
    font-size: 15px;
    
    .cm-content {
      padding: 60px 80px;
      font-family: 'SF Mono', Menlo, Monaco, 'Courier New', monospace;
      line-height: 1.8;
      max-width: 760px;
      margin: 0 auto;
      width: 100%;
      caret-color: var(--accent-color);
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
      border-left-width: 3px;
    }

    .cm-focused .cm-selectionBackground,
    ::selection {
      background-color: var(--accent-light);
    }
    
    .cm-activeLine {
      background-color: transparent;
    }
    
    .cm-focused .cm-activeLine {
      background-color: var(--bg-secondary);
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
  goToLine: (line: number) => void;
  getCurrentLine: () => number;
  find: (query: string, options: any) => { current: number; total: number };
  replace: (replacement: string) => void;
  replaceAll: (query: string, replacement: string, options: any) => number;
  navigateFind: (direction: 'next' | 'prev') => void;
}

const remoteTransaction = Annotation.define<boolean>();

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
          if (update.docChanged && !update.transactions.some(tr => tr.annotation(remoteTransaction))) {
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
      const view = viewRef.current;
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: content,
        },
        selection: { anchor: 0 },
        annotations: [remoteTransaction.of(true)]
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
    },
    goToLine: (line: number) => {
      if (!viewRef.current) return;
      
      const view = viewRef.current;
      const doc = view.state.doc;
      const lineInfo = doc.line(Math.min(line + 1, doc.lines));
      
      view.dispatch({
        selection: { anchor: lineInfo.from, head: lineInfo.from },
        scrollIntoView: true
      });
      
      view.focus();
    },
    getCurrentLine: () => {
      if (!viewRef.current) return 0;
      
      const view = viewRef.current;
      const pos = view.state.selection.main.head;
      return view.state.doc.lineAt(pos).number - 1;
    },
    find: (query: string, options: any) => {
      if (!viewRef.current || !query) return { current: 0, total: 0 };
      
      const view = viewRef.current;
      const doc = view.state.doc;
      const text = doc.toString();
      
      let regex: RegExp;
      try {
        if (options.regex) {
          regex = new RegExp(query, options.caseSensitive ? 'g' : 'gi');
        } else {
          const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const pattern = options.wholeWord ? `\\b${escapedQuery}\\b` : escapedQuery;
          regex = new RegExp(pattern, options.caseSensitive ? 'g' : 'gi');
        }
      } catch {
        return { current: 0, total: 0 };
      }
      
      const matches = Array.from(text.matchAll(regex));
      const currentPos = view.state.selection.main.from;
      let current = 0;
      
      for (let i = 0; i < matches.length; i++) {
        if (matches[i].index! >= currentPos) {
          current = i + 1;
          break;
        }
      }
      
      return { current: current || (matches.length > 0 ? 1 : 0), total: matches.length };
    },
    replace: (replacement: string) => {
      if (!viewRef.current) return;
      
      const view = viewRef.current;
      const { from, to } = view.state.selection.main;
      
      if (from !== to) {
        view.dispatch({
          changes: { from, to, insert: replacement },
          selection: { anchor: from + replacement.length }
        });
      }
    },
    replaceAll: (query: string, replacement: string, options: any) => {
      if (!viewRef.current || !query) return 0;
      
      const view = viewRef.current;
      const doc = view.state.doc;
      const text = doc.toString();
      
      let regex: RegExp;
      try {
        if (options.regex) {
          regex = new RegExp(query, options.caseSensitive ? 'g' : 'gi');
        } else {
          const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const pattern = options.wholeWord ? `\\b${escapedQuery}\\b` : escapedQuery;
          regex = new RegExp(pattern, options.caseSensitive ? 'g' : 'gi');
        }
      } catch {
        return 0;
      }
      
      const matches = Array.from(text.matchAll(regex));
      const changes = matches.map(match => ({
        from: match.index!,
        to: match.index! + match[0].length,
        insert: replacement
      })).reverse();
      
      if (changes.length > 0) {
        view.dispatch({ changes });
      }
      
      return changes.length;
    },
    navigateFind: (direction: 'next' | 'prev') => {
      // TODO: Implement find navigation
    }
  }), []);

  return (
    <EditorContainer ref={editorRef} $fullWidth={!showPreview} />
  );
});

Editor.displayName = 'Editor';

export default Editor;