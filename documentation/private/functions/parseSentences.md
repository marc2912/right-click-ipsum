# parseSentences

> Internal utility function that splits a paragraph string into individual sentences.

## Signature

```javascript
function parseSentences(paragraph)
```

## Description

Private helper function used during module initialization to parse the source lorem ipsum paragraphs into individual sentences. The function splits on period-followed-by-whitespace pattern and ensures each sentence ends with a period. This is not exported and is only used internally by `ipsum.js` to build the `ALL_SENTENCES` array.

## Parameters

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| paragraph | `string` | Yes | - | A paragraph of text to split into sentences |

## Returns

**Type**: `string[]`

Returns an array of sentence strings where:
- Each sentence ends with a period
- Empty or single-character strings are filtered out
- Whitespace between sentences is removed

## Algorithm

1. Split paragraph on regex pattern `/\.\s+/` (period followed by one or more whitespace characters)
2. For each resulting segment:
   - Check if it already ends with a period
   - If not, append a period
3. Filter out any strings with length <= 1
4. Return array of cleaned sentences

## Example

```javascript
// Internal usage in ipsum.js module initialization
const SOURCE_PARAGRAPHS = [
  "First sentence. Second sentence. Third sentence.",
  "Another paragraph here. With multiple sentences."
];

const paragraph1Sentences = parseSentences(SOURCE_PARAGRAPHS[0]);
// ["First sentence.", "Second sentence.", "Third sentence."]

const paragraph2Sentences = parseSentences(SOURCE_PARAGRAPHS[1]);
// ["Another paragraph here.", "With multiple sentences."]

// Used to build flat array of all sentences
const ALL_SENTENCES = SOURCE_PARAGRAPHS.flatMap(parseSentences);
```

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Empty string input | Returns empty array `[]` |
| Single sentence with period | Returns array with one element |
| Sentence without trailing period | Adds period before returning |
| Multiple consecutive spaces | Split regex handles multiple whitespace characters |
| Text with no periods | Returns array with single element (entire text + added period) |
| Very short fragments (<= 1 char) | Filtered out |

## Safety Considerations

- **Thread Safety**: Safe for concurrent calls (no shared mutable state)
- **Idempotency**: Same input always produces same output
- **Side Effects**: None - pure function
- **Resource Cleanup**: Not applicable
- **Memory**: Creates new array and string objects

## Why It's Private

This function is intentionally not exported because:
1. It's only needed during module initialization
2. The pre-computed `ALL_SENTENCES` array is used at runtime instead
3. External code should use `generateIpsum()` rather than manually parsing
4. Implementation detail that may change without affecting public API

## Module Initialization Usage

```javascript
// In ipsum.js, at module scope
const ALL_SENTENCES = SOURCE_PARAGRAPHS.flatMap(parseSentences);
```

This pre-computes all sentences once when the module loads, avoiding repeated parsing during text generation.

## Related

- [generateIpsum](../../public/functions/generateIpsum.md) - Public function that uses the parsed sentences
