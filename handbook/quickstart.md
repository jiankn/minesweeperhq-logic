# Quick start

## Run from source

With Node.js 20 or later and Git installed:

```sh
git clone https://github.com/jiankn/minesweeperhq-logic.git
cd minesweeperhq-logic
npm test
node cli.mjs examples/board.json
```

No dependency installation is required to run the solver. The `npm test` command invokes Node's built-in test runner.

## Analyze a small position

Create `example.mjs` in the repository:

```js
import { solve } from './logic.mjs';

const result = solve({
  width: 3,
  height: 1,
  cells: [0, null, null],
  mines: 1
});

console.log(result.safe);  // [1]
console.log(result.mines); // [2]
```

Run it with `node example.mjs`. The zero at index 0 proves that its neighbor, index 1, is safe. The total mine count then proves that the only remaining hidden square, index 2, contains a mine. Without the total mine count, index 2 would remain uncertain.

Indexes are zero-based and row-major. For a board of width `w`, index `i` has column `i % w` and row `Math.floor(i / w)`. Human-readable explanations use rows and columns starting at 1.

## Use the JSON CLI

The CLI accepts a file path or reads standard input:

```sh
node cli.mjs examples/board.json
node cli.mjs < examples/board.json
node cli.mjs --help
```

It writes one JSON analysis to standard output. Invalid JSON or invalid input fields cause an error on standard error and exit code 1. An inconsistent but structurally valid puzzle returns a contradiction result as JSON; it is not a command-line parsing failure.

The CLI uses the default enumeration limit. To change `maxUnknown`, use the JavaScript API.

## Install the release artifact

Download the `.tgz` asset from the [v0.1.0 release](https://github.com/jiankn/minesweeperhq-logic/releases/tag/v0.1.0), then pass its local path to npm:

```sh
npm install ./minesweeperhq-logic-0.1.0.tgz
```

An application can then import `solve` from `minesweeperhq-logic`. Installation from this release file does not imply a release exists on the npm registry.
