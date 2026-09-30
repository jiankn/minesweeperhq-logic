#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { solve } from './logic.mjs';
if (process.argv.includes('--help')) {
  console.log('Usage: minesweeperhq-logic board.json | minesweeperhq-logic < board.json\nJSON: {width, height, cells: [null, "F", 0..8], mines?: integer}');
} else {
  try { console.log(JSON.stringify(solve(JSON.parse(readFileSync(process.argv[2] ?? 0, 'utf8'))), null, 2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
