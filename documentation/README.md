# Documentation

AI-optimized codebase documentation for the Right Click Ipsum Chrome extension.

## Overview

This directory contains comprehensive, structured documentation designed for both human developers and AI assistants. The documentation follows industry-standard templates and provides deep insights into the extension's architecture, API, and implementation details.

## Documentation Structure

```
documentation/
├── README.md                      # This file
├── config.json                    # Documentation configuration
├── .docstate                      # Generation state tracking
├── overview.md                    # Project overview and quick start
├── architecture.md                # System architecture and design decisions
├── public/                        # Public API documentation
│   ├── _index.md                  # Public API index
│   ├── functions/
│   │   └── generateIpsum.md       # Core text generation function
│   └── features/
│       ├── context-menu.md        # Context menu integration
│       ├── storage.md             # Settings persistence
│       └── options-ui.md          # Options page interface
└── private/                       # Private implementation details
    ├── _index.md                  # Private API index
    └── functions/
        └── parseSentences.md      # Internal sentence parsing helper
```

## Documentation Philosophy

### AI-Optimized Format

The documentation is structured to be easily consumed by Large Language Models (LLMs) and AI assistants:

- **Structured Data**: Tables, code blocks, and hierarchical organization
- **Complete Context**: Each document is self-contained with full context
- **Explicit Relationships**: Clear cross-references between related components
- **Machine-Parseable**: Markdown with consistent formatting patterns
- **Progressive Disclosure**: Information organized from high-level to detailed

### Human-Friendly Design

While optimized for AI consumption, the documentation remains highly readable for humans:

- **Clear Navigation**: Index files provide quick reference
- **Visual Diagrams**: Mermaid diagrams illustrate data flow and architecture
- **Practical Examples**: Real code examples for every API
- **Contextual Explanations**: "Why" alongside "what" and "how"

## Key Documents

### Start Here

1. **[overview.md](./overview.md)** - Project purpose, quick start, and entry points
2. **[architecture.md](./architecture.md)** - System design, data flow, and architectural decisions

### Public API

3. **[public/functions/generateIpsum.md](./public/functions/generateIpsum.md)** - Core text generation function
4. **[public/features/context-menu.md](./public/features/context-menu.md)** - Context menu system
5. **[public/features/storage.md](./public/features/storage.md)** - Settings management
6. **[public/features/options-ui.md](./public/features/options-ui.md)** - User interface

### Implementation Details

7. **[private/functions/parseSentences.md](./private/functions/parseSentences.md)** - Internal utilities
8. **[private/_index.md](./private/_index.md)** - Data structures and patterns

## Using This Documentation

### For New Developers

**Onboarding Path**:
1. Read `overview.md` for project context
2. Review `architecture.md` to understand system design
3. Explore `public/_index.md` for API surface
4. Dive into specific feature docs as needed

**Estimated Reading Time**:
- Quick overview: 10 minutes (overview.md)
- Complete understanding: 45-60 minutes (all docs)

### For AI Assistants

**Recommended Context Loading**:
1. Load `overview.md` for project scope
2. Load `architecture.md` for system understanding
3. Load relevant function/feature docs for specific tasks

**Token-Efficient Approach**:
- Use index files (`_index.md`) to identify relevant detailed docs
- Load specific function/feature docs only when needed
- Cross-reference links provide navigation without loading all content

### For Code Reviews

Focus areas by change type:

**Core Logic Changes**:
- Review `public/functions/generateIpsum.md`
- Check `private/functions/parseSentences.md`
- Verify `architecture.md` reflects changes

**UI Changes**:
- Review `public/features/options-ui.md`
- Check `public/features/storage.md` if settings affected

**Extension Changes**:
- Review `public/features/context-menu.md`
- Check `architecture.md` data flow diagrams

## Documentation Maintenance

### Automatic Updates

This documentation is maintained using the **ws-codebase-documenter** workflow:

```bash
# Documentation is regenerated when code changes
# State is tracked in .docstate file
# Configuration is managed in config.json
```

### Manual Updates

If manual updates are needed:

1. Edit relevant `.md` files in place
2. Update `last_run` timestamp in `.docstate`
3. Commit changes with descriptive message

### When to Update

Update documentation when:
- Adding new functions or features
- Modifying public API signatures
- Changing architectural patterns
- Fixing bugs that affect documented behavior
- Adding new configuration options

## Configuration

### config.json

Defines documentation scope and behavior:

```json
{
  "stack": "browser-extension",
  "exclude": [
    "**/*.test.*",
    "**/*.spec.*",
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**"
  ],
  "include_inline_examples": true,
  "include_architecture_diagrams": true,
  "docusaurus": null
}
```

**Key Settings**:
- `stack`: Browser extension (no build tools)
- `exclude`: Files to skip during documentation generation
- `include_inline_examples`: Embed code examples in docs
- `include_architecture_diagrams`: Generate Mermaid diagrams
- `docusaurus`: External docs sync (disabled)

### .docstate

Tracks documentation generation state:

```json
{
  "last_commit": "9c5bbe653ee8cc19a69db3f39f5bfb290885bac3",
  "last_run": "2026-02-06T16:45:00Z"
}
```

Used to determine if documentation is up-to-date with codebase.

## Documentation Standards

### Markdown Formatting

- Headings: ATX-style (`#`, `##`, `###`)
- Code blocks: Fenced with language identifier
- Tables: GitHub-flavored markdown
- Links: Relative paths for internal docs

### Code Examples

All code examples should be:
- **Complete**: Runnable without modification
- **Contextual**: Show realistic usage
- **Commented**: Explain non-obvious parts
- **Tested**: Verify accuracy before documenting

### Diagrams

Mermaid diagrams are used for:
- Component relationships (`graph TD`)
- Data flow (`sequenceDiagram`)
- State machines (if applicable)
- Architecture overviews

### Cross-References

Internal links use relative paths:
```markdown
[generateIpsum](./public/functions/generateIpsum.md)
[Architecture](./architecture.md)
```

## Contributing to Documentation

### Adding New Function Documentation

1. Create file: `public/functions/[function-name].md`
2. Follow template in `doc-templates.md`
3. Include: signature, description, parameters, returns, examples
4. Update `public/_index.md` with new entry
5. Add cross-references from related docs

### Adding New Feature Documentation

1. Create file: `public/features/[feature-name].md`
2. Include: overview, configuration, implementation, user flow
3. Add diagrams for complex interactions
4. Update `public/_index.md` with new entry
5. Link from `architecture.md` if architecturally significant

### Improving Existing Documentation

1. Read the existing doc completely
2. Identify gaps or outdated information
3. Update with accurate, current details
4. Verify code examples still work
5. Update cross-references if needed

## Questions or Issues?

If documentation is unclear or incomplete:

1. Check related docs via cross-references
2. Review code directly (docs may lag behind)
3. Consult `architecture.md` for design context
4. Open an issue describing the gap
5. Submit a PR with improvements

## Version History

- **v1.0.0** (2026-02-06): Initial documentation generation
  - Complete coverage of public API
  - Architectural documentation
  - Feature guides
  - Internal implementation details
