import React from 'react';
import styled from 'styled-components';

const ToolbarContainer = styled.div`
  height: 52px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 20px;
  -webkit-app-region: drag;
  padding-left: 80px;
`;

const ToolbarButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-left: auto;
  -webkit-app-region: no-drag;
`;

const IconButton = styled.button<{ $active?: boolean }>`
  width: 32px;
  height: 32px;
  border: none;
  background-color: ${props => props.$active ? 'var(--bg-tertiary)' : 'transparent'};
  color: var(--text-primary);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--bg-tertiary);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

interface ToolbarProps {
  onTogglePreview: () => void;
  showPreview: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ onTogglePreview, showPreview }) => {
  return (
    <ToolbarContainer>
      <ToolbarButtons>
        <IconButton onClick={onTogglePreview} $active={showPreview} title="Toggle Preview">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {showPreview ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10l-3-3m3 3l3-3m6 3V7m0 10l-3-3m3 3l3-3" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            )}
          </svg>
        </IconButton>
      </ToolbarButtons>
    </ToolbarContainer>
  );
};

export default Toolbar;