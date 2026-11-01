import { readFileSync } from "node:fs";
import ai from "../data/ai.js";
import math from "../data/math.js";
import symbolData from "../data/symbols.js";
import glossaryAliases from "../data/glossary-aliases.js";
import { parseCsv } from "./csv.js";
import { normalize } from "./text.js";

export const CATEGORIES = ["ai", "math"];

// Subjects used in data/glossary.csv, mapped to the CLI's two categories.
// Unknown subjects fall back to "ai"; test/data.test.js fails if one is missing here.
export const SUBJECT_CATEGORY = {
  "AI Agents": "ai", "AI Ethics": "ai", "AI General": "ai", "AI Infrastructure": "ai", "AI Safety": "ai",
  "Computer Vision": "ai", "Data & MLOps": "ai", "Deep Learning": "ai", "Machine Learning": "ai",
  "NLP & LLMs": "ai", "Reinforcement Learning": "ai",
  "Abstract Algebra": "math", "Algebra": "math", "Calculus": "math", "Discrete Math": "math",
  "Geometry": "math", "Graph Theory": "math", "Linear Algebra": "math", "Number Theory": "math",
  "Optimization": "math", "Probability": "math", "Set Theory & Logic": "math", "Statistics": "math",
  "Topology": "math",
};

/** "NLP & LLMs" -> "nlp-llms" */
export const slugify = s => normalize(s).replace(/ /g, "-");

const MINOR_WORDS = new Set(["of", "the", "a", "an", "and", "to", "in", "for", "on", "with", "by"]);

/** "Principal Component Analysis" -> "PCA"; "Law of Large Numbers" -> "LLN". */
export function initials(term) {
  const words = term.split(/[\s-]+/).filter(w => w && !MINOR_WORDS.has(w.toLowerCase()));
  return words.length >= 2 ? words.map(w => w[0]).join("").toUpperCase() : "";
}

export const glossaryRows =parseCsv(readFileSync(new URL("../data/glossary.csv", import.meta.url), "utf8"));

/**
 * Combine the hand-written entries (data/ai.js, data/math.js) with the glossary CSV.
 * - CSV term matches a curated term or id  -> merged: curated content kept, CSV subject added as a tag
 *                                            (and the CSV example, if the curated entry has none).
 * - CSV term matches only a curated alias  -> becomes its own entry; the alias moves off the curated
 *   entry and the two are cross-linked via `related`.
 * - Otherwise                              -> new glossary entry.
 */
function buildTerms() {
  const curated = [
    ...ai.map(t => ({ ...t, category: "ai" })),
    ...math.map(t => ({ ...t, category: "math" })),
  ].map(t => ({ ...t, aliases: [...t.aliases], tags: [...t.tags], related: [...t.related], source: "curated" }));

  const byName = new Map();  // normalized term/id -> curated entry
  const byAlias = new Map(); // normalized alias   -> curated entry
  for (const t of curated) {
    byName.set(normalize(t.term), t);
    byName.set(normalize(t.id), t);
    for (const a of t.aliases) byAlias.set(normalize(a), t);
  }

  // Curated entries titled by an acronym ("DPO", "PPO"), keyed by that acronym.
  const curatedAcronyms = new Map(curated.filter(t => /^[A-Z]{2,6}$/.test(t.term)).map(t => [t.term, t]));

  const ids = new Set(curated.map(t => t.id));
  const uniqueId = base => {
    let id = base, n = 2;
    while (ids.has(id)) id = `${base}-${n++}`;
    ids.add(id);
    return id;
  };

  const glossary = [];
  for (const row of glossaryRows) {
    if (!row.term || !row.definition) continue;
    const name = normalize(row.term);
    const tag = slugify(row.category || "general");
    const acronym = initials(row.term);
    // "Direct Preference Optimization" is the same concept as the curated "DPO" entry.
    const merged = byName.get(name) ?? (acronym && curatedAcronyms.get(acronym));
    if (merged) {
      if (!merged.tags.includes(tag)) merged.tags.push(tag);
      if (row.example && !merged.example) merged.example = row.example;
      continue;
    }
    const entry = {
      id: uniqueId(slugify(row.term) || "term"),
      term: row.term,
      aliases: [],
      tags: [tag],
      subject: row.category,
      short: row.definition,
      definition: "",
      ...(row.example && { example: row.example }),
      related: [],
      category: SUBJECT_CATEGORY[row.category] ?? "ai",
      source: "glossary",
    };
    const parent = byAlias.get(name);
    if (parent) {
      // Move the alias, plus its acronym if the curated entry had one ("PCA" goes with
      // "Principal Component Analysis"), to the new entry.
      const moves = a => normalize(a) === name || a === acronym;
      entry.aliases.push(...parent.aliases.filter(a => a === acronym));
      parent.aliases = parent.aliases.filter(a => !moves(a));
      parent.related.push(entry.id);
      entry.related.push(parent.id);
    }
    byName.set(name, entry);
    glossary.push(entry);
  }

  for (const [term, names] of Object.entries(glossaryAliases)) {
    const entry = byName.get(normalize(term));
    if (!entry) continue; // reported by test/data.test.js
    for (const n of names) if (!entry.aliases.includes(n)) entry.aliases.push(n);
  }

  return [...curated, ...glossary].map(t => Object.freeze(t));
}

export const terms = Object.freeze(buildTerms());

export const symbols = Object.freeze(symbolData.map(s => Object.freeze({ ...s })));

const byId = new Map(terms.map(t => [t.id, t]));

/** Get a term by its exact id, e.g. getTerm("softmax"). */
export const getTerm = id => byId.get(id);

/** Every tag with how many terms use it, most common first. */
export function allTags() {
  const counts = new Map();
  for (const t of terms) for (const tag of t.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
