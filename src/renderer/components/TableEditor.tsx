import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';

const TableEditorOverlay = styled.div<{ $position: { top: number; left: number } }>`
  position: absolute;
  top: ${props => props.$position.top}px;
  left: ${props => props.$position.left}px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  padding: 16px;
  z-index: 1000;
  min-width: 300px;
`;

const TableGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
`;

const TableRow = styled.div`
  display: flex;
  gap: 4px;
`;

const TableCell = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 13px;
  font-family: 'SF Mono', monospace;
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px var(--accent-light);
  }
  
  &.header {
    font-weight: 600;
    background: var(--bg-tertiary);
  }
`;

const TableControls = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const ControlButton = styled.button`
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background: var(--bg-hover);
    border-color: var(--accent-color);
  }
  
  &.primary {
    background: var(--accent-color);
    color: white;
    border-color: var(--accent-color);
    
    &:hover {
      background: var(--accent-dark);
    }
  }
`;

const SizeSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 24px);
  gap: 2px;
  margin-bottom: 12px;
`;

const SizeCell = styled.div<{ $active: boolean }>`
  width: 24px;
  height: 24px;
  border: 1px solid ${props => props.$active ? 'var(--accent-color)' : 'var(--border-color)'};
  background: ${props => props.$active ? 'var(--accent-light)' : 'var(--bg-primary)'};
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    border-color: var(--accent-color);
    background: var(--accent-light);
  }
`;

const SizeDisplay = styled.div`
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
`;

interface TableEditorProps {
  position: { top: number; left: number };
  onInsert: (markdown: string) => void;
  onClose: () => void;
  initialSelection?: { content: string; rows: number; cols: number };
}

const TableEditor: React.FC<TableEditorProps> = ({ position, onInsert, onClose, initialSelection }) => {
  const [rows, setRows] = useState(initialSelection?.rows || 3);
  const [cols, setCols] = useState(initialSelection?.cols || 3);
  const [hoveredCell, setHoveredCell] = useState({ row: 2, col: 2 });
  const [showGrid, setShowGrid] = useState(!initialSelection);
  const [data, setData] = useState<string[][]>(() => {
    if (initialSelection?.content) {
      // Parse existing table
      const lines = initialSelection.content.trim().split('\n');
      return lines
        .filter(line => line.includes('|'))
        .map(line => 
          line.split('|')
            .slice(1, -1)
            .map(cell => cell.trim())
        )
        .filter((_, index) => index !== 1); // Skip separator line
    }
    return Array(rows).fill(null).map(() => Array(cols).fill(''));
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  
  const handleCellChange = useCallback((rowIndex: number, colIndex: number, value: string) => {
    setData(prev => {
      const newData = [...prev];
      newData[rowIndex] = [...newData[rowIndex]];
      newData[rowIndex][colIndex] = value;
      return newData;
    });
  }, []);
  
  const addRow = useCallback(() => {
    setData(prev => [...prev, Array(prev[0].length).fill('')]);
    setRows(prev => prev + 1);
  }, []);
  
  const addColumn = useCallback(() => {
    setData(prev => prev.map(row => [...row, '']));
    setCols(prev => prev + 1);
  }, []);
  
  const removeRow = useCallback(() => {
    if (rows > 1) {
      setData(prev => prev.slice(0, -1));
      setRows(prev => prev - 1);
    }
  }, [rows]);
  
  const removeColumn = useCallback(() => {
    if (cols > 1) {
      setData(prev => prev.map(row => row.slice(0, -1)));
      setCols(prev => prev - 1);
    }
  }, [cols]);
  
  const generateMarkdown = useCallback(() => {
    const headers = data[0].map(cell => cell || 'Header');
    const separator = headers.map(() => '---');
    const body = data.slice(1).map(row => row.map(cell => cell || ' '));
    
    const formatRow = (cells: string[]) => `| ${cells.join(' | ')} |`;
    
    const markdown = [
      formatRow(headers),
      formatRow(separator),
      ...body.map(formatRow)
    ].join('\n');
    
    return markdown;
  }, [data]);
  
  const handleInsert = useCallback(() => {
    onInsert(generateMarkdown());
    onClose();
  }, [generateMarkdown, onInsert, onClose]);
  
  const handleSizeSelect = useCallback((row: number, col: number) => {
    setRows(row + 1);
    setCols(col + 1);
    setData(Array(row + 1).fill(null).map(() => Array(col + 1).fill('')));
    setShowGrid(false);
  }, []);
  
  if (showGrid) {
    return (
      <TableEditorOverlay ref={containerRef} $position={position}>
        <SizeDisplay>{hoveredCell.row + 1} × {hoveredCell.col + 1}</SizeDisplay>
        <SizeSelector>
          {Array(5).fill(null).map((_, rowIndex) => (
            Array(6).fill(null).map((_, colIndex) => (
              <SizeCell
                key={`${rowIndex}-${colIndex}`}
                $active={rowIndex <= hoveredCell.row && colIndex <= hoveredCell.col}
                onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                onClick={() => handleSizeSelect(rowIndex, colIndex)}
              />
            ))
          )).flat()}
        </SizeSelector>
        <TableControls>
          <ControlButton onClick={onClose}>Cancel</ControlButton>
        </TableControls>
      </TableEditorOverlay>
    );
  }
  
  return (
    <TableEditorOverlay ref={containerRef} $position={position}>
      <TableGrid>
        {data.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {row.map((cell, colIndex) => (
              <TableCell
                key={colIndex}
                className={rowIndex === 0 ? 'header' : ''}
                value={cell}
                onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                placeholder={rowIndex === 0 ? `Header ${colIndex + 1}` : ''}
              />
            ))}
          </TableRow>
        ))}
      </TableGrid>
      
      <TableControls>
        <ControlButton onClick={addRow}>+ Row</ControlButton>
        <ControlButton onClick={addColumn}>+ Column</ControlButton>
        {rows > 1 && <ControlButton onClick={removeRow}>- Row</ControlButton>}
        {cols > 1 && <ControlButton onClick={removeColumn}>- Column</ControlButton>}
        <div style={{ flex: 1 }} />
        <ControlButton onClick={onClose}>Cancel</ControlButton>
        <ControlButton className="primary" onClick={handleInsert}>
          {initialSelection ? 'Update' : 'Insert'}
        </ControlButton>
      </TableControls>
    </TableEditorOverlay>
  );
};

export default TableEditor;