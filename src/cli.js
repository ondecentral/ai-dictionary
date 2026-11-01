import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { createInterface } from "node:readline";
import { terms, symbols, getTerm, allTags, slugify, CATEGORIES } from "./data.js";
import { search, lookup, findSymbols } from "./search.js";
import { scan } from "./scan.js";
import { explainFormula } from "./notation.js";
import { makeStyle, formatEntry, formatList, formatSymbol, formatScan } from "./format.js";

const VERSION = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;

const HELP = `aidict ${VERSION} — offline dictionary of AI & math terms from whitepapers, explained for JS devs

Usage
  aidict                         interactive mode (type a term, get a definition)
  aidict <term>                  look up a term            aidict softmax
  aidict search <query>          list matching terms       aidict search attention
  aidict sym [symbol|name]       explain math notation     aidict sym ∇   aidict sym nabla
  aidict scan <file|->           find terms used in a paper (text/markdown; "-" = stdin)
  aidict list                    list every term           aidict list -c math
  aidict tags                    list tags                 aidict list -t optimization
  aidict random                  show a random term

Options
  -c, --category <ai|math>       filter by category
  -t, --tag <tag>                filter by tag
  -n, --limit <n>                max results (search/scan)
      --min <n>                  scan: only terms seen at least n times
      --full                     scan: print full entries instead of a table
      --json                     machine-readable output
      --no-color                 disable colors (also respects NO_COLOR)
  -h, --help                     show this help
  -v, --version                  show version

With npm:  npm run cli                (interactive)
           npm run cli -- softmax     (pass args after --)

PDFs:  pdftotext paper.pdf - | aidict scan -`;

const OPTIONS = {
  category: { type: "string", short: "c" },
  tag: { type: "string", short: "t" },
  limit: { type: "string", short: "n" },
  min: { type: "string" },
  full: { type: "boolean" },
  json: { type: "boolean" },
  "no-color": { type: "boolean" },
  help: { type: "boolean", short: "h" },
  version: { type: "boolean", short: "v" },
};

const COMMANDS = new Set(["search", "find", "sym", "symbol", "symbols", "scan", "list", "ls", "tags", "random", "help", "define", "lookup"]);

/**
 * Run one CLI command. Returns an exit code.
 * `io` lets tests and the REPL capture output.
 */
