# Reasoning and limits

## Visible clues become equations

For each revealed number, let the neighboring covered cells form a set `S`. Subtract adjacent assumed flags from the clue to obtain a remaining mine count `k`. The constraint is:

```text
sum(mine[i] for i in S) = k
mine[i] is either 0 or 1
```

If `k` is zero, every cell in `S` is safe. If `k` equals the size of `S`, every cell in `S` is a mine. Proven assignments are substituted into other constraints until these rules stop producing changes.

The optional total mine count creates one additional constraint over all hidden squares, after subtracting flags. It can resolve a cell that no local clue touches, as in the quick-start example.

## Compare overlapping neighborhoods

If one constraint covers `A` with `a` mines and another covers a larger set `B` with `b` mines, and `A` is entirely contained in `B`, then `B` minus `A` must contain `b - a` mines.

For example, `{x, y} = 1` and `{x, y, z} = 1` imply `{z} = 0`. This is a useful safe-cell deduction even though neither original clue alone identifies a square to open.

The implementation limits growth of derived constraints. Skipping an extra derivation can leave a deduction undiscovered, but it does not turn an uncertain cell into a certain one. With enumeration disabled or over its bound, the returned deductions are therefore sound under the entered assumptions but need not be complete.

## Enumerate the remaining choices

When the unresolved set is small enough, the solver enumerates every binary assignment and retains those satisfying all constraints. A cell's probability is the fraction of retained assignments in which it is a mine.

Without a total mine count, all compatible assignments receive equal weight. This is an explicit model of the entered constraints, not a guarantee that an arbitrary game's mine generator uses the same prior. With a total count, compatible assignments must also satisfy that count.

The package does not split a large frontier into independently solved components. Large boards can therefore return `exact: false` even when a more advanced solver could calculate probabilities efficiently.

## Flags are assumptions

A flag is accepted as a mine before deduction starts. An incorrect flag may make the input contradictory, but it may also remain consistent with the visible clues and lead to conclusions that are wrong for the actual game. The library cannot distinguish a mistaken player flag from a confirmed mine without additional information.

Only supply `"F"` when that assumption is intended. If studying a position without trusting player flags, enter those squares as `null` instead. Nothing in this package uses a concealed board to validate a flag.

## Verify independently

The repository's test suite includes small examples, input validation, contradiction behavior, subset deductions, and a separate exhaustive reference over 64 small-board configurations. That reference enumerates assignments independently and compares results; it is not a second call to the same production algorithm.

These tests support the published examples and core rules, rather than proving that every large puzzle will be fully solved. Known limits include the enumeration bound, derived-constraint growth limits, the absence of frontier decomposition, and the assumptions attached to flags and optional mine totals.
