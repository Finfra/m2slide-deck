// 장면 ① — 덱 전체 흐름 (원고 근거: AGENDA.md 부제·부록1·부록2 + 01-markdown.md 장 제목 15개 + 02-linux.md 장 제목 4개)
var NAME = 'mg-00-flow', DUR = 15;
var TL = { card1: 1.0, intro0: 1.8, chip0: 3.4, chipStep: 0.35, editor: 6.9, arrow: 7.6, card2: 8.4, row0: 9.0, rowStep: 0.6, count: 11.6, foot: 12.4 };
var CY = 210, CHH = 740;
var C1X = X0, C1W = 860, C2W = CW - C1W - 100, C2X = X1 - C2W;
var INTRO = ['Markdown이란?', 'Markdown의 장-단점', 'Markdown Example'];
var CHIPS = ['Header', 'BlockQuote', '순서있는 목록', '순서없는 목록', '수평선', '링크', '강조', '코드·HTML 블록', '이미지·표'];
var LINUX = ['리눅스를 알아야 하는 이유', '윈도우에서 접속시', '명령어 및 유틸리티 리스트', '절대경로 이름과 상대경로 이름'];

function cardHead(ctx, x, y, w, label, title, color, tint) {
  pill(ctx, label, x + 40 + 70, y + 58, 140, 52, color, color === C.brand ? C.ink : '#FFFFFF', 28, 800);
  fit(ctx, title, x + 196, y + 59, 40, 800, C.ink, 'left', w - 226);
  ctx.fillStyle = tint;
  ctx.fillRect(x + 30, y + 108, w - 60, 4);
}
function bullet(ctx, s, x, y, w, color) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x + 10, y, 8, 0, Math.PI * 2); ctx.fill();
  fit(ctx, s, x + 34, y + 1, 34, 700, C.ink, 'left', w - 40);
}
function part1(ctx, T) {
  var p = es(T, TL.card1, TL.card1 + 0.7);
  if (p <= 0) return;
  var y = CY + (1 - p) * 50;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, C1X, y, C1W, CHH, {});
  cardHead(ctx, C1X, y, C1W, '부록1', 'MarkDown', C.brand, C.brand);
  ctx.restore();
  for (var i = 0; i < INTRO.length; i++) {
    var a = TL.intro0 + 0.5 * i, q = es(T, a, a + 0.5);
    if (q <= 0) continue;
    ctx.save(); ctx.globalAlpha = q;
    bullet(ctx, INTRO[i], C1X + 50 + (1 - q) * 20, y + 170 + i * 62, C1W - 100, C.brandInk);
    ctx.restore();
  }
  // 문법 칩 3×3
  var qh = es(T, TL.chip0 - 0.3, TL.chip0 + 0.2);
  if (qh > 0) {
    ctx.save(); ctx.globalAlpha = qh;
    txt(ctx, 'Markdown 문법', C1X + 50, y + 370, 30, 800, C.sub, 'left');
    ctx.restore();
  }
  var gx = C1X + 50, gy = y + 410, gw = (C1W - 100 - 2 * 20) / 3, gh = 64;
  for (var k = 0; k < CHIPS.length; k++) {
    var b = TL.chip0 + TL.chipStep * k, r = es(T, b, b + 0.4);
    if (r <= 0) continue;
    var cx = gx + (k % 3) * (gw + 20), cy = gy + Math.floor(k / 3) * (gh + 16);
    ctx.save(); ctx.globalAlpha = r;
    var s = lerp(0.8, 1, r);
    ctx.translate(cx + gw / 2, cy + gh / 2); ctx.scale(s, s);
    ctx.fillStyle = C.tint; rr(ctx, -gw / 2, -gh / 2, gw, gh, 14); ctx.fill();
    ctx.strokeStyle = C.brand; ctx.lineWidth = 2; ctx.stroke();
    fit(ctx, CHIPS[k], 0, 1, 28, 700, C.ink, 'center', gw - 24);
    ctx.restore();
  }
  var e = es(T, TL.editor, TL.editor + 0.5);
  if (e > 0) {
    ctx.save(); ctx.globalAlpha = e;
    bullet(ctx, 'MarkDown Editor', C1X + 50 + (1 - e) * 20, y + 680, C1W - 100, C.brandInk);
    ctx.restore();
  }
}
function part2(ctx, T) {
  var p = es(T, TL.card2, TL.card2 + 0.7);
  if (p <= 0) return;
  var y = CY + (1 - p) * 50;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, C2X, y, C2W, CHH, { stroke: C.blue, lw: 3 });
  cardHead(ctx, C2X, y, C2W, '부록2', '리눅스 사용 기초', C.blue, C.blueTint);
  ctx.restore();
  for (var i = 0; i < LINUX.length; i++) {
    var a = TL.row0 + TL.rowStep * i, q = es(T, a, a + 0.5);
    if (q <= 0) continue;
    var ry = y + 200 + i * 130;
    ctx.save(); ctx.globalAlpha = q;
    card(ctx, C2X + 36 + (1 - q) * 20, ry - 46, C2W - 72, 92, { fill: C.blueTint, stroke: C.blueTint, r: 14, shadow: 0 });
    txt(ctx, String(i + 1), C2X + 76, ry + 1, 34, 800, C.blue, 'center');
    fit(ctx, LINUX[i], C2X + 110, ry + 1, 30, 700, C.ink, 'left', C2W - 170);
    ctx.restore();
  }
}
function counts(ctx, T) {
  var p = es(T, TL.count, TL.count + 0.5);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  var s = lerp(1.4, 1, p);
  ctx.translate(C1X + C1W - 90, CY); ctx.scale(s, s);
  pill(ctx, '15장', 0, 0, 120, 52, C.ink, '#FFFFFF', 28, 800);
  ctx.restore();
  ctx.save(); ctx.globalAlpha = p;
  ctx.translate(C2X + C2W - 80, CY); ctx.scale(s, s);
  pill(ctx, '4장', 0, 0, 100, 52, C.blue, '#FFFFFF', 28, 800);
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '기초 지식', '부록1 MarkDown → 부록2 리눅스 사용 기초', 0.2);
  part1(ctx, T);
  var ay = CY + CHH / 2;
  arrow(ctx, C1X + C1W + 20, ay, C2X - 20, ay, es(T, TL.arrow, TL.arrow + 0.7), C.brandInk, 8);
  part2(ctx, T);
  counts(ctx, T);
  footer(ctx, T, 'AI 활용을 위한 기초 지식', TL.foot);
}
