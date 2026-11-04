// 장면 ② — 간단한 기호로 쓰고 HTML 로 변환 (원고 근거: 01-markdown «Markdown이란?» · «Markdown Example» · «순서있는 목록(번호)»)
var NAME = 'mg-01-markdown', DUR = 16;
var TL = { html: 1.0, md: 2.0, same: 2.8, cards: 3.6, auto: 10.8, pulse: 12.0, foot: 13.0 };
var SRC = [ // [글자, 시작, 길이]
  ['# 개요1', 4.2, 0.6],
  ['1. 첫째 항목', 5.2, 0.5],
  ['1. 둘째 항목', 5.8, 0.5],
  ['1. 셋째 항목', 6.4, 0.5],
  ['[finfra](https://finfra.com)', 7.4, 0.8],
  ['|id|name |', 8.4, 0.5],
  ['|--|-----|', 9.0, 0.5],
  ['|1 |aaa  |', 9.6, 0.5],
];
var KY = 370, KH = 580, KW = 640, SX = X0, RX = X1 - KW;
function done(i, T) { return es(T, SRC[i][1] + SRC[i][2], SRC[i][1] + SRC[i][2] + 0.4); }

function compare(ctx, T) {
  var rows = [['HTML', '<html><h1>hi</h1></html>', TL.html, C.sub], ['Markdown', '# hi', TL.md, C.brandInk]];
  for (var i = 0; i < rows.length; i++) {
    var p = es(T, rows[i][2], rows[i][2] + 0.6);
    if (p <= 0) continue;
    var y = 215 + i * 78;
    ctx.save(); ctx.globalAlpha = p;
    pill(ctx, rows[i][0], X0 + 90, y, 180, 54, i ? C.brand : C.line, C.ink, 28, 800);
    txt(ctx, rows[i][1], X0 + 210 + (1 - p) * 20, y + 1, 38, 700, rows[i][3], 'left', MONO);
    ctx.restore();
  }
  var q = es(T, TL.same, TL.same + 0.6);
  if (q > 0) {
    ctx.save(); ctx.globalAlpha = q;
    ctx.strokeStyle = C.brandInk; ctx.lineWidth = 4; ctx.lineCap = 'round';
    var bx = X0 + 870;
    ctx.beginPath(); ctx.moveTo(bx, 195); ctx.lineTo(bx + 24, 195); ctx.lineTo(bx + 24, 313); ctx.lineTo(bx, 313); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx + 24, 254); ctx.lineTo(bx + 50, 254); ctx.stroke();
    pill(ctx, '같은 제목 hi', bx + 50 + 130, 254, 260, 58, C.tint, C.brandInk, 30, 800);
    ctx.restore();
  }
}
function frames(ctx, T) {
  var p = es(T, TL.cards, TL.cards + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, SX, KY, KW, KH, { fill: '#2B2B28', stroke: '#2B2B28' });
  card(ctx, RX, KY, KW, KH, {});
  txt(ctx, '소스 (.md)', SX + 32, KY + 40, 26, 800, C.brand, 'left');
  txt(ctx, '렌더 결과', RX + 32, KY + 40, 26, 800, C.muted, 'left');
  ctx.restore();
  // 변환 화살표 — 끝 무렵 맥동
  var a = es(T, TL.cards + 0.3, TL.cards + 1.0);
  var cy = KY + KH / 2, pulse = T > TL.pulse ? 1 + 0.08 * Math.sin((T - TL.pulse) * 6) * (1 - seg(T, TL.pulse + 2, TL.pulse + 3)) : 1;
  arrow(ctx, SX + KW + 24, cy, RX - 24, cy, a, C.brandInk, 8 * pulse);
  if (a > 0.9) {
    ctx.save(); ctx.translate((SX + KW + RX) / 2, cy - 50); ctx.scale(pulse, pulse);
    pill(ctx, '변환', 0, 0, 110, 48, C.brand, C.ink, 26, 800);
    ctx.restore();
  }
}
function source(ctx, T) {
  for (var i = 0; i < SRC.length; i++) {
    var s = SRC[i][0], a = SRC[i][1], d = SRC[i][2];
    if (T < a) continue;
    var n = Math.floor(s.length * seg(T, a, a + d) + 1e-6), y = KY + 100 + i * 60, x = SX + 40;
    var shown = s.substr(0, n);
    if (i >= 1 && i <= 3 && T > TL.auto) { // 자동 번호 강조 — 소스의 «1.»
      ctx.save(); ctx.globalAlpha = es(T, TL.auto, TL.auto + 0.5);
      ctx.fillStyle = rgba(C.brand, 0.45); rr(ctx, x - 6, y - 22, 46, 44, 8); ctx.fill();
      ctx.restore();
    }
    ctx.font = '700 30px ' + MONO;
    var w = ctx.measureText(shown).width, maxW = KW - 80;
    var size = w > maxW ? Math.floor(30 * maxW / w) : 30;
    txt(ctx, shown, x, y, size, 700, '#F4F1E6', 'left', MONO);
    if (n < s.length && Math.floor(T * 4) % 2 === 0) { // 커서 — T 로만 깜빡임
      ctx.font = '700 ' + size + 'px ' + MONO;
      ctx.fillStyle = C.brand; ctx.fillRect(x + ctx.measureText(shown).width + 2, y - 16, 14, 32);
    }
  }
}
function render(ctx, T) {
  var x = RX + 40, p;
  p = done(0, T);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = p;
    txt(ctx, '개요1', x, KY + 110, 48, 800, C.ink, 'left');
    ctx.fillStyle = C.line; ctx.fillRect(x, KY + 146, (KW - 80) * p, 3);
    ctx.restore();
  }
  var items = ['첫째 항목', '둘째 항목', '셋째 항목'];
  for (var i = 0; i < 3; i++) {
    p = done(i + 1, T);
    if (p <= 0) continue;
    var y = KY + 200 + i * 56;
    ctx.save(); ctx.globalAlpha = p;
    if (T > TL.auto) {
      ctx.save(); ctx.globalAlpha = es(T, TL.auto, TL.auto + 0.5);
      ctx.fillStyle = rgba(C.brand, 0.45); rr(ctx, x + 4, y - 22, 40, 44, 8); ctx.fill();
      ctx.restore();
    }
    txt(ctx, (i + 1) + '.', x + 10, y, 32, 800, C.ink, 'left');
    txt(ctx, items[i], x + 56 + (1 - p) * 16, y, 32, 600, C.ink, 'left');
    ctx.restore();
  }
  var q = es(T, TL.auto + 0.3, TL.auto + 0.9);
  if (q > 0) {
    ctx.save(); ctx.globalAlpha = q;
    pill(ctx, '자동으로 1부터 차례대로', RX + KW - 175, KY + 256, 310, 50, C.ink, '#FFFFFF', 24, 800);
    ctx.restore();
  }
  p = done(4, T);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = p;
    txt(ctx, 'finfra', x, KY + 390, 34, 700, C.blue, 'left');
    ctx.font = '700 34px ' + KR;
    ctx.fillStyle = C.blue; ctx.fillRect(x, KY + 410, ctx.measureText('finfra').width, 3);
    ctx.restore();
  }
  // 표 — 구분선 줄까지 들어오면 머리, 마지막 줄에서 행
  var ty = KY + 450, cw = [120, 220], rh = 52;
  p = done(6, T);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = p;
    ctx.fillStyle = C.tint; ctx.fillRect(x, ty, cw[0] + cw[1], rh);
    ctx.strokeStyle = C.line; ctx.lineWidth = 2;
    ctx.strokeRect(x, ty, cw[0], rh); ctx.strokeRect(x + cw[0], ty, cw[1], rh);
    txt(ctx, 'id', x + 20, ty + rh / 2, 28, 800, C.ink, 'left');
    txt(ctx, 'name', x + cw[0] + 20, ty + rh / 2, 28, 800, C.ink, 'left');
    ctx.restore();
  }
  p = done(7, T);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = p;
    ctx.strokeStyle = C.line; ctx.lineWidth = 2;
    ctx.strokeRect(x, ty + rh, cw[0], rh); ctx.strokeRect(x + cw[0], ty + rh, cw[1], rh);
    txt(ctx, '1', x + 20, ty + rh * 1.5, 28, 600, C.ink, 'left');
    txt(ctx, 'aaa', x + cw[0] + 20, ty + rh * 1.5, 28, 600, C.ink, 'left');
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, 'Markdown', '간단한 기호로 쓰고 HTML로 변환', 0.2);
  compare(ctx, T);
  frames(ctx, T);
  if (T >= TL.cards) { source(ctx, T); render(ctx, T); }
  footer(ctx, T, '특수기호와 문자 — 매우 간단한 구조의 문법', TL.foot);
}
