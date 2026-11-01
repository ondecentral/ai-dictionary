import { explainFormula } from "./notation.js";

// Terminal rendering. Colors are disabled when output isn't a TTY,
// when NO_COLOR is set, or with --no-color.

const CODES = { bold: [1, 22], dim: [2, 22], italic: [3, 23], cyan: [36, 39], yellow: [33, 39], green: [32, 39], magenta: [35, 39], gray: [90, 39] };

export function makeStyle(enabled) {
  const style = {};
  for (const [name, [open, close]] of Object.entries(CODES)) {
    style[name] = s => (enabled ? `\x1b[${open}m${s}\x1b[${close}m` : String(s));
  }
  return style;
}

export const termWidth = () => Math.min(process.stdout.columns || 80, 100);

/** Word-wrap a paragraph to `width`, prefixing each line with `indent`. */
export function wrap(text, width = termWidth(), indent = "") {
  const max = Math.max(20, width - indent.length);
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (line && line.length + 1 + word.length > max) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines.map(l => indent + l).join("\n");
}

const indentBlock = (text, indent) => text.split("\n").map(l => indent + l).join("\n");

// Visible width, ignoring combining accents (the hat in m̂) and counting 𝔼 as one.
const visibleLength = s => [...s.replace(/\p{M}/gu, "")].length;

/** Two-column legend: symbol, then its explanation wrapped beside it. */
function legend(rows, s, indent = "  ") {
  const width = Math.min(16, Math.max(...rows.map(([k]) => visibleLength(k))));
  return rows
    .map(([key, text, dim]) => {
      const body = wrap(text, termWidth(), " ".repeat(indent.length + width + 3)).trimStart();
      const styled = dim ? s.gray(body) : body;
      const pad = visibleLength(key) > width ? `\n${" ".repeat(indent.length + width + 3)}` : " ".repeat(width - visibleLength(key) + 3);
      return `${indent}${s.yellow(key)}${pad}${styled}`;
    })
    .join("\n");
}

const categoryLabel = (c, s) => (c === "ai" ? s.magenta("[ai]") : s.cyan("[math]"));

export function formatEntry(entry, s, { getTerm } = {}) {
  const out = [];
  out.push(`${s.bold(entry.term)}  ${categoryLabel(entry.category, s)} ${s.gray(entry.tags.join(" · "))}`);
  if (entry.aliases.length) out.push(wrap(s.gray(`aka: ${entry.aliases.join(", ")}`)));
  out.push("");
  out.push(wrap(s.bold(entry.short), termWidth(), "  "));
  if (entry.definition) {
    out.push("");
    out.push(wrap(entry.definition, termWidth(), "  "));
  }
  if (entry.example) {
    out.push("", wrap(`${s.gray("Example:")} ${entry.example}`, termWidth(), "  "));
  }
  const explained = explainFormula(entry);
  if (entry.formula) {
    out.push("", s.yellow("Formula"), indentBlock(s.bold(entry.formula), "  "), "");
    out.push(s.gray("  where"));
    out.push(legend([
      ...explained.where,
      ...explained.operators.map(sym => [sym.symbol, sym.short, true]),
    ], s, "    "));
  }
  if (entry.js) {
    out.push("", s.green("In JavaScript"), s.dim(indentBlock(entry.js, "  ")));
  }
  if (entry.related?.length) {
    const names = entry.related.map(id => getTerm?.(id)?.term ?? id);
    out.push("", wrap(`${s.gray("Related:")} ${names.join(", ")}`));
  }
  if (explained.notation.length) {
    out.push("", s.gray("Notation used in the formula") + s.gray("  (more: aidict sym <symbol>)"));
    out.push(legend(explained.notation.map(sym => [sym.symbol, sym.meaning]), s));
  }
  return out.join("\n");
}

export function formatList(entries, s, { showCategory = true } = {}) {
  const width = Math.min(28, Math.max(...entries.map(e => e.term.length), 4));
  return entries
    .map(e => {
      const cat = showCategory ? `${e.category === "ai" ? s.magenta("ai  ") : s.cyan("math")} ` : "";
      const name = e.term.length > width ? e.term.slice(0, width - 1) + "…" : e.term.padEnd(width);
      const room = termWidth() - width - (showCategory ? 7 : 2);
      const desc = e.short.length > room ? e.short.slice(0, room - 1) + "…" : e.short;
      return `${cat}${s.bold(name)}  ${s.gray(desc)}`;
    })
    .join("\n");
}

export function formatSymbol(sym, s, { getTerm } = {}) {
  const out = [`${s.bold(s.yellow(sym.symbol))}  ${s.gray(sym.names.join(", "))}`];
  out.push(wrap(sym.meaning, termWidth(), "  "));
  if (sym.js) out.push(`  ${s.green("JS:")} ${s.dim(sym.js)}`);
  if (sym.term) out.push(`  ${s.gray("See:")} aidict ${getTerm?.(sym.term)?.id ?? sym.term}`);
  return out.join("\n");
}

export function formatScan(results, s, { full = false, getTerm } = {}) {
  if (full) return results.map(r => `${s.gray(`×${r.count}`)} ${formatEntry(r.entry, s, { getTerm })}`).join(`\n\n${s.gray("─".repeat(40))}\n\n`);
  const countWidth = String(results[0]?.count ?? 0).length + 1;
  const width = Math.min(28, Math.max(...results.map(r => r.entry.term.length), 4));
  return results
    .map(r => {
      const count = `×${r.count}`.padStart(countWidth);
      const name = r.entry.term.length > width ? r.entry.term.slice(0, width - 1) + "…" : r.entry.term.padEnd(width);
      const room = termWidth() - width - countWidth - 4;
      const desc = r.entry.short.length > room ? r.entry.short.slice(0, room - 1) + "…" : r.entry.short;
      return `${s.gray(count)}  ${s.bold(name)}  ${s.gray(desc)}`;
    })
    .join("\n");
}
