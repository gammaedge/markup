import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import styled from 'styled-components';
import Editor, { EditorHandle } from './components/Editor';
import Preview from './components/Preview';
import Toolbar from './components/Toolbar';
import StatusBar from './components/StatusBar';
import SplitPane from './components/SplitPane';
import FocusMode from './components/FocusMode';
import TabBar, { TabItem } from './components/TabBar';
import Sidebar from './components/Sidebar';
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

const EditorArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

interface Document {
  id: string;
  content: string;
  path?: string;
  title: string;
  isModified: boolean;
}

const App: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      content: '# Welcome to Elegant Markdown Editor\n\nStart typing to see the magic happen...\n\n## Features\n\n- **Live Preview** - See your Markdown rendered in real-time\n- **Task Lists** - [ ] Create todo items\n- **Tables** - Create beautiful tables\n- **Math Support** - Write equations like $E = mc^2$\n\n## Example Table\n\n| Feature | Status |\n|---------|--------|\n| Editor  | ✅ |\n| Preview | ✅ |\n| Tabs    | ✅ |\n\n## Math Example\n\n$$\n\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}\n$$',
      title: 'Welcome.md',
      isModified: false
    }
  ]);
  const [activeDocId, setActiveDocId] = useState('1');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showPreview, setShowPreview] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [splitPosition, setSplitPosition] = useState(50);
  const [focusMode, setFocusMode] = useState(false);
  const [recentFiles, setRecentFiles] = useState<Array<{ path: string; name: string }>>([]);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const editorRef = useRef<EditorHandle>(null);
  const nextDocId = useRef(2);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const activeDoc = documents.find(doc => doc.id === activeDocId) || documents[0];

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
      handleNewTab();
    });

    window.electronAPI.onFileOpened(({ filePath, content }) => {
      const existingDoc = documents.find(doc => doc.path === filePath);
      if (existingDoc) {
        setActiveDocId(existingDoc.id);
      } else {
        const newDoc: Document = {
          id: String(nextDocId.current++),
          content,
          path: filePath,
          title: filePath.split('/').pop() || 'Unknown',
          isModified: false
        };
        setDocuments([...documents, newDoc]);
        setActiveDocId(newDoc.id);
      }
      
      if (!recentFiles.find(f => f.path === filePath)) {
        setRecentFiles([...recentFiles, { 
          path: filePath, 
          name: filePath.split('/').pop() || 'Unknown' 
        }]);
      }
    });

    window.electronAPI.onFileSave(() => {
      handleSave();
    });

    window.electronAPI.onFileSaveAs(() => {
      handleSaveAs();
    });
  }, []);

  useEffect(() => {
    if (autoSaveEnabled && activeDoc.isModified && activeDoc.path) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave();
      }, 3000);
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [autoSaveEnabled, activeDoc.isModified, activeDoc.path, activeDoc.content]);

  const handleContentChange = useCallback((newContent: string) => {
    setDocuments(docs => 
      docs.map(doc => 
        doc.id === activeDocId 
          ? { ...doc, content: newContent, isModified: true }
          : doc
      )
    );
  }, [activeDocId]);
  
  const handleNavigate = useCallback((line: number) => {
    editorRef.current?.goToLine(line);
  }, []);
  
  const handleNewTab = useCallback(() => {
    const newDoc: Document = {
      id: String(nextDocId.current++),
      content: '',
      title: `Untitled-${nextDocId.current - 1}.md`,
      isModified: false
    };
    setDocuments([...documents, newDoc]);
    setActiveDocId(newDoc.id);
  }, [documents]);
  
  const handleTabClose = useCallback((id: string) => {
    if (documents.length <= 1) return;
    
    const docIndex = documents.findIndex(doc => doc.id === id);
    const newDocs = documents.filter(doc => doc.id !== id);
    setDocuments(newDocs);
    
    if (id === activeDocId) {
      const newActiveIndex = Math.max(0, docIndex - 1);
      setActiveDocId(newDocs[newActiveIndex].id);
    }
  }, [documents, activeDocId]);

  const handleSave = async () => {
    const result = await window.electronAPI.saveFile({
      content: activeDoc.content,
      filePath: activeDoc.path,
    });

    if (result.success && result.filePath) {
      setDocuments(docs => 
        docs.map(doc => 
          doc.id === activeDocId 
            ? { ...doc, path: result.filePath, isModified: false, title: result.filePath!.split('/').pop() || doc.title }
            : doc
        )
      );
      
      if (!recentFiles.find(f => f.path === result.filePath)) {
        setRecentFiles([...recentFiles, { 
          path: result.filePath, 
          name: result.filePath!.split('/').pop() || 'Unknown' 
        }]);
      }
    }
  };

  const handleSaveAs = async () => {
    const result = await window.electronAPI.saveFile({
      content: activeDoc.content,
    });

    if (result.success && result.filePath) {
      setDocuments(docs => 
        docs.map(doc => 
          doc.id === activeDocId 
            ? { ...doc, path: result.filePath, isModified: false, title: result.filePath!.split('/').pop() || doc.title }
            : doc
        )
      );
      
      if (!recentFiles.find(f => f.path === result.filePath)) {
        setRecentFiles([...recentFiles, { 
          path: result.filePath!, 
          name: result.filePath!.split('/').pop() || 'Unknown' 
        }]);
      }
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
    'cmd+shift+f': () => setFocusMode(!focusMode),
    'cmd+shift+b': () => setShowSidebar(!showSidebar),
    'cmd+t': () => handleNewTab(),
    'cmd+w': () => handleTabClose(activeDocId),
  }), [handleFormat, showPreview, focusMode, showSidebar, handleNewTab, handleTabClose, activeDocId]);

  useKeyboardShortcuts(shortcuts);

  const wordCount = activeDoc.content.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = activeDoc.content.length;
  
  const tabs: TabItem[] = documents.map(doc => ({
    id: doc.id,
    title: doc.title,
    path: doc.path,
    isModified: doc.isModified
  }));

  return (
    <AppContainer>
      <FocusMode isActive={focusMode} />
      <Toolbar 
        onTogglePreview={() => setShowPreview(!showPreview)}
        showPreview={showPreview}
        onFormat={handleFormat}
      />
      <MainContent>
        <Sidebar
          isCollapsed={!showSidebar}
          content={activeDoc.content}
          onNavigate={handleNavigate}
          recentFiles={recentFiles}
          onFileSelect={(path) => {
            // TODO: Load file from path
          }}
          selectedFile={activeDoc.path}
        />
        <EditorArea>
          <TabBar
            tabs={tabs}
            activeTabId={activeDocId}
            onTabClick={setActiveDocId}
            onTabClose={handleTabClose}
            onNewTab={handleNewTab}
          />
          <ContentArea>
            {showPreview ? (
              <SplitPane 
                defaultSplit={splitPosition} 
                minSize={300} 
                maxSize={70}
                onSplitChange={setSplitPosition}
              >
                <Editor 
                  ref={editorRef}
                  content={activeDoc.content} 
                  onChange={handleContentChange}
                  showPreview={showPreview}
                />
                <Preview content={activeDoc.content} />
              </SplitPane>
            ) : (
              <Editor 
                ref={editorRef}
                content={activeDoc.content} 
                onChange={handleContentChange}
                showPreview={showPreview}
              />
            )}
          </ContentArea>
        </EditorArea>
      </MainContent>
      <StatusBar 
        filePath={activeDoc.path || null}
        wordCount={wordCount}
        charCount={charCount}
        isModified={activeDoc.isModified}
      />
    </AppContainer>
  );
};

export default App;