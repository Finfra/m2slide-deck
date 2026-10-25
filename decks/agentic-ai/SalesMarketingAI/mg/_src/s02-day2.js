// 장면 ③ — 2일차 조사하기 (원고 근거: 2-1 «출처 링크가 달려도 틀릴 수 있음 — 열리는가·본문에 있는가·날짜가 최신인가»
//          · 2-4 «사전 브리핑 5항목 — 개요·제품·동향·접점 가설·질문» · 1일차 맥락 카드를 받아 시작)
var NAME = 'mg-02-day2', DUR = 16;
var TL = { src0: 0.8, chk: 4.4, bad: 6.4, fly: 8.2, brief: 8.8, foot: 13.6 };
var SRC = [
  ['시장 동향', '소형 굴착기 시장 흐름', '[1]', 1],
  ['바이어 후보', '부시·핀 수요가 있는 제조사', '[2]', 1],
  ['경쟁사', '«점유율 1위» — 링크가 안 열림', '[3]', 0],
];
var BR = ['개요 — 사업 영역·규모', '제품 — 주력 제품·시장', '동향 — 최근 1년 뉴스', '접점 가설 — 부시·핀 수요', '질문 — 첫 상담에서 물을 3가지'];
var CHK = ['열리는가', '본문에 있는가', '날짜가 최신인가'];
function srcY(i) { return 330 + i * 170; }
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '2일차', '조사하기 — 출처를 단 조사가 브리핑으로', 0.2);
  // 출처 확인 세 점 — 위 띠
  for (var c = 0; c < 3; c++) {
    var a = TL.chk + 0.35 * c, p = es(T, a, a + 0.5);
    if (p <= 0) continue;
    ctx.save(); ctx.globalAlpha = p;
    pill(ctx, (c + 1) + '. ' + CHK[c], 230 + c * 250, 222, 25, C.blueTint, C.blue, 22);
    ctx.restore();
  }
  var lbl = es(T, TL.chk - 0.3, TL.chk + 0.2);
  if (lbl > 0) { ctx.save(); ctx.globalAlpha = lbl; txt(ctx, '출처 확인', 70, 178, 26, 700, C.muted, 'left'); ctx.restore(); }
  // 조사 카드 셋 — 왼쪽
  for (var i = 0; i < SRC.length; i++) {
    var s = TL.src0 + 1.0 * i, q = es(T, s, s + 0.6);
    if (q <= 0) continue;
    var y = srcY(i), ok = SRC[i][3], fl = es(T, TL.fly + 0.25 * i, TL.fly + 0.25 * i + 0.8);
    var gone = ok ? 0 : 0.55 * es(T, TL.bad + 0.6, TL.bad + 1.4);
    ctx.save();
    ctx.globalAlpha = q * (1 - gone);
    card(ctx, 70 + (1 - q) * -50, y, 600, 140, { fill: ok && fl > 0 ? C.tint : C.paper, stroke: ok && fl > 0 ? C.brand : C.line, lw: ok && fl > 0 ? 3 : 2 });
    txt(ctx, SRC[i][0], 104, y + 44, 34, 800, C.ink, 'left');
    txt(ctx, SRC[i][1], 104, y + 98, 27, 500, C.sub, 'left');
    pill(ctx, SRC[i][2], 600, y + 44, 22, C.blueTint, C.blue, 14);
    ctx.restore();
    var ck = es(T, TL.chk + 1.2 + 0.4 * i, TL.chk + 1.6 + 0.4 * i);
    if (ok) stamp(ctx, 640, y + 100, 22, ck, C.blue);
    else if (gone < 1) {
      crossmark(ctx, 640, y + 100, 22, es(T, TL.bad, TL.bad + 0.5), C.red);
      var t2 = es(T, TL.bad + 0.3, TL.bad + 0.8);
      if (t2 > 0) { ctx.save(); ctx.globalAlpha = t2; txt(ctx, '확정으로 쓰지 않음', 370, y + 166, 26, 800, C.red, 'center'); ctx.restore(); }
    }
    if (ok) arrow(ctx, 690, y + 70, 780, lerp(y + 70, 560, 0.6), fl, C.brandInk, 5);
  }
  // 사전 브리핑 — 오른쪽 문서
  var b = es(T, TL.brief, TL.brief + 0.7);
  if (b > 0) {
    ctx.save(); ctx.globalAlpha = b;
    card(ctx, 800, 300, 570, 600, { fill: C.paper, stroke: C.brand, lw: 3 });
    ctx.fillStyle = C.brand; rr(ctx, 820, 320, 530, 70, 14); ctx.fill();
    txt(ctx, '고객사 사전 브리핑', 1085, 356, 34, 800, C.ink, 'center');
    for (var k = 0; k < BR.length; k++) {
      var r = es(T, TL.brief + 0.5 + 0.55 * k, TL.brief + 1.0 + 0.55 * k), y2 = 440 + k * 94;
      if (r <= 0) continue;
      ctx.globalAlpha = b * r;
      ctx.fillStyle = C.brand; ctx.beginPath(); ctx.arc(856, y2, 22, 0, Math.PI * 2); ctx.fill();
      txt(ctx, String(k + 1), 856, y2 + 1, 26, 800, C.ink, 'center');
      txt(ctx, BR[k], 896, y2 + 1, 27, k === 3 ? 800 : 600, k === 3 ? C.brandInk : C.ink, 'left');
      if (k < BR.length - 1) { ctx.fillStyle = C.line; ctx.fillRect(836, y2 + 46, 500, 2); }
    }
    ctx.restore();
  }
  footer(ctx, T, '세 점을 통과한 문장만 확정으로 씀', TL.foot);
}
