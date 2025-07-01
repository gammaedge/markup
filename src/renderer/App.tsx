import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Toolbar from './components/Toolbar';
import StatusBar from './components/StatusBar';

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

  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = content.length;

  return (
    <AppContainer>
      <Toolbar 
        onTogglePreview={() => setShowPreview(!showPreview)}
        showPreview={showPreview}
      />
      <MainContent>
        <Editor 
          content={content} 
          onChange={handleContentChange}
          showPreview={showPreview}
        />
        {showPreview && <Preview content={content} />}
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