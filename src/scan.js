import { terms } from "./data.js";
import { normalize, singulars } from "./search.js";

// Aliases that are useful for lookups but are everyday words in prose,
// so they'd flood scan results with false positives.
const SCAN_IGNORE = new Set([
  "agent", "agents", "average", "batch", "beam", "benchmark", "bits", "compute", "decode", "dense",
  "derivative", "distance", "distribution", "encoder", "decoder", "environment", "evidence", "given",
  "grounding", "identity", "independence", "independent", "information", "inference", "instruction",
  "inverse", "iteration", "label", "labels", "length", "linear", "log", "loss", "magnitude", "markov",
  "mean", "objective", "optimization", "partial", "policy", "prediction", "prior", "project",
  "projected", "random", "randomness", "reasoning", "retrieval", "reward", "serving", "slope", "steps",
  "support", "target", "targets", "tools", "uncertainty", "weights", "params", "cosine", "deterministic",
  "nondeterministic", "seed", "expectation", "experts", "router", "baseline", "decode", "prefill",
  "representation space", "test time", "annotation",
]);

// A name is matched case-sensitively when it looks like an acronym
// ("RAG", "MoE", "LoRA") so we don't match "rag" or "moe" in ordinary text.
const isAcronym = name => (name.match(/[A-Z]/g) ?? []).length >= 2 && !/\s/.test(name);

let matcher;
function buildMatcher() {
  const exact = new Map();   // normalized phrase -> id
  const acronyms = new Map(); // exact-case token -> id
  let maxWords = 1;
  for (const t of terms) {
    // Ids are skipped: "rag" would otherwise bypass RAG's case-sensitive acronym match.
    for (const name of [t.term, ...t.aliases]) {
      if (isAcronym(name)) {
        if (!acronyms.has(name)) acronyms.set(name, t.id);
        continue;
      }
      const n = normalize(name);
      // Skip short names and notation-style aliases like "E[x]" -> "e x".
      if (n.length < 3 || n.split(" ").some(w => w.length < 2) || SCAN_IGNORE.has(n)) continue;
      if (!exact.has(n)) exact.set(n, t.id);
      maxWords = Math.max(maxWords, n.split(" ").length);
    }
  }
  return { exact, acronyms, maxWords };
}

const tokenize = text => text.normalize("NFKC").match(/[\p{L}\p{N}]+/gu) ?? [];

/**
 * Find dictionary terms mentioned in a body of text (e.g. a whitepaper).
 * Longest phrase wins, so "multi-head attention" is not also counted as "attention".
 * @returns {{ entry: object, count: number, matched: string[] }[]} most frequent first
 */
export function scan(text, { category, minCount = 1 } = {}) {
  matcher ??= buildMatcher();
  const { exact, acronyms, maxWords } = matcher;
  const tokens = tokenize(text);
  const lower = tokens.map(t => t.toLowerCase());
  const hits = new Map(); // id -> { count, matched:Set }

  const record = (id, surface) => {
    const h = hits.get(id) ?? { count: 0, matched: new Set() };
    h.count++;
    h.matched.add(surface);
    hits.set(id, h);
  };

  for (let i = 0; i < tokens.length; ) {
    let advanced = false;
    for (let n = Math.min(maxWords, tokens.length - i); n >= 1; n--) {
      const phrase = lower.slice(i, i + n).join(" ");
      const id = exact.get(phrase) ?? singulars(phrase).map(s => exact.get(s)).find(Boolean);
      if (id) {
        record(id, tokens.slice(i, i + n).join(" "));
        i += n;
        advanced = true;
        break;
      }
    }
    if (advanced) continue;
    const tok = tokens[i];
    const id = acronyms.get(tok) ?? (tok.endsWith("s") ? acronyms.get(tok.slice(0, -1)) : undefined);
    if (id) record(id, tok);
    i++;
  }

  const byId = new Map(terms.map(t => [t.id, t]));
  return [...hits]
    .map(([id, h]) => ({ entry: byId.get(id), count: h.count, matched: [...h.matched] }))
    .filter(r => r.count >= minCount && (!category || r.entry.category === category))
    .sort((a, b) => b.count - a.count || a.entry.term.localeCompare(b.entry.term));
}
