// scene.js — GenContentProd 강의 모션그래픽 04-pandoc (Pandoc 출판 파이프라인) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s04-pandoc.js · 합성: node mg/_src/compose.js
(function (root) {
// common.js — GenContentProd 덱 mg 6개 장면이 공유하는 그리기 도구 (compose.js 가 각 scene.js 에 전문을 싣는다)
// 출발점: AgenticCoding mg/_src/common.js — 같은 default_lec 색 체계 · 같은 판형 3:2(1620×1080)
// 결정론: Math.random·Date·performance.now 금지 — 모든 값은 시간 T 의 함수다. 글꼴은 시스템 글꼴만.

var W = 1620, H = 1080;
var X0 = 70, X1 = W - 70, CW = X1 - X0; // 본문 좌우 여백 70 — 본문 폭 1480
var C = {
  bg: '#FFFDF6', ink: '#222222', sub: '#4A4A44', muted: '#8A877A', line: '#E3DFD0', paper: '#FFFFFF',
  brand: '#F5C518', brandInk: '#7A6000', tint: '#FFF6D5',
  blue: '#0365C0', blueTint: '#EAF2FB', red: '#C82506', redTint: '#FDECE8', green: '#1F7A4D', greenTint: '#E4F3EA',
};
var KR = '"Apple SD Gothic Neo", "Noto Sans KR", sans-serif';
var MONO = 'Menlo, "SF Mono", monospace';

// ── 수학 ──────────────────────────────────────────────────────────────────
function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
function seg(T, a, b) { return clamp((T - a) / (b - a), 0, 1); }
function ease(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
function es(T, a, b) { return ease(seg(T, a, b)); }
function lerp(a, b, p) { return a + (b - a) * p; }
function hex(c) { return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; }
function rgba(c, a) { var x = hex(c); return 'rgba(' + x[0] + ',' + x[1] + ',' + x[2] + ',' + a + ')'; }

// ── 도형 ──────────────────────────────────────────────────────────────────
function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
// 카드 — o: {fill, stroke, lw, r, alpha, shadow}
function card(ctx, x, y, w, h, o) {
  o = o || {};
  ctx.save();
  ctx.globalAlpha = (o.alpha == null ? 1 : o.alpha);
  if (o.shadow !== 0) {
    ctx.shadowColor = 'rgba(60,50,10,0.13)';
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 8;
  }
  ctx.fillStyle = o.fill || C.paper;
  rr(ctx, x, y, w, h, o.r == null ? 20 : o.r);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = o.stroke || C.line;
  ctx.lineWidth = o.lw || 2;
  ctx.stroke();
  ctx.restore();
}
// 글자 — size px, weight, color, align(left|center|right), 기준선 middle
function txt(ctx, s, x, y, size, weight, color, align, font) {
  ctx.font = weight + ' ' + size + 'px ' + (font || KR);
  ctx.fillStyle = color;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}
// 칸 폭 maxW 를 넘으면 글자 크기를 줄여 맞춘다 — 글꼴이 바뀌어도 잘리지 않게
function fit(ctx, s, x, y, size, weight, color, align, maxW, font) {
  ctx.font = weight + ' ' + size + 'px ' + (font || KR);
  var w = ctx.measureText(s).width;
  if (maxW && w > maxW) size = Math.floor(size * maxW / w);
  txt(ctx, s, x, y, size, weight, color, align, font);
}
function lines(ctx, arr, x, y, step, size, weight, color, align) {
  for (var i = 0; i < arr.length; i++) txt(ctx, arr[i], x, y + i * step, size, weight, color, align);
}
// 화살표 — 시작점에서 p(0~1) 만큼 그려진다
function arrow(ctx, x1, y1, x2, y2, p, color, lw) {
  if (p <= 0) return;
  var x = lerp(x1, x2, p), y = lerp(y1, y2, p), a = Math.atan2(y2 - y1, x2 - x1);
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw || 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x, y); ctx.stroke();
  if (p > 0.85) {
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 22 * Math.cos(a - 0.45), y2 - 22 * Math.sin(a - 0.45));
    ctx.lineTo(x2 - 22 * Math.cos(a + 0.45), y2 - 22 * Math.sin(a + 0.45));
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
// 검증 도장 — ✓ (색 원 + 체크)
function stamp(ctx, cx, cy, r, p, color) {
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, p * 1.6);
  var s = lerp(1.5, 1, p);
  ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-r * 0.42, 0); ctx.lineTo(-r * 0.1, r * 0.34); ctx.lineTo(r * 0.45, -r * 0.34); ctx.stroke();
  ctx.restore();
}
function crossmark(ctx, cx, cy, r, p, color) {
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, p * 1.6);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx - r * 0.36, cy - r * 0.36); ctx.lineTo(cx + r * 0.36, cy + r * 0.36);
  ctx.moveTo(cx + r * 0.36, cy - r * 0.36); ctx.lineTo(cx - r * 0.36, cy + r * 0.36); ctx.stroke();
  ctx.restore();
}
// 문서 아이콘 — 접힌 모서리 + 본문 줄
function doc(ctx, x, y, w, h, o) {
  o = o || {};
  var f = Math.min(w, h) * 0.22;
  ctx.save();
  ctx.globalAlpha = (o.alpha == null ? 1 : o.alpha);
  ctx.shadowColor = 'rgba(60,50,10,0.13)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 6;
  ctx.fillStyle = o.fill || C.paper;
  ctx.beginPath();
  ctx.moveTo(x + 10, y); ctx.lineTo(x + w - f, y); ctx.lineTo(x + w, y + f); ctx.lineTo(x + w, y + h - 10);
  ctx.arcTo(x + w, y + h, x + w - 10, y + h, 10); ctx.lineTo(x + 10, y + h); ctx.arcTo(x, y + h, x, y + h - 10, 10);
  ctx.lineTo(x, y + 10); ctx.arcTo(x, y, x + 10, y, 10); ctx.closePath(); ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.strokeStyle = o.stroke || C.line; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = C.line;
  ctx.beginPath(); ctx.moveTo(x + w - f, y); ctx.lineTo(x + w - f, y + f); ctx.lineTo(x + w, y + f); ctx.closePath(); ctx.fill();
  var n = o.rows == null ? 4 : o.rows;
  for (var i = 0; i < n; i++) ctx.fillRect(x + 18, y + f + 18 + i * 20, (w - 36) * (i === n - 1 ? 0.55 : 1), 7);
  ctx.restore();
}

