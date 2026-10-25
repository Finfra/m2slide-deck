// 장면 ④ — 3일차 제안하기 (원고 근거: 3-0 timeline «뽑기·쓰기·입히기·답하기·줄이기»
//          · 받는 파일 → 만드는 파일: 상담 메모 3건 → 페인포인트표.md → 제안서.md → 제안서.docx
//          · P3-0-1 규칙 «레퍼런스·가격·납기 숫자는 지어내지 말고 [담당자 입력]» · 고객 한솔건기(가상))
var NAME = 'mg-03-day3', DUR = 18;
var TS = [1.6, 4.4, 7.2, 10.0, 12.8];  // 다섯 단계 시작 시각
var TL = { bar: 0.6, s1: TS[0], s2: TS[1], s3: TS[2], s4: TS[3], s5: TS[4], foot: 15.8 };
var ST = [['뽑기', '페인포인트표'], ['쓰기', '제안서 초안'], ['입히기', '.docx 양식'], ['답하기', '견적 메일'], ['줄이기', '한 장 요약']];
var P = { x: 70, y: 380, w: 1300, h: 540 };
function cur(T) { var c = -1; for (var i = 0; i < 5; i++) if (T >= TS[i]) c = i; return c; }
function vis(T, i) {
  var a = es(T, TS[i], TS[i] + 0.6);
  return i < 4 ? a * (1 - es(T, TS[i + 1] - 0.4, TS[i + 1] + 0.1)) : a;
}
function bar(ctx, T) {
  var c = cur(T);
  for (var i = 0; i < 5; i++) {
    var a = TL.bar + 0.2 * i, p = es(T, a, a + 0.5), x = 70 + i * 265;
    if (p <= 0) continue;
    ctx.save(); ctx.globalAlpha = p;
    var on = i === c, done = i < c;
    card(ctx, x, 196, 240, 130, { fill: on ? C.tint : C.paper, stroke: on ? C.brand : C.line, lw: on ? 4 : 2, shadow: on ? 1 : 0 });
    txt(ctx, ST[i][0], x + 120, 244, 36, 800, done ? C.muted : C.ink, 'center');
    txt(ctx, ST[i][1], x + 120, 294, 24, 600, on ? C.brandInk : C.muted, 'center');
    ctx.restore();
    if (done) stamp(ctx, x + 214, 220, 16, 1, C.green);
    if (i < 4) arrow(ctx, x + 243, 261, x + 263, 261, p, C.line, 4);
  }
}
function panel(ctx, a) { card(ctx, P.x, P.y, P.w, P.h, { alpha: a }); }
function s1(ctx, T) {
  var a = vis(T, 0); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; panel(ctx, 1);
  for (var i = 0; i < 3; i++) {
    doc(ctx, 110 + i * 70, 440 + i * 26, 190, 250, { rows: 6 });
  }
  txt(ctx, '상담 메모 3건', 255, 790, 30, 700, C.ink, 'center');
  arrow(ctx, 470, 580, 560, 580, es(T, TS[0] + 0.6, TS[0] + 1.2), C.brandInk, 5);
  var R = [['페인포인트', '근거'], ['납기가 두 번 밀림', '메모 1'], ['견적 회신이 사흘 넘음', '메모 2'], ['양식 요청 — 다음 주', '메모 3']];
  for (var k = 0; k < R.length; k++) {
    var q = es(T, TS[0] + 0.9 + 0.35 * k, TS[0] + 1.3 + 0.35 * k), y = 460 + k * 92;
    ctx.globalAlpha = a * q;
    if (k === 0) { ctx.fillStyle = C.brand; rr(ctx, 590, y - 34, 740, 68, 12); ctx.fill(); }
    else { ctx.fillStyle = C.line; ctx.fillRect(600, y + 44, 720, 2); }
    txt(ctx, R[k][0], 620, y, 31, k === 0 ? 800 : 700, C.ink, 'left');
    txt(ctx, R[k][1], 1300, y, 28, 700, k === 0 ? C.ink : C.blue, 'right');
  }
  ctx.restore();
}
function s2(ctx, T) {
  var a = vis(T, 1); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; panel(ctx, 1);
  txt(ctx, '제안서.md', 110, 432, 30, 800, C.brandInk, 'left');
  var R = [['배경', '납기·회신 지연이 반복됨', 0], ['솔루션', '차별점 — 표의 근거에서 이음', 0], ['레퍼런스', '[담당자 입력]', 1], ['가격', '[담당자 입력]', 1]];
  for (var k = 0; k < R.length; k++) {
    var q = es(T, TS[1] + 0.4 + 0.4 * k, TS[1] + 0.9 + 0.4 * k), y = 510 + k * 96;
    ctx.globalAlpha = a * q;
    card(ctx, 110, y - 38, 1220, 78, { fill: R[k][2] ? C.redTint : C.tint, stroke: 'transparent', shadow: 0, r: 14 });
    txt(ctx, R[k][0], 140, y + 1, 32, 800, C.ink, 'left');
    txt(ctx, R[k][1], 380, y + 1, 31, R[k][2] ? 800 : 600, R[k][2] ? C.red : C.sub, 'left');
  }
  ctx.globalAlpha = a * es(T, TS[1] + 2.0, TS[1] + 2.5);
  txt(ctx, '숫자는 지어내지 않음', 1300, 432, 28, 800, C.red, 'right');
  ctx.restore();
}
function s3(ctx, T) {
  var a = vis(T, 2); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; panel(ctx, 1);
  doc(ctx, 160, 450, 260, 340, { rows: 9 });
  txt(ctx, '제안서.md', 290, 830, 30, 700, C.ink, 'center');
  var m = es(T, TS[2] + 0.5, TS[2] + 1.3);
  arrow(ctx, 460, 620, 560, 620, m, C.brandInk, 5);
  pill(ctx, 'pandoc', 680, 620, 32, C.ink, C.paper, 30);
  arrow(ctx, 800, 620, 900, 620, es(T, TS[2] + 1.1, TS[2] + 1.7), C.brandInk, 5);
  var d = es(T, TS[2] + 1.4, TS[2] + 2.0);
  ctx.globalAlpha = a * d;
  doc(ctx, 950, 450, 260, 340, { rows: 7 });
  ctx.fillStyle = C.blue; ctx.fillRect(952, 452 + 56, 256, 40);
  txt(ctx, '회사 양식', 1080, 528, 24, 800, C.paper, 'center');
  txt(ctx, '제안서.docx', 1080, 830, 30, 800, C.blue, 'center');
  ctx.restore();
}
function s4(ctx, T) {
  var a = vis(T, 3); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; panel(ctx, 1);
  var M = [['정중하게', ['한솔건기 구매팀 담당자님께', '견적 회신이 늦어 송구합니다.', '양식은 다음 주에 보내 드립니다.']],
           ['간결하게', ['견적 회신드립니다.', '양식 — 다음 주 송부', '납기 — [담당자 입력]']]];
  for (var i = 0; i < 2; i++) {
    var q = es(T, TS[3] + 0.3 + 0.6 * i, TS[3] + 0.9 + 0.6 * i), x = 110 + i * 620;
    ctx.globalAlpha = a * q;
    card(ctx, x, 420 + (1 - q) * 30, 580, 460, { fill: C.paper, stroke: C.brand, lw: 3 });
    pill(ctx, '어조 ' + (i + 1) + ' — ' + M[i][0], x + 180, 476, 26, C.tint, C.brandInk, 22);
    lines(ctx, M[i][1], x + 40, 580, 76, 30, 600, C.ink, 'left');
  }
  ctx.restore();
}
function s5(ctx, T) {
  var a = vis(T, 4); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; panel(ctx, 1);
  var w = lerp(1100, 560, es(T, TS[4] + 0.4, TS[4] + 1.4)), x = 720 - w / 2;
  card(ctx, x, 420, w, 460, { fill: C.paper, stroke: C.brand, lw: 4 });
  ctx.fillStyle = C.brand; rr(ctx, x + 20, 440, w - 40, 70, 14); ctx.fill();
  txt(ctx, '한 장 요약', 720, 476, 34, 800, C.ink, 'center');
  var K = ['문제 — 납기·회신 지연', '제안 — 차별점 한 줄', '다음 — 견적 양식 송부'];
  for (var k = 0; k < 3; k++) {
    var q = es(T, TS[4] + 1.2 + 0.4 * k, TS[4] + 1.6 + 0.4 * k);
    ctx.globalAlpha = a * q;
    txt(ctx, K[k], 720, 580 + k * 90, 32, 700, C.ink, 'center');
  }
  ctx.globalAlpha = a * es(T, TS[4] + 2.4, TS[4] + 2.9);
  txt(ctx, '의사결정자가 1분에 읽음', 720, 846, 28, 800, C.brandInk, 'center');
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '3일차', '제안하기 — 상담 메모가 제안서 한 벌로', 0.2);
  bar(ctx, T);
  s1(ctx, T); s2(ctx, T); s3(ctx, T); s4(ctx, T); s5(ctx, T);
  footer(ctx, T, '근거가 있는 문장만 제안서에 들어감', TL.foot);
}
