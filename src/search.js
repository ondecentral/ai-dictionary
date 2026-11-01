import { terms, symbols } from "./data.js";

/** Lowercase, strip accents/punctuation, treat - and _ as spaces. */
export function normalize(s) {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** Cheap English singular forms of the last word, most specific first. */
export function singulars(phrase) {
  const out = [];
  const m = phrase.match(/^(.*?)(\w+)$/);
  if (!m) return out;
  const [, head, last] = m;
  if (last.length > 4 && last.endsWith("ies")) out.push(head + last.slice(0, -3) + "y");
  if (last.length > 4 && /(s|x|ch|sh)es$/.test(last)) out.push(head + last.slice(0, -2));
  if (last.length > 3 && last.endsWith("s") && !last.endsWith("ss")) out.push(head + last.slice(0, -1));
  return out;
}

export function levenshtein(a, b, max = Infinity) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

const namesOf = t => [t.term, t.id, ...t.aliases];

// Pre-normalise every searchable name once.
const index = terms.map(entry => ({
  entry,
  names: [...new Set(namesOf(entry).map(normalize).filter(Boolean))],
  tags: entry.tags,
  short: normalize(entry.short),
  body: normalize(entry.definition),
}));

function scoreName(q, name) {
  if (name === q) return 100;
  if (singulars(q).includes(name)) return 95;
  if (name.startsWith(q + " ") || (q.length >= 3 && name.startsWith(q))) return 80;
  if (q.length >= 3 && (` ${name} `).includes(` ${q} `)) return 70;
  const max = q.length <= 4 ? 1 : q.length <= 8 ? 2 : 3;
  const d = levenshtein(q, name, max);
  if (d <= max) return 75 - d * 10;
  if (q.length >= 4 && name.includes(q)) return 50;
  return 0;
}

function scoreEntry(item, q) {
  let best = 0;
  for (const name of item.names) best = Math.max(best, scoreName(q, name));
  if (best >= 50) return best;
  if (item.tags.includes(q)) return 40;
  const words = q.split(" ");
  const inText = s => words.every(w => (` ${s} `).includes(` ${w}`));
  if (inText(item.short)) return 30;
  if (inText(item.body)) return 20;
  return best;
}

/**
 * Ranked search over all terms.
 * @returns {{ entry: object, score: number }[]}
 */
export function search(query, { limit = 10, category, tag } = {}) {
  const q = normalize(query);
  if (!q) return [];
  return index
    .filter(it => (!category || it.entry.category === category) && (!tag || it.tags.includes(tag)))
    .map(it => ({ entry: it.entry, score: scoreEntry(it, q) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.term.localeCompare(b.entry.term))
    .slice(0, limit);
}

/**
 * Best single match for a query, plus near misses.
 * `entry` is null when nothing matched confidently.
 */
export function lookup(query, opts = {}) {
  const results = search(query, { limit: 6, ...opts });
  const [top, ...rest] = results;
  if (top && top.score >= 65) {
    return { entry: top.entry, suggestions: rest.filter(r => r.score >= 50).map(r => r.entry) };
  }
  return { entry: null, suggestions: results.map(r => r.entry) };
}

/** Find notation symbols by the symbol itself or by name ("nabla", "sum", "∇"). */
export function findSymbols(query) {
  const raw = query.trim();
  const q = normalize(raw);
  return symbols
    .map(s => {
      let score = 0;
      // Match the glyph itself (but don't let "a" match every symbol containing an "a").
      if (s.symbol === raw || (raw && !/^[a-z ]+$/i.test(raw) && s.symbol.includes(raw))) score = 100;
      for (const n of s.names) {
        const nn = normalize(n);
        if (n === raw || (nn && nn === q)) score = Math.max(score, 90);
        else if (q.length >= 3 && nn.startsWith(q)) score = Math.max(score, 60);
      }
      if (!score && q.length >= 3 && normalize(s.meaning).includes(q)) score = 20;
      return { symbol: s, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(r => r.symbol);
}
