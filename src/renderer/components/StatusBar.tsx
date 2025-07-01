import React from 'react';
import styled from 'styled-components';

const StatusBarContainer = styled.div`
  height: 28px;
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 24px;
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
`;

const StatusItem = styled.div`
  margin-right: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const FilePath = styled(StatusItem)`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ModifiedIndicator = styled.span`
  color: var(--accent-color);
  margin-left: 6px;
  font-size: 16px;
  line-height: 1;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

interface StatusBarProps {
  filePath: string | null;
  wordCount: number;
  charCount: number;
  isModified: boolean;
}

const StatusBar: React.FC<StatusBarProps> = ({ filePath, wordCount, charCount, isModified }) => {
  const fileName = filePath ? filePath.split('/').pop() : 'Untitled';

  return (
    <StatusBarContainer>
      <FilePath>
        {fileName}
        {isModified && <ModifiedIndicator>●</ModifiedIndicator>}
      </FilePath>
      <StatusItem>{wordCount} words</StatusItem>
      <StatusItem>{charCount} characters</StatusItem>
    </StatusBarContainer>
  );
};

export default StatusBar;