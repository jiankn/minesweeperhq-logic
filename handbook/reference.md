# API reference

```js
import { solve } from './logic.mjs';
const result = solve(board, { maxUnknown: 18 });
```

`solve` is synchronous and does not mutate the caller's `cells` array. All analysis takes place in memory. There is no network access or game-state lookup in the library.

## Board fields

| Field | Accepted value | Meaning |
| --- | --- | --- |
| `width` | Positive integer | Columns; together with height, at most 2,500 cells. |
| `height` | Positive integer | Rows. |
| `cells` | Array of exactly `width * height` entries | Row-major visible state. |
| `mines` | Integer from 0 to board size, or `null` | Optional total mine count; defaults to `null`. |

Each cell must be `null` for a covered square, `"F"` for an assumed mine, or an integer from 0 through 8 for a revealed clue. Hidden mine coordinates are not an input format. Numeric entries must represent visible clues, not concealed answers.

Invalid dimensions, cell values, array length, or mine-count values throw `TypeError`. A clue that cannot be satisfied by neighboring hidden squares and flags produces a contradiction result instead.

## Options

`maxUnknown` is an integer from 0 to 20, defaulting to 18. It limits exact enumeration of unresolved cells *after* propagation. The limit applies to the whole set of unresolved hidden squares, rather than each connected frontier separately.

Increasing the limit can be expensive: exact enumeration considers up to `2 ** maxUnknown` assignments and checks them against all recorded constraints. A value of 0 still allows certain deductions, but only enters enumeration when propagation resolves every hidden square.

## Result fields

| Field | Meaning |
| --- | --- |
| `contradiction` | `null` if the entered constraints are consistent with the analysis; otherwise a diagnostic string. |
| `safe` | Sorted indexes of hidden cells proven safe. |
| `mines` | Sorted indexes of hidden cells proven to contain mines. |
| `probabilities` | Sorted entries `{index, probability, reason}`. |
| `exact` | Whether enumeration completed and found compatible assignments. |
| `solutions` | Number of compatible assignments when enumerated; `null` when enumeration was skipped. |

Probability values are between 0 and 1. A value of 0 is a certain safe cell; a value of 1 is a certain mine. Existing `"F"` cells are assumptions and do not appear as newly deduced entries.

When enumeration is skipped, `probabilities` contains only proven entries. An omitted index means the library did not produce a probability; it must not be interpreted as 0, 0.5, or any default estimate.

A contradiction returns empty move and probability arrays, `exact: false`, and `solutions: 0`. Treat that result as a request to correct the input, not as a reason to guess a move.

## Handling results in a hint interface

Check `contradiction` before offering moves. Preserve each deduction's `reason` alongside its index. If `exact` is false, show the available certain deductions and explain that full enumeration was skipped. Do not claim that the absence of a hint proves no forced move exists.

For a larger browser interface with a board editor, the [MinesweeperHQ solver](https://minesweeperhq.com/solver/) is the appropriate companion tool.
