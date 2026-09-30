/** Analyze visible clues only. null is hidden; 'F' is an assumed confirmed mine. */
export function solve({ width, height, cells, mines = null }, { maxUnknown = 18 } = {}) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width * height > 2500)
    throw new TypeError('width and height must be positive integers with at most 2500 cells');
  if (!Array.isArray(cells) || cells.length !== width * height || cells.some(v => v !== null && v !== 'F' && (!Number.isInteger(v) || v < 0 || v > 8)))
    throw new TypeError('cells must contain width * height entries: null, F, or integers 0–8');
  if (mines !== null && (!Number.isInteger(mines) || mines < 0 || mines > cells.length))
    throw new TypeError('mines must be null or an integer from zero to the board size');
  if (!Number.isInteger(maxUnknown) || maxUnknown < 0 || maxUnknown > 20)
    throw new TypeError('maxUnknown must be an integer from 0 to 20');
  const hidden = [], constraints = [], keys = new Map(), known = new Map(), reasons = new Map();
  let contradiction = null;
  const flags = cells.filter(v => v === 'F').length;
  const add = (set, count, reason) => {
    const sorted = [...set].sort((a, b) => a - b), key = sorted.join(',');
    if (count < 0 || count > sorted.length) { contradiction = 'The clues, flags, or total mine count are inconsistent.'; return; }
    if (keys.has(key)) { if (keys.get(key) !== count) contradiction = 'Identical hidden-cell sets require different mine counts.'; return; }
    keys.set(key, count);
    if (sorted.length) constraints.push({ set: sorted, count, reason });
  };
  cells.forEach((v, i) => {
    if (v === null) hidden.push(i);
    if (typeof v !== 'number') return;
    const adjacent = [];
    const x = i % width, y = Math.floor(i / width);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if ((dx || dy) && nx >= 0 && nx < width && ny >= 0 && ny < height) adjacent.push(ny * width + nx);
    }
    add(adjacent.filter(n => cells[n] === null), v - adjacent.filter(n => cells[n] === 'F').length,
      `Clue ${v} at row ${y + 1}, column ${x + 1}, after subtracting adjacent flags.`);
  });
  if (mines !== null) add(hidden, mines - flags, 'The total mine count, after subtracting flags.');
  let changed = true;
  while (changed && !contradiction) {
    changed = false;
    const reduced = constraints.map(c => ({ ...c, set: c.set.filter(i => !known.has(i)), count: c.count - c.set.filter(i => known.get(i) === 1).length }));
    for (const c of reduced) {
      if (c.count < 0 || c.count > c.set.length) { contradiction = 'Deductions contradict a clue.'; break; }
      if (!c.set.length || (c.count !== 0 && c.count !== c.set.length)) continue;
      for (const i of c.set) {
        const value = c.count === 0 ? 0 : 1;
        if (known.has(i) && known.get(i) !== value) { contradiction = 'Two deductions contradict each other.'; break; }
        if (!known.has(i)) { known.set(i, value); reasons.set(i, c.reason + (value ? ' All remaining cells are mines.' : ' All remaining cells are safe.')); changed = true; }
      }
    }
    // Limit constraint growth; omitting extra deductions does not invent certainty.
    if (constraints.length <= 300) for (const a of reduced) for (const b of reduced) {
      if (!a.set.length || a.set.length >= b.set.length || !a.set.every(i => b.set.includes(i))) continue;
      const before = constraints.length;
      if (before >= 400) break;
      add(b.set.filter(i => !a.set.includes(i)), b.count - a.count, 'Subtract one overlapping clue constraint from a larger constraint.');
      if (constraints.length !== before) changed = true;
    }
  }
  const unresolved = hidden.filter(i => !known.has(i)), probabilities = new Map(known);
  let exact = false, solutions = null;
  if (!contradiction && unresolved.length <= maxUnknown) {
    const positions = new Map(unresolved.map((i, bit) => [i, bit]));
    const checks = constraints.map(c => ({ bits: c.set.filter(i => positions.has(i)).map(i => positions.get(i)), count: c.count - c.set.filter(i => known.get(i) === 1).length }));
    const counts = new Array(unresolved.length).fill(0);
    solutions = 0;
    for (let mask = 0; mask < 2 ** unresolved.length; mask++) {
      if (!checks.every(c => c.bits.reduce((n, bit) => n + ((mask >>> bit) & 1), 0) === c.count)) continue;
      solutions++;
      counts.forEach((_, bit) => { counts[bit] += (mask >>> bit) & 1; });
    }
    if (!solutions) contradiction = 'No mine assignment satisfies the entered constraints.';
    else { exact = true; unresolved.forEach((i, bit) => { const p = counts[bit] / solutions; probabilities.set(i, p); if (p === 0 || p === 1) reasons.set(i, 'Every satisfying assignment agrees on this cell.'); }); }
  }
  if (contradiction) return { contradiction, safe: [], mines: [], probabilities: [], exact: false, solutions: 0 };
  const entries = [...probabilities].sort((a, b) => a[0] - b[0]);
  return { contradiction: null, safe: entries.filter(([, p]) => p === 0).map(([i]) => i),
    mines: entries.filter(([, p]) => p === 1).map(([i]) => i),
    probabilities: entries.map(([index, probability]) => ({ index, probability, reason: reasons.get(index) ?? 'Fraction of satisfying assignments; all hidden cells are enumerated.' })),
    exact, solutions };
}
