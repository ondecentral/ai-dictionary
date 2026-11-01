# Contributing terms

The dictionary is plain JavaScript in `data/`:

- `data/ai.js`: AI/ML terms (`category: "ai"` is added automatically)
- `data/math.js`: math terms (`category: "math"`)
- `data/symbols.js`: notation

## Term schema

```js
{
  id: "top-p-sampling",            // kebab-case, unique, used in `related`
  term: "Top-p Sampling",          // display name
  aliases: ["nucleus sampling"],   // other names, acronyms, plurals papers use
  tags: ["sampling", "inference"], // at least one; reuse existing tags (`aidict tags`)
  short: "One line, <= 140 chars.",
  definition: "2–5 plain-English sentences. Explain it to a JS dev with no ML background.",
  formula: "optional, Unicode math as papers write it",
  js: `optional runnable-looking JS showing what it computes`,
  related: ["top-k-sampling", "temperature"], // ids of other terms
}
```

## Symbol schema

```js
{ symbol: "∇", names: ["nabla", "grad"], meaning: "...", js: "grad(loss, params)", term: "gradient" /* optional link */ }
```

## Guidelines

- **Write for JS developers.** Use programming analogies where they help (an RNN is `reduce`; attention is a soft hash-map lookup).
- **Keep JS snippets short** (about 3–10 lines). They can call helpers that other entries define (`dot`, `softmax`, `matvec`, `mean`), but they must parse. The test suite checks this.
- **Acronyms**: an alias with 2+ capital letters and no spaces (`RAG`, `LoRA`) is matched case-sensitively by `scan`. Write acronyms in their real casing.
- **Generic words**: if an alias is an everyday English word ("mean", "given"), add it to `SCAN_IGNORE` in `src/scan.js` so it doesn't flood scan results. It still works for lookups.
- Each alias may belong to only one term. If two concepts share a name, give it to the more common one and mention the other in its definition.

Run `npm test` before submitting.
