import ai from "../data/ai.js";
import math from "../data/math.js";
import symbolData from "../data/symbols.js";

export const CATEGORIES = ["ai", "math"];

export const terms = Object.freeze([
  ...ai.map(t => Object.freeze({ ...t, category: "ai" })),
  ...math.map(t => Object.freeze({ ...t, category: "math" })),
]);

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
