// 장면 ② — 6대 패턴 (원고 근거: 03 «Q&A + 6대 패턴 정리» + 패턴별 절 «Zero-shot» ~ «Self-Consistency·Self-Refine»)
var NAME = 'mg-01-patterns', DUR = 18;
var TL = { c0: 1.0, cstep: 0.8, pick: 7.0, fly: 7.6, start: 10.4, cot: 11.6, few: 12.8, foot: 15.0 };
var PAT = [
  ['Zero-shot', '빠른 초안', '예시 없이 작업 지시만 1줄'],
  ['Few-shot', '톤·양식 통일', '입력→출력 예시 2~3쌍'],
  ['CoT', '다단계 추론', '“단계별로 생각해라”'],
  ['Role', '전문성·톤 부여', '“당신은 ○○ 전문가다”'],
  ['Constraint·Format', '후가공 절감', '길이·구조·금지어 명시'],
  ['Self-Consistency·Refine', '품질 검증·재작성', '다수결 / 되돌아보기'],
];
var CG = 30, CWD = (CW - CG * 2) / 3, CHT = 196, CY0 = 188, CY1 = 408;
var BY = 650, BH = 140; // 시작 조합 띠
var BAND = [['Role', 3], ['Constraint', 4], ['Format', 4]];
var PW = 300, PH = 80, PGAP = 90, PX0 = X0 + 230;
function cardPos(i) { return [X0 + (i % 3) * (CWD + CG), i < 3 ? CY0 : CY1]; }
function pills(i) { return [PX0 + i * (PW + PGAP) + PW / 2, BY + BH / 2]; }
function cards(ctx, T) {
  var pk = es(T, TL.pick, TL.pick + 0.6);
  for (var i = 0; i < PAT.length; i++) {
    var a = TL.c0 + TL.cstep * i, p = es(T, a, a + 0.6);
    if (p <= 0) continue;
    var xy = cardPos(i), x = xy[0], y = xy[1] + (1 - p) * 30;
    var core = i === 3 || i === 4;
    var again = (i === 2 && T >= TL.cot) || (i === 1 && T >= TL.few);
    var dim = core || again ? 1 : 1 - 0.5 * pk;
    var hot = core ? pk : again ? 1 : 0;
    ctx.save(); ctx.globalAlpha = p * dim;
    card(ctx, x, y, CWD, CHT, { fill: hot > 0 ? C.tint : C.paper, stroke: hot > 0 ? (again ? C.blue : C.brand) : C.line, lw: hot > 0 ? 5 : 2 });
    ctx.fillStyle = C.brand;
    ctx.beginPath(); ctx.arc(x + 46, y + 50, 24, 0, Math.PI * 2); ctx.fill();
    txt(ctx, String(i + 1), x + 46, y + 52, 28, 800, C.ink, 'center');
    fit(ctx, PAT[i][0], x + 86, y + 52, 32, 800, C.ink, 'left', CWD - 110);
    ctx.globalAlpha = p * dim * es(T, a + 0.25, a + 0.6);
    fit(ctx, PAT[i][1], x + 30, y + 114, 36, 800, C.brandInk, 'left', CWD - 60);
    ctx.globalAlpha = p * dim * es(T, a + 0.4, a + 0.8);
    fit(ctx, PAT[i][2], x + 30, y + 160, 26, 600, C.sub, 'left', CWD - 60);
    ctx.restore();
  }
}
function band(ctx, T) {
  var pb = es(T, TL.fly - 0.2, TL.fly + 0.4);
  if (pb <= 0) return;
  ctx.save(); ctx.globalAlpha = pb;
  card(ctx, X0, BY, CW, BH, { fill: C.paper, stroke: C.brand, lw: 3 });
  ctx.restore();
  var ps = es(T, TL.start, TL.start + 0.5);
  if (ps > 0) { ctx.save(); ctx.globalAlpha = ps; pill(ctx, '시작', X0 + 110, BY + BH / 2, 160, 64, C.ink, '#FFFFFF', 32, 800); ctx.restore(); }
  for (var i = 0; i < BAND.length; i++) {
    var f = es(T, TL.fly + 0.6 * i, TL.fly + 0.6 * i + 0.8);
    if (f <= 0) continue;
    var src = cardPos(BAND[i][1]), sx = src[0] + CWD / 2, sy = src[1] + 52, dst = pills(i);
    var x = lerp(sx, dst[0], f), y = lerp(sy, dst[1], f) - Math.sin(f * Math.PI) * 60;
    ctx.save(); ctx.globalAlpha = Math.min(1, f * 2);
    pill(ctx, BAND[i][0], x, y, lerp(220, PW, f), lerp(56, PH, f), C.brand, C.ink, lerp(28, 38, f), 800);
    ctx.restore();
    if (i > 0 && f >= 1) txt(ctx, '+', PX0 + i * (PW + PGAP) - PGAP / 2, BY + BH / 2 + 2, 56, 800, C.brandInk, 'center');
  }
}
function addons(ctx, T) {
  var L = [[TL.cot, '+ CoT', '어려운 작업일 때'], [TL.few, '+ Few-shot', '양식 일관성이 중요할 때']];
  var w = (CW - 230 - 40) / 2;
  for (var i = 0; i < L.length; i++) {
    var p = es(T, L[i][0], L[i][0] + 0.6);
    if (p <= 0) continue;
    var x = X0 + 230 + i * (w + 40), y = 830 + (1 - p) * 20;
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, x, y, w, 96, { fill: C.blueTint, stroke: C.blue, lw: 3, r: 48, shadow: 0 });
    txt(ctx, L[i][1], x + 40, y + 49, 34, 800, C.blue, 'left');
    ctx.font = '800 34px ' + KR;
    var lw = ctx.measureText(L[i][1]).width;
    fit(ctx, L[i][2], x + 40 + lw + 26, y + 49, 28, 600, C.sub, 'left', w - lw - 100);
    ctx.restore();
  }
  var pt = es(T, TL.cot - 0.2, TL.cot + 0.4);
  if (pt > 0) { ctx.save(); ctx.globalAlpha = pt; txt(ctx, '덧붙임', X0 + 110, 878, 28, 700, C.muted, 'center'); ctx.restore(); }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, 'Part 1', '프롬프트 엔지니어링 6대 패턴 — 한 줄 정리', 0.2);
  cards(ctx, T);
  band(ctx, T);
  addons(ctx, T);
  footer(ctx, T, '시작은 Role + Constraint + Format 3종 조합으로 충분', TL.foot);
}
