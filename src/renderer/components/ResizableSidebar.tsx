import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';

const ResizableContainer = styled.div<{ $width: number; $isCollapsed: boolean }>`
  position: relative;
  width: ${props => props.$isCollapsed ? '0' : `${props.$width}px`};
  height: 100%;
  transition: ${props => props.$isCollapsed ? 'width var(--transition-normal)' : 'none'};
`;

const ResizeHandle = styled.div<{ $isCollapsed: boolean; $isDragging: boolean }>`
  position: absolute;
  top: 0;
  right: -3px;
  width: 6px;
  height: 100%;
  cursor: ${props => props.$isCollapsed ? 'default' : 'col-resize'};
  background-color: ${props => props.$isDragging ? 'var(--accent-color)' : 'transparent'};
  z-index: 10;
  transition: background-color var(--transition-fast);
  
  &:hover {
    background-color: ${props => props.$isCollapsed ? 'transparent' : 'var(--accent-light)'};
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 2px;
    height: 30px;
    background-color: ${props => props.$isDragging ? 'white' : 'var(--border-color)'};
    border-radius: 1px;
    opacity: ${props => props.$isCollapsed ? 0 : (props.$isDragging ? 1 : 0.5)};
    transition: opacity var(--transition-fast);
  }
`;

const CollapseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all var(--transition-fast);
  z-index: 11;
  
  &:hover {
    background-color: var(--bg-hover);
    color: var(--text-primary);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ExpandButton = styled.button<{ $isVisible: boolean }>`
  position: fixed;
  top: 50%;
  left: ${props => props.$isVisible ? '12px' : '-100px'};
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 4px 4px 0;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
  z-index: 100;
  opacity: ${props => props.$isVisible ? 1 : 0};
  pointer-events: ${props => props.$isVisible ? 'auto' : 'none'};
  
  &:hover {
    background-color: var(--bg-hover);
    color: var(--text-primary);
    border-color: var(--accent-color);
    box-shadow: var(--shadow-lg);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

interface ResizableSidebarProps {
  content: string;
  onNavigate: (line: number) => void;
  activeHeadingId?: string;
  recentFiles?: Array<{ path: string; name: string }>;
  onFileSelect?: (path: string) => void;
  selectedFile?: string;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onWidthChange?: (width: number) => void;
}

const ResizableSidebar: React.FC<ResizableSidebarProps> = ({
  content,
  onNavigate,
  activeHeadingId,
  recentFiles,
  onFileSelect,
  selectedFile,
  defaultWidth = 260,
  minWidth = 200,
  maxWidth = 400,
  isCollapsed,
  onCollapsedChange,
  onWidthChange
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isCollapsed) return;
    e.preventDefault();
    setIsDragging(true);
  }, [isCollapsed]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const parentRect = containerRef.current.parentElement?.getBoundingClientRect();
    if (!parentRect) return;
    
    const newWidth = e.clientX - parentRect.left;
    setWidth(Math.max(minWidth, Math.min(newWidth, maxWidth)));
  }, [isDragging, minWidth, maxWidth]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    onWidthChange?.(width);
  }, [width, onWidthChange]);

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
    <>
      <ResizableContainer ref={containerRef} $width={width} $isCollapsed={isCollapsed}>
        <Sidebar
          isCollapsed={false}
          content={content}
          onNavigate={onNavigate}
          activeHeadingId={activeHeadingId}
          recentFiles={recentFiles}
          onFileSelect={onFileSelect}
          selectedFile={selectedFile}
        />
        <ResizeHandle
          $isCollapsed={isCollapsed}
          $isDragging={isDragging}
          onMouseDown={handleMouseDown}
        />
        {!isCollapsed && (
          <CollapseButton onClick={() => onCollapsedChange(true)} title="Hide sidebar (Cmd+Shift+B)">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </CollapseButton>
        )}
      </ResizableContainer>
      <ExpandButton $isVisible={isCollapsed} onClick={() => onCollapsedChange(false)} title="Show sidebar (Cmd+Shift+B)">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </ExpandButton>
    </>
  );
};

export default ResizableSidebar;