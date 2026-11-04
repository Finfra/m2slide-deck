// 장면 ⑥ — 기준 문서 사슬 (원고 근거: «요구사항 → 설계 → 이슈 → 변경» + «코드를 읽고 쓴 설계 문서의 함정» + «작업 하나 = 이슈 하나»)
var NAME = 'vscode-md-git-06-chain', DUR = 13;
var TL = { n0: 1.0, nStep: 0.8, first: 4.4, basis: 5.2, work: 6.2, sp0: 6.9, spStep: 0.3, back: 7.9, md: 9.0, foot: 10.4 };
var NODES = [ // [제목, 아래 글, 색, 바탕]
  ['요구사항', '요구사항.md', C.blue, C.blueTint],
  ['설계', '설계.md', C.purple, C.purpleTint],
  ['이슈', '작업의 기록', C.brandInk, C.tint],
  ['변경', '저장 지점', C.green, C.greenTint],
];
var NY = 320, NH = 230, NW = 280, NGAP = (CW - NW * 4) / 3;
var WY = 740, SPX = [920, 1060, 1200], SPR = 30;
function nx(i) { return X0 + i * (NW + NGAP); }
function nodes(ctx, T) {
  for (var i = 0; i < NODES.length; i++) {
    var a = TL.n0 + TL.nStep * i, p = es(T, a, a + 0.6);
    if (i > 0) arrow(ctx, nx(i - 1) + NW + 12, NY + NH / 2, nx(i) - 12, NY + NH / 2, es(T, a - 0.3, a + 0.1), C.muted, 5);
    if (p <= 0) continue;
    var N = NODES[i], x = nx(i), y = NY + (1 - p) * 40;
    var hi = i === 2 ? es(T, TL.basis, TL.basis + 0.5) : 0;
    ctx.save();
    ctx.globalAlpha = p;
    card(ctx, x, y, NW, NH, { fill: N[3], stroke: N[2], lw: 3 + hi * 3 });
    doc(ctx, x + NW / 2 - 40, y + 24, 80, 96, { stroke: N[2], rows: 3 });
    fit(ctx, N[0], x + NW / 2, y + 160, 44, 800, C.ink, 'center', NW - 30);
    fit(ctx, N[1], x + NW / 2, y + 202, 26, 600, N[2], 'center', NW - 30);
    ctx.restore();
  }
}
function flags(ctx, T) {
  var pf = es(T, TL.first, TL.first + 0.6);
  if (pf > 0) {
    ctx.save(); ctx.globalAlpha = pf;
    var cx = nx(0) + NW / 2, cy = NY - 56 - (1 - pf) * 20;
    pill(ctx, '먼저 — 코드보다', cx, cy, 300, 58, C.ink, '#FFFFFF', 28, 800);
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.moveTo(cx - 12, cy + 28); ctx.lineTo(cx + 12, cy + 28); ctx.lineTo(cx, cy + 42); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  var pb = es(T, TL.basis, TL.basis + 0.6);
  if (pb > 0) {
    ctx.save(); ctx.globalAlpha = pb;
    var gx = nx(2) - NGAP / 2;
    pill(ctx, '근거', gx, NY + NH / 2 - 50, 96, 46, C.purple, '#FFFFFF', 24, 800);
    ctx.restore();
  }
}
function work(ctx, T) {
  var pw = es(T, TL.work, TL.work + 0.6);
  if (pw <= 0) return;
  var ix = nx(2) + NW / 2, iy = NY + NH;
  ctx.save(); ctx.globalAlpha = pw;
  pill(ctx, '작업 하나 = 이슈 하나', X0 + 200, WY, 400, 66, C.tint, C.brandInk, 32, 800);
  ctx.restore();
  // 이슈 → 작업
  arrow(ctx, ix - 60, iy + 14, 700, WY - 44, pw, C.brandInk, 4);
  var pk = es(T, TL.work + 0.3, TL.work + 0.8);
  if (pk > 0) {
    ctx.save(); ctx.globalAlpha = pk;
    card(ctx, 620, WY - 40, 180, 80, { fill: C.paper, stroke: C.brandInk, lw: 3, r: 16, shadow: 0 });
    txt(ctx, '작업', 710, WY, 34, 800, C.ink, 'center');
    ctx.restore();
  }
  for (var s = 0; s < SPX.length; s++) {
    var a = TL.sp0 + TL.spStep * s, p = es(T, a, a + 0.35);
    var px0 = s === 0 ? 800 : SPX[s - 1] + SPR;
    arrow(ctx, px0 + 8, WY, SPX[s] - SPR - 8, WY, p, C.muted, 4);
    if (p <= 0) continue;
    ctx.save();
    ctx.globalAlpha = p;
    ctx.fillStyle = C.green;
    ctx.beginPath(); ctx.arc(SPX[s], WY, SPR * lerp(0.4, 1, p), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  var ps = es(T, TL.sp0 + 0.6, TL.sp0 + 1.2);
  if (ps > 0) {
    ctx.save(); ctx.globalAlpha = ps;
    txt(ctx, '저장 지점', SPX[1], WY + 62, 28, 700, C.green, 'center');
    ctx.restore();
  }
  // 저장 지점 → 이슈에 이어 둠 (되돌아오는 곡선)
  var pr = es(T, TL.back, TL.back + 0.8);
  if (pr > 0) {
    var x0 = SPX[2] + SPR + 6, y0 = WY, x3 = ix + 60, y3 = iy + 14;
    ctx.save();
    ctx.strokeStyle = C.brandInk; ctx.lineWidth = 4; ctx.setLineDash([10, 8]);
    ctx.beginPath();
    var N = 24;
    for (var k = 0; k <= N * pr; k++) {
      var u = k / N, v = 1 - u;
      var bx = v * v * v * x0 + 3 * v * v * u * (x0 + 160) + 3 * v * u * u * (x3 + 240) + u * u * u * x3;
      var by = v * v * v * y0 + 3 * v * v * u * y0 + 3 * v * u * u * (y3 + 60) + u * u * u * y3;
      if (k === 0) ctx.moveTo(bx, by); else ctx.lineTo(bx, by);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = es(T, TL.back + 0.5, TL.back + 1.0);
    txt(ctx, '이슈에 이어 둠', 1410, 590, 30, 800, C.brandInk, 'center');
    ctx.restore();
  }
}
function bracket(ctx, T) {
  var p = es(T, TL.md, TL.md + 0.8);
  if (p <= 0) return;
  var y = 900, xa = X0, xb = X1, xm = W / 2;
  ctx.save();
  ctx.globalAlpha = p;
  ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(lerp(xm, xa, p), y - 24); ctx.lineTo(lerp(xm, xa, p), y);
  ctx.lineTo(lerp(xm, xb, p), y); ctx.lineTo(lerp(xm, xb, p), y - 24);
  ctx.moveTo(xm, y); ctx.lineTo(xm, y + 20);
  ctx.stroke();
  pill(ctx, '모두 Markdown 으로 남음', xm, y + 62, 520, 70, C.ink, '#FFFFFF', 34, 800);
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '사슬', '요구사항 → 설계 → 이슈 → 변경', 0.2);
  nodes(ctx, T);
  flags(ctx, T);
  work(ctx, T);
  bracket(ctx, T);
  footer(ctx, T, '기준 문서가 있어야 이슈가 근거를 가짐', TL.foot);
}
