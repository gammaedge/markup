import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
`;

const Pane = styled.div<{ width: string }>`
  width: ${props => props.width};
  height: 100%;
  overflow: hidden;
  position: relative;
`;

const Resizer = styled.div<{ $isDragging: boolean }>`
  width: 1px;
  height: 100%;
  background-color: var(--border-color);
  cursor: col-resize;
  position: relative;
  transition: all var(--transition-fast);
  flex-shrink: 0;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -4px;
    right: -4px;
    bottom: 0;
    background-color: transparent;
    transition: background-color var(--transition-fast);
  }

  &:hover::before {
    background-color: var(--accent-light);
  }

  ${props => props.$isDragging && `
    background-color: var(--accent-color);
    
    &::before {
      background-color: var(--accent-light);
    }
  `}
`;

interface SplitPaneProps {
  children: [React.ReactNode, React.ReactNode];
  defaultSplit?: number;
  minSize?: number;
  maxSize?: number;
  onSplitChange?: (split: number) => void;
}

const SplitPane: React.FC<SplitPaneProps> = ({
  children,
  defaultSplit = 50,
  minSize = 200,
  maxSize = 80,
  onSplitChange
}) => {
  const [split, setSplit] = useState(defaultSplit);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const x = e.clientX - containerRect.left;
    
    let newSplit = (x / containerWidth) * 100;
    
    // Apply min/max constraints
    const minPercent = (minSize / containerWidth) * 100;
    const maxPercent = maxSize;
    
    newSplit = Math.max(minPercent, Math.min(newSplit, maxPercent));
    
    setSplit(newSplit);
    onSplitChange?.(newSplit);
  }, [isDragging, minSize, maxSize, onSplitChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <Container ref={containerRef}>
      <Pane width={`${split}%`}>
        {children[0]}
      </Pane>
      <Resizer 
        onMouseDown={handleMouseDown}
        $isDragging={isDragging}
      />
      <Pane width={`${100 - split}%`}>
        {children[1]}
      </Pane>
    </Container>
  );
};

export default SplitPane;