# Right Click Ipsum

> Chrome extension that provides quick access to lorem ipsum text generation via right-click context menu

## Purpose

Right Click Ipsum is a Chrome Extension (Manifest V3) that allows users to quickly insert placeholder text into any editable field on a webpage. By right-clicking on any text input or textarea, users can choose from pre-configured text lengths (1 sentence, 2 sentences, 1 paragraph, or 2 paragraphs) and instantly insert lorem ipsum placeholder text. The extension includes a configurable randomization feature that allows text to start from different points in the source corpus rather than always beginning with "Lorem ipsum dolor sit amet."

## Primary Entry Points

| Entry Point | Purpose | Location |
|-------------|---------|----------|
| `background.js` | Service worker that registers context menus and handles menu clicks | `/background.js` |
| `generateIpsum()` | Core text generation function | `import { generateIpsum } from './ipsum.js'` |
| `options.html` | Settings page for user preferences | Chrome extension options page |

## Quick Start

### Installation
1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the project directory
5. The extension is now installed and active

### Usage
1. Navigate to any webpage with a text input field
2. Right-click on any editable field (input, textarea, or contentEditable element)
3. Hover over "Ipsum" in the context menu
4. Select the desired text length:
   - 1 Sentence
   - 2 Sentences
   - 1 Paragraph
   - 2 Paragraphs
5. The text is instantly inserted at the cursor position

### Configuration
1. Right-click the extension icon and select "Options"
2. Toggle "Randomize starting location" to change text generation behavior
3. Settings are automatically saved and synced across devices via Chrome sync storage

## Dependencies

| Dependency | Purpose | Required |
|------------|---------|----------|
| Chrome Browser | Runtime environment for Manifest V3 extensions | Yes |
| ES Modules | Native JavaScript module support | Yes |
| Chrome APIs | contextMenus, storage, activeTab, scripting | Yes |

## Requirements

- Runtime: Chrome Browser (version supporting Manifest V3, Chrome 88+)
- Platform: Any platform supporting Chrome (Windows, macOS, Linux, ChromeOS)
- Permissions: contextMenus, storage, activeTab, scripting
- No external dependencies or build process required
