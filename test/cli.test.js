import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const bin = fileURLToPath(new URL("../bin/aidict.js", import.meta.url));
const sample = fileURLToPath(new URL("../examples/sample-abstract.md", import.meta.url));
const cli = (args, input) => spawnSync(process.execPath, [bin, ...args], { input, encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } });

test("looks up a term", () => {
  const r = cli(["softmax"]);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /Softmax/);
  assert.match(r.stdout, /In JavaScript/);
});

test("unknown term exits 1 with suggestions on stderr", () => {
  const r = cli(["blargh"]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /No entry/);
});

test("--json output is parseable", () => {
  const r = cli(["search", "attention", "--json"]);
  assert.equal(r.status, 0);
  assert.ok(JSON.parse(r.stdout).length > 0);
});

test("scan reads a file and stdin", () => {
  const fromFile = cli(["scan", sample, "--json"]);
  assert.equal(fromFile.status, 0);
  assert.ok(JSON.parse(fromFile.stdout).some(t => t.id === "transformer"));
  const fromStdin = cli(["scan", "-", "--json"], "Gradient descent with Adam and dropout.");
  assert.deepEqual(JSON.parse(fromStdin.stdout).map(t => t.id).sort(), ["adam", "dropout", "gradient-descent"]);
});

test("sym, list, tags and version run", () => {
  for (const args of [["sym", "∇"], ["list", "-c", "math"], ["tags"], ["--version"], ["--help"]]) {
    assert.equal(cli(args).status, 0, args.join(" "));
  }
});

test("bad flags exit 2", () => {
  assert.equal(cli(["--nope"]).status, 2);
  assert.equal(cli(["list", "-c", "physics"]).status, 2);
});
