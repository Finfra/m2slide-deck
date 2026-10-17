// 장면 ③ — 2일차 보기 (원고 근거: 2-4 «교차 검증의 판정 규칙»·«기계 먼저, LLM 나중»)
var NAME = 'mg-02-day2', DUR = 17;
var TL = { doc: 0.8, ocr: 2.0, llm: 4.6, diff: 8.0, flag: 9.4, steps: 11.4, foot: 14.6 };
var OCR = ['101', '102', '103', '104', '105'];
var LLM = ['101', '102', '104', '105', '106'];
function chips(ctx, T, list, x, y, a, other, flagColor) {
  for (var i = 0; i < list.length; i++) {
    var p = es(T, a + 0.35 * i, a + 0.35 * i + 0.4);
    if (p <= 0) continue;
    var odd = other.indexOf(list[i]) < 0;
    var fl = odd ? es(T, TL.diff, TL.diff + 0.6) : 0;
    ctx.save(); ctx.globalAlpha = p;
    ctx.fillStyle = fl > 0 ? flagColor : C.blueTint;
    rr(ctx, x + i * 96, y, 84, 64, 14); ctx.fill();
    ctx.strokeStyle = fl > 0 ? C.red : C.blue; ctx.lineWidth = fl > 0 ? 4 : 2; ctx.stroke();
    txt(ctx, list[i], x + i * 96 + 42, y + 33, 32, 800, fl > 0 ? C.red : C.blue, 'center', MONO);
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '2일차', '보기 — 기계가 먼저, LLM 이 나중', 0.2);
  var pd = es(T, TL.doc, TL.doc + 0.8);
  if (pd > 0) {
    ctx.save(); ctx.globalAlpha = pd;
    doc(ctx, 70, 250, 250, 330, { rows: 8 });
    txt(ctx, '도면 이미지', 195, 625, 32, 700, C.ink, 'center');
    txt(ctx, '부품번호 35종', 195, 666, 28, 500, C.muted, 'center');
    ctx.restore();
  }
  // 두 갈래 읽기
  var lanes = [
    { y: 220, t: '기계 OCR', s: '모든 문자열을 긁음', a: TL.ocr, list: OCR, other: LLM },
    { y: 420, t: '비전 LLM', s: '표 형태 결과를 만듦', a: TL.llm, list: LLM, other: OCR },
  ];
  for (var k = 0; k < 2; k++) {
    var L = lanes[k], p = es(T, L.a - 0.4, L.a + 0.4);
    arrow(ctx, 335, 415, 410, L.y + 90, p, C.brandInk, 5);
    if (p <= 0) continue;
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, 420, L.y, 560, 170, {});
    txt(ctx, L.t, 450, L.y + 40, 38, 800, C.ink, 'left');
    txt(ctx, L.s, 700, L.y + 42, 28, 500, C.muted, 'left');
    ctx.restore();
    chips(ctx, T, L.list, 450, L.y + 82, L.a + 0.4, L.other, C.redTint);
  }
  // 차이 카드
  var pf = es(T, TL.flag, TL.flag + 0.6);
  if (pf > 0) {
    ctx.save(); ctx.globalAlpha = pf;
    card(ctx, 1020, 220, 350, 370, { fill: C.redTint, stroke: C.red, lw: 3 });
    txt(ctx, '차이만 추림', 1195, 262, 36, 800, C.red, 'center');
    txt(ctx, '103', 1070, 330, 34, 800, C.red, 'left', MONO);
    lines(ctx, ['OCR 에만 있음', 'LLM 누락 후보'], 1170, 318, 36, 27, 600, C.ink, 'left');
    txt(ctx, '106', 1070, 450, 34, 800, C.red, 'left', MONO);
    lines(ctx, ['LLM 에만 있음', '지어냈을 가능성'], 1170, 438, 36, 27, 600, C.ink, 'left');
    txt(ctx, '도면에서 직접 확인', 1195, 548, 30, 800, C.brandInk, 'center');
    ctx.restore();
  }
  var pm = es(T, TL.diff + 0.3, TL.diff + 0.9);
  if (pm > 0) {
    ctx.save(); ctx.globalAlpha = pm;
    txt(ctx, '양쪽 일치 4건 — 넘어감', 700, 640, 32, 700, C.green, 'center');
    ctx.restore();
  }
  // 4단계 순서
  var S = ['기계 OCR', '비전 LLM', '차집합', '사람 확인'];
  for (var i = 0; i < 4; i++) {
    var a = TL.steps + 0.5 * i, p2 = es(T, a, a + 0.5);
    if (p2 <= 0) continue;
    var x = 70 + i * 335;
    ctx.save(); ctx.globalAlpha = p2;
    var last = i === 3;
    card(ctx, x, 740, 290, 130, { fill: last ? C.brand : C.paper, stroke: last ? C.brandInk : C.line, lw: last ? 4 : 2 });
    txt(ctx, String(i + 1), x + 46, 805, 42, 800, last ? C.ink : C.brandInk, 'center');
    txt(ctx, S[i], x + 92, 805, 34, 800, C.ink, 'left');
    ctx.restore();
    if (i < 3) arrow(ctx, x + 296, 805, x + 329, 805, es(T, a + 0.3, a + 0.7), C.brandInk, 4);
  }
  footer(ctx, T, '전수 검증이 아니라 차이만 봄', TL.foot);
}
