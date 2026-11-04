// 장면 ③ — 질량과 수명 (원고 근거: «주계열성: 별의 청년기» 질량·색·온도·수명 표 + «수소 핵융합 — 별의 에너지원»)
var NAME = 'mg-02-mass-life', DUR = 16;
var TL = { star0: 1.0, sstep: 0.8, color: 3.6, fuel: 4.6, burn: 5.4, note: 12.0, foot: 13.0 };
// [질량 표지, 색·온도, 수명, 별 색, 밝기(후광), 반지름, 연료가 바닥나는 시각]
var COLS = [
  ['태양의 0.5배', '붉고 차가움', '수천억 년', '#FF7A55', 0.35, 58, 11.0],
  ['태양급 (1배)', '노랑', '약 100억 년', '#FFD35A', 0.65, 70, 9.0],
  ['태양의 10배', '푸르고 뜨거움', '수천만 년', '#8CC4FF', 1.0, 84, 6.6],
];
var CX = [420, 960, 1500], SY = 380, FY = 640, FW = 400, FH = 44;
function axis(ctx, T) {
  var p = es(T, TL.star0, TL.star0 + 2.0);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = 0.9;
  arrow(ctx, 240, 205, 1680, 205, p, C.muted, 4);
  ctx.globalAlpha = es(T, TL.star0 + 1.4, TL.star0 + 2.0);
  txt(ctx, '질량 ↑', 1700, 205, 28, 800, C.sub, 'left');
  ctx.restore();
}
function col(ctx, T, i) {
  var c = COLS[i], x = CX[i];
  var a = TL.star0 + TL.sstep * i, p = es(T, a, a + 0.6);
  if (p <= 0) return;
  var empty = es(T, c[6], c[6] + 0.6);
  ctx.save(); ctx.globalAlpha = p;
  fit(ctx, c[0], x, 262, 34, 800, C.ink, 'center', 460);
  glowStar(ctx, x, SY + (1 - p) * 20, c[5] * (1 + 0.02 * Math.sin(T * 3 + i)), c[3], lerp(c[4], 0.12, empty));
  ctx.restore();
  var pc = es(T, TL.color + 0.2 * i, TL.color + 0.2 * i + 0.5);
  if (pc > 0) {
    ctx.save(); ctx.globalAlpha = pc;
    fit(ctx, c[1], x, 530, 30, 700, c[3], 'center', 460);
    ctx.restore();
  }
  // 수소 연료 막대 — burn 에서 c[6] 까지 비어감
  var pf = es(T, TL.fuel, TL.fuel + 0.6);
  if (pf > 0) {
    var left = 1 - seg(T, TL.burn, c[6]);
    ctx.save(); ctx.globalAlpha = pf;
    txt(ctx, '수소 연료', x - FW / 2, FY - 26, 22, 700, C.sub, 'left');
    card(ctx, x - FW / 2, FY, FW, FH, { fill: C.paper, stroke: C.line, r: 22, shadow: 0 });
    if (left > 0) {
      ctx.fillStyle = rgba(c[3], 0.9);
      rr(ctx, x - FW / 2, FY, Math.max(FH, FW * left), FH, 22); ctx.fill();
    }
    ctx.restore();
  }
  // 수명 칩 — 연료가 바닥날 때
  var pl = es(T, c[6], c[6] + 0.6);
  if (pl > 0) {
    ctx.save(); ctx.globalAlpha = pl;
    txt(ctx, '수명(대략)', x, 742, 22, 700, C.muted, 'center');
    pill(ctx, c[2], x, 800 + (1 - pl) * 16, 300, 74, C.tint, C.brand, 38, 800);
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx, T);
  header(ctx, T, '주계열성', '질량이 클수록 밝고, 수명은 짧다 — 일생의 약 90%를 보내는 시기', 0.2);
  axis(ctx, T);
  for (var i = 0; i < COLS.length; i++) col(ctx, T, i);
  var pn = es(T, TL.note, TL.note + 0.6);
  if (pn > 0) {
    ctx.save(); ctx.globalAlpha = pn;
    txt(ctx, '핵에서 수소 → 헬륨 융합이 꾸준히 진행', W / 2, 912, 28, 600, C.sub, 'center');
    ctx.restore();
  }
  footer(ctx, T, '질량이 클수록 더 뜨겁고 밝지만, 연료를 빨리 태워 수명은 짧다', TL.foot);
}