export async function run(argv, io = defaultIo()) {
  let parsed;
  try {
    parsed = parseArgs({ args: argv, options: OPTIONS, allowPositionals: true, strict: true });
  } catch (err) {
    io.err(`${err.message}\nRun "aidict --help" for usage.`);
    return 2;
  }
  const { values: opts, positionals } = parsed;
  const s = makeStyle(io.color && !opts["no-color"] && !opts.json && !process.env.NO_COLOR);
  const fmt = { getTerm };
  const json = data => io.out(JSON.stringify(data, null, 2));

  if (opts.version) return io.out(VERSION), 0;
  if (opts.help) return io.out(HELP), 0;
  if (opts.category && !CATEGORIES.includes(opts.category)) {
    io.err(`Unknown category "${opts.category}". Use one of: ${CATEGORIES.join(", ")}`);
    return 2;
  }
  const limit = opts.limit ? Number(opts.limit) : undefined;
  // Accept tags as shown ("nlp-llms") or as written in the CSV ("NLP & LLMs").
  const filters = { category: opts.category, tag: opts.tag && slugify(opts.tag) };

  let [cmd, ...rest] = positionals;
  if (!COMMANDS.has(cmd)) {
    rest = positionals;
    cmd = "define";
  }
  const query = rest.join(" ");

  switch (cmd) {
    case "help":
      io.out(HELP);
      return 0;

    case "define":
    case "lookup": {
      if (!query) return io.out(HELP), 0;
      const { entry, suggestions } = lookup(query, filters);
      if (opts.json) return json(entry ? { ...entry, notation: explainFormula(entry).notation.map(symbolJson), suggestions: suggestions.map(e => e.id) } : { entry: null, suggestions: suggestions.map(e => e.id) }), entry ? 0 : 1;
      if (!entry) {
        io.err(`No entry for "${query}".`);
        if (suggestions.length) io.err(`Did you mean: ${suggestions.map(e => s.bold(e.term)).join(", ")}?`);
        io.err(s.gray(`Try: aidict search ${query}   or   aidict sym ${query}`));
        return 1;
      }
      io.out(formatEntry(entry, s, fmt));
      const extra = suggestions.filter(e => !entry.related.includes(e.id));
      if (extra.length) io.out(`${s.gray("Also matched:")} ${extra.map(e => e.term).join(", ")}`);
      return 0;
    }

    case "search":
    case "find": {
      if (!query) return io.err("Usage: aidict search <query>"), 2;
      const results = search(query, { limit: limit ?? 15, ...filters });
      if (opts.json) return json(results.map(r => ({ id: r.entry.id, term: r.entry.term, category: r.entry.category, score: r.score, short: r.entry.short }))), 0;
      if (!results.length) return io.err(`No matches for "${query}".`), 1;
      io.out(formatList(results.map(r => r.entry), s));
      return 0;
    }

    case "list":
    case "ls": {
      const list = terms
        .filter(t => (!filters.category || t.category === filters.category) && (!filters.tag || t.tags.includes(filters.tag)))
        .sort((a, b) => a.term.localeCompare(b.term));
      if (opts.json) return json(list.map(t => ({ id: t.id, term: t.term, category: t.category, short: t.short }))), 0;
      if (!list.length) return io.err("No terms match those filters. Run \"aidict tags\" to see tags."), 1;
      io.out(formatList(list, s));
      io.out(s.gray(`\n${list.length} terms`));
      return 0;
    }

    case "tags": {
      const tags = allTags();
      if (opts.json) return json(Object.fromEntries(tags)), 0;
      io.out(tags.map(([tag, n]) => `${tag.padEnd(20)} ${s.gray(n)}`).join("\n"));
      return 0;
    }

    case "random": {
      const pool = terms.filter(t => !filters.category || t.category === filters.category);
      const entry = pool[Math.floor(Math.random() * pool.length)];
      if (opts.json) return json(entry), 0;
      io.out(formatEntry(entry, s, fmt));
      return 0;
    }

    case "sym":
    case "symbol":
    case "symbols": {
      const found = query ? findSymbols(query) : symbols;
      if (opts.json) return json(found.map(symbolJson)), found.length ? 0 : 1;
      if (!found.length) return io.err(`No notation found for "${query}". Run "aidict sym" to list all symbols.`), 1;
      io.out(found.slice(0, limit ?? (query ? 5 : Infinity)).map(x => formatSymbol(x, s, fmt)).join("\n\n"));
      return 0;
    }

    case "scan": {
      if (!query) return io.err("Usage: aidict scan <file|->   (use - to read stdin)"), 2;
      if (/\.pdf$/i.test(query)) {
        io.err(`aidict reads plain text. Convert the PDF first, e.g.:\n  pdftotext "${query}" - | aidict scan -`);
        return 2;
      }
      let text;
      try {
        text = query === "-" ? await io.readStdin() : readFileSync(query, "utf8");
      } catch (err) {
        io.err(`Could not read ${query}: ${err.message}`);
        return 2;
      }
      const results = scan(text, { category: opts.category, minCount: opts.min ? Number(opts.min) : 1 }).slice(0, limit);
      if (opts.json) return json(results.map(r => ({ id: r.entry.id, term: r.entry.term, category: r.entry.category, count: r.count, matched: r.matched, short: r.entry.short }))), 0;
      if (!results.length) return io.out("No known terms found."), 0;
      io.out(formatScan(results, s, { full: opts.full, getTerm }));
      if (!opts.full) io.out(s.gray(`\n${results.length} terms found. Look one up with: aidict <term>`));
      return 0;
    }
  }
}

// Symbols carry detection regexes, which don't serialize; drop them from JSON output.
const symbolJson = ({ detect, ...sym }) => sym;

function defaultIo() {
  return {
    out: msg => console.log(msg),
    err: msg => console.error(msg),
    color: Boolean(process.stdout.isTTY),
    readStdin: async () => {
      const chunks = [];
      for await (const chunk of process.stdin) chunks.push(chunk);
      return Buffer.concat(chunks).toString("utf8");
    },
  };
}

/** Interactive prompt: each line is run as if it were CLI arguments. */
export async function repl() {
  const s = makeStyle(Boolean(process.stdout.isTTY) && !process.env.NO_COLOR);
  console.log(`${s.bold("aidict")} ${s.gray(`v${VERSION} — ${terms.length} terms, ${symbols.length} symbols, fully offline`)}`);
  console.log(s.gray('Type a term (e.g. "softmax"), "search <q>", "sym <symbol>", "list", "random", "help", or "exit".\n'));

  const rl = createInterface({ input: process.stdin, output: process.stdout, prompt: s.cyan("aidict› ") });
  rl.prompt();
  for await (const line of rl) {
    const input = line.trim();
    if (["exit", "quit", ":q", "q"].includes(input)) break;
    if (input) {
      await run(splitArgs(input));
      console.log();
    }
    rl.prompt();
  }
  rl.close();
}

// Split a REPL line into args, honouring simple quotes.
const splitArgs = line => [...line.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)].map(m => m[1] ?? m[2] ?? m[3]);
