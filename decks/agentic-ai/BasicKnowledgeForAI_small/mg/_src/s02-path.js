// 장면 ③ — 절대경로와 상대경로 (원고 근거: 02-linux «절대경로 이름과 상대경로 이름»)
var NAME = 'mg-02-path', DUR = 16;
var TL = { n0: 1.0, n1: 1.6, n2: 2.2, absCard: 3.0, absHome: 3.6, absEtc: 4.6, cur: 6.0, relCard: 6.8, rel: 7.4, up: 9.0, cmd0: 10.6, cmdStep: 0.2, foot: 13.0 };
var NW = 180, NH = 80;
var N = { root: [X0 + 450, 300, '/'], home: [X0 + 260, 520, 'home'], etc: [X0 + 640, 520, 'etc'], xx: [X0 + 260, 780, 'xx'] };
var PX = X0 + 880, PW = X1 - PX;
var CMDS = ['cd', 'pwd', 'ls', 'mkdir', 'cp', 'mv'];

function node(ctx, n, p, o) {
  if (p <= 0) return;
  o = o || {};
  ctx.save(); ctx.globalAlpha = p;
  var s = lerp(0.85, 1, p);
  ctx.translate(n[0], n[1]); ctx.scale(s, s);
  card(ctx, -NW / 2, -NH / 2, NW, NH, { fill: o.fill || C.paper, stroke: o.stroke || C.line, lw: o.lw || 2, r: 16 });
  txt(ctx, n[2], 0, 2, 40, 800, o.color || C.ink, 'center', MONO);
  ctx.restore();
}
function edge(ctx, a, b, p, color, lw) {
  if (p <= 0) return;
  var x1 = a[0], y1 = a[1] + NH / 2, x2 = b[0], y2 = b[1] - NH / 2;
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(lerp(x1, x2, p), lerp(y1, y2, p)); ctx.stroke();
  ctx.restore();
}
function tag(ctx, s, cx, cy, w, p, fill, color, font) {
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  ctx.translate(cx, cy + (1 - p) * 12);
  ctx.fillStyle = fill; rr(ctx, -w / 2, -25, w, 50, 25); ctx.fill();
  fit(ctx, s, 0, 1, 28, 800, color, 'center', w - 24, font);
  ctx.restore();
}
function tree(ctx, T) {
  var p1 = es(T, TL.n1, TL.n1 + 0.6), p2 = es(T, TL.n2, TL.n2 + 0.6);
  edge(ctx, N.root, N.home, p1, C.line, 5);
  edge(ctx, N.root, N.etc, p1, C.line, 5);
  edge(ctx, N.home, N.xx, p2, C.line, 5);
  // 절대경로 — / 에서 출발하는 파란 길
  edge(ctx, N.root, N.home, es(T, TL.absHome, TL.absHome + 0.8), C.blue, 9);
  edge(ctx, N.root, N.etc, es(T, TL.absEtc, TL.absEtc + 0.8), C.blue, 9);
  var cur = es(T, TL.cur, TL.cur + 0.5);
  node(ctx, N.root, es(T, TL.n0, TL.n0 + 0.6), { stroke: T > TL.absHome ? C.blue : C.line, lw: 3, color: T > TL.absHome ? C.blue : C.ink });
  node(ctx, N.home, p1, cur > 0 ? { fill: C.greenTint, stroke: C.green, lw: 4 } : {});
  node(ctx, N.etc, p1, {});
  node(ctx, N.xx, p2, {});
  tag(ctx, '/home', N.home[0] - 175, N.home[1], 130, es(T, TL.absHome + 0.6, TL.absHome + 1.1), C.blue, '#FFFFFF', MONO);
  tag(ctx, '/etc', N.etc[0], N.etc[1] + 80, 120, es(T, TL.absEtc + 0.6, TL.absEtc + 1.1), C.blue, '#FFFFFF', MONO);
  tag(ctx, '현재 폴더 .', N.home[0] - 150, 430, 200, cur, C.green, '#FFFFFF');
  // 상대경로 — 현재 폴더(home) 에서 아래로
  var r = es(T, TL.rel, TL.rel + 0.8);
  arrow(ctx, N.home[0] + 40, N.home[1] + NH / 2 + 10, N.home[0] + 40, N.xx[1] - NH / 2 - 10, r, C.green, 7);
  tag(ctx, 'cd ./xx == cd xx', N.home[0] + 250, 690, 300, es(T, TL.rel + 0.6, TL.rel + 1.1), C.greenTint, C.green, MONO);
  // .. — 상위 폴더로
  var u = es(T, TL.up, TL.up + 0.8);
  arrow(ctx, N.home[0] - 40, N.home[1] - NH / 2 - 10, N.root[0] - NW / 2 - 10, N.root[1] + 10, u, C.red, 7);
  tag(ctx, '.. 상위 폴더', N.root[0] - 280, N.root[1] - 10, 220, es(T, TL.up + 0.6, TL.up + 1.1), C.redTint, C.red);
}
function panel(ctx, T) {
  var p = es(T, TL.absCard, TL.absCard + 0.6);
  if (p > 0) {
    var y = 200 + (1 - p) * 30;
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, PX, y, PW, 220, { stroke: C.blue, lw: 3 });
    txt(ctx, '절대경로 이름', PX + 36, y + 52, 38, 800, C.blue, 'left');
    fit(ctx, ': /로 시작', PX + 36, y + 116, 34, 700, C.ink, 'left', PW - 72);
    fit(ctx, 'ex) /home, /etc', PX + 36, y + 172, 32, 700, C.sub, 'left', PW - 72, MONO);
    ctx.restore();
  }
  p = es(T, TL.relCard, TL.relCard + 0.6);
  if (p > 0) {
    var y2 = 450 + (1 - p) * 30;
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, PX, y2, PW, 300, { stroke: C.green, lw: 3 });
    txt(ctx, '상대경로 이름', PX + 36, y2 + 52, 38, 800, C.green, 'left');
    fit(ctx, ': 현재 폴더를 기준', PX + 36, y2 + 116, 34, 700, C.ink, 'left', PW - 72);
    ctx.globalAlpha = p * es(T, TL.rel, TL.rel + 0.6);
    fit(ctx, '"." 현재 폴더 — cd ./xx == cd xx', PX + 36, y2 + 180, 30, 700, C.sub, 'left', PW - 72);
    ctx.globalAlpha = p * es(T, TL.up, TL.up + 0.6);
    fit(ctx, '".." 상위 폴더', PX + 36, y2 + 240, 30, 700, C.sub, 'left', PW - 72);
    ctx.restore();
  }
  var h = es(T, TL.cmd0 - 0.3, TL.cmd0 + 0.2);
  if (h > 0) {
    ctx.save(); ctx.globalAlpha = h;
    txt(ctx, '관련 명령어', PX + 4, 800, 30, 800, C.sub, 'left');
    ctx.restore();
  }
  var gw = (PW - 5 * 12) / 6;
  for (var i = 0; i < CMDS.length; i++) {
    var a = TL.cmd0 + TL.cmdStep * i, q = es(T, a, a + 0.4);
    if (q <= 0) continue;
    ctx.save(); ctx.globalAlpha = q;
    ctx.translate(PX + i * (gw + 12) + gw / 2, 870 + (1 - q) * 20);
    ctx.fillStyle = C.ink; rr(ctx, -gw / 2, -30, gw, 60, 14); ctx.fill();
    fit(ctx, CMDS[i], 0, 1, 30, 800, C.brand, 'center', gw - 14, MONO);
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '경로', '절대경로는 /로 시작, 상대경로는 현재 폴더 기준', 0.2);
  tree(ctx, T);
  panel(ctx, T);
  footer(ctx, T, '절대경로는 /로 시작 · 상대경로는 현재 폴더를 기준', TL.foot);
}
