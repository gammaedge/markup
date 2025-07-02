// Z-index hierarchy for proper layering
export const zIndex = {
  // Base layers
  base: 0,
  sidebar: 10,
  sidebarElements: 11,
  
  // Main content area overlays
  focusMode: 50,
  toolbar: 100,
  expandButton: 100,
  
  // Floating panels
  commentsToggle: 140,
  commentsPanel: 150,
  
  // Modal-like components
  findReplace: 200,
  quickNav: 300,
  exportDialog: 300,
  
  // Highest priority modals
  tableEditor: 1000,
  settings: 1000,
  
  // System level
  errorBoundary: 9999,
};