import React, { useMemo } from 'react';
import styled from 'styled-components';

const OutlineContainer = styled.div`
  width: 260px;
  height: 100%;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  flex-shrink: 0;
  
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
  }
`;

const OutlineHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  position: sticky;
  top: 0;
  z-index: 10;
`;

const OutlineContent = styled.div`
  padding: 16px 0;
`;

const OutlineItem = styled.div<{ level: number; active?: boolean }>`
  padding: 8px 24px;
  padding-left: ${props => 24 + (props.level - 1) * 16}px;
  font-size: 13px;
  color: ${props => props.active ? 'var(--accent-color)' : 'var(--text-secondary)'};
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  
  &:hover {
    color: var(--text-primary);
    background-color: var(--bg-hover);
  }
  
  ${props => props.active && `
    background-color: var(--accent-light);
    color: var(--accent-color);
    font-weight: 500;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background-color: var(--accent-color);
    }
  `}
`;

const EmptyState = styled.div`
  padding: 40px 24px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 13px;
`;

interface Heading {
  id: string;
  text: string;
  level: number;
  line: number;
}

interface DocumentOutlineProps {
  content: string;
  onNavigate: (line: number) => void;
  activeHeadingId?: string;
}

const DocumentOutline: React.FC<DocumentOutlineProps> = ({ content, onNavigate, activeHeadingId }) => {
  const headings = useMemo(() => {
    const lines = content.split('\n');
    const headingsList: Heading[] = [];
    
    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text.toLowerCase().replace(/[^\w]+/g, '-');
        
        headingsList.push({
          id,
          text,
          level,
          line: index
        });
      }
    });
    
    return headingsList;
  }, [content]);

  if (headings.length === 0) {
    return (
      <OutlineContainer>
        <OutlineHeader>Document Outline</OutlineHeader>
        <EmptyState>No headings found</EmptyState>
      </OutlineContainer>
    );
  }

  return (
    <OutlineContainer>
      <OutlineHeader>Document Outline</OutlineHeader>
      <OutlineContent>
        {headings.map((heading) => (
          <OutlineItem
            key={`${heading.id}-${heading.line}`}
            level={heading.level}
            active={heading.id === activeHeadingId}
            onClick={() => onNavigate(heading.line)}
          >
            {heading.text}
          </OutlineItem>
        ))}
      </OutlineContent>
    </OutlineContainer>
  );
};

export default DocumentOutline;