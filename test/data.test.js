import { test } from "node:test";
import assert from "node:assert/strict";
import { terms, symbols, getTerm } from "../src/index.js";
import { normalize } from "../src/search.js";
import { glossaryRows, SUBJECT_CATEGORY } from "../src/data.js";
import glossaryAliases from "../data/glossary-aliases.js";
import { unexplained } from "../src/notation.js";

const curated = terms.filter(t => t.source === "curated");

const REQUIRED = ["id", "term", "aliases", "tags", "short", "definition", "related"];

test("every curated term has the required fields with the right types", () => {
  for (const t of curated) {
    for (const key of REQUIRED) assert.ok(key in t, `${t.id ?? t.term}: missing "${key}"`);
    assert.match(t.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${t.id}: id must be kebab-case`);
    assert.ok(Array.isArray(t.aliases) && Array.isArray(t.tags) && Array.isArray(t.related), `${t.id}: aliases/tags/related must be arrays`);
    assert.ok(t.tags.length > 0, `${t.id}: needs at least one tag`);
    assert.ok(t.short.length <= 140, `${t.id}: short description should be one line (<= 140 chars)`);
    for (const k of ["formula", "js"]) if (k in t) assert.equal(typeof t[k], "string", `${t.id}: ${k} must be a string`);
  }
});

test("ids are unique", () => {
  const seen = new Set();
  for (const t of terms) {
    assert.ok(!seen.has(t.id), `duplicate id: ${t.id}`);
    seen.add(t.id);
  }
});

test("related ids and symbol links point at real terms", () => {
  for (const t of terms) {
    for (const r of t.related) {
      assert.ok(getTerm(r), `${t.id}: related "${r}" does not exist`);
      assert.notEqual(r, t.id, `${t.id}: relates to itself`);
    }
  }
  for (const s of symbols) if (s.term) assert.ok(getTerm(s.term), `symbol ${s.symbol}: term "${s.term}" does not exist`);
});

test("no name/alias is claimed by two different terms", () => {
  const owner = new Map();
  for (const t of terms) {
    for (const name of new Set([t.term, t.id, ...t.aliases].map(normalize))) {
      if (!name) continue;
      assert.ok(!owner.has(name), `"${name}" is used by both ${owner.get(name)} and ${t.id}`);
      owner.set(name, t.id);
    }
  }
});

test("JS snippets are syntactically valid", () => {
  for (const t of terms) {
    if (!t.js) continue;
    // Wrap in an async function so snippets can use await / top-level statements.
    assert.doesNotThrow(() => new Function(`return async () => {\n${t.js}\n}`), `${t.id}: js snippet has a syntax error`);
  }
});

test("symbols have the required fields", () => {
  for (const s of symbols) {
    assert.ok(s.symbol && s.short && s.meaning && Array.isArray(s.names) && s.names.length, `bad symbol entry: ${s.symbol}`);
  }
});

// Index letters often appear only as sub/superscripts: i as ᵢ or ⁱ.
const SCRIPTS = { i: "ᵢⁱ", j: "ⱼ", k: "ₖ", m: "ₘ", n: "ₙⁿ", t: "ₜᵗ", x: "ₓˣ" };
const inFormula = (formula, p) => formula.includes(p) || [...(SCRIPTS[p] ?? "")].some(c => formula.includes(c));

test("every formula has a legend, and every symbol in it is explained", () => {
  for (const t of terms.filter(t => t.formula)) {
    assert.ok(t.where?.length, `${t.id}: formula needs a \`where\` legend`);
    for (const [key, text] of t.where) {
      assert.ok(text, `${t.id}: legend for "${key}" is empty`);
      const found = t.formula.includes(key) || key.split(/,\s*/).every(p => inFormula(t.formula, p));
      assert.ok(found, `${t.id}: legend key "${key}" does not appear in the formula`);
    }
    assert.equal(unexplained(t), "", `${t.id}: these parts of the formula are unexplained; add them to \`where\` or a detect pattern in data/symbols.js`);
  }
});

test("glossary.csv rows are complete and every subject is mapped to a category", () => {
  assert.ok(glossaryRows.length > 0, "glossary.csv is empty");
  for (const r of glossaryRows) {
    assert.ok(r.term && r.definition && r.category, `incomplete row: ${JSON.stringify(r)}`);
    assert.ok(r.category in SUBJECT_CATEGORY, `subject "${r.category}" (${r.term}) is missing from SUBJECT_CATEGORY in src/data.js`);
  }
});

test("every glossary.csv term is findable by its exact name", () => {
  const names = new Set(terms.flatMap(t => [t.term, t.id, ...t.aliases].map(normalize)));
  for (const r of glossaryRows) assert.ok(names.has(normalize(r.term)), `"${r.term}" is not reachable`);
});

test("glossary-aliases.js keys match real terms", () => {
  const names = new Set(terms.map(t => normalize(t.term)));
  for (const key of Object.keys(glossaryAliases)) assert.ok(names.has(normalize(key)), `glossary-aliases.js: no term named "${key}"`);
});
