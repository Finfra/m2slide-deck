// 장면 ② — 점화와 힘의 균형 (원고 근거: «별의 탄생: 성운에서 원시별로» + «원시별에서 주계열성으로»)
var NAME = 'mg-01-ignition', DUR = 16;
var TL = { cloud: 1.0, shrink0: 1.6, shrink1: 5.6, proto: 5.6, ignite: 6.6, push: 8.0, ms: 10.2, foot: 13.0 };
var SX = 620, SY = 545;                    // 별 가운데
var PX = 1120, PW = X1 - PX;               // 오른쪽 판
var STEPS = [
  ['온도 상승', '중심 약 1000만 K', TL.shrink0],
  ['수소 점화', '핵융합 시작', TL.ignite],
  ['힘의 균형', '복사압 = 중력', TL.push],
  ['주계열성', '안정 상태', TL.ms],
];
var NP = 110;
function cloud(ctx, T) {
  var pa = es(T, TL.cloud, TL.cloud + 0.8) * (1 - es(T, TL.proto, TL.ignite));
  if (pa <= 0) return;
  var k = lerp(1, 0.14, es(T, TL.shrink0, TL.shrink1));
  ctx.save();
  for (var i = 0; i < NP; i++) {
    var r0 = 90 + hash(i + 3) * 330, a0 = hash(i + 41) * Math.PI * 2;
    var a = a0 + (1 - k) * (0.6 + hash(i + 77)) + 0.05 * Math.sin(T + i);
    var r = r0 * k;
    var x = SX + r * Math.cos(a), y = SY + r * Math.sin(a) * 0.85;
    var heat = 1 - k;
    ctx.fillStyle = heat > 0.6 ? rgba('#FF9A4A', 0.8 * pa) : rgba('#9C8CFF', (0.35 + 0.4 * hash(i + 9)) * pa);
    ctx.beginPath(); ctx.arc(x, y, 3 + hash(i + 13) * 5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
function star(ctx, T) {
  // 원시별: 어두운 주황 → 점화 후 노란 주계열성
  var pp = es(T, TL.shrink1 - 1.0, TL.proto + 0.4), pi = es(T, TL.ignite, TL.ignite + 0.8);
  if (pp > 0) {
    var col = pi > 0.5 ? '#FFD35A' : '#FF7A3A';
    var r = lerp(56, 92, pi) * (1 + 0.02 * Math.sin(T * 3));
    ctx.save(); ctx.globalAlpha = pp;
    glowStar(ctx, SX, SY, r, col, lerp(0.25, 1, pi));
    ctx.restore();
  }
  // 점화 섬광 — 퍼지는 고리
  var f = seg(T, TL.ignite, TL.ignite + 1.0);
  if (f > 0 && f < 1) {
    ctx.save();
    ctx.strokeStyle = rgba('#FFF2C0', 1 - f); ctx.lineWidth = 10 * (1 - f) + 2;
    ctx.beginPath(); ctx.arc(SX, SY, 92 + f * 300, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  var pl = es(T, TL.proto, TL.proto + 0.5) * (1 - es(T, TL.ignite, TL.ignite + 0.4));
  if (pl > 0) {
    ctx.save(); ctx.globalAlpha = pl;
    pill(ctx, '원시별', SX, SY + 140, 160, 50, C.redTint, C.red, 26, 800);
    ctx.restore();
  }
}
// 힘 화살표 — 중력(안쪽, 파랑) · 복사압(바깥쪽, 주황). 같은 길이 = 균형
function forces(ctx, T) {
  var pg = es(T, TL.shrink0, TL.shrink0 + 0.8), pr = es(T, TL.push, TL.push + 1.0);
  for (var i = 0; i < 8; i++) {
    var a = i * Math.PI / 4, b = a + Math.PI / 8;
    if (pg > 0) {
      ctx.save(); ctx.globalAlpha = pg;
      arrow(ctx, SX + 300 * Math.cos(a), SY + 300 * Math.sin(a), SX + 190 * Math.cos(a), SY + 190 * Math.sin(a), pg, C.blue, 6);
      ctx.restore();
    }
    if (pr > 0) arrow(ctx, SX + 190 * Math.cos(b), SY + 190 * Math.sin(b), SX + 300 * Math.cos(b), SY + 300 * Math.sin(b), pr, '#FF9A4A', 6);
  }
  if (pg > 0) {
    ctx.save(); ctx.globalAlpha = pg;
    pill(ctx, '중력 ↘ 안으로', SX - 330, SY - 300, 230, 52, C.blueTint, C.blue, 26, 800);
    ctx.restore();
  }
  if (pr > 0) {
    ctx.save(); ctx.globalAlpha = pr;
    pill(ctx, '복사압 ↗ 바깥으로', SX + 310, SY - 300, 260, 52, C.redTint, '#FF9A4A', 26, 800);
    ctx.restore();
  }
  var pb = es(T, TL.push + 1.0, TL.push + 1.6);
  if (pb > 0) {
    ctx.save(); ctx.globalAlpha = pb;
    pill(ctx, '복사압 = 중력', SX, SY + 355, 300, 56, C.brand, '#1A1400', 32, 800);
    ctx.restore();
  }
}
function panel(ctx, T) {
  var p = es(T, TL.cloud, TL.cloud + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  // 중심 온도 막대
  txt(ctx, '중심 온도', PX, 230, 28, 700, C.sub, 'left');
  var by = 260, bh = 34;
  card(ctx, PX, by, PW, bh, { fill: C.paper, stroke: C.line, r: 17, shadow: 0 });
  var q = es(T, TL.shrink0, TL.ignite);
  if (q > 0) {
    var g = ctx.createLinearGradient(PX, 0, PX + PW, 0);
    g.addColorStop(0, '#6B5BD0'); g.addColorStop(0.6, '#FF7A3A'); g.addColorStop(1, '#FFE070');
    ctx.fillStyle = g; rr(ctx, PX, by, Math.max(bh, PW * q), bh, 17); ctx.fill();
  }
  var qm = es(T, TL.ignite - 0.4, TL.ignite + 0.2);
  ctx.globalAlpha = p * (0.35 + 0.65 * qm);
  txt(ctx, '약 1000만 K → 점화', PX + PW, by + bh + 30, 26, 800, C.brandInk, 'right');
  ctx.globalAlpha = p;
  // 단계 칩
  for (var i = 0; i < STEPS.length; i++) {
    var y = 400 + i * 108, on = T >= STEPS[i][2], cur = on && (i === STEPS.length - 1 || T < STEPS[i + 1][2]);
    var pa = es(T, STEPS[i][2], STEPS[i][2] + 0.4);
    card(ctx, PX, y, PW, 88, { fill: cur ? C.tint : C.paper, stroke: on ? rgba(C.brand, 0.4 + 0.6 * pa) : C.line, lw: cur ? 4 : 2, r: 16 });
    ctx.fillStyle = on ? C.brand : C.line;
    ctx.beginPath(); ctx.arc(PX + 44, y + 44, 18, 0, Math.PI * 2); ctx.fill();
    txt(ctx, String(i + 1), PX + 44, y + 45, 22, 800, on ? '#1A1400' : C.muted, 'center');
    fit(ctx, STEPS[i][0], PX + 84, y + 44, 32, 800, on ? C.ink : C.muted, 'left', 230);
    fit(ctx, STEPS[i][1], PX + PW - 28, y + 44, 28, 600, on ? C.sub : C.muted, 'right', PW - 360);
  }
  ctx.restore();
  var ps = es(T, TL.ms + 0.4, TL.ms + 1.0);
  if (ps > 0) {
    ctx.save(); ctx.globalAlpha = ps;
    fit(ctx, '우리 태양도 지금 이 단계 (약 46억 년째)', PX + PW / 2, 870, 30, 700, C.brandInk, 'center', PW);
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx, T);
  header(ctx, T, '점화', '원시별 → 주계열성 — 수소 점화와 힘의 균형', 0.2);
  cloud(ctx, T);
  forces(ctx, T);
  star(ctx, T);
  panel(ctx, T);
  footer(ctx, T, '바깥으로 미는 복사압 = 안으로 당기는 중력 → 안정된 주계열성', TL.foot);
}
