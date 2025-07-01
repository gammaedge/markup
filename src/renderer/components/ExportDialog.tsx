import React, { useState } from 'react';
import styled from 'styled-components';

const Overlay = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => props.$isVisible ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 300;
  backdrop-filter: blur(4px);
`;

const Dialog = styled.div`
  width: 480px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: slideIn 0.2s ease-out;
  
  @keyframes slideIn {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
`;

const Content = styled.div`
  padding: 24px;
`;

const FormatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
`;

const FormatCard = styled.div<{ $isSelected: boolean }>`
  padding: 16px;
  border: 2px solid ${props => props.$isSelected ? 'var(--accent-color)' : 'var(--border-color)'};
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-fast);
  background-color: ${props => props.$isSelected ? 'var(--accent-light)' : 'transparent'};
  
  &:hover {
    border-color: ${props => props.$isSelected ? 'var(--accent-color)' : 'var(--text-tertiary)'};
    background-color: ${props => props.$isSelected ? 'var(--accent-light)' : 'var(--bg-hover)'};
  }
`;

const FormatIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
`;

const FormatName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const FormatDescription = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
`;

const Options = styled.div`
  margin-bottom: 24px;
`;

const OptionLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  
  input {
    cursor: pointer;
  }
`;

const Footer = styled.div`
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 8px 20px;
  border: 1px solid ${props => props.$primary ? 'var(--accent-color)' : 'var(--border-color)'};
  background-color: ${props => props.$primary ? 'var(--accent-color)' : 'transparent'};
  color: ${props => props.$primary ? 'white' : 'var(--text-primary)'};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: ${props => props.$primary ? 'var(--accent-hover)' : 'var(--bg-hover)'};
  }
  
  &:active {
    transform: scale(0.96);
  }
`;

export type ExportFormat = 'html' | 'pdf' | 'docx' | 'print';

interface ExportOptions {
  includeStyles: boolean;
  includeHighlighting: boolean;
  pageSize?: 'A4' | 'Letter';
  margins?: 'normal' | 'narrow' | 'wide';
}

interface ExportDialogProps {
  isVisible: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat, options: ExportOptions) => void;
}

const formats = [
  {
    id: 'html' as ExportFormat,
    icon: '🌐',
    name: 'HTML',
    description: 'Web page with styling'
  },
  {
    id: 'pdf' as ExportFormat,
    icon: '📄',
    name: 'PDF',
    description: 'Portable document'
  },
  {
    id: 'docx' as ExportFormat,
    icon: '📝',
    name: 'Word',
    description: 'Microsoft Word document'
  },
  {
    id: 'print' as ExportFormat,
    icon: '🖨️',
    name: 'Print',
    description: 'Send to printer'
  }
];

const ExportDialog: React.FC<ExportDialogProps> = ({ isVisible, onClose, onExport }) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [options, setOptions] = useState<ExportOptions>({
    includeStyles: true,
    includeHighlighting: true,
    pageSize: 'A4',
    margins: 'normal'
  });

  const handleExport = () => {
    onExport(selectedFormat, options);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <Overlay $isVisible={isVisible} onClick={onClose}>
      <Dialog onClick={e => e.stopPropagation()}>
        <Header>
          <Title>Export Document</Title>
        </Header>
        
        <Content>
          <FormatGrid>
            {formats.map(format => (
              <FormatCard
                key={format.id}
                $isSelected={selectedFormat === format.id}
                onClick={() => setSelectedFormat(format.id)}
              >
                <FormatIcon>{format.icon}</FormatIcon>
                <FormatName>{format.name}</FormatName>
                <FormatDescription>{format.description}</FormatDescription>
              </FormatCard>
            ))}
          </FormatGrid>
          
          <Options>
            {(selectedFormat === 'html' || selectedFormat === 'pdf') && (
              <>
                <OptionLabel>
                  <input
                    type="checkbox"
                    checked={options.includeStyles}
                    onChange={e => setOptions({ ...options, includeStyles: e.target.checked })}
                  />
                  Include styling
                </OptionLabel>
                <OptionLabel>
                  <input
                    type="checkbox"
                    checked={options.includeHighlighting}
                    onChange={e => setOptions({ ...options, includeHighlighting: e.target.checked })}
                  />
                  Include syntax highlighting
                </OptionLabel>
              </>
            )}
            
            {selectedFormat === 'pdf' && (
              <>
                <OptionLabel>
                  Page size:
                  <select
                    value={options.pageSize}
                    onChange={e => setOptions({ ...options, pageSize: e.target.value as 'A4' | 'Letter' })}
                    style={{
                      marginLeft: '8px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="A4">A4</option>
                    <option value="Letter">Letter</option>
                  </select>
                </OptionLabel>
                <OptionLabel>
                  Margins:
                  <select
                    value={options.margins}
                    onChange={e => setOptions({ ...options, margins: e.target.value as 'normal' | 'narrow' | 'wide' })}
                    style={{
                      marginLeft: '8px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="narrow">Narrow</option>
                    <option value="normal">Normal</option>
                    <option value="wide">Wide</option>
                  </select>
                </OptionLabel>
              </>
            )}
          </Options>
        </Content>
        
        <Footer>
          <Button onClick={onClose}>Cancel</Button>
          <Button $primary onClick={handleExport}>
            {selectedFormat === 'print' ? 'Print' : 'Export'}
          </Button>
        </Footer>
      </Dialog>
    </Overlay>
  );
};

export default ExportDialog;