# GitHub Repository Setup for Markup

Follow these steps to create the repository and publish the release:

## 1. Create Repository on GitHub

1. Go to https://github.com/organizations/gammaedge/repositories/new (or your GammaEdge organization page)
2. Create a new repository with these settings:
   - **Repository name**: `markup`
   - **Description**: `A powerful, feature-rich Markdown editor for macOS`
   - **Public/Private**: Choose as appropriate
   - **Initialize**: DO NOT initialize with README, .gitignore, or license (we already have them)

## 2. Push Code to GitHub

After creating the empty repository, run these commands in your terminal:

```bash
# Add the remote repository (replace with your actual repo URL)
git remote add origin https://github.com/gammaedge/markup.git

# Push all branches and tags
git push -u origin main
```

## 3. Create GitHub Release

### Option A: Using GitHub CLI (if you have `gh` installed)

```bash
# Create release with the built files
gh release create v0.0.1 \
  --title "Markup v0.0.1" \
  --notes "Initial release of Markup - A powerful Markdown editor for macOS by GammaEdge.io

## Features
- Advanced CodeMirror 6 Editor
- Real-time Markdown Preview
- Vim Mode Support
- Math expressions with KaTeX
- Export to HTML and Word
- Comments and annotations
- And much more!

## Installation
1. Download the DMG file below
2. Open and drag Markup to your Applications folder
3. Launch and enjoy!

For support or questions: opensource@gammaedge.io" \
  release/Markup-1.0.0-arm64.dmg \
  release/Markup-1.0.0-arm64-mac.zip
```

### Option B: Using GitHub Web Interface

1. Go to your repository on GitHub
2. Click on "Releases" → "Create a new release"
3. Fill in:
   - **Tag version**: `v0.0.1`
   - **Release title**: `Markup v0.0.1`
   - **Description**: (use the text from Option A)
4. Upload these files:
   - `release/Markup-1.0.0-arm64.dmg`
   - `release/Markup-1.0.0-arm64-mac.zip`
5. Click "Publish release"

## 4. Update README (Optional)

After creating the release, you might want to update the README with download links:

```markdown
## Download

Download the latest version from the [Releases page](https://github.com/gammaedge/markup/releases).
```

## Repository Structure

Your repository will have:
```
markup/
├── src/                 # Source code
├── build/              # Build configuration
├── release/            # Built applications (in .gitignore)
├── package.json        # Project configuration
├── README.md          # Documentation
├── LICENSE            # MIT License
├── .gitignore         # Git ignore rules
└── ...                # Other config files
```

## Contact

For any issues with the setup, contact: opensource@gammaedge.io