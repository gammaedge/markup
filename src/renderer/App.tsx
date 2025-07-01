import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import styled from 'styled-components';
import Editor, { EditorHandle } from './components/Editor';
import Preview from './components/Preview';
import Toolbar from './components/Toolbar';
import StatusBar from './components/StatusBar';
import SplitPane from './components/SplitPane';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-primary);
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const App: React.FC = () => {
  const [content, setContent] = useState('# Welcome to Elegant Markdown Editor\n\nStart typing to see the magic happen...');
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showPreview, setShowPreview] = useState(true);
  const [isModified, setIsModified] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50);
  const editorRef = useRef<EditorHandle>(null);

  useEffect(() => {
    window.electronAPI.getTheme().then((theme) => {
      setTheme(theme as 'light' | 'dark');
      document.documentElement.setAttribute('data-theme', theme);
    });

    window.electronAPI.onThemeChanged((theme) => {
      setTheme(theme as 'light' | 'dark');
      document.documentElement.setAttribute('data-theme', theme);
    });

    window.electronAPI.onFileNew(() => {
      setContent('');
      setCurrentFile(null);
      setIsModified(false);
    });

    window.electronAPI.onFileOpened(({ filePath, content }) => {
      setContent(content);
      setCurrentFile(filePath);
      setIsModified(false);
    });

    window.electronAPI.onFileSave(() => {
      handleSave();
    });

    window.electronAPI.onFileSaveAs(() => {
      handleSaveAs();
    });
  }, []);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setIsModified(true);
  }, []);

  const handleSave = async () => {
    const result = await window.electronAPI.saveFile({
      content,
      filePath: currentFile || undefined,
    });

    if (result.success && result.filePath) {
      setCurrentFile(result.filePath);
      setIsModified(false);
    }
  };

  const handleSaveAs = async () => {
    const result = await window.electronAPI.saveFile({
      content,
    });

    if (result.success && result.filePath) {
      setCurrentFile(result.filePath);
      setIsModified(false);
    }
  };

  const handleFormat = useCallback((action: string, value?: any) => {
    editorRef.current?.format(action, value);
  }, []);

  const shortcuts = useMemo(() => ({
    'cmd+b': () => handleFormat('bold'),
    'cmd+i': () => handleFormat('italic'),
    'cmd+k': () => handleFormat('link'),
    'cmd+e': () => handleFormat('code'),
    'cmd+shift+c': () => handleFormat('codeBlock'),
    'cmd+shift+.': () => handleFormat('quote'),
    'cmd+shift+7': () => handleFormat('orderedList'),
    'cmd+shift+8': () => handleFormat('unorderedList'),
    'cmd+1': () => handleFormat('heading', 1),
    'cmd+2': () => handleFormat('heading', 2),
    'cmd+3': () => handleFormat('heading', 3),
    'cmd+/': () => setShowPreview(!showPreview),
  }), [handleFormat, showPreview]);

  useKeyboardShortcuts(shortcuts);

  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = content.length;

  return (
    <AppContainer>
      <Toolbar 
        onTogglePreview={() => setShowPreview(!showPreview)}
        showPreview={showPreview}
        onFormat={handleFormat}
      />
      <MainContent>
        {showPreview ? (
          <SplitPane 
            defaultSplit={splitPosition} 
            minSize={300} 
            maxSize={70}
            onSplitChange={setSplitPosition}
          >
            <Editor 
              ref={editorRef}
              content={content} 
              onChange={handleContentChange}
              showPreview={showPreview}
            />
            <Preview content={content} />
          </SplitPane>
        ) : (
          <Editor 
            ref={editorRef}
            content={content} 
            onChange={handleContentChange}
            showPreview={showPreview}
          />
        )}
      </MainContent>
      <StatusBar 
        filePath={currentFile}
        wordCount={wordCount}
        charCount={charCount}
        isModified={isModified}
      />
    </AppContainer>
  );
};

export default App;