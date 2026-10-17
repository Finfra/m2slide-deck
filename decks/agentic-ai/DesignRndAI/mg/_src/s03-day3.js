// 장면 ④ — 3일차 찾기 (원고 근거: 3-0 «자료 묶음»·3-3 «출처 검증의 3단 확인»)
var NAME = 'mg-03-day3', DUR = 17;
var TL = { src: 1.0, arr: 4.0, nb: 4.6, ans: 7.0, cite: 8.6, v: 10.6, foot: 15.0 };
var SRC = [
  ['특허 공보', 'KIPRIS · Google Patents'],
  ['학술 논문', 'Google Scholar'],
  ['사내 산출물', '1~2일차에 만든 표와 요약'],
];
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '3일차', '찾기 — 흩어진 자료를 한 노트북으로', 0.2);
  for (var i = 0; i < 3; i++) {
    var a = TL.src + 0.7 * i, p = es(T, a, a + 0.6), y = 215 + i * 170;
    if (p > 0) {
      ctx.save(); ctx.globalAlpha = p;
      var hot = es(T, TL.cite + 1.0 + 0.6 * i, TL.cite + 1.4 + 0.6 * i) * (1 - es(T, TL.cite + 1.6 + 0.6 * i, TL.cite + 2.0 + 0.6 * i));
      card(ctx, 70 - (1 - p) * 40, y, 400, 140, { fill: hot > 0 ? C.tint : C.paper, stroke: hot > 0 ? C.brand : C.line, lw: hot > 0 ? 5 : 2 });
      txt(ctx, SRC[i][0], 100 - (1 - p) * 40, y + 48, 40, 800, C.ink, 'left');
      txt(ctx, SRC[i][1], 100 - (1 - p) * 40, y + 100, 27, 500, C.muted, 'left');
      ctx.restore();
    }
    arrow(ctx, 480, y + 70, 560, 395, es(T, TL.arr + 0.3 * i, TL.arr + 0.3 * i + 0.6), C.brandInk, 5);
  }
  // 노트북
  var pn = es(T, TL.nb, TL.nb + 0.7);
  if (pn > 0) {
    ctx.save(); ctx.globalAlpha = pn;
    card(ctx, 570, 250, 280, 290, { fill: C.blueTint, stroke: C.blue, lw: 3 });
    txt(ctx, 'Gemini', 710, 330, 38, 800, C.blue, 'center');
    txt(ctx, 'Notebook', 710, 376, 38, 800, C.blue, 'center');
    txt(ctx, '소스 3묶음', 710, 450, 32, 600, C.ink, 'center');
    ctx.restore();
  }
  arrow(ctx, 860, 395, 930, 395, es(T, TL.ans - 0.5, TL.ans), C.brandInk, 5);
  // 답 + 인용
  var pa = es(T, TL.ans, TL.ans + 0.7);
  if (pa > 0) {
    ctx.save(); ctx.globalAlpha = pa;
    card(ctx, 940, 215, 430, 450, {});
    txt(ctx, '답변', 975, 262, 34, 800, C.brandInk, 'left');
    for (var l = 0; l < 6; l++) { ctx.fillStyle = C.line; rr(ctx, 975, 310 + l * 52, l % 3 === 2 ? 260 : 360, 18, 9); ctx.fill(); }
    ctx.restore();
    for (var c = 0; c < 3; c++) {
      var pc = es(T, TL.cite + 0.6 * c - 0.4, TL.cite + 0.6 * c), cx = 1295 - 0 , cy = 330 + c * 104;
      if (pc <= 0) continue;
      ctx.save(); ctx.globalAlpha = pc;
      ctx.fillStyle = C.brand; rr(ctx, 1280, cy - 24, 62, 48, 24); ctx.fill();
      txt(ctx, String(c + 1), 1311, cy + 1, 30, 800, C.ink, 'center');
      ctx.restore();
    }
  }
  // 인용 → 원문 (연결선)
  for (var k = 0; k < 3; k++) {
    var q = es(T, TL.cite + 1.0 + 0.6 * k, TL.cite + 1.5 + 0.6 * k) * (1 - es(T, TL.cite + 1.8 + 0.6 * k, TL.cite + 2.2 + 0.6 * k));
    if (q > 0) {
      ctx.save(); ctx.globalAlpha = q; ctx.setLineDash([10, 10]); ctx.strokeStyle = C.red; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(1280, 330 + k * 104); ctx.quadraticCurveTo(900, 170, 480, 285 + k * 170); ctx.stroke(); ctx.restore();
    }
  }
  // 출처 검증 3단
  var V = [['인용을 눌러', '원문 구절로 이동'], ['구절에 그 내용이', '있는지 봄'], ['숫자·단위가 원문과', '같은지 대조']];
  for (var j = 0; j < 3; j++) {
    var a2 = TL.v + 0.6 * j, p3 = es(T, a2, a2 + 0.5);
    if (p3 <= 0) continue;
    var x = 70 + j * 445;
    ctx.save(); ctx.globalAlpha = p3;
    card(ctx, x, 740, 420, 150, {});
    ctx.fillStyle = C.brand; ctx.beginPath(); ctx.arc(x + 46, 815, 28, 0, Math.PI * 2); ctx.fill();
    txt(ctx, String(j + 1), x + 46, 816, 34, 800, C.ink, 'center');
    lines(ctx, V[j], x + 92, 800, 42, 30, 700, C.ink, 'left');
    stamp(ctx, x + 380, 770, 20, es(T, TL.v + 2.4 + 0.5 * j, TL.v + 2.8 + 0.5 * j), C.green);
    ctx.restore();
  }
  footer(ctx, T, '3건만 확인 — 하나라도 어긋나면 그 답 전체를 다시 봄', TL.foot);
}
