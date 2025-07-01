import React, { useState } from 'react';
import styled from 'styled-components';
import DocumentOutline from './DocumentOutline';

const SidebarContainer = styled.div<{ $isCollapsed: boolean }>`
  width: ${props => props.$isCollapsed ? '0' : '260px'};
  height: 100%;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  transition: width var(--transition-normal);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const SidebarTabs = styled.div`
  display: flex;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-primary);
`;

const SidebarTab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px;
  border: none;
  background: ${props => props.$active ? 'var(--bg-secondary)' : 'transparent'};
  color: ${props => props.$active ? 'var(--text-primary)' : 'var(--text-secondary)'};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  border-bottom: 2px solid ${props => props.$active ? 'var(--accent-color)' : 'transparent'};
  
  &:hover {
    background-color: var(--bg-hover);
  }
`;

const SidebarContent = styled.div`
  flex: 1;
  overflow: hidden;
`;

const FileTreeContainer = styled.div`
  height: 100%;
  overflow-y: auto;
  padding: 16px 0;
`;

const FileItem = styled.div<{ $isSelected?: boolean; $depth: number }>`
  padding: 6px 16px;
  padding-left: ${props => 16 + props.$depth * 16}px;
  font-size: 13px;
  color: ${props => props.$isSelected ? 'var(--accent-color)' : 'var(--text-primary)'};
  background-color: ${props => props.$isSelected ? 'var(--accent-light)' : 'transparent'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: var(--bg-hover);
  }
  
  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`;

const FileName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type SidebarView = 'files' | 'outline';

interface SidebarProps {
  isCollapsed: boolean;
  content: string;
  onNavigate: (line: number) => void;
  activeHeadingId?: string;
  recentFiles?: Array<{ path: string; name: string }>;
  onFileSelect?: (path: string) => void;
  selectedFile?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  content,
  onNavigate,
  activeHeadingId,
  recentFiles = [],
  onFileSelect,
  selectedFile
}) => {
  const [activeView, setActiveView] = useState<SidebarView>('outline');

  return (
    <SidebarContainer $isCollapsed={isCollapsed}>
      <SidebarTabs>
        <SidebarTab
          $active={activeView === 'files'}
          onClick={() => setActiveView('files')}
        >
          Files
        </SidebarTab>
        <SidebarTab
          $active={activeView === 'outline'}
          onClick={() => setActiveView('outline')}
        >
          Outline
        </SidebarTab>
      </SidebarTabs>
      <SidebarContent>
        {activeView === 'outline' ? (
          <div style={{ height: '100%', overflow: 'hidden' }}>
            <DocumentOutline
              content={content}
              onNavigate={onNavigate}
              activeHeadingId={activeHeadingId}
            />
          </div>
        ) : (
          <FileTreeContainer>
            {recentFiles.length > 0 ? (
              recentFiles.map((file) => (
                <FileItem
                  key={file.path}
                  $depth={0}
                  $isSelected={file.path === selectedFile}
                  onClick={() => onFileSelect?.(file.path)}
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <FileName>{file.name}</FileName>
                </FileItem>
              ))
            ) : (
              <div style={{ padding: '20px', color: 'var(--text-tertiary)', fontSize: '13px', textAlign: 'center' }}>
                No recent files
              </div>
            )}
          </FileTreeContainer>
        )}
      </SidebarContent>
    </SidebarContainer>
  );
};

export default Sidebar;