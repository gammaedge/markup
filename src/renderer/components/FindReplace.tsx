import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const FindReplaceContainer = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  top: ${props => props.$isVisible ? '0' : '-100px'};
  right: 20px;
  width: 360px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  padding: 16px;
  z-index: 120; /* Below comments panel (150) and quicknav (130) */
  transition: top var(--transition-normal);
`;

const SearchRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  transition: all var(--transition-fast);
  
  &:focus {
    border-color: var(--accent-color);
    box-shadow: var(--shadow-glow);
  }
  
  &::placeholder {
    color: var(--text-tertiary);
  }
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${props => props.$primary ? 'var(--accent-color)' : 'var(--border-color)'};
  background-color: ${props => props.$primary ? 'var(--accent-color)' : 'transparent'};
  color: ${props => props.$primary ? 'white' : 'var(--text-primary)'};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
  
  &:hover {
    background-color: ${props => props.$primary ? 'var(--accent-hover)' : 'var(--bg-hover)'};
  }
  
  &:active {
    transform: scale(0.96);
  }
`;

const IconButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: var(--bg-hover);
    color: var(--text-primary);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const SearchInfo = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Options = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

const Checkbox = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  
  input {
    cursor: pointer;
  }
`;

interface FindReplaceProps {
  isVisible: boolean;
  onClose: () => void;
  onFind: (query: string, options: FindOptions) => FindResult;
  onReplace: (replacement: string) => void;
  onReplaceAll: (query: string, replacement: string, options: FindOptions) => number;
  onNavigate: (direction: 'next' | 'prev') => void;
}

export interface FindOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  regex: boolean;
}

export interface FindResult {
  current: number;
  total: number;
}

const FindReplace: React.FC<FindReplaceProps> = ({
  isVisible,
  onClose,
  onFind,
  onReplace,
  onReplaceAll,
  onNavigate
}) => {
  const [findQuery, setFindQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [options, setOptions] = useState<FindOptions>({
    caseSensitive: false,
    wholeWord: false,
    regex: false
  });
  const [result, setResult] = useState<FindResult>({ current: 0, total: 0 });
  const findInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isVisible) {
      findInputRef.current?.focus();
      findInputRef.current?.select();
    }
  }, [isVisible]);

  useEffect(() => {
    if (findQuery) {
      const newResult = onFind(findQuery, options);
      setResult(newResult);
    } else {
      setResult({ current: 0, total: 0 });
    }
  }, [findQuery, options, onFind]);

  const handleReplace = () => {
    if (result.total > 0) {
      onReplace(replaceQuery);
      const newResult = onFind(findQuery, options);
      setResult(newResult);
    }
  };

  const handleReplaceAll = () => {
    if (result.total > 0) {
      const replacedCount = onReplaceAll(findQuery, replaceQuery, options);
      setResult({ current: 0, total: 0 });
    }
  };

  return (
    <FindReplaceContainer $isVisible={isVisible}>
      <SearchRow>
        <Input
          ref={findInputRef}
          type="text"
          placeholder="Find"
          value={findQuery}
          onChange={(e) => setFindQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onNavigate(e.shiftKey ? 'prev' : 'next');
            } else if (e.key === 'Escape') {
              onClose();
            }
          }}
        />
        <IconButton onClick={() => onNavigate('prev')} title="Previous (Shift+Enter)">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </IconButton>
        <IconButton onClick={() => onNavigate('next')} title="Next (Enter)">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </IconButton>
        <IconButton onClick={() => setShowReplace(!showReplace)} title="Toggle Replace">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </IconButton>
        <IconButton onClick={onClose} title="Close (Esc)">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </IconButton>
      </SearchRow>
      
      {showReplace && (
        <SearchRow>
          <Input
            type="text"
            placeholder="Replace"
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey) {
                handleReplaceAll();
              }
            }}
          />
          <Button onClick={handleReplace}>Replace</Button>
          <Button onClick={handleReplaceAll} $primary>All</Button>
        </SearchRow>
      )}
      
      <Options>
        <Checkbox>
          <input
            type="checkbox"
            checked={options.caseSensitive}
            onChange={(e) => setOptions({ ...options, caseSensitive: e.target.checked })}
          />
          Match Case
        </Checkbox>
        <Checkbox>
          <input
            type="checkbox"
            checked={options.wholeWord}
            onChange={(e) => setOptions({ ...options, wholeWord: e.target.checked })}
          />
          Whole Word
        </Checkbox>
        <Checkbox>
          <input
            type="checkbox"
            checked={options.regex}
            onChange={(e) => setOptions({ ...options, regex: e.target.checked })}
          />
          Regex
        </Checkbox>
      </Options>
      
      <SearchInfo>
        <span>
          {result.total > 0 ? `${result.current} of ${result.total}` : 'No results'}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
          Cmd+F to search • Cmd+H to replace
        </span>
      </SearchInfo>
    </FindReplaceContainer>
  );
};

export default FindReplace;