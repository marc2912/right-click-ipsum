# generateIpsum

> Generates lorem ipsum placeholder text of specified length with optional randomization.

## Signature

```javascript
function generateIpsum(type, randomize)
```

## Description

The core text generation function that produces lorem ipsum placeholder text based on the requested type (sentence or paragraph) and optionally randomizes the starting position in the source corpus. This is a pure function with no side effects - it takes parameters and returns a string without accessing any external state or APIs.

The function handles four distinct text length types:
- Single sentence
- Two sentences
- Single paragraph
- Two paragraphs

When randomization is disabled (default), text always starts with "Lorem ipsum dolor sit amet...". When enabled, a random starting point is selected from the corpus, providing variety in generated text.

## Parameters

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| type | `string` | Yes | - | Text length identifier, one of: `"1-sentence"`, `"2-sentences"`, `"1-paragraph"`, `"2-paragraphs"` |
| randomize | `boolean` | Yes | - | Whether to start from a random position in the corpus |

## Returns

**Type**: `string`

Returns a string containing the generated lorem ipsum text:
- For sentence types: Sentences joined with a single space
- For paragraph types: Paragraphs joined with double newlines (`\n\n`)
- Returns empty string (`""`) if type parameter is not recognized

## Algorithm

### Sentence Generation
1. Determine starting index: random if `randomize=true`, otherwise 0
2. Extract required number of sentences from `ALL_SENTENCES` array
3. Uses modulo arithmetic to wrap around if needed
4. Join sentences with single space

### Paragraph Generation
1. Determine starting sentence index (random or 0)
2. Map sentence index to corresponding paragraph index via `SENTENCE_TO_PARAGRAPH` lookup
3. Extract required number of paragraphs from `SOURCE_PARAGRAPHS` array
4. Uses modulo arithmetic to wrap around if needed
5. Join paragraphs with double newline

## Example

```javascript
import { generateIpsum } from './ipsum.js';

// Generate single sentence, always starting with "Lorem ipsum..."
const sentence1 = generateIpsum('1-sentence', false);
// "Lorem ipsum dolor sit amet, consectetur adipiscing elit."

// Generate two sentences with randomization
const sentence2 = generateIpsum('2-sentences', true);
// Might return: "Cras ornare tristique elit. Vivamus vestibulum ntulla nec ante."

// Generate one paragraph, deterministic
const paragraph1 = generateIpsum('1-paragraph', false);
// Returns the full first paragraph starting with "Lorem ipsum..."

// Generate two paragraphs with randomization
const paragraph2 = generateIpsum('2-paragraphs', true);
// Returns two consecutive paragraphs starting from random position

// Invalid type returns empty string
const invalid = generateIpsum('invalid-type', false);
// ""
```

## Source Data

The function operates on pre-computed data structures:

- `SOURCE_PARAGRAPHS`: Array of 8 lorem ipsum paragraphs
- `ALL_SENTENCES`: Flat array of all sentences from all paragraphs (computed via `parseSentences()`)
- `SENTENCE_TO_PARAGRAPH`: Mapping array that tracks which paragraph each sentence belongs to

Total available content:
- 8 paragraphs
- ~40+ sentences (exact count depends on parsing)

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Invalid type parameter | Returns empty string `""` |
| Randomize wraps past end | Uses modulo to wrap to beginning of array |
| Multiple calls with same params | Returns identical output (deterministic when randomize=false) |
| Empty string type | Returns empty string `""` |

## Safety Considerations

- **Thread Safety**: Safe for concurrent calls (no shared mutable state)
- **Idempotency**: Deterministic when `randomize=false` - same inputs always produce same output
- **Side Effects**: None - pure function
- **Resource Cleanup**: Not applicable (no resources allocated)
- **Memory**: Pre-computed arrays are loaded once at module initialization
- **Performance**: O(1) for sentence generation, O(n) for joining where n is number of units requested

## Integration Notes

### Typical Usage in Extension Context

```javascript
// In background.js service worker
import { generateIpsum } from "./ipsum.js";

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  // Get user's randomize preference from storage
  const { randomize = false } = await chrome.storage.sync.get("randomize");

  // Generate text based on menu selection
  const text = generateIpsum(info.menuItemId, randomize);

  // Inject into page (separate concern)
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (ipsumText) => {
      // DOM manipulation logic
    },
    args: [text],
  });
});
```

## Related

- [parseSentences](../../private/functions/parseSentences.md) - Internal helper for parsing sentences
- [Context Menu Integration](../features/context-menu.md) - How this function is called from menu clicks
- [Storage Integration](../features/storage.md) - How randomize preference is managed
