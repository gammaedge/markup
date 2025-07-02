# Building Markup

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

## Platform-Specific Requirements

### macOS
- Xcode Command Line Tools

### Windows
- Windows Build Tools
- Visual Studio 2019 or later

### Linux
- Build essentials
- libgtk-3-dev
- libnss3-dev

## Building from Source

1. Clone the repository:
```bash
git clone https://github.com/gammaedge/markup.git
cd markup
```

2. Install dependencies:
```bash
npm install
```

3. Build for your platform:

### macOS
```bash
npm run dist:mac
```
Creates:
- DMG installer
- ZIP archive

### Windows
```bash
npm run dist:win
```
Creates:
- NSIS installer (.exe)
- Portable version

### Linux
```bash
npm run dist:linux
```
Creates:
- AppImage
- DEB package
- RPM package
- Snap package

### All Platforms (on supported build hosts)
```bash
npm run dist:all
```

## Build Output

All builds are placed in the `release/` directory.

## Cross-Platform Building

To build for other platforms from your current OS:

### From macOS
- Can build for macOS natively
- Use GitHub Actions for Windows/Linux builds

### From Windows
- Can build for Windows natively
- Use WSL2 for Linux builds
- Cannot build for macOS

### From Linux
- Can build for Linux natively
- Can build for Windows using Wine
- Cannot build for macOS

## Automated Builds

We use GitHub Actions to automatically build for all platforms when a new tag is pushed:

```bash
git tag v0.0.2
git push origin v0.0.2
```

This will trigger builds for macOS, Windows, and Linux.

## Development Build

For development with hot reload:
```bash
# Terminal 1: Start webpack dev server
npm run dev

# Terminal 2: Start Electron in dev mode
npm run electron:dev
```

## Troubleshooting

### macOS Code Signing
If you encounter code signing issues, you can build without signing:
```bash
export CSC_IDENTITY_AUTO_DISCOVERY=false
npm run dist:mac
```

### Linux Dependencies
If building on Linux fails, install required dependencies:
```bash
sudo apt-get update
sudo apt-get install -y libgtk-3-dev libnss3-dev libxss1 libasound2
```

### Windows Build Tools
If building on Windows fails, install build tools:
```bash
npm install --global windows-build-tools
```

## Support

For build issues or questions: opensource@gammaedge.io