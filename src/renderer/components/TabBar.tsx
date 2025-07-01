import React from 'react';
import styled from 'styled-components';

const TabBarContainer = styled.div`
  height: 40px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: flex-end;
  padding: 0 12px;
  gap: 4px;
  overflow-x: auto;
  -webkit-app-region: drag;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 2px;
  }
`;

const Tab = styled.div<{ $active: boolean }>`
  height: 32px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: ${props => props.$active ? 'var(--bg-primary)' : 'transparent'};
  border: 1px solid ${props => props.$active ? 'var(--border-color)' : 'transparent'};
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  min-width: 120px;
  max-width: 200px;
  -webkit-app-region: no-drag;
  
  ${props => props.$active && `
    box-shadow: var(--shadow-sm);
    
    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 1px;
      background-color: var(--bg-primary);
    }
  `}
  
  &:hover {
    background-color: ${props => props.$active ? 'var(--bg-primary)' : 'var(--bg-hover)'};
  }
`;

const TabTitle = styled.span`
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TabClose = styled.button`
  width: 18px;
  height: 18px;
  border: none;
  background: none;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all var(--transition-fast);
  padding: 0;
  
  &:hover {
    background-color: var(--bg-hover);
    color: var(--text-primary);
  }
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const NewTabButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all var(--transition-fast);
  -webkit-app-region: no-drag;
  
  &:hover {
    background-color: var(--bg-hover);
    color: var(--text-primary);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ModifiedIndicator = styled.span`
  width: 6px;
  height: 6px;
  background-color: var(--accent-color);
  border-radius: 50%;
  margin-left: 4px;
`;

export interface TabItem {
  id: string;
  title: string;
  path?: string;
  isModified?: boolean;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTabId: string;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
  onNewTab: () => void;
}

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTabId, onTabClick, onTabClose, onNewTab }) => {
  return (
    <TabBarContainer>
      {tabs.map(tab => (
        <Tab
          key={tab.id}
          $active={tab.id === activeTabId}
          onClick={() => onTabClick(tab.id)}
        >
          <TabTitle title={tab.path || tab.title}>
            {tab.title}
          </TabTitle>
          {tab.isModified && <ModifiedIndicator />}
          <TabClose
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </TabClose>
        </Tab>
      ))}
      <NewTabButton onClick={onNewTab} title="New Tab (Cmd+T)">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </NewTabButton>
    </TabBarContainer>
  );
};

export default TabBar;