import React from 'react';
import styled from 'styled-components';

const StatusBarContainer = styled.div`
  height: 24px;
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 20px;
  font-size: 12px;
  color: var(--text-secondary);
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
  margin-left: 4px;
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