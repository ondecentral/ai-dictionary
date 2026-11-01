import { symbols } from "./data.js";

const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const global = re => new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
const toRegex = d => (d instanceof RegExp ? global(d) : new RegExp(escape(d), "g"));

// Stand-in for text a legend already explains. Symbol detectors treat it like a
// variable, so "p(tokenₜ | tokens<ₜ)" still reveals its "|" (given).
export const PLACEHOLDER = "\u0000";

// A key that begins/ends with a word ("softmax", "tokenₜ") must not match inside a
// longer word; a key like "W_Q" may sit right next to another variable ("XW_Q").
function keyRegex(key) {
  const start = /^[A-Za-z]{2}/.test(key) ? "(?<![A-Za-z])" : "";
  const end = /[A-Za-z]{2}$/.test(key) ? "(?![A-Za-z])" : "";
  return new RegExp(start + escape(key) + end, "g");
}

// "B, A" in a legend explains B and A wherever they appear separately.
function keyParts(formula, where = []) {
  const parts = where.flatMap(([key]) => [key, ...key.split(/,\s*/)]).filter(p => formula.includes(p) || p.length === 1);
  return [...new Set(parts)].sort((a, b) => b.length - a.length);
}

const detects = sym => (sym.detect ?? []).map(toRegex);
const matches = (sym, text) => detects(sym).some(re => re.test(text));

/**
 * Everything needed to explain a formula.
 *  where     hand-written [symbol, meaning-in-this-formula] pairs from the entry
 *  operators notation found in the rest of the formula, explained by its short gloss
 *  notation  every notation symbol the formula uses (full definitions go under Related)
 */
export function explainFormula(entry) {
  if (!entry.formula) return { where: [], operators: [], notation: [] };
  const where = entry.where ?? [];
  let rest = entry.formula;
  for (const part of keyParts(entry.formula, where)) if (part.length > 1) rest = rest.replace(keyRegex(part), PLACEHOLDER);
  const operators = symbols.filter(s => matches(s, rest));
  const notation = symbols.filter(s => operators.includes(s) || where.some(([key]) => matches(s, key)));
  return { where, operators, notation };
}

// Characters that need no explanation: digits, = + − ( ) , and closing brackets.
const TRIVIAL = new RegExp(`[\\s\\d=+−\\-(),.;:\\]}⟩${PLACEHOLDER}]`, "g");
const WORDS = /(?<![A-Za-z])(if|else)(?![A-Za-z])/g;

/** Whatever in a formula is explained by neither its legend nor the symbol table (used by tests). */
export function unexplained(entry) {
  const parts = keyParts(entry.formula ?? "", entry.where);
  let rest = entry.formula ?? "";
  for (const part of parts) if (part.length > 1) rest = rest.replace(keyRegex(part), PLACEHOLDER);
  for (const s of symbols) for (const re of detects(s)) rest = rest.replace(re, " ");
  rest = rest.replace(WORDS, " ");
  // Single-letter variables last, so they can't eat letters out of longer names.
  for (const part of parts) if (part.length === 1) rest = rest.replaceAll(part, " ");
  return rest.replace(TRIVIAL, " ").trim();
}
