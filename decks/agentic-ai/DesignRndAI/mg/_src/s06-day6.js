// 장면 ⑦ — 6일차 쌓기 (원고 근거: 6-1 «RAG 세 글자의 뜻 — 찾고·붙이고·답함»)
var NAME = 'mg-06-day6', DUR = 17;
var TL = { st: 0.8, grid: 1.2, q: 3.4, pick: 5.2, fly: 7.4, ans: 10.6, cite: 12.0, foot: 14.4 };
var ST = [['질문', '부시 허용하중은?'], ['Retrieval', '찾기'], ['Augmented', '붙이기'], ['Generation', '답하기']];
var PICK = [4, 9, 20];
function gridPos(i) { return { x: 70 + (i % 6) * 116, y: 470 + Math.floor(i / 6) * 100 }; }
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '6일차', '쌓기 — 찾고 · 붙이고 · 답함', 0.2);
  // 단계 표시줄 — 진행 중인 칸이 노랗다
  var cur = T < TL.q ? -1 : T < TL.pick + 1.6 ? 1 : T < TL.ans ? 2 : 3;
  if (T >= TL.q && T < TL.pick) cur = 0;
  for (var s = 0; s < 4; s++) {
    var a = TL.st + 0.3 * s, p = es(T, a, a + 0.5), x = 70 + s * 336;
    if (p <= 0) continue;
    ctx.save(); ctx.globalAlpha = p;
    var on = s === cur;
    card(ctx, x, 200, 290, 150, { fill: on ? C.tint : C.paper, stroke: on ? C.brand : C.line, lw: on ? 5 : 2, shadow: on ? 1 : 0 });
    txt(ctx, ST[s][0], x + 145, 252, s === 0 ? 40 : 34, 800, C.ink, 'center');
    txt(ctx, ST[s][1], x + 145, 306, s === 0 ? 29 : 40, s === 0 ? 600 : 800, s === 0 ? C.sub : C.brandInk, 'center');
    ctx.restore();
    if (s < 3) arrow(ctx, x + 295, 275, x + 331, 275, es(T, a + 0.3, a + 0.7), C.brandInk, 4);
  }
  // 창고 — 문서 조각 24개
  var pg = es(T, TL.grid - 0.2, TL.grid + 0.6);
  if (pg > 0) {
    ctx.save(); ctx.globalAlpha = pg;
    txt(ctx, '문서 창고 — 잘게 자른 조각', 70, 420, 32, 700, C.muted, 'left');
    ctx.restore();
  }
  // 붙이기 — 프롬프트 카드
  var pp = es(T, TL.fly - 0.6, TL.fly + 0.2);
  if (pp > 0) {
    ctx.save(); ctx.globalAlpha = pp;
    card(ctx, 790, 430, 580, 235, { fill: C.paper });
    txt(ctx, '질문 + 조각', 830, 470, 34, 800, C.brandInk, 'left');
    txt(ctx, '질문 뒤에 조각을 붙여 넘김', 1080, 636, 28, 700, C.muted, 'center');
    ctx.restore();
  }
  for (var i = 0; i < 24; i++) {
    var gp = es(T, TL.grid + 0.04 * i, TL.grid + 0.04 * i + 0.5), pos = gridPos(i);
    if (gp <= 0) continue;
    var pi = PICK.indexOf(i), hl = pi >= 0 ? es(T, TL.pick + 0.5 * pi, TL.pick + 0.5 * pi + 0.5) : 0;
    var fly = pi >= 0 ? es(T, TL.fly + 0.5 * pi, TL.fly + 0.5 * pi + 1.0) : 0;
    var tx = 880 + pi * 150, ty = 520;
    var x = lerp(pos.x, tx, fly), y = lerp(pos.y, ty, fly);
    ctx.save(); ctx.globalAlpha = gp * (pi >= 0 ? 1 : 1 - 0.55 * es(T, TL.pick, TL.pick + 0.6));
    ctx.fillStyle = hl > 0 ? C.brand : C.paper;
    rr(ctx, x, y, 104, 84, 12); ctx.fill();
    ctx.strokeStyle = hl > 0 ? C.brandInk : C.line; ctx.lineWidth = hl > 0 ? 4 : 2; ctx.stroke();
    for (var l = 0; l < 3; l++) { ctx.fillStyle = hl > 0 ? C.brandInk : C.line; ctx.fillRect(x + 14, y + 18 + l * 18, l === 2 ? 40 : 76, 6); }
    if (pi >= 0 && fly > 0.9) txt(ctx, String(pi + 1), x + 52, y - 18, 28, 800, C.brandInk, 'center');
    ctx.restore();
  }
  // 질문 말풍선(창고 위로 들어오는 신호)
  var pq = es(T, TL.q, TL.q + 0.6) * (1 - es(T, TL.fly, TL.fly + 0.6));
  if (pq > 0) {
    ctx.save(); ctx.globalAlpha = pq;
    ctx.fillStyle = C.blueTint; rr(ctx, 520, 392, 330, 54, 27); ctx.fill();
    txt(ctx, '질문과 비슷한 조각을 찾음', 685, 419, 27, 700, C.blue, 'center');
    ctx.restore();
  }
  // 답 + 인용
  var pa = es(T, TL.ans, TL.ans + 0.7);
  if (pa > 0) {
    ctx.save(); ctx.globalAlpha = pa;
    card(ctx, 790, 720, 580, 180, { fill: C.tint, stroke: C.brandInk, lw: 4 });
    txt(ctx, '답', 830, 760, 34, 800, C.brandInk, 'left');
    for (var l2 = 0; l2 < 2; l2++) { ctx.fillStyle = C.brandInk; ctx.globalAlpha = pa * 0.35; rr(ctx, 830, 798 + l2 * 36, l2 ? 300 : 440, 16, 8); ctx.fill(); }
    ctx.restore();
    for (var c = 0; c < 3; c++) {
      var pc = es(T, TL.cite + 0.5 * c, TL.cite + 0.5 * c + 0.4);
      if (pc <= 0) continue;
      ctx.save(); ctx.globalAlpha = pc;
      ctx.fillStyle = C.brand; rr(ctx, 830 + c * 84, 850, 70, 40, 20); ctx.fill();
      txt(ctx, '[' + (c + 1) + ']', 865 + c * 84, 871, 26, 800, C.ink, 'center');
      ctx.restore();
    }
  }
  footer(ctx, T, '어느 조각을 썼는지 남기면 그것이 인용임', TL.foot);
}
