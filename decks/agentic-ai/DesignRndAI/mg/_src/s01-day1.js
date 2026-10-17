// 장면 ② — 1일차 읽기 (원고 근거: 1-3 «사양서 PDF 자동 요약과 핵심 사양 추출» 1~3단계 + 검증 P1-3)
var NAME = 'mg-01-day1', DUR = 17;
var TL = { s1: 1.0, p1: 1.6, s2: 5.4, p2: 6.0, s3: 9.4, p3: 10.0, stamp: 14.2, foot: 15.0 };
var STEPS = ['목차·구조', '필요한 절 요약', '사양 표로 고정'];
var P = { x: 430, y: 380, w: 940, h: 520 };
function stepsBar(ctx, T) {
  var cur = T < TL.s2 ? 0 : T < TL.s3 ? 1 : 2;
  for (var i = 0; i < 3; i++) {
    var a = TL.s1 + 0.3 * i, p = es(T, a, a + 0.5), x = 430 + i * 320;
    if (p <= 0) continue;
    ctx.save(); ctx.globalAlpha = p;
    var on = (i === cur && T < TL.stamp) ? 1 : 0;
    card(ctx, x, 208, 300, 120, { fill: on ? C.tint : C.paper, stroke: on ? C.brand : C.line, lw: on ? 4 : 2, shadow: on ? 1 : 0 });
    ctx.fillStyle = on ? C.brand : C.line; ctx.beginPath(); ctx.arc(x + 44, 268, 24, 0, Math.PI * 2); ctx.fill();
    txt(ctx, String(i + 1), x + 44, 269, 30, 800, C.ink, 'center');
    txt(ctx, STEPS[i], x + 84, 268, 29, 700, C.ink, 'left');
    ctx.restore();
  }
}
function drawDoc1(ctx, T) {
  var p = es(T, 0.6, 1.4);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  doc(ctx, 80, 380, 270, 400, { rows: 9 });
  txt(ctx, '사양서 PDF', 215, 830, 34, 700, C.ink, 'center');
  txt(ctx, '58쪽', 215, 872, 30, 500, C.muted, 'center');
  ctx.restore();
  var q = es(T, TL.p1, TL.p1 + 0.8);
  arrow(ctx, 370, 570, 420, 570, q, C.brandInk, 5);
}
function panelToc(ctx, T) {
  var a = es(T, TL.p1, TL.p1 + 0.6) * (1 - es(T, TL.s2 - 0.4, TL.s2 + 0.2));
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  card(ctx, P.x, P.y, P.w, P.h, {});
  txt(ctx, '목차 — 3단계까지, 쪽 범위와 함께', P.x + 40, P.y + 48, 32, 700, C.brandInk, 'left');
  var rowsT = [['2.1 구조', '9', 0], ['2.2 건식 마모 메커니즘', '9', 0], ['2.3 물성', '11', 1], ['2.4 화학적 특성', '12', 0], ['3.1 설계 요소', '14', 0], ['3.3 허용하중 한계', '15', 1], ['3.4 미끄럼 속도', '15', 0]];
  for (var i = 0; i < rowsT.length; i++) {
    var y = P.y + 100 + i * 56, hl = rowsT[i][2] ? es(T, 3.0 + 0.7 * (i > 3 ? 1 : 0), 3.7 + 0.7 * (i > 3 ? 1 : 0)) : 0;
    if (hl > 0) { ctx.fillStyle = rgba(C.brand, 0.55 * hl); rr(ctx, P.x + 24, y - 24, P.w - 48, 50, 10); ctx.fill(); }
    txt(ctx, rowsT[i][0], P.x + 48, y, 30, rowsT[i][2] ? 800 : 500, rowsT[i][2] ? C.ink : C.sub, 'left');
    txt(ctx, rowsT[i][1] + '쪽', P.x + P.w - 48, y, 30, 600, C.muted, 'right');
  }
  txt(ctx, '58쪽 중 읽을 절은 2~3개', P.x + P.w / 2, P.y + P.h - 26, 28, 700, C.brandInk, 'center');
  ctx.restore();
}
function panelSummary(ctx, T) {
  var a = es(T, TL.p2, TL.p2 + 0.6) * (1 - es(T, TL.s3 - 0.4, TL.s3 + 0.2));
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  card(ctx, P.x, P.y, P.w, P.h, {});
  txt(ctx, '2.3 물성 · 3.3 허용하중 한계 — 항목 — 값 — 조건', P.x + 40, P.y + 48, 30, 700, C.brandInk, 'left');
  var L = [['최대하중', '250 N/mm²', '정하중'], ['최대하중', '140 N/mm²', '동하중']];
  for (var i = 0; i < 2; i++) {
    var p = es(T, TL.p2 + 0.5 + 0.7 * i, TL.p2 + 1.1 + 0.7 * i), y = P.y + 150 + i * 100;
    if (p <= 0) continue;
    ctx.globalAlpha = a * p;
    card(ctx, P.x + 40 + (1 - p) * 40, y - 38, P.w - 80, 80, { fill: C.tint, stroke: 'transparent', shadow: 0, r: 14 });
    txt(ctx, L[i][0], P.x + 70, y + 2, 34, 700, C.ink, 'left');
    txt(ctx, L[i][1], P.x + 330, y + 2, 34, 800, C.ink, 'left');
    if (L[i][2]) txt(ctx, L[i][2], P.x + P.w - 70, y + 2, 32, 700, C.blue, 'right');
  }
  var n = es(T, TL.p2 + 3.2, TL.p2 + 3.8);
  ctx.globalAlpha = a * n;
  txt(ctx, '조건이 빠지면 뒤에서 되살릴 수 없음', P.x + P.w / 2, P.y + P.h - 70, 32, 700, C.red, 'center');
  ctx.restore();
}
function panelTable(ctx, T) {
  var a = es(T, TL.p3, TL.p3 + 0.6);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  card(ctx, P.x, P.y, P.w, P.h, {});
  var cx = [P.x + 40, P.x + 380, P.x + 780];
  ctx.fillStyle = C.brand; rr(ctx, P.x + 20, P.y + 22, P.w - 40, 66, 14); ctx.fill();
  txt(ctx, '항목', cx[0], P.y + 56, 34, 800, C.ink, 'left');
  txt(ctx, '값', cx[1], P.y + 56, 34, 800, C.ink, 'left');
  txt(ctx, '근거 쪽수', cx[2], P.y + 56, 34, 800, C.ink, 'left');
  var R = [['허용하중 (정하중)', '250 N/mm²', '11쪽'], ['허용하중 (동하중)', '140 N/mm²', '11쪽'], ['동작 온도 범위', '−200 ~ +280 °C', '11쪽']];
  for (var i = 0; i < 3; i++) {
    var p = es(T, TL.p3 + 0.6 + 0.8 * i, TL.p3 + 1.2 + 0.8 * i), y = P.y + 150 + i * 98;
    ctx.globalAlpha = a * p;
    ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(P.x + 30, y + 44); ctx.lineTo(P.x + P.w - 30, y + 44); ctx.stroke();
    txt(ctx, R[i][0], cx[0], y, 32, 700, C.ink, 'left');
    txt(ctx, R[i][1], cx[1], y, 32, 800, C.ink, 'left');
    txt(ctx, R[i][2], cx[2], y, 32, 600, C.sub, 'left');
    stamp(ctx, P.x + P.w - 60, y, 22, es(T, TL.stamp + 0.4 * i, TL.stamp + 0.8 * i), C.green);
  }
  ctx.globalAlpha = a * es(T, TL.p3 + 3.4, TL.p3 + 4.0);
  txt(ctx, '원문에 없는 항목은 «원문에 없음» · 환산하지 않음', P.x + P.w / 2, P.y + P.h - 44, 32, 700, C.brandInk, 'center');
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '1일차', '읽기 — 사양서 한 권이 표 한 장으로', 0.2);
  drawDoc1(ctx, T);
  stepsBar(ctx, T);
  panelToc(ctx, T); panelSummary(ctx, T); panelTable(ctx, T);
  footer(ctx, T, '표의 수치는 원문과 대조함', TL.foot);
}
