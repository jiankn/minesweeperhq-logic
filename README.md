# MinesweeperHQ Logic

A small, dependency-free JavaScript library and JSON CLI for studying Minesweeper constraints. It reads only visible clues and assumed flags. It never accepts or peeks at a hidden mine layout.

Try the complete [MinesweeperHQ solver](https://minesweeperhq.com/solver/) for an interactive board editor and more advanced probability calculations. [API documentation and interactive example](https://jiankn.github.io/minesweeperhq-logic/).

## Run from source

Requires Node.js 20 or later. There is no registry release yet.

```sh
git clone https://github.com/jiankn/minesweeperhq-logic.git
cd minesweeperhq-logic
npm test
node cli.mjs examples/board.json
```

## Library

```js
import { solve } from './logic.mjs';
const result = solve({width: 3, height: 1, cells: [0, null, null], mines: 1});
// result.safe = [1]; result.mines = [2]
```

Cells are row-major: `null` means hidden, `"F"` means an assumed confirmed mine, and numbers 0–8 are visible clues. `mines` is an optional total mine count. Coordinates in the explanation text start at 1; returned indexes start at 0.

The solver propagates certain moves, subtracts subset constraints, and optionally enumerates all remaining hidden-cell assignments. Exact enumeration defaults to at most 18 unresolved cells. Above that bound, it returns only proven deductions and `exact: false`, with no fabricated odds. With no total mine count, probabilities weight every compatible assignment equally. Flags are assumptions; a wrong flag can invalidate conclusions. A contradiction returns no suggested moves.

`solve(board, {maxUnknown: 18})` returns `{contradiction, safe, mines, probabilities, exact, solutions}`. Each probability entry contains `{index, probability, reason}`. Input validation throws `TypeError`. This educational solver is intentionally smaller than the production site solver, and does not implement frontier-component decomposition or unbounded probability calculations.

## CLI

```sh
node cli.mjs examples/board.json
node cli.mjs < examples/board.json
node cli.mjs --help
```

The CLI prints JSON to stdout. Malformed input prints an error to stderr and exits with code 1. Logical contradictions are valid analysis results, returned as JSON.

MIT license. Issues and contributions: https://github.com/jiankn/minesweeperhq-logic/issues.
