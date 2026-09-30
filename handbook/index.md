# MinesweeperHQ Logic

MinesweeperHQ Logic is a small JavaScript library and command-line tool for analyzing a Minesweeper position from visible clues. It has no runtime dependencies, requires Node.js 20 or later, and is available under the MIT license.

The package does not receive a hidden mine layout. Its input contains revealed numbers, covered squares, and flags that the caller explicitly chooses to treat as mines. This boundary makes it useful for teaching deduction, testing puzzle positions, or building a small hint interface without giving that interface access to the answer.

The [quick start](quickstart.md) shows a complete example. The [API reference](reference.md) documents every input and result field. The [reasoning guide](reasoning.md) explains the constraint rules, probability model, and limits that a caller must preserve.

For entering a position visually, use the [MinesweeperHQ solver](https://minesweeperhq.com/solver/). It provides a browser board editor and more advanced analysis than this deliberately small educational package. The separate [interactive library example](https://jiankn.github.io/minesweeperhq-logic/) runs the package's public function directly.

## Availability

Version 0.1.0 is released as source and an npm-format tarball on [GitHub Releases](https://github.com/jiankn/minesweeperhq-logic/releases/tag/v0.1.0). It has not been published to the npm registry. Use the source or the release artifact; do not assume that an `npm install minesweeperhq-logic` registry command is available.

The repository includes examples and tests. Contributions and bug reports belong in the [issue tracker](https://github.com/jiankn/minesweeperhq-logic/issues).
