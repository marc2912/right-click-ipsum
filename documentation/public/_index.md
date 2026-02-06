# Public API Index

Quick reference for all public API items in the Right Click Ipsum extension.

## Summary

This extension provides a minimal public API surface, as it's primarily designed for end-user interaction via Chrome's context menu system. The only programmatically accessible export is the text generation function.

## Functions

| Function | Description | Added | Status |
|----------|-------------|-------|--------|
| [generateIpsum](./functions/generateIpsum.md) | Generates lorem ipsum text of specified length with optional randomization | v1.0 | Stable |

## Features

| Feature | Description | Status |
|---------|-------------|--------|
| [Context Menu Integration](./features/context-menu.md) | Right-click menu for inserting text into editable fields | Stable |
| [Storage Integration](./features/storage.md) | Chrome sync storage for user preferences | Stable |
| [Options UI](./features/options-ui.md) | Settings page for configuring extension behavior | Stable |

## By Category

### Core API
- [generateIpsum](./functions/generateIpsum.md) - Text generation function

### User Interface Features
- [Context Menu Integration](./features/context-menu.md) - Right-click menu system
- [Options UI](./features/options-ui.md) - Settings page

### Data Management
- [Storage Integration](./features/storage.md) - Preference persistence

## Entry Points

### For Extension Users
1. Install extension from Chrome Web Store or load unpacked
2. Right-click on any editable field
3. Select "Ipsum" → desired text length
4. Configure via Options page if needed

### For Developers Extending This Extension

If you want to programmatically generate lorem ipsum text in your own extension or reuse this module:

```javascript
// Import the text generation function
import { generateIpsum } from './ipsum.js';

// Generate text
const oneSentence = generateIpsum('1-sentence', false);
const randomParagraph = generateIpsum('1-paragraph', true);
```

**Available Text Types**:
- `"1-sentence"` - Single sentence
- `"2-sentences"` - Two consecutive sentences
- `"1-paragraph"` - Full paragraph
- `"2-paragraphs"` - Two consecutive paragraphs

**Randomization**:
- `false` - Always starts with "Lorem ipsum dolor sit amet..."
- `true` - Random starting position in source corpus

## Chrome Extension Architecture

This extension follows Manifest V3 architecture:

```
manifest.json (configuration)
    ↓
background.js (service worker)
    ↓
ipsum.js (text generation)
    ↓
chrome.scripting.executeScript (content script injection)
    ↓
DOM manipulation (text insertion)
```

Separate options page:
```
options.html (UI)
    ↓
options.js (logic)
    ↓
chrome.storage.sync (persistence)
```

## API Stability

All documented public APIs are considered **stable** as of v1.0:
- Function signatures will not change in backwards-incompatible ways
- Menu structure and text types are fixed
- Storage schema is stable

Future versions may add:
- Additional text length options
- Custom text sources
- Keyboard shortcuts
- But existing functionality will remain compatible

## Related Documentation

- [Overview](../overview.md) - Project purpose and quick start
- [Architecture](../architecture.md) - System design and component relationships
- [Private API](../private/_index.md) - Internal implementation details
