import React, { useState, useEffect, useRef, useMemo } from 'react';
import styled from 'styled-components';

const Overlay = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => props.$isVisible ? 'flex' : 'none'};
  align-items: flex-start;
  justify-content: center;
  padding-top: 100px;
  z-index: 130; /* Below comments panel (150) */
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  width: 600px;
  max-height: 400px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideDown 0.2s ease-out;
  
  @keyframes slideDown {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 20px 24px;
  border: none;
  border-bottom: 1px solid var(--border-color);
  background-color: transparent;
  color: var(--text-primary);
  font-size: 16px;
  outline: none;
  
  &::placeholder {
    color: var(--text-tertiary);
  }
`;

const ResultsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
  }
`;

const ResultItem = styled.div<{ $isSelected: boolean }>`
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: ${props => props.$isSelected ? 'var(--accent-light)' : 'transparent'};
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: ${props => props.$isSelected ? 'var(--accent-light)' : 'var(--bg-hover)'};
  }
`;

const HeadingLevel = styled.span<{ level: number }>`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const HeadingText = styled.span`
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MatchedText = styled.span`
  color: var(--accent-color);
  font-weight: 600;
`;

const LineNumber = styled.span`
  font-size: 12px;
  color: var(--text-tertiary);
`;

const EmptyState = styled.div`
  padding: 40px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 14px;
`;

interface QuickNavProps {
  isVisible: boolean;
  content: string;
  onClose: () => void;
  onNavigate: (line: number) => void;
}

interface Heading {
  text: string;
  level: number;
  line: number;
  score?: number;
  matches?: number[];
}

const QuickNav: React.FC<QuickNavProps> = ({ isVisible, content, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const headings = useMemo(() => {
    const lines = content.split('\n');
    const headingsList: Heading[] = [];
    
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

  const filteredHeadings = useMemo(() => {
    if (!query) return headings;
    
    const lowerQuery = query.toLowerCase();
    const queryChars = lowerQuery.split('');
    
    return headings
      .map(heading => {
        const lowerText = heading.text.toLowerCase();
        let score = 0;
        const matches: number[] = [];
        let queryIndex = 0;
        
        // Fuzzy matching
        for (let i = 0; i < lowerText.length && queryIndex < queryChars.length; i++) {
          if (lowerText[i] === queryChars[queryIndex]) {
            matches.push(i);
            score += (i === 0 || lowerText[i - 1] === ' ') ? 10 : 1;
            queryIndex++;
          }
        }
        
        // Only include if all query characters were found
        if (queryIndex === queryChars.length) {
          // Bonus for exact substring match
          if (lowerText.includes(lowerQuery)) {
            score += 20;
          }
          // Bonus for matching at start
          if (lowerText.startsWith(lowerQuery)) {
            score += 30;
          }
          
          return { ...heading, score, matches };
        }
        
        return null;
      })
      .filter((h): h is Heading & { score: number; matches: number[] } => 
        h !== null && h.score !== undefined && h.matches !== undefined
      )
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [headings, query]);

  useEffect(() => {
    if (isVisible) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isVisible]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(Math.min(selectedIndex + 1, filteredHeadings.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(Math.max(selectedIndex - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredHeadings[selectedIndex]) {
          onNavigate(filteredHeadings[selectedIndex].line);
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  const highlightMatches = (text: string, matches?: number[]) => {
    if (!matches || matches.length === 0) return text;
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    matches.forEach((matchIndex, i) => {
      if (matchIndex > lastIndex) {
        parts.push(text.substring(lastIndex, matchIndex));
      }
      parts.push(
        <MatchedText key={i}>{text[matchIndex]}</MatchedText>
      );
      lastIndex = matchIndex + 1;
    });
    
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts;
  };

  if (!isVisible) return null;

  return (
    <Overlay $isVisible={isVisible} onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <SearchInput
          ref={inputRef}
          type="text"
          placeholder="Search headings..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <ResultsList>
          {filteredHeadings.length > 0 ? (
            filteredHeadings.map((heading, index) => {
              if (!heading) return null;
              return (
                <ResultItem
                  key={`${heading.line}-${index}`}
                  $isSelected={index === selectedIndex}
                  onClick={() => {
                    onNavigate(heading.line);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <HeadingLevel level={heading.level}>
                    H{heading.level}
                  </HeadingLevel>
                  <HeadingText>
                    {highlightMatches(heading.text, heading.matches)}
                  </HeadingText>
                  <LineNumber>Line {heading.line + 1}</LineNumber>
                </ResultItem>
              );
            })
          ) : (
            <EmptyState>
              {query ? 'No matching headings found' : 'No headings in document'}
            </EmptyState>
          )}
        </ResultsList>
      </Modal>
    </Overlay>
  );
};

export default QuickNav;