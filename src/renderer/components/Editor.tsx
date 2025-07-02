import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Compartment, Transaction, Annotation } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';
import { ViewUpdate, keymap } from '@codemirror/view';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import TableEditor from './TableEditor';

const EditorContainer = styled.div<{ $fullWidth: boolean }>`
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);

  .cm-editor {
    height: 100%;
    font-size: 15px;
    
    &.cm-focused {
      outline: none;
    }
    
    .cm-content {
      padding: 40px 40px;
      font-family: 'SF Mono', Menlo, Monaco, 'Courier New', monospace;
      line-height: 1.8;
      max-width: 800px;
      margin: 0 auto;
      width: 100%;
      caret-color: var(--accent-color);
      min-height: 100%;
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
  onSelectionChange?: (selection: { start: number; end: number; text: string } | null) => void;
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

const Editor = forwardRef<EditorHandle, EditorProps>(({ content, onChange, showPreview, onSelectionChange }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const themeConfig = useRef(new Compartment());
  const onChangeRef = useRef(onChange);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const [showTableEditor, setShowTableEditor] = useState(false);
  const [tableEditorPosition, setTableEditorPosition] = useState({ top: 0, left: 0 });
  const [tableSelection, setTableSelection] = useState<{ content: string; rows: number; cols: number } | undefined>();
  
  // Update refs to avoid recreating editor
  useEffect(() => {
    onChangeRef.current = onChange;
    onSelectionChangeRef.current = onSelectionChange;
  }, [onChange, onSelectionChange]);

  useEffect(() => {
    if (!editorRef.current) return;

    const theme = document.documentElement.getAttribute('data-theme');
    const isDark = theme === 'dark';

    const startState = EditorState.create({
      doc: content,
      extensions: [
        basicSetup,
        markdown(),
        syntaxHighlighting(defaultHighlightStyle),
        keymap.of([
          ...defaultKeymap,
          indentWithTab
        ]),
        EditorView.lineWrapping,
        themeConfig.current.of(isDark ? oneDark : []),
        EditorView.updateListener.of((update: ViewUpdate) => {
          try {
            if (update.docChanged && !update.transactions.some(tr => tr.annotation(remoteTransaction))) {
              const content = update.state.doc.toString();
              onChangeRef.current(content);
            }
            
            if (update.selectionSet && onSelectionChangeRef.current) {
              const { from, to } = update.state.selection.main;
              if (from !== to) {
                const text = update.state.doc.sliceString(from, to);
                onSelectionChangeRef.current({ start: from, end: to, text });
              } else {
                onSelectionChangeRef.current(null);
              }
            }
          } catch (error) {
            console.error('Editor update error:', error);
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
      dispatch: (transaction) => {
        // Log key events for debugging
        if (transaction.isUserEvent('input')) {
          console.log('User input event:', transaction);
        }
        view.update([transaction]);
      }
    });

    viewRef.current = view;
    
    // Focus the editor on mount
    setTimeout(() => {
      view.focus();
      console.log('Editor initialized successfully');
    }, 100);

    return () => {
      view.destroy();
    };
  }, []); // Empty dependency array - create editor only once

  useEffect(() => {
    if (viewRef.current && content !== viewRef.current.state.doc.toString()) {
      const view = viewRef.current;
      const currentPos = view.state.selection.main.head;
      const scrollPos = view.scrollDOM.scrollTop;
      
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: content,
        },
        selection: { anchor: Math.min(currentPos, content.length) },
        annotations: [remoteTransaction.of(true)]
      });
      
      // Restore scroll position
      requestAnimationFrame(() => {
        view.scrollDOM.scrollTop = scrollPos;
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
  
  const handleTableInsert = useCallback((markdown: string) => {
    if (!viewRef.current) return;
    
    const view = viewRef.current;
    const { from, to } = view.state.selection.main;
    
    view.dispatch({
      changes: { from, to, insert: markdown },
      selection: { anchor: from + markdown.length }
    });
    
    view.focus();
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
        case 'table':
          const coords = view.coordsAtPos(from);
          if (coords) {
            const editorRect = view.dom.getBoundingClientRect();
            setTableEditorPosition({
              top: coords.top - editorRect.top + 20,
              left: coords.left - editorRect.left
            });
            
            // Check if we're inside an existing table
            const line = view.state.doc.lineAt(from);
            let tableStart = -1;
            let tableEnd = -1;
            let isInTable = false;
            
            // Look backwards for table start
            for (let i = line.number; i >= 1; i--) {
              const lineText = view.state.doc.line(i).text;
              if (lineText.includes('|')) {
                if (tableStart === -1) tableStart = i;
              } else if (tableStart !== -1) {
                break;
              }
            }
            
            // Look forwards for table end
            for (let i = line.number; i <= view.state.doc.lines; i++) {
              const lineText = view.state.doc.line(i).text;
              if (lineText.includes('|')) {
                tableEnd = i;
                if (i === line.number) isInTable = true;
              } else if (tableEnd !== -1) {
                break;
              }
            }
            
            if (isInTable && tableStart !== -1 && tableEnd !== -1) {
              // Extract existing table
              const tableLines = [];
              for (let i = tableStart; i <= tableEnd; i++) {
                tableLines.push(view.state.doc.line(i).text);
              }
              
              const rows = tableLines.filter(l => l.includes('|') && !l.match(/^\s*\|?\s*:?-+:?\s*\|/));
              const cols = rows[0]?.split('|').filter(c => c.trim()).length || 3;
              
              setTableSelection({
                content: tableLines.join('\n'),
                rows: rows.length,
                cols
              });
            } else {
              setTableSelection(undefined);
            }
            
            setShowTableEditor(true);
          }
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
    <>
      <EditorContainer ref={editorRef} $fullWidth={!showPreview} />
      {showTableEditor && (
        <TableEditor
          position={tableEditorPosition}
          onInsert={handleTableInsert}
          onClose={() => setShowTableEditor(false)}
          initialSelection={tableSelection}
        />
      )}
    </>
  );
});

Editor.displayName = 'Editor';

export default Editor;