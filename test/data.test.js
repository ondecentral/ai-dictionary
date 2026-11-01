import { test } from "node:test";
import assert from "node:assert/strict";
import { terms, symbols, getTerm } from "../src/index.js";
import { normalize } from "../src/search.js";

const REQUIRED = ["id", "term", "aliases", "tags", "short", "definition", "related"];

test("every term has the required fields with the right types", () => {
  for (const t of terms) {
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
    assert.ok(s.symbol && s.meaning && Array.isArray(s.names) && s.names.length, `bad symbol entry: ${JSON.stringify(s)}`);
  }
});
