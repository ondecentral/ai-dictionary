# Contributing terms

The dictionary is plain JavaScript in `data/`:

- `data/ai.js`: AI/ML terms (`category: "ai"` is added automatically)
- `data/math.js`: math terms (`category: "math"`)
- `data/symbols.js`: notation
- `data/glossary.csv`: one-line glossary definitions (`id,term,category,definition`), with extra names in `data/glossary-aliases.js`

To make a glossary term richer (add a formula or JS snippet), add a curated entry with the same `term` to `ai.js` or `math.js`. It takes precedence over the CSV row automatically.

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
  where: [                         // required with a formula: explain each variable in context
    ["p", "probability of each token"],
    ["B, A", "comma-separated keys explain several symbols at once"],
  ],
  js: `optional runnable-looking JS showing what it computes`,
  related: ["top-k-sampling", "temperature"], // ids of other terms
}
```

## Symbol schema

```js
{
  symbol: "∇", names: ["nabla", "grad"],
  short: "gradient",                 // few-word gloss shown in formula legends
  meaning: "...",                    // full definition, shown under "Notation used in the formula"
  js: "grad(loss, params)",
  term: "gradient",                  // optional link to an entry
  detect: ["∇"],                     // strings/regexes that find this notation inside formulas
}
```

## Guidelines

- **Every formula must be fully explained.** Variables and anything used in a formula-specific way (σ as sigmoid vs. standard deviation, a lone ‖ in KL) go in the entry's `where`. Generic operators (∈, Σ, √, ·, subscripts, powers…) are explained automatically when a symbol's `detect` pattern matches. `npm test` lists anything left unexplained; fix it by adding a `where` row or a new symbol.

- **Write for JS developers.** Use programming analogies where they help (an RNN is `reduce`; attention is a soft hash-map lookup).
- **Keep JS snippets short** (about 3–10 lines). They can call helpers that other entries define (`dot`, `softmax`, `matvec`, `mean`), but they must parse. The test suite checks this.
- **Acronyms**: an alias with 2+ capital letters and no spaces (`RAG`, `LoRA`) is matched case-sensitively by `scan`. Write acronyms in their real casing.
- **Generic words**: if an alias is an everyday English word ("mean", "given"), add it to `SCAN_IGNORE` in `src/scan.js` so it doesn't flood scan results. It still works for lookups.
- Each alias may belong to only one term. If two concepts share a name, give it to the more common one and mention the other in its definition.

Run `npm test` before submitting.
