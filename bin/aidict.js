#!/usr/bin/env node
import { run, repl } from "../src/cli.js";

const args = process.argv.slice(2);

if (args.length === 0 && process.stdin.isTTY) {
  await repl();
} else {
  process.exitCode = await run(args);
}
