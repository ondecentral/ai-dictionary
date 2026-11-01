import { test } from "node:test";
import assert from "node:assert/strict";
import { lookup, search, findSymbols, scan } from "../src/index.js";

const id = q => lookup(q).entry?.id;

test("exact, alias, case and plural lookups", () => {
  assert.equal(id("softmax"), "softmax");
  assert.equal(id("Softmax"), "softmax");
  assert.equal(id("RAG"), "rag");
  assert.equal(id("nucleus sampling"), "top-p-sampling");
  assert.equal(id("embeddings"), "embedding");
  assert.equal(id("KL-divergence"), "kl-divergence");
  assert.equal(id("mixture of experts"), "mixture-of-experts");
});

test("glossary terms: own entries, merges and acronyms", () => {
  assert.equal(id("AdamW"), "adamw");
  assert.ok(lookup("AdamW").entry.related.includes("adam"));
  assert.equal(id("Direct Preference Optimization"), "dpo", "acronym expansion merges into curated DPO");
  assert.equal(id("PCA"), "principal-component-analysis");
  assert.equal(id("NLP"), "natural-language-processing");
  assert.equal(id("heteroscedasticity"), "heteroscedasticity");
});

test("glossary examples are shown on glossary and merged curated entries", () => {
  assert.match(lookup("L2 norm").entry.example, /\[3,4\] is 5/);
  assert.ok(lookup("L2 norm").entry.related.includes("norm"), "alias split links back to the curated entry");
  assert.ok(lookup("teacher forcing").entry.example, "curated entry picks up the CSV example");
  assert.equal(id("JEPA"), "joint-embedding-predictive-architecture");
  assert.equal(id("exponential"), "exponential-function");
});

test("typos still find the term", () => {
  assert.equal(id("sofmax"), "softmax");
  assert.equal(id("backpropogation"), "backpropagation");
  assert.equal(id("transfomer"), "transformer");
});

test("unknown words return no entry", () => {
  assert.equal(lookup("zzzqqq").entry, null);
});

test("search ranks name matches above body matches and filters by category", () => {
  const results = search("attention");
  assert.equal(results[0].entry.id, "attention");
  assert.ok(search("gradient", { category: "math" }).every(r => r.entry.category === "math"));
});

test("findSymbols by glyph and by name", () => {
  assert.equal(findSymbols("∇")[0].symbol, "∇");
  assert.equal(findSymbols("nabla")[0].symbol, "∇");
  assert.equal(findSymbols("sum")[0].symbol, "Σ");
});

test("scan finds terms, prefers longest phrase, respects acronym case", () => {
  const text = "We use multi-head attention and LoRA. The rag was dirty. RAG helps LLMs.";
  const found = Object.fromEntries(scan(text).map(r => [r.entry.id, r.count]));
  assert.equal(found["multi-head-attention"], 1);
  assert.equal(found.attention, undefined, "attention inside multi-head attention should not double count");
  assert.equal(found.lora, 1);
  assert.equal(found.rag, 1, "lowercase 'rag' must not match RAG");
  assert.equal(found.llm, 1);
});
