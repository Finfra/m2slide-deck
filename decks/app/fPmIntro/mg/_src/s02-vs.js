// 장면 ② — Claude Code 단독 vs fPM (원고 근거: 01.1 «전제 vs 현실» 비교 · «무엇이 본질적으로 달라지나»)
var NAME = 'mg-02-vs', DUR = 16;
var TL = { left: 0.6, right: 1.8, gap: 3.2, rows: 5.0, step: 2.3, foot: 13.4 };
var TOP = { y: 192, h: 196 }, LX = 110, LW = 760, RX = 1050, RW = 760;
function premise(ctx, T, x, w, d, a, color, fill) {
  var p = es(T, a, a + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  var y = TOP.y + (1 - p) * 20;
  card(ctx, x, y, w, TOP.h, { fill: fill, stroke: color, lw: 3, r: 18 });
  txt(ctx, d.head, x + 36, y + 52, 36, 800, C.ink, 'left', w - 260);
  pill(ctx, d.tag, x + w - 36, y + 52, 24, color, '#FFFFFF', 'right');
  // 칩 줄 — 카드 폭을 넘으면 글자 크기를 줄여 한 줄에 맞춘다
  var sz = 26, total = 0;
  for (var j = 0; j < d.items.length; j++) total += tw(ctx, d.items[j], sz, 700) + sz * 1.2 + 16;
  if (total > w - 72) sz = Math.floor(sz * (w - 72) / total);
  var cx = x + 36;
  for (var i = 0; i < d.items.length; i++) {
    var q = es(T, a + 0.4 + 0.25 * i, a + 0.8 + 0.25 * i);
    if (q <= 0) continue;
    ctx.globalAlpha = p * q;
    cx += pill(ctx, d.items[i], cx, y + 142, sz, fill === C.paper ? C.bg : C.paper, C.ink, 'left') + 16;
  }
  ctx.restore();
}
function gap(ctx, T) {
  var p = es(T, TL.gap, TL.gap + 0.5);
  if (p <= 0) return;
  var blink = T < TL.gap + 1.6 ? 0.55 + 0.45 * Math.cos((T - TL.gap) * 8) : 1;
  ctx.save(); ctx.globalAlpha = p * blink;
  var cy = TOP.y + TOP.h / 2;
  ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  for (var k = 0; k <= 6; k++) { var x = LX + LW + 24 + k * 22, y = cy - 40 + (k % 2 ? 20 : -20); if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
  ctx.stroke();
  ctx.globalAlpha = p;
  txt(ctx, L.gap, W / 2, TOP.y + TOP.h + 26, 28, 800, C.red, 'center', 900);
  ctx.restore();
}
function row(ctx, T, i) {
  var a = TL.rows + TL.step * i, y = 462 + i * 146, h = 124, r = L.rows[i];
  var p = es(T, a, a + 0.5);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, LX, y, 640, h, { fill: C.redTint, stroke: 'transparent', shadow: 0, r: 16 });
  txt(ctx, r[0], LX + 36, y + 46, 40, 800, C.red, 'left', 560);
  txt(ctx, r[1], LX + 36, y + 94, 26, 500, C.sub, 'left', 560);
  var s = es(T, a + 0.6, a + 1.0);
  if (s > 0) {
    var ww = Math.min(560, tw(ctx, r[0], 40, 800));
    ctx.strokeStyle = C.red; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(LX + 30, y + 48); ctx.lineTo(LX + 30 + (ww + 12) * s, y + 48); ctx.stroke();
  }
  ctx.restore();
  arrow(ctx, LX + 660, y + h / 2, RX - 20, y + h / 2, es(T, a + 0.8, a + 1.3), C.brand, 6);
  var q = es(T, a + 1.2, a + 1.7);
  if (q <= 0) return;
  ctx.save(); ctx.globalAlpha = q;
  card(ctx, RX + (1 - q) * 30, y, RW, h, { fill: C.greenTint, stroke: C.green, lw: 3, shadow: 0, r: 16 });
  txt(ctx, r[2], RX + 36, y + 46, 40, 800, C.green, 'left', RW - 140);
  txt(ctx, r[3], RX + 36, y + 94, 26, 600, C.ink, 'left', RW - 140);
  ctx.restore();
  stamp(ctx, RX + RW - 60, y + h / 2, 30, es(T, a + 1.6, a + 2.0), C.green);
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, L.chip, L.title, 0.2);
  premise(ctx, T, LX, LW, L.left, TL.left, C.muted, C.paper);
  premise(ctx, T, RX, RW, L.right, TL.right, C.brand, C.tint);
  gap(ctx, T);
  for (var i = 0; i < 3; i++) row(ctx, T, i);
  footer(ctx, T, L.foot, TL.foot);
}