// 둥근 알약 꼬리표 — 가운데 정렬 글자
function pill(ctx, s, cx, cy, w, h, fill, color, size, weight) {
  ctx.fillStyle = fill;
  rr(ctx, cx - w / 2, cy - h / 2, w, h, h / 2);
  ctx.fill();
  fit(ctx, s, cx, cy + 1, size, weight || 800, color, 'center', w - 24);
}

// ── 공통 틀: 머리(칩 + 제목) · 아래 한 줄 ────────────────────────────────────
function header(ctx, T, chip, title, a) {
  var p = es(T, a, a + 0.6);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = p;
  pill(ctx, chip, X0 + 100, 93, 200, 62, C.brand, C.ink, 34, 800);
  fit(ctx, title, X0 + 228, 94 + (1 - p) * 10, 52, 800, C.ink, 'left', X1 - X0 - 228);
  ctx.fillStyle = C.brand;
  ctx.fillRect(X0, 148, CW * p, 6);
  ctx.restore();
}
function footer(ctx, T, s, a, color) {
  var p = es(T, a, a + 0.8);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = p;
  fit(ctx, s, W / 2, 1010 + (1 - p) * 12, 38, 700, color || C.brandInk, 'center', CW);
  ctx.restore();
}
function backdrop(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
}

// ── GenContentProd 추가 도구 ────────────────────────────────────────────────
// 결정론 의사난수 — 정수 i 에 대해 항상 같은 0~1 값 (Math.random 대신)
function hash01(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
// 꺾쇠 화살표 경로 — 점 배열을 따라 p(0~1) 만큼 그린다 (끝에 화살촉)
function polyArrow(ctx, pts, p, color, lw) {
  if (p <= 0) return;
  var L = [], tot = 0, i;
  for (i = 1; i < pts.length; i++) { var d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  var want = tot * p;
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw || 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  var ex = pts[0][0], ey = pts[0][1], ang = 0;
  for (i = 1; i < pts.length && want > 0; i++) {
    var q = Math.min(1, want / L[i - 1]);
    ex = lerp(pts[i - 1][0], pts[i][0], q); ey = lerp(pts[i - 1][1], pts[i][1], q);
    ang = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]);
    ctx.lineTo(ex, ey); want -= L[i - 1];
  }
  ctx.stroke();
  if (p > 0.95) {
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - 20 * Math.cos(ang - 0.45), ey - 20 * Math.sin(ang - 0.45));
    ctx.lineTo(ex - 20 * Math.cos(ang + 0.45), ey - 20 * Math.sin(ang + 0.45));
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

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

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
