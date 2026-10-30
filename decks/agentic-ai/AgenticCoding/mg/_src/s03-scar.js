// 장면 ④ — SCAR 4요소 (원고 근거: 01-part1 «SCAR 4요소» + «하네스(Harness)란?» + «프롬프트 엔지니어링이란?»)
var NAME = 'mg-03-scar', DUR = 17;
var TL = { c0: 1.0, step: 1.6, fly: 8.0, band: 9.6, hl: 11.6, foot: 13.8 };
var CARDS = [
  ['S', 'Skill', '트리거 키워드로 자동 호출되는 능력 단위', '', '/needs → plan 생성'],
  ['C', 'Command', '사용자 진입점', '슬래시 입력으로 트리거', '/init · /review'],
  ['A', 'Agent', '별도 컨텍스트의 subagent', '메인 컨텍스트 보호 + 병렬 실행', 'code-reviewer'],
  ['R', 'Rule', '모델 행동 제약 정책', '', '“한국어 답변”'],
];
var GG = 36, KW = (CW - GG) / 2, KH = 300, KY = [190, 190 + KH + 30];
var BY = 860, BH = 96; // 아래 띠
function cardPos(i) { return { x: X0 + (i % 2) * (KW + GG), y: KY[Math.floor(i / 2)] }; }
function letterHome(i) { var c = cardPos(i); return { x: c.x + 76, y: c.y + 76 }; }
function letterBand(i) { return { x: X0 + 70 + i * 78, y: BY + BH / 2 }; }
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, 'SCAR', '하네스의 핵심 4요소', 0.2);
  var pf = es(T, TL.fly, TL.fly + 1.2), hl = es(T, TL.hl, TL.hl + 0.6);
  for (var i = 0; i < 4; i++) {
    var a = TL.c0 + TL.step * i, p = es(T, a, a + 0.6);
    if (p <= 0) continue;
    var c = cardPos(i), k = CARDS[i], on = (i === 0 || i === 3) ? hl : 0;
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, c.x, c.y + (1 - p) * 30, KW, KH, { stroke: on > 0 ? C.blue : C.line, lw: 2 + 3 * on });
    // 글자 자리 — 날아간 뒤에는 옅은 원만 남음
    ctx.fillStyle = pf > 0 ? rgba(C.brand, 0.25 + 0.75 * (1 - pf)) : C.brand;
    ctx.beginPath(); ctx.arc(c.x + 76, c.y + 76, 46, 0, Math.PI * 2); ctx.fill();
    txt(ctx, k[1], c.x + 146, c.y + 78, 46, 800, C.ink, 'left');
    ctx.globalAlpha = p * es(T, a + 0.4, a + 0.9);
    fit(ctx, k[2], c.x + 40, c.y + 160, 30, 700, C.ink, 'left', KW - 80);
    if (k[3]) fit(ctx, k[3], c.x + 40, c.y + 204, 28, 600, C.sub, 'left', KW - 80);
    ctx.globalAlpha = p * es(T, a + 0.8, a + 1.3);
    ctx.font = '600 26px ' + MONO;
    var ew = Math.min(KW - 136, ctx.measureText(k[4]).width + 48);
    txt(ctx, 'ex)', c.x + 40, c.y + 259, 26, 700, C.muted, 'left');
    ctx.fillStyle = C.blueTint; rr(ctx, c.x + 96, c.y + 236, ew, 46, 12); ctx.fill();
    fit(ctx, k[4], c.x + 120, c.y + 260, 26, 600, C.blue, 'left', ew - 48, MONO);
    ctx.restore();
  }
  // 아래 띠
  var pb = es(T, TL.fly - 0.4, TL.fly + 0.3);
  if (pb > 0) {
    ctx.save(); ctx.globalAlpha = pb;
    card(ctx, X0, BY, CW, BH, { fill: C.tint, stroke: C.brand, lw: 3 });
    ctx.globalAlpha = pb * es(T, TL.band, TL.band + 0.8);
    fit(ctx, '+  CLAUDE.md · settings.json  +  Hook  =  하네스', X0 + 70 + 4 * 78 + 10, BY + BH / 2 + 1, 36, 800, C.ink, 'left', CW - 70 - 4 * 78 - 50);
    ctx.restore();
  }
  // 날아가는 글자 S·C·A·R — 카드 원에서 띠로
  for (var j = 0; j < 4; j++) {
    var a2 = TL.c0 + TL.step * j, p2 = es(T, a2, a2 + 0.6);
    if (p2 <= 0) continue;
    var q = es(T, TL.fly + 0.15 * j, TL.fly + 0.15 * j + 1.0), h = letterHome(j), b = letterBand(j);
    var x = lerp(h.x, b.x, q), y = lerp(h.y, b.y, q) - Math.sin(Math.PI * q) * 60;
    ctx.save(); ctx.globalAlpha = p2;
    txt(ctx, CARDS[j][0], x, y + 2, lerp(56, 60, q), 800, C.ink, 'center');
    ctx.restore();
  }
  footer(ctx, T, '프롬프트는 Skill·Rule 에 담겨 재사용됨', TL.foot, C.blue);
}
