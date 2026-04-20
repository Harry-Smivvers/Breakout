// ─── Level Generation ──────────────────────────────────────────────────────
function genLevel(lvl) {
  bricks = [];
  const stepX = BW + BGAP;
  const stepY = BH + BGAP;
  const ax  = FL + 6,                           ay  = FT + 8;
  const ax2 = FR - 6,                           ay2 = FT + 8 + 10 * (BH + BGAP);

  const cols   = Math.floor((ax2 - ax) / stepX);
  const rows   = Math.floor((ay2 - ay) / stepY);
  const totalW = cols * stepX - BGAP;
  const totalH = rows * stepY - BGAP;
  const ox  = ax + ((ax2 - ax) - totalW) / 2;
  const oy  = ay + ((ay2 - ay) - totalH) / 2;
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
      let place = false;
      if (lvl === 1) {
        place = inEll(r, c, totalW * 0.52, totalH * 0.52) &&
               !inEll(r, c, totalW * 0.28, totalH * 0.28);
      } else if (lvl === 2) {
        const o = inEll(r, c, totalW * 0.52, totalH * 0.52);
        const m = inEll(r, c, totalW * 0.36, totalH * 0.36);
        const i = inEll(r, c, totalW * 0.18, totalH * 0.18);
        place = (o && !m) || i;
      } else if (lvl === 3) {
        place = inEll(r, c, totalW * 0.52, totalH * 0.52);
      } else {
        place = inEll(r, c, totalW * 0.52, totalH * 0.52) && Math.random() > 0.28;
      }
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
  // Exactly one health brick per level — replace a random alive brick's pu
  if (bricks.length > 0) {
    const idx = Math.floor(Math.random() * bricks.length);
    bricks[idx].pu = 'health';
  }
}
