// 장면 ② — 4가지 개념 (원고 근거: 01-part1 «바이브 코딩이란?» ~ «Agentic Engineering이란?» + «4가지 개념 한눈에 비교표»)
var NAME = 'mg-01-concepts', DUR = 17;
var TL = { st0: 1.0, step: 1.8, axis: 8.6, absorb: 10.0, intro: 11.6, grad: 12.4, foot: 14.2 };
var STEPS = [
  ['바이브 코딩', '자연어 대화로 즉흥 개발', '휘발성 · 1회용 코드'],
  ['프롬프트 엔지니어링', '단발 요청을 정교화', '단발성 · 재사용 어려움'],
  ['하네스', '도구 + 규칙 + 맥락 + 후크', '반복 · 재현 가능한 작업 환경'],
  ['Agentic Engineering', '격리 · 재현성 · 검증 · 문서화', '장기 유지보수 · 확장'],
];
var SW = 350, SGAP = (CW - SW * 4) / 3, SB = 850; // 계단 바닥
function stepX(i) { return X0 + i * (SW + SGAP); }
function stepY(i) { return 600 - i * 100; }
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, 'Part 1', '4가지 개념 — 입문에서 졸업까지', 0.2);
  for (var i = 0; i < 4; i++) {
    var a = TL.st0 + TL.step * i, p = es(T, a, a + 0.8);
    if (p <= 0) continue;
    var x = stepX(i), top = stepY(i), h = (SB - top) * p, y = SB - h, last = i === 3;
    var hi = last ? es(T, TL.grad, TL.grad + 0.6) : 0;
    card(ctx, x, y, SW, h, { fill: last ? C.tint : C.paper, stroke: hi > 0 ? C.brand : C.line, lw: 2 + 3 * hi });
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, SW, h); ctx.clip();
    ctx.fillStyle = C.brand; ctx.fillRect(x + 24, y + 26, 54, 8);
    fit(ctx, STEPS[i][0], x + 24, y + 74, 36, 800, C.ink, 'left', SW - 48);
    ctx.globalAlpha = es(T, a + 0.6, a + 1.1);
    fit(ctx, STEPS[i][1], x + 24, y + 134, 27, 600, C.sub, 'left', SW - 48);
    ctx.globalAlpha = es(T, a + 1.0, a + 1.5);
    fit(ctx, STEPS[i][2], x + 24, y + 182, 27, 800, last || i === 2 ? C.green : C.red, 'left', SW - 48);
    ctx.restore();
  }
  // 아래 축 — 1회용 → 지속 가능
  var pa = es(T, TL.axis, TL.axis + 1.2);
  arrow(ctx, X0 + 10, 900, X1 - 10, 900, pa, C.muted, 5);
  if (pa > 0) {
    ctx.save(); ctx.globalAlpha = pa;
    txt(ctx, '1회용', X0 + 10, 940, 28, 700, C.red, 'left');
    txt(ctx, '지속 가능', X1 - 10, 940, 28, 700, C.green, 'right');
    ctx.restore();
  }
  // 프롬프트 → Skill·Rule 흡수 — 2칸 위에서 3칸 위로 곡선 화살표
  var pb = es(T, TL.absorb, TL.absorb + 1.0);
  if (pb > 0) {
    var sx = stepX(1) + SW * 0.62, sy = stepY(1) - 14, ex = stepX(2) + SW * 0.38, ey = stepY(2) - 14;
    var mx = (sx + ex) / 2, my = Math.min(sy, ey) - 90;
    ctx.save();
    ctx.strokeStyle = C.blue; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(sx, sy);
    var n = 24, k;
    for (k = 1; k <= Math.round(n * pb); k++) {
      var u = k / n, qx = (1 - u) * (1 - u) * sx + 2 * (1 - u) * u * mx + u * u * ex, qy = (1 - u) * (1 - u) * sy + 2 * (1 - u) * u * my + u * u * ey;
      ctx.lineTo(qx, qy);
    }
    ctx.stroke();
    if (pb > 0.9) {
      ctx.fillStyle = C.blue; ctx.beginPath();
      ctx.moveTo(ex, ey + 4); ctx.lineTo(ex - 20, ey - 16); ctx.lineTo(ex + 4, ey - 22); ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = es(T, TL.absorb + 0.5, TL.absorb + 1.1);
    pill(ctx, '프롬프트 → Skill·Rule 에 흡수', mx, my - 30, 380, 48, C.blueTint, C.blue, 26, 800);
    ctx.restore();
  }
  // 입문 · 졸업 표지
  var pi = es(T, TL.intro, TL.intro + 0.6), pg = es(T, TL.grad, TL.grad + 0.6);
  if (pi > 0) { ctx.save(); ctx.globalAlpha = pi; pill(ctx, '입문', stepX(1) + 70, stepY(1) - 40, 110, 46, C.ink, '#FFFFFF', 26, 800); ctx.restore(); }
  if (pg > 0) {
    var fx = stepX(3) + SW - 60, fy = stepY(3) - 14;
    ctx.save(); ctx.globalAlpha = pg;
    ctx.fillStyle = C.ink; ctx.fillRect(fx - 3, fy - 110 * pg, 6, 110 * pg);
    ctx.fillStyle = C.brand; ctx.beginPath();
    ctx.moveTo(fx + 3, fy - 110 * pg); ctx.lineTo(fx + 3 - 110, fy - 110 * pg + 2); ctx.lineTo(fx + 3 - 110, fy - 110 * pg + 50); ctx.lineTo(fx + 3, fy - 110 * pg + 52); ctx.closePath(); ctx.fill();
    txt(ctx, '졸업', fx - 52, fy - 110 * pg + 27, 26, 800, C.ink, 'center');
    ctx.restore();
  }
  footer(ctx, T, '프롬프트 엔지니어링은 입문, Agentic Engineering은 졸업', TL.foot);
}
