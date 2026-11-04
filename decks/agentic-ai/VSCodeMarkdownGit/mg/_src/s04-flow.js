// 장면 ④ — 덱 전체 흐름 (원고 근거: 머리 주석의 시간 구획 0~5·5~17·17~29·29~44·44~50분 + «쌓이고 나면 답할 수 없는 세 질문» + «세 개가 맞물리는 그림»)
var NAME = 'vscode-md-git-04-flow', DUR = 14;
var TL = { bar0: 1.0, barStep: 0.5, q0: 4.0, qStep: 0.7, a0: 6.4, aStep: 0.5, join: 8.6, habit: 9.8, foot: 11.2 };
var PARTS = [ // [이름, 분 시작, 분 끝, 색, 바탕]
  ['문제', 0, 5, C.muted, C.panel],
  ['VS Code', 5, 17, C.blue, C.blueTint],
  ['Markdown', 17, 29, C.purple, C.purpleTint],
  ['Git', 29, 44, C.green, C.greenTint],
  ['돌파구', 44, 50, C.brandInk, C.tint],
];
var QS = [ // [질문, 답 도구, 칸 번호]
  ['어디 있나', 'VS Code', 1],
  ['무엇을 시켰나', 'Markdown', 2],
  ['무엇이 바뀌었나', 'Git', 3],
];
var BY = 230, BH = 110, BGAP = 8, PERMIN = (CW - BGAP * 4) / 50;
var QY = 480, QH = 300, QGAP = 60, QW = (CW - QGAP * 2) / 3;
var HY = 940;
function partX(i) { return X0 + PARTS[i][1] * PERMIN + i * BGAP; }
function partW(i) { return (PARTS[i][2] - PARTS[i][1]) * PERMIN; }
function bar(ctx, T) {
  for (var i = 0; i < PARTS.length; i++) {
    var a = TL.bar0 + TL.barStep * i, p = es(T, a, a + 0.6);
    if (p <= 0) continue;
    var x = partX(i), w = partW(i), P = PARTS[i];
    card(ctx, x, BY, w * p, BH, { fill: P[4], stroke: P[3], lw: 3, r: 16, shadow: 0 });
    ctx.save();
    ctx.globalAlpha = es(T, a + 0.3, a + 0.7);
    fit(ctx, P[0], x + w / 2, BY + BH / 2, 36, 800, P[3], 'center', w - 20);
    fit(ctx, P[1] + '~' + P[2] + '분', x + w / 2, BY + BH + 36, 26, 600, C.muted, 'center', w);
    ctx.restore();
  }
}
function qx(k) { return X0 + k * (QW + QGAP); }
function questions(ctx, T) {
  for (var k = 0; k < QS.length; k++) {
    var a = TL.q0 + TL.qStep * k, p = es(T, a, a + 0.7);
    if (p <= 0) continue;
    var q = QS[k], P = PARTS[q[2]], x = qx(k), y = QY + (1 - p) * 50;
    // 시간 막대 칸 → 카드로 내려오는 연결선
    ctx.save();
    ctx.globalAlpha = p;
    ctx.strokeStyle = rgba(P[3], 0.5); ctx.lineWidth = 3; ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.moveTo(partX(q[2]) + partW(q[2]) / 2, BY + BH + 60); ctx.lineTo(x + QW / 2, y); ctx.stroke();
    ctx.setLineDash([]);
    card(ctx, x, y, QW, QH, { stroke: P[3], lw: 3 });
    pill(ctx, 'Q' + (k + 1), x + 70, y + 54, 92, 50, P[4], P[3], 28, 800);
    fit(ctx, q[0] + '?', x + QW / 2, y + 140, 52, 800, C.ink, 'center', QW - 60);
    ctx.restore();
    var pa = es(T, TL.a0 + TL.aStep * k, TL.a0 + TL.aStep * k + 0.5);
    if (pa > 0) {
      ctx.save();
      ctx.globalAlpha = pa;
      pill(ctx, q[1], x + QW / 2 - 30, QY + 232 + (1 - pa) * 16, 260, 70, P[3], '#FFFFFF', 36, 800);
      ctx.restore();
      stamp(ctx, x + QW / 2 + 140, QY + 232, 30, pa, C.green);
    }
  }
}
function habit(ctx, T) {
  var pj = es(T, TL.join, TL.join + 1.2);
  if (pj > 0) {
    for (var k = 0; k < QS.length; k++) {
      var sx = qx(k) + QW / 2, sy = QY + QH;
      arrow(ctx, sx, sy + 6, W / 2 + (k - 1) * 120, HY - 52, pj, rgba(PARTS[QS[k][2]][3], 0.75), 4);
    }
  }
  var ph = es(T, TL.habit, TL.habit + 0.7);
  if (ph <= 0) return;
  ctx.save();
  ctx.globalAlpha = ph;
  ctx.translate(W / 2, HY);
  var s = lerp(0.8, 1, ph);
  ctx.scale(s, s);
  pill(ctx, 'AI 를 다루는 습관', 0, 0, 620, 96, C.brand, C.ink, 44, 800);
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '50분', '세 질문 → 세 도구 → 하나의 습관', 0.2);
  bar(ctx, T);
  questions(ctx, T);
  habit(ctx, T);
  footer(ctx, T, '돌파구는 코딩 실력이 아니라, AI 를 다루는 습관', TL.foot);
}
