# Markup

A powerful, feature-rich Markdown editor for macOS built by [GammaEdge.io](https://gammaedge.io). Experience a native macOS interface with advanced editing capabilities, real-time preview, and comprehensive markdown support.

For questions, feature requests, or contributions, please contact us at: **opensource@gammaedge.io**

## 🌟 Features

### Core Editor Features
- **Advanced CodeMirror 6 Editor** with syntax highlighting and auto-completion
- **Real-time Markdown Preview** with synchronized scrolling
- **Split-pane Interface** with adjustable layout
- **Multi-tab Support** for working with multiple documents
- **Vim Mode Support** with customizable keybindings
- **Focus Mode** for distraction-free writing
- **Smart Auto-save** with configurable intervals

### Rich Text Formatting
- **Full Markdown Support** including GFM (GitHub Flavored Markdown)
- **Math Expressions** with KaTeX rendering (inline `$...$` and block `$$...$$`)
- **Code Syntax Highlighting** with Prism.js
- **Table Editor** with visual table creation and editing
- **Task Lists** with checkbox support
- **Smart Lists** with automatic formatting
- **Block Quotes** and nested quotes
- **Footnotes** and references

### Document Management
- **File Operations**: New, Open, Save, Save As with native macOS dialogs
- **Recent Files** tracking and quick access
- **Document Tabs** with unsaved changes indicators
- **Breadcrumb Navigation** showing file path hierarchy
- **Quick Navigation** (Cmd+P) for fast file switching
- **Document Outline** with heading-based navigation

### Search and Navigation
- **Find and Replace** with regex support
- **Quick Nav** (Cmd+P) for jumping to files and headings
- **Document Outline** panel for structure overview
- **Go to Line** functionality

### Export Capabilities
- **HTML Export** with custom styling options
- **Word Document Export** (.docx format)
- **PDF Export** (coming soon)
- **Markdown Export** with front matter support

### Collaboration Features
- **Comments System** for document annotations
- **Comment Threading** with reply support
- **Comment Resolution** tracking

### User Interface
- **Native macOS Design** with traffic light controls
- **Dark/Light Theme** following system preferences
- **Resizable Sidebar** with document list
- **Customizable Layout** with collapsible panels
- **Status Bar** with word count, character count, and cursor position
- **Toolbar** with quick formatting buttons

### Customization
- **Settings Panel** with extensive configuration options
- **Adjustable Font Size** and editor preferences
- **Tab Size Configuration**
- **Word Wrap Toggle**
- **Line Numbers** and active line highlighting
- **Code Folding** support
- **Vim Mode** with relative line numbers option

## 📦 Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- macOS (for full native experience)

### Install from Source
```bash
# Clone the repository
git clone https://github.com/yourusername/elegant-markdown-editor.git
cd elegant-markdown-editor

# Install dependencies
npm install

# Build and run the application
npm start
```

## 🚀 Usage Guide

### Getting Started
1. Launch the application
2. Create a new document with `Cmd+N` or open existing with `Cmd+O`
3. Start writing in Markdown on the left, see preview on the right
4. Toggle preview with the preview button or `Cmd+P`

### Keyboard Shortcuts

#### File Operations
- `Cmd+N` - New document
- `Cmd+O` - Open file
- `Cmd+S` - Save
- `Cmd+Shift+S` - Save As
- `Cmd+W` - Close tab
- `Cmd+Tab` - Switch between tabs

#### Editing
- `Cmd+B` - Bold
- `Cmd+I` - Italic
- `Cmd+K` - Insert link
- `Cmd+Shift+K` - Insert code block
- `Cmd+/` - Toggle comment
- `Cmd+]` - Indent
- `Cmd+[` - Outdent

#### Navigation
- `Cmd+P` - Quick navigation
- `Cmd+F` - Find
- `Cmd+Shift+F` - Find and replace
- `Cmd+G` - Go to line
- `Cmd+Shift+O` - Document outline

#### View
- `Cmd+\` - Toggle sidebar
- `Cmd+Shift+P` - Toggle preview
- `Cmd+Shift+Enter` - Focus mode
- `Cmd+,` - Settings

### Markdown Support

The editor supports all standard Markdown syntax plus:
- Tables with alignment
- Task lists `- [ ]` and `- [x]`
- Strikethrough `~~text~~`
- Footnotes `[^1]`
- Math expressions (LaTeX)
- Code blocks with syntax highlighting
- HTML tags
- Front matter (YAML)

## 🔨 Building

### Development Mode
```bash
# Run webpack dev server for hot reloading
npm run dev

# In another terminal, run Electron
npm run electron:dev
```

### Production Build
```bash
# Build the application
npm run build

# Create distributable package
npm run dist
```

The packaged application will be available in the `dist` folder.

## 📸 Screenshots

![Main Editor Interface](screenshots/main-editor.png)
*Main editor with split-pane preview*

![Dark Mode](screenshots/dark-mode.png)
*Dark mode with syntax highlighting*

![Focus Mode](screenshots/focus-mode.png)
*Distraction-free focus mode*

![Settings Panel](screenshots/settings.png)
*Comprehensive settings panel*

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For any questions or discussions about contributions, please contact us at **opensource@gammaedge.io**

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use styled-components for styling
- Maintain component modularity

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [CodeMirror](https://codemirror.net/) for the powerful editor
- [Electron](https://www.electronjs.org/) for cross-platform desktop support
- [React](https://reactjs.org/) for the UI framework
- [unified](https://unifiedjs.com/) for markdown processing
- [KaTeX](https://katex.org/) for math rendering
- [Prism.js](https://prismjs.com/) for syntax highlighting

## 📞 Support

- **Email**: opensource@gammaedge.io
- **Website**: [GammaEdge.io](https://gammaedge.io)

---

Made with ❤️ by [GammaEdge.io](https://gammaedge.io)