# ai-dictionary

An **offline** dictionary of AI and math terms that show up in machine-learning papers, explained for **JavaScript developers**.

Every entry has a plain-English definition, the formula as papers write it, and a short **JS snippet** showing what it actually computes. There are no network calls and no dependencies: the whole dataset ships inside the package.

```
$ npm run cli -- softmax

Softmax  [math] functions · probability
aka: softargmax, normalized exponential, softmax function

  Turns a vector of arbitrary scores into probabilities that are positive and sum to 1.
  ...
Formula
  softmax(z)ᵢ = exp(zᵢ) / Σⱼ exp(zⱼ)

In JavaScript
  function softmax(z) {
    const m = Math.max(...z);                 // stability trick
    const e = z.map(v => Math.exp(v - m));
    const s = e.reduce((a, b) => a + b, 0);
    return e.map(v => v / s);
  }

Related: Logits, Temperature, Argmax, Sigmoid, Log-Sum-Exp, Cross-Entropy
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

- **AI** (`data/ai.js`): architectures (transformer, attention, MoE, diffusion…), tokens and embeddings, sampling, training and optimizers, fine-tuning (LoRA, quantization, distillation), RLHF/DPO, RAG, agents, and everyday research vocabulary (ablation, SOTA).
- **Math** (`data/math.js`): linear algebra, calculus, probability and statistics, information theory, and the functions papers use most (softmax, log-sum-exp…).
- **Notation** (`data/symbols.js`): Greek letters and their usual meanings, ∇ ∂ Σ 𝔼 ~ ‖x‖ ⊙ and others, plus paper conventions like x⁽ⁱ⁾ vs xᵢ, all with JS equivalents.

Run `aidict list` or `aidict tags` to browse everything.

## Project layout

```
bin/aidict.js        CLI entry (opens interactive mode when run with no args in a terminal)
src/cli.js           command parsing, output, REPL
src/search.js        normalisation, fuzzy matching, lookup, symbol search
src/scan.js          find terms in a document
src/format.js        terminal rendering
src/index.js         public library API
data/*.js            the dictionary itself
test/                node:test suites, including data-integrity checks
```

## Contributing

To add or fix terms, see [CONTRIBUTING.md](CONTRIBUTING.md). Run `npm test` before opening a PR. The tests check that ids are unique, related links resolve, no alias belongs to two terms, and every JS snippet parses.
