// 장면 ① — fPM 이 무엇인가 (원고 근거: 01 «Claude Code 단독으로 겪는 불편» · «각 Pain → fPM 기능 매핑» · «SCAR 3-tier»)
var NAME = 'mg-01-what', DUR = 15;
var TL = { pain: 0.8, map: 4.6, scar: 11.0, foot: 12.6 };
var ROW = { y: 240, step: 104, h: 88 };
var PX = 110, PW = 700, FX = 1010, FW = 800;
function painCard(ctx, T, i) {
  var a = TL.pain + 0.5 * i, p = es(T, a, a + 0.5);
  if (p <= 0) return;
  var m = es(T, TL.map + 1.1 * i, TL.map + 1.1 * i + 0.6), y = ROW.y + i * ROW.step;
  ctx.save();
  ctx.globalAlpha = p * (1 - 0.45 * m);
  card(ctx, PX - (1 - p) * 40, y, PW, ROW.h, { fill: C.paper, stroke: m > 0.5 ? C.line : C.red, lw: 3, shadow: 0, r: 16 });
  ctx.fillStyle = m > 0.5 ? C.muted : C.red;
  ctx.beginPath(); ctx.arc(PX + 40 - (1 - p) * 40, y + ROW.h / 2, 12, 0, Math.PI * 2); ctx.fill();
  txt(ctx, L.pains[i][0], PX + 74, y + 30, 32, 800, C.ink, 'left', PW - 100);
  txt(ctx, L.pains[i][1], PX + 74, y + 64, 24, 500, C.sub, 'left', PW - 100);
  ctx.restore();
}
function featCard(ctx, T, i) {
  var a = TL.map + 1.1 * i, y = ROW.y + i * ROW.step;
  arrow(ctx, PX + PW + 20, y + ROW.h / 2, FX - 20, y + ROW.h / 2, es(T, a, a + 0.5), C.brand, 6);
  var p = es(T, a + 0.3, a + 0.8);
  if (p <= 0) return;
  var on = T < a + 1.1 && T < TL.scar ? 1 : 0;
  ctx.save();
  ctx.globalAlpha = p;
  card(ctx, FX + (1 - p) * 40, y, FW, ROW.h, { fill: on ? C.tint : C.paper, stroke: C.brand, lw: on ? 4 : 2, shadow: on ? 1 : 0, r: 16 });
  ctx.fillStyle = C.brand;
  rr(ctx, FX + (1 - p) * 40, y, 14, ROW.h, 7); ctx.fill();
  txt(ctx, L.feats[i][0], FX + 44, y + 30, 32, 800, C.brandInk, 'left', FW - 70);
  txt(ctx, L.feats[i][1], FX + 44, y + 64, 24, 500, C.sub, 'left', FW - 70);
  ctx.restore();
}
function heads(ctx, T) {
  var p = es(T, 0.5, 1.0);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = p;
    txt(ctx, L.painHead, PX, 204, 28, 800, C.red, 'left', PW);
    ctx.restore();
  }
  var q = es(T, TL.map, TL.map + 0.5);
  if (q > 0) {
    ctx.save(); ctx.globalAlpha = q;
    txt(ctx, L.featHead, FX, 204, 28, 800, C.brand, 'left', FW);
    ctx.restore();
  }
}
function scarBand(ctx, T) {
  var p = es(T, TL.scar, TL.scar + 0.7);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  var y = 878 + (1 - p) * 20;
  card(ctx, PX, y, FX + FW - PX, 80, { fill: C.ink, stroke: C.ink, shadow: 0, r: 16 });
  txt(ctx, L.scar, PX + 40, y + 40, 32, 800, '#FFFFFF', 'left', 760);
  txt(ctx, L.scarSub, FX + FW - 40, y + 40, 26, 600, '#C9D6EA', 'right', 820);
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, L.chip, L.title, 0.2);
  heads(ctx, T);
  for (var i = 0; i < 6; i++) { painCard(ctx, T, i); featCard(ctx, T, i); }
  scarBand(ctx, T);
  footer(ctx, T, L.foot, TL.foot);
}
