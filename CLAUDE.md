# Right Click Ipsum - AI Assistant Context

## Project Overview

Right Click Ipsum is a Chrome Extension (Manifest V3) that provides quick access to lorem ipsum text generation via right-click context menus. Users can insert placeholder text into any editable field by right-clicking and selecting from predefined text lengths.

## Documentation Location

Comprehensive, AI-optimized codebase documentation is available in the `/documentation` directory:

- **Overview**: `/documentation/overview.md` - Project purpose, quick start, and dependencies
- **Architecture**: `/documentation/architecture.md` - System design, data flow, and architectural decisions
- **Public API**: `/documentation/public/` - Exported functions and user-facing features
- **Private Implementation**: `/documentation/private/` - Internal functions and data structures

### Key Documentation Files

**Core Function**:
- `/documentation/public/functions/generateIpsum.md` - Text generation function API

**Features**:
- `/documentation/public/features/context-menu.md` - Right-click menu integration
- `/documentation/public/features/storage.md` - Settings persistence system
- `/documentation/public/features/options-ui.md` - User preferences interface

**Internal Details**:
- `/documentation/private/functions/parseSentences.md` - Sentence parsing helper
- `/documentation/private/_index.md` - Internal data structures and patterns

## Project Structure

```
/
├── manifest.json           # Chrome Extension Manifest V3 configuration
├── background.js           # Service worker (context menus, event handling)
├── ipsum.js                # Text generation module (core logic)
├── options.html            # Settings page UI
├── options.js              # Settings page logic
├── options.css             # Settings page styles
├── icons/                  # Extension icons (16px, 48px, 128px)
└── documentation/          # AI-optimized codebase documentation
    ├── config.json         # Documentation configuration
    ├── .docstate           # Documentation generation state
    ├── overview.md         # Project overview
    ├── architecture.md     # System architecture
    ├── public/             # Public API documentation
    │   ├── _index.md
    │   ├── functions/
    │   │   └── generateIpsum.md
    │   └── features/
    │       ├── context-menu.md
    │       ├── storage.md
    │       └── options-ui.md
    └── private/            # Private implementation documentation
        ├── _index.md
        └── functions/
            └── parseSentences.md
```

## Tech Stack

- **Platform**: Chrome Browser (Manifest V3)
- **Language**: JavaScript (ES Modules)
- **APIs**: Chrome Extensions API (contextMenus, storage, scripting, activeTab)
- **Build**: None required (vanilla JS)
- **Dependencies**: None (zero npm packages)

## Development Guidelines

### Extension Architecture

This extension follows Manifest V3 patterns:
- **Service Worker**: `background.js` handles events, doesn't maintain persistent state
- **ES Modules**: Uses `type: "module"` for cleaner imports
- **Script Injection**: Dynamically injects content scripts on-demand
- **Sync Storage**: Uses `chrome.storage.sync` for cross-device settings

### Code Style

- Pure functions where possible (see `generateIpsum()`)
- Event-driven architecture (Chrome API listeners)
- No external dependencies or build tools
- Clear separation of concerns (UI, logic, storage)

### Key Files

1. **manifest.json**: Extension configuration (permissions, entry points)
2. **background.js**: Service worker (menu registration, click handling, script injection)
3. **ipsum.js**: Pure text generation logic (no side effects, easily testable)
4. **options.html/js/css**: Settings page (single toggle for randomization)

### Testing Locally

1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select this project directory
5. Right-click on any editable field to test

### Making Changes

**To modify text generation**:
- Edit `ipsum.js` (update `SOURCE_PARAGRAPHS` or `generateIpsum()` logic)
- All arrays rebuild automatically on module load

**To add menu options**:
- Edit `background.js` in `onInstalled` listener
- Add new menu items with unique IDs
- Handle new IDs in `onClicked` listener

**To change settings**:
- Add UI elements to `options.html`
- Add logic to `options.js` for storage interaction
- Read new settings in `background.js` before text generation

## Common Tasks

### Adding a New Text Length Option

1. Add menu item in `background.js`:
   ```javascript
   chrome.contextMenus.create({
     id: "3-paragraphs",
     parentId: "ipsum-parent",
     title: "3 Paragraphs",
     contexts: ["editable"],
   });
   ```

2. Handle in `generateIpsum()` in `ipsum.js`:
   ```javascript
   if (type === "3-paragraphs") {
     // Generate 3 paragraphs
   }
   ```

### Changing Source Text

Edit `SOURCE_PARAGRAPHS` array in `ipsum.js`. No other changes needed.

### Adding a New Setting

1. Add UI to `options.html`
2. Read/write to `chrome.storage.sync` in `options.js`
3. Read setting in `background.js` before calling `generateIpsum()`

## Important Reminders

- **Service Worker Lifecycle**: Background script may terminate between events
- **Storage API**: Always use async/await or callbacks, never synchronous
- **Script Injection**: Fails on Chrome Web Store and chrome:// pages
- **Permissions**: Minimal permissions (contextMenus, storage, activeTab, scripting)
- **No Build Step**: All files load directly, no compilation

## Documentation Maintenance

The `/documentation` directory is maintained using the ws-codebase-documenter workflow:
- **Config**: `/documentation/config.json` defines documentation scope
- **State**: `/documentation/.docstate` tracks last documentation generation
- **Templates**: Documentation follows standard AI-optimized templates
- **Updates**: Re-run documenter when significant code changes occur

When updating documentation:
1. Modify code as needed
2. Run ws-codebase-documenter skill to update docs
3. Review generated documentation for accuracy
4. Commit both code and documentation changes together

## Resources

- [Chrome Extension Manifest V3 Docs](https://developer.chrome.com/docs/extensions/mv3/)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Chrome Context Menus API](https://developer.chrome.com/docs/extensions/reference/contextMenus/)
- [Chrome Scripting API](https://developer.chrome.com/docs/extensions/reference/scripting/)
