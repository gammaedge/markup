import React, { useState } from 'react';
import styled from 'styled-components';

type KeybindingMode = 'default' | 'vim' | 'emacs';

const SettingsModal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const SettingsContent = styled.div`
  background: var(--bg-secondary);
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xl);
`;

const SettingsHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SettingsTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
`;

const CloseButton = styled.button`
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
  
  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
`;

const SettingsBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
`;

const SettingSection = styled.div`
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
`;

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid var(--border-light);
  }
`;

const SettingLabel = styled.label`
  font-size: 14px;
  color: var(--text-primary);
  flex: 1;
`;

const SettingDescription = styled.p`
  margin: 4px 0 0 0;
  font-size: 12px;
  color: var(--text-secondary);
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px var(--accent-light);
  }
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: var(--accent-color);
  }
  
  &:checked + span:before {
    transform: translateX(24px);
  }
`;

const SwitchSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color);
  transition: var(--transition-fast);
  border-radius: 24px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: var(--transition-fast);
    border-radius: 50%;
  }
`;

export interface SettingsData {
  keybindingMode: KeybindingMode;
  autoSave: boolean;
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  showLineNumbers: boolean;
  highlightActiveLine: boolean;
  foldGutter: boolean;
  vim: {
    insertModeOnNew: boolean;
    relativeLineNumbers: boolean;
  };
}

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsData;
  onSettingsChange: (settings: SettingsData) => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  
  const handleChange = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };
  
  const handleVimChange = <K extends keyof SettingsData['vim']>(key: K, value: SettingsData['vim'][K]) => {
    const newSettings = {
      ...localSettings,
      vim: { ...localSettings.vim, [key]: value }
    };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };
  
  return (
    <SettingsModal $isOpen={isOpen}>
      <SettingsContent>
        <SettingsHeader>
          <SettingsTitle>Settings</SettingsTitle>
          <CloseButton onClick={onClose}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </CloseButton>
        </SettingsHeader>
        
        <SettingsBody>
          <SettingSection>
            <SectionTitle>Editor</SectionTitle>
            
            <SettingRow>
              <SettingLabel>
                Keybinding Mode
                <SettingDescription>Choose your preferred keybinding mode</SettingDescription>
              </SettingLabel>
              <Select 
                value={localSettings.keybindingMode} 
                onChange={(e) => handleChange('keybindingMode', e.target.value as KeybindingMode)}
              >
                <option value="default">Default</option>
                <option value="vim">Vim</option>
                <option value="emacs">Emacs</option>
              </Select>
            </SettingRow>
            
            <SettingRow>
              <SettingLabel>
                Font Size
                <SettingDescription>Editor font size in pixels</SettingDescription>
              </SettingLabel>
              <Select 
                value={localSettings.fontSize} 
                onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
              >
                <option value="12">12px</option>
                <option value="13">13px</option>
                <option value="14">14px</option>
                <option value="15">15px</option>
                <option value="16">16px</option>
                <option value="18">18px</option>
              </Select>
            </SettingRow>
            
            <SettingRow>
              <SettingLabel>
                Tab Size
                <SettingDescription>Number of spaces per tab</SettingDescription>
              </SettingLabel>
              <Select 
                value={localSettings.tabSize} 
                onChange={(e) => handleChange('tabSize', parseInt(e.target.value))}
              >
                <option value="2">2 spaces</option>
                <option value="4">4 spaces</option>
                <option value="8">8 spaces</option>
              </Select>
            </SettingRow>
            
            <SettingRow>
              <SettingLabel>
                Word Wrap
                <SettingDescription>Wrap long lines at viewport width</SettingDescription>
              </SettingLabel>
              <Switch>
                <SwitchInput 
                  type="checkbox" 
                  checked={localSettings.wordWrap}
                  onChange={(e) => handleChange('wordWrap', e.target.checked)}
                />
                <SwitchSlider />
              </Switch>
            </SettingRow>
            
            <SettingRow>
              <SettingLabel>
                Show Line Numbers
                <SettingDescription>Display line numbers in the gutter</SettingDescription>
              </SettingLabel>
              <Switch>
                <SwitchInput 
                  type="checkbox" 
                  checked={localSettings.showLineNumbers}
                  onChange={(e) => handleChange('showLineNumbers', e.target.checked)}
                />
                <SwitchSlider />
              </Switch>
            </SettingRow>
            
            <SettingRow>
              <SettingLabel>
                Highlight Active Line
                <SettingDescription>Highlight the line where the cursor is</SettingDescription>
              </SettingLabel>
              <Switch>
                <SwitchInput 
                  type="checkbox" 
                  checked={localSettings.highlightActiveLine}
                  onChange={(e) => handleChange('highlightActiveLine', e.target.checked)}
                />
                <SwitchSlider />
              </Switch>
            </SettingRow>
            
            <SettingRow>
              <SettingLabel>
                Code Folding
                <SettingDescription>Enable code folding in the gutter</SettingDescription>
              </SettingLabel>
              <Switch>
                <SwitchInput 
                  type="checkbox" 
                  checked={localSettings.foldGutter}
                  onChange={(e) => handleChange('foldGutter', e.target.checked)}
                />
                <SwitchSlider />
              </Switch>
            </SettingRow>
          </SettingSection>
          
          {localSettings.keybindingMode === 'vim' && (
            <SettingSection>
              <SectionTitle>Vim Settings</SectionTitle>
              
              <SettingRow>
                <SettingLabel>
                  Insert Mode on New File
                  <SettingDescription>Start in insert mode when creating new files</SettingDescription>
                </SettingLabel>
                <Switch>
                  <SwitchInput 
                    type="checkbox" 
                    checked={localSettings.vim.insertModeOnNew}
                    onChange={(e) => handleVimChange('insertModeOnNew', e.target.checked)}
                  />
                  <SwitchSlider />
                </Switch>
              </SettingRow>
              
              <SettingRow>
                <SettingLabel>
                  Relative Line Numbers
                  <SettingDescription>Show line numbers relative to cursor position</SettingDescription>
                </SettingLabel>
                <Switch>
                  <SwitchInput 
                    type="checkbox" 
                    checked={localSettings.vim.relativeLineNumbers}
                    onChange={(e) => handleVimChange('relativeLineNumbers', e.target.checked)}
                  />
                  <SwitchSlider />
                </Switch>
              </SettingRow>
            </SettingSection>
          )}
          
          <SettingSection>
            <SectionTitle>Files</SectionTitle>
            
            <SettingRow>
              <SettingLabel>
                Auto Save
                <SettingDescription>Automatically save files after changes</SettingDescription>
              </SettingLabel>
              <Switch>
                <SwitchInput 
                  type="checkbox" 
                  checked={localSettings.autoSave}
                  onChange={(e) => handleChange('autoSave', e.target.checked)}
                />
                <SwitchSlider />
              </Switch>
            </SettingRow>
          </SettingSection>
        </SettingsBody>
      </SettingsContent>
    </SettingsModal>
  );
};

export default Settings;