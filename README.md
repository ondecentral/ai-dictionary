# ai-dictionary

An **offline** dictionary of AI and math terms that show up in machine-learning papers, explained for **JavaScript developers**.

Every entry has a plain-English definition, the formula as papers write it with **every symbol in it explained**, and a short **JS snippet** showing what it actually computes. There are no network calls and no dependencies: the whole dataset ships inside the package.

```
$ npm run cli -- softmax

Softmax  [math] functions · probability
aka: softargmax, normalized exponential, softmax function

  Turns a vector of arbitrary scores into probabilities that are positive and sum to 1.
  ...
Formula
  softmax(z)ᵢ = exp(zᵢ) / Σⱼ exp(zⱼ)

  where
    z             vector of scores (logits)
    zᵢ            score of item i
    zⱼ            score of item j, summed over every item
    softmax(z)ᵢ   probability assigned to item i
    /             divided by
    xᵢ            subscript: an index or label
    Σ             sum over the index
    exp(x)        e raised to the power (e ≈ 2.718)

In JavaScript
  function softmax(z) {
    const m = Math.max(...z);                 // stability trick
    const e = z.map(v => Math.exp(v - m));
    const s = e.reduce((a, b) => a + b, 0);
    return e.map(v => v / s);
  }

Related: Logits, Temperature, Argmax, Sigmoid, Log-Sum-Exp, Cross-Entropy

Notation used in the formula  (more: aidict sym <symbol>)
  Σ             Summation. Σᵢ₌₁ⁿ xᵢ adds x₁ through xₙ; the subscript says what to sum over. ...
  ...
```

## Quick start

Requires Node.js 18.3+. Nothing to install.

```sh
npm run cli                 # interactive mode: type terms, get definitions
npm run cli -- softmax      # one-off lookup (put arguments after --)
```

To get a global `aidict` command, run `npm link` once in this folder. Then:

```sh
aidict "kv cache"
```

## Commands

| Command | What it does |
| --- | --- |
| `aidict` | Interactive prompt. Each line works like the commands below (`search adam`, `sym ∇`, `exit`). |
| `aidict <term>` | Look up a term. Matches aliases (`RAG`, `nucleus sampling`), plurals, and typos (`sofmax`). |
| `aidict search <query>` | Ranked list of matching terms. |
| `aidict sym [symbol\|name]` | Explain math notation: `aidict sym ∇`, `aidict sym nabla`, `aidict sym "x_{<t}"`. With no argument it lists every symbol. |
| `aidict scan <file\|->` | List the dictionary terms used in a paper, most frequent first. |
| `aidict list` | List all terms. Filter with `-c ai\|math` or `-t <tag>`. |
| `aidict tags` | List tags with counts. |
| `aidict random` | Show a random term. |

Flags: `--json` (machine-readable output), `-n/--limit`, `-c/--category`, `-t/--tag`, `--min <n>` and `--full` for scan, `--no-color`. Colors also turn off when `NO_COLOR` is set or output is piped.

### Reading a whitepaper

`scan` takes plain text or Markdown. To scan a PDF, convert it with `pdftotext` first (from poppler: `brew install poppler` or `apt install poppler-utils`):

```sh
pdftotext paper.pdf - | npm run cli -- scan -
pdftotext paper.pdf - | aidict scan - --min 2       # only terms used at least twice
pdftotext paper.pdf - | aidict scan - --full        # print full entries
```

Try it on the included sample: `npm run cli -- scan examples/sample-abstract.md`.

How scan matches terms:
- The longest phrase wins, so "multi-head attention" is not also counted as "attention".
- Acronyms (`RAG`, `LoRA`, `MoE`) only match with that capitalisation, so the word "rag" doesn't count as RAG.
- Aliases that are everyday words ("mean", "given", "linear") are skipped. The list is `SCAN_IGNORE` in `src/scan.js`.

## Use as a library

```js
import { lookup, search, scan, findSymbols, terms } from "ai-dictionary";

lookup("nucleus sampling").entry.id;     // "top-p-sampling"
search("optimizer", { limit: 3 });       // [{ entry, score }, ...]
scan(paperText);                          // [{ entry, count, matched }, ...]
findSymbols("∇")[0].meaning;              // "Gradient. ∇_θ L = ..."
```

## What's covered

About **1,090 terms** across 24 subjects, plus 90 notation symbols.

- **Curated entries** (`data/ai.js`, `data/math.js`, ~140 terms): the concepts papers use most (transformer, attention, softmax, gradient descent, KL divergence, LoRA, RLHF…). Each has a full explanation, the formula, and a JS snippet.
- **Glossary** (`data/glossary.csv`, 1,072 rows): one-sentence definitions across machine learning, deep learning, NLP & LLMs, RL, AI agents, safety and ethics, MLOps, and math from calculus and statistics to graph theory, number theory and topology.
- **Notation** (`data/symbols.js`): Greek letters and their usual meanings, ∇ ∂ Σ 𝔼 ~ ‖x‖ ⊙ and others, plus paper conventions like x⁽ⁱ⁾ vs xᵢ, all with JS equivalents.

Browse with `aidict list`, filter by subject with `aidict list -t "Linear Algebra"`, and see every subject and tag with `aidict tags`.

### Updating the glossary

Replace `data/glossary.csv` with a new export that has the same columns: `id,term,category,definition`. The `category` column is the subject (e.g. `Linear Algebra`). The file is loaded at startup and merged with the curated entries:

- If a CSV term has the same name as a curated entry, they merge: the curated explanation, formula and JS stay, and the CSV subject is added as a tag.
- If a CSV term is only an *alias* of a curated entry (e.g. `AdamW` under Adam), it becomes its own entry, and the two are linked as related.
- Spelled-out acronyms merge into their acronym entry (`Direct Preference Optimization` → `DPO`).
- To add acronyms or other names for CSV terms, edit `data/glossary-aliases.js`. The CSV has no alias column.
- A new subject must be added to `SUBJECT_CATEGORY` in `src/data.js`, which maps it to `ai` or `math`. `npm test` reports any missing ones.

## Project layout

```
bin/aidict.js        CLI entry (opens interactive mode when run with no args in a terminal)
src/cli.js           command parsing, output, REPL
src/data.js          loads and merges curated entries with the glossary CSV
src/search.js        fuzzy matching, lookup, symbol search
src/scan.js          find terms in a document
src/format.js        terminal rendering
src/index.js         public library API
data/ai.js, math.js  curated entries with formulas and JS snippets
data/glossary.csv    glossary definitions (+ glossary-aliases.js for acronyms)
data/symbols.js      math notation
test/                node:test suites, including data-integrity checks
```

## Contributing

To add or fix terms, see [CONTRIBUTING.md](CONTRIBUTING.md). Run `npm test` before opening a PR. The tests check that ids are unique, related links resolve, no alias belongs to two terms, and every JS snippet parses.
