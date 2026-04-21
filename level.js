// ─── Level Generation ──────────────────────────────────────────────────────

// ASCII-Zeichen → Power-up-Typ
const CHAR_PU = { M: 'multiball', B: 'wide', W: 'wall', H: 'fireball', '+': 'health' };

function genLevel(lvl) {
  bricks = [];
  const stepX = BW + BGAP;
  const stepY = BH + BGAP;
  const ax  = FL + 6,                           ay  = FT + 8;
  const ax2 = FR - 6,                           ay2 = FT + 8 + 14 * (BH + BGAP);

  const cols   = Math.floor((ax2 - ax) / stepX);
  const rows   = Math.floor((ay2 - ay) / stepY);
  const totalW = cols * stepX - BGAP;
  const totalH = rows * stepY - BGAP;
  const ox  = ax + ((ax2 - ax) - totalW) / 2;
  const oy  = ay + ((ay2 - ay) - totalH) / 2;

  // ── ASCII-Map aus level-def.js ──────────────────────────────────────────
  if (typeof LEVEL_MAPS !== 'undefined' && LEVEL_MAPS[lvl - 1]) {
    const lines = LEVEL_MAPS[lvl - 1]
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    for (let r = 0; r < Math.min(lines.length, rows); r++) {
      const line = lines[r];
      for (let c = 0; c < Math.min(line.length, cols); c++) {
        const ch = line[c];
        if (ch === '.') continue;
        const pu = CHAR_PU[ch] ?? null;
        bricks.push({
          x: ox + c * stepX, y: oy + r * stepY,
          w: BW, h: BH,
          alive: true,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          stoneIdx: Math.floor(Math.random() * stoneImgs.length),
          pu
        });
      }
    }
    return;
  }

  // ── Fallback: prozeduraler Generator für Level 4+ ──────────────────────
  const gcx = ox + totalW / 2;
  const gcy = oy + totalH / 2;

  function inEll(r, c, rx, ry) {
    const bx = ox + c * stepX + BW / 2;
    const by = oy + r * stepY + BH / 2;
    const nx = (bx - gcx) / rx, ny = (by - gcy) / ry;
    return nx * nx + ny * ny <= 1;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const place = inEll(r, c, totalW * 0.52, totalH * 0.52) && Math.random() > 0.28;
      if (!place) continue;

      const pu = Math.random() < 0.25
        ? PU_TYPES[Math.floor(Math.random() * PU_TYPES.length)]
        : null;
      bricks.push({
        x: ox + c * stepX, y: oy + r * stepY,
        w: BW, h: BH,
        alive: true,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        stoneIdx: Math.floor(Math.random() * stoneImgs.length),
        pu
      });
    }
  }
  if (bricks.length > 0) {
    const idx = Math.floor(Math.random() * bricks.length);
    bricks[idx].pu = 'health';
  }
}
