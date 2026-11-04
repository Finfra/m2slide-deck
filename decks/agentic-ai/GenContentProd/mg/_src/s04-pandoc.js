// 장면 ⑤ — Pandoc 출판 파이프라인 (원고 근거: 11 «Pandoc 변환 파이프라인 — 단계별 흐름» + «Pandoc 핵심 개요» + «설치 확인 + CLI 기본 문법» + «Pandoc는 역으로 변환 가능?» + «Pandoc 정리»)
var NAME = 'mg-04-pandoc', DUR = 17;
var TL = { in: 1.0, fm: 1.6, term: 2.6, type: 3.0, typeEnd: 5.4, link: 5.8, o0: 6.6, ostep: 0.6, pdf: 10.2, ok: 11.4, foot: 14.0 };
var OUTS = [
  ['DOCX', '협업·코멘트 요청', 'welcome.docx'],
  ['PDF', '정식 배포·인쇄', 'welcome.pdf'],
  ['PPTX', '발표·강의', 'welcome.pptx'],
  ['HTML', '정적 웹 페이지', 'welcome.html'],
  ['RevealJS', '웹 슬라이드 (HTML 기반)', 'welcome.html --to=revealjs'],
];
var DX = X0, DY = 300, DW = 320, DH = 470;
var KX = 440, KY = 400, KW = 560, KH = 220;
var OX = 1110, OW = X1 - OX, OY0 = 188, OSTEP = 152, OH = 128;
var CMD1 = '$ pandoc welcome.md', CMD2 = '  -o welcome.docx';
function inputDoc(ctx, T) {
  var p = es(T, TL.in, TL.in + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  doc(ctx, DX, DY + (1 - p) * 30, DW, DH, { rows: 0 });
  var y0 = DY + (1 - p) * 30, f = es(T, TL.fm, TL.fm + 0.5);
  ctx.fillStyle = rgba(C.brand, 0.25 * f); rr(ctx, DX + 16, y0 + 70, DW - 32, 164, 10); ctx.fill();
  var L = [['---', C.muted], ['title: "강의 자료"', C.ink], ['author: "남중구"', C.ink], ['---', C.muted]];
  for (var i = 0; i < L.length; i++) fit(ctx, L[i][0], DX + 30, y0 + 94 + i * 38, 24, 600, L[i][1], 'left', DW - 60, MONO);
  txt(ctx, '# 본문', DX + 30, y0 + 280, 26, 800, C.ink, 'left', MONO);
  ctx.fillStyle = C.line;
  for (var j = 0; j < 4; j++) ctx.fillRect(DX + 30, y0 + 320 + j * 30, (DW - 60) * (j === 3 ? 0.5 : 1), 8);
  ctx.globalAlpha = p * f;
  txt(ctx, 'Frontmatter', DX + 30, y0 + 46, 22, 700, C.brandInk, 'left');
  ctx.restore();
  ctx.save(); ctx.globalAlpha = p;
  txt(ctx, 'welcome.md', DX + DW / 2, DY + DH + 46, 30, 800, C.ink, 'center', MONO);
  txt(ctx, 'Markdown 1편', DX + DW / 2, DY + DH + 90, 26, 600, C.sub, 'center');
  ctx.restore();
}
function curOut(T) { return T < TL.o0 ? -1 : Math.min(4, Math.floor((T - TL.o0) / TL.ostep)); }
function terminal(ctx, T) {
  var p = es(T, TL.term, TL.term + 0.5);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, KX, KY + (1 - p) * 20, KW, KH, { fill: '#2A2925', stroke: '#2A2925', r: 18 });
  var y = KY + (1 - p) * 20;
  for (var i = 0; i < 3; i++) { ctx.fillStyle = ['#E8695A', '#F5C518', '#5BBE7A'][i]; ctx.beginPath(); ctx.arc(KX + 30 + i * 26, y + 28, 8, 0, Math.PI * 2); ctx.fill(); }
  txt(ctx, 'Pandoc CLI', KX + KW - 26, y + 28, 22, 700, '#B8B4A6', 'right');
  var all = CMD1.length + CMD2.length, n = Math.floor(all * seg(T, TL.type, TL.typeEnd));
  var c2 = CMD2, k = curOut(T);
  if (k >= 0) c2 = '  -o ' + OUTS[k][2];
  var s1 = CMD1.substr(0, Math.min(n, CMD1.length)), s2 = n > CMD1.length ? c2.substr(0, n - CMD1.length) : '';
  if (k >= 0) s2 = c2;
  fit(ctx, s1, KX + 30, y + 92, 32, 700, '#FFFFFF', 'left', KW - 60, MONO);
  fit(ctx, s2, KX + 30, y + 146, 32, 700, C.brand, 'left', KW - 60, MONO);
  ctx.restore();
  var q = es(T, TL.typeEnd, TL.typeEnd + 0.5);
  if (q > 0) {
    ctx.save(); ctx.globalAlpha = q;
    fit(ctx, 'pandoc {입력} -o {출력} [옵션]', KX + KW / 2, KY + KH + 46, 28, 700, C.ink, 'center', KW, MONO);
    txt(ctx, '확장자로 포맷 자동 판단', KX + KW / 2, KY + KH + 92, 26, 600, C.sub, 'center');
    ctx.restore();
  }
  arrow(ctx, DX + DW + 14, KY + KH / 2, KX - 14, KY + KH / 2, es(T, TL.link, TL.link + 0.5), C.brandInk, 5);
}
function outputs(ctx, T) {
  var k = curOut(T);
  for (var i = 0; i < OUTS.length; i++) {
    var a = TL.o0 + TL.ostep * i, y = OY0 + i * OSTEP, cy = y + OH / 2;
    polyArrow(ctx, [[KX + KW + 12, KY + KH / 2], [KX + KW + 50, KY + KH / 2], [KX + KW + 50, cy], [OX - 14, cy]], es(T, a, a + 0.4), C.brandInk, 4);
    var p = es(T, a + 0.2, a + 0.6);
    if (p <= 0) continue;
    var on = i === k && T < TL.ok;
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, OX + (1 - p) * 30, y, OW, OH, { fill: on ? C.tint : C.paper, stroke: on ? C.brand : C.line, lw: on ? 5 : 2 });
    txt(ctx, OUTS[i][0], OX + 34, y + 44, 36, 800, C.ink, 'left', MONO);
    fit(ctx, OUTS[i][1], OX + 34, y + 92, 28, 600, C.sub, 'left', OW - 130);
    ctx.restore();
    stamp(ctx, OX + OW - 54, cy, 24, es(T, TL.ok + 0.25 * i, TL.ok + 0.25 * i + 0.4), C.green);
  }
  var q = es(T, TL.pdf, TL.pdf + 0.5);
  if (q > 0) {
    var y1 = OY0 + OSTEP;
    ctx.save(); ctx.globalAlpha = q;
    pill(ctx, '조판 엔진 필요', OX + 245, y1 + 44 - (1 - q) * 10, 200, 42, C.redTint, C.red, 22, 800);
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, 'Part 2', 'Pandoc — Markdown 1소스 → 5종 출력', 0.2);
  inputDoc(ctx, T);
  terminal(ctx, T);
  outputs(ctx, T);
  footer(ctx, T, '한 번 작성 → 다중 출판 (1소스 N채널)', TL.foot);
}
