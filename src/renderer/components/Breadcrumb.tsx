import React, { useMemo, useEffect, useState } from 'react';
import styled from 'styled-components';

const BreadcrumbContainer = styled.div`
  height: 32px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 24px;
  font-size: 12px;
  color: var(--text-secondary);
  overflow-x: auto;
  white-space: nowrap;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 2px;
  }
`;

const BreadcrumbItem = styled.span<{ $isActive?: boolean }>`
  color: ${props => props.$isActive ? 'var(--text-primary)' : 'var(--text-secondary)'};
  font-weight: ${props => props.$isActive ? '500' : '400'};
  cursor: ${props => props.$isActive ? 'default' : 'pointer'};
  transition: color var(--transition-fast);
  
  &:hover {
    color: ${props => props.$isActive ? 'var(--text-primary)' : 'var(--text-primary)'};
  }
`;

const Separator = styled.span`
  margin: 0 8px;
  color: var(--text-tertiary);
`;

interface BreadcrumbProps {
  content: string;
  currentLine: number;
  onNavigate: (line: number) => void;
}

interface HeadingHierarchy {
  text: string;
  level: number;
  line: number;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ content, currentLine, onNavigate }) => {
  const [currentPath, setCurrentPath] = useState<HeadingHierarchy[]>([]);

  const headings = useMemo(() => {
    const lines = content.split('\n');
    const headingsList: HeadingHierarchy[] = [];
    
    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        headingsList.push({
          text: match[2].trim(),
          level: match[1].length,
          line: index
        });
      }
    });
    
    return headingsList;
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) {
      setCurrentPath([]);
      return;
    }

    // Find the current heading based on cursor position
    let currentHeading: HeadingHierarchy | null = null;
    for (let i = headings.length - 1; i >= 0; i--) {
      if (headings[i].line <= currentLine) {
        currentHeading = headings[i];
        break;
      }
    }

    if (!currentHeading) {
      setCurrentPath([]);
      return;
    }

    // Build the path from root to current heading
    const path: HeadingHierarchy[] = [];
    let currentLevel = currentHeading.level;
    
    // Add the current heading
    path.unshift(currentHeading);
    
    // Walk backwards to find parent headings
    const headingIndex = headings.indexOf(currentHeading);
    for (let i = headingIndex - 1; i >= 0; i--) {
      if (headings[i].level < currentLevel) {
        path.unshift(headings[i]);
        currentLevel = headings[i].level;
        if (currentLevel === 1) break;
      }
    }
    
    setCurrentPath(path);
  }, [headings, currentLine]);

  if (currentPath.length === 0) {
    return (
      <BreadcrumbContainer>
        <BreadcrumbItem $isActive>Document</BreadcrumbItem>
      </BreadcrumbContainer>
    );
  }

  return (
    <BreadcrumbContainer>
      <BreadcrumbItem onClick={() => onNavigate(0)}>
        Document
      </BreadcrumbItem>
      {currentPath.map((heading, index) => (
        <React.Fragment key={`${heading.line}-${index}`}>
          <Separator>/</Separator>
          <BreadcrumbItem
            $isActive={index === currentPath.length - 1}
            onClick={() => onNavigate(heading.line)}
          >
            {heading.text}
          </BreadcrumbItem>
        </React.Fragment>
      ))}
    </BreadcrumbContainer>
  );
};

export default Breadcrumb;