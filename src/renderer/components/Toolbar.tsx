import React from 'react';
import styled from 'styled-components';

const ToolbarContainer = styled.div`
  height: 56px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 24px;
  -webkit-app-region: drag;
  padding-left: 88px;
  z-index: 100;
  box-shadow: var(--shadow-sm);
`;

const ToolbarSection = styled.div`
  display: flex;
  gap: 4px;
  -webkit-app-region: no-drag;
  
  &:not(:last-child) {
    margin-right: 16px;
    padding-right: 16px;
    border-right: 1px solid var(--border-color);
  }
`;

const ToolbarButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-left: auto;
  -webkit-app-region: no-drag;
`;

const IconButton = styled.button<{ $active?: boolean }>`
  width: 36px;
  height: 36px;
  border: none;
  background-color: ${props => props.$active ? 'var(--accent-light)' : 'transparent'};
  color: ${props => props.$active ? 'var(--accent-color)' : 'var(--text-primary)'};
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  font-size: 14px;
  font-weight: 600;
  position: relative;

  &:hover {
    background-color: ${props => props.$active ? 'var(--accent-light)' : 'var(--bg-hover)'};
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.96);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--shadow-glow);
  }

  svg {
    width: 20px;
    height: 20px;
    stroke-width: 2;
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background-color: var(--border-color);
  margin: 0 8px;
`;

interface ToolbarProps {
  onTogglePreview: () => void;
  showPreview: boolean;
  onFormat: (action: string, value?: any) => void;
  onToggleSidebar?: () => void;
  showSidebar?: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ onTogglePreview, showPreview, onFormat, onToggleSidebar, showSidebar }) => {
  return (
    <ToolbarContainer>
      <ToolbarSection>
        <IconButton onClick={() => onFormat('bold')} title="Bold (Cmd+B)">
          <strong>B</strong>
        </IconButton>
        <IconButton onClick={() => onFormat('italic')} title="Italic (Cmd+I)">
          <em>I</em>
        </IconButton>
        <IconButton onClick={() => onFormat('strikethrough')} title="Strikethrough">
          <span style={{ textDecoration: 'line-through' }}>S</span>
        </IconButton>
      </ToolbarSection>
      
      <ToolbarSection>
        <IconButton onClick={() => onFormat('heading', 1)} title="Heading 1">
          H1
        </IconButton>
        <IconButton onClick={() => onFormat('heading', 2)} title="Heading 2">
          H2
        </IconButton>
        <IconButton onClick={() => onFormat('heading', 3)} title="Heading 3">
          H3
        </IconButton>
      </ToolbarSection>

      <ToolbarSection>
        <IconButton onClick={() => onFormat('link')} title="Insert Link (Cmd+K)">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </IconButton>
        <IconButton onClick={() => onFormat('code')} title="Inline Code">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </IconButton>
        <IconButton onClick={() => onFormat('codeBlock')} title="Code Block">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </IconButton>
      </ToolbarSection>

      <ToolbarSection>
        <IconButton onClick={() => onFormat('quote')} title="Blockquote">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </IconButton>
        <IconButton onClick={() => onFormat('unorderedList')} title="Bullet List">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </IconButton>
        <IconButton onClick={() => onFormat('orderedList')} title="Numbered List">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
        </IconButton>
      </ToolbarSection>

      <ToolbarButtons>
        {onToggleSidebar && (
          <IconButton onClick={onToggleSidebar} $active={showSidebar} title="Toggle Sidebar (Cmd+Shift+B)">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </IconButton>
        )}
        <Divider />
        <IconButton onClick={onTogglePreview} $active={showPreview} title="Toggle Preview">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {showPreview ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
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