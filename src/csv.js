/**
 * Minimal RFC 4180 CSV parser: quoted fields, "" escapes, CRLF, BOM.
 * Returns an array of objects keyed by the header row.
 */
export function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  text = text.replace(/^﻿/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') field += '"', i++;
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") row.push(field), field = "";
    else if (c === "\n") row.push(field), rows.push(row), row = [], field = "";
    else if (c !== "\r") field += c;
  }
  if (field || row.length) row.push(field), rows.push(row);

  const [header, ...body] = rows.filter(r => r.some(f => f.trim()));
  return body.map(r => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? "").trim()])));
}
