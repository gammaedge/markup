import React from 'react';
import styled from 'styled-components';

const FocusOverlay = styled.div<{ $isActive: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  transition: opacity var(--transition-slow);
  opacity: ${props => props.$isActive ? 1 : 0};
  z-index: 50;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 35%;
    background: linear-gradient(
      ${props => props.$isActive ? 'to bottom' : 'to top'},
      var(--bg-primary) 0%,
      transparent 100%
    );
    transition: all var(--transition-slow);
  }
  
  &::before {
    top: 0;
  }
  
  &::after {
    bottom: 0;
    background: linear-gradient(
      to top,
      var(--bg-primary) 0%,
      transparent 100%
    );
  }
`;

interface FocusModeProps {
  isActive: boolean;
}

const FocusMode: React.FC<FocusModeProps> = ({ isActive }) => {
  return <FocusOverlay $isActive={isActive} />;
};

export default FocusMode;