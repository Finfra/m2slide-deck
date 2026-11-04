// scene.js — graphify 덱 모션그래픽 03-token (필요한 노드만) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s03-token.js · 합성: node mg/_src/compose.js
(function (root) {
// common.js — graphify 덱 mg 4개 장면이 공유하는 그리기 도구 (compose.js 가 각 scene.js 에 전문을 싣는다)
// 출발점: AgenticCoding mg/_src/common.js — 같은 default_lec 색 체계. 판형만 16:9(1920×1080)
// 결정론: Math.random·Date·performance.now 금지 — 모든 값은 시간 T 의 함수다. 글꼴은 시스템 글꼴만.

var W = 1920, H = 1080;
var X0 = 80, X1 = W - 80, CW = X1 - X0; // 본문 좌우 여백 80 — 본문 폭 1760
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
// 선분 — 시작점에서 p(0~1) 만큼 그려진다. dash: [길이, 간격] (없으면 실선)
function dline(ctx, x1, y1, x2, y2, p, color, lw, dash) {
  if (p <= 0) return;
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = lw || 4; ctx.lineCap = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(lerp(x1, x2, p), lerp(y1, y2, p)); ctx.stroke();
  ctx.restore();
}
// 그래프 노드 — 채운 원 + 흰 테두리, p 로 튀어나옴
function node(ctx, cx, cy, r, p, fill) {
  if (p <= 0) return;
  var s = p < 1 ? lerp(0.2, 1, p) + Math.sin(p * Math.PI) * 0.18 : 1;
  ctx.save();
  ctx.globalAlpha = Math.min(1, p * 1.5);
  ctx.fillStyle = fill;
  ctx.beginPath(); ctx.arc(cx, cy, r * s, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
}

// 장면 ④ — 필요한 노드만 (원고 근거: «절대 하지 말 것» · «권장 탐색 패턴» · «path & explain 사용 예시» · «코드베이스 탐색 워크플로» · «graphify가 해결하는 문제»)
var NAME = 'mg-03-token', DUR = 17;
var TL = { left: 1.0, r0: 1.6, rStep: 0.8, meter: 3.4, meterEnd: 5.2, cross: 5.6, right: 6.4, cmd0: 6.8, cmdStep: 0.8, path0: 9.4, pathStep: 0.5, small: 12.0, ok: 13.0, foot: 14.4 };
var BAD = [['Read graphify-out/graph.json', '수백 KB — 절대 금지'], ['Read graphify-out/GRAPH_REPORT.md', '300+ 줄 — bash 발췌만']];
var CMDS = ['graphify query "X와 Y의 관계"', 'graphify path "Info.md" "slide/index.html"', 'graphify explain "개념명"'];
var PATH = ['Info.md', 'agenda-designer', 'AGENDA.md', 'generate-slides.js', 'slide/index.html'];
var LX = X0, LW = 820, RX = 980, RW = X1 - RX, PY = 190, PH = 750;
// 컨텍스트 창 막대 — v(0~) 만큼 참, 1 을 넘으면 넘침
function meter(ctx, x, y, w, v, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = C.paper; rr(ctx, x, y, w, 56, 14); ctx.fill();
  ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.stroke();
  if (v > 0) { ctx.fillStyle = color; rr(ctx, x, y, Math.max(28, w * Math.min(v, 1.06)), 56, 14); ctx.fill(); }
  ctx.restore();
}
function left(ctx, T) {
  var p = es(T, TL.left, TL.left + 0.6);
  if (p <= 0) return;
  card(ctx, LX, PY, LW, PH, { alpha: p, fill: C.redTint, stroke: rgba(C.red, 0.35), r: 24 });
  ctx.save(); ctx.globalAlpha = p;
  txt(ctx, '절대 하지 말 것', LX + 40, PY + 60, 36, 800, C.red, 'left');
  ctx.restore();
  for (var i = 0; i < 2; i++) {
    var a = TL.r0 + TL.rStep * i, pr = es(T, a, a + 0.6), y = PY + 170 + i * 150;
    if (pr <= 0) continue;
    doc(ctx, LX + 40, y - 46, 70, 92, { alpha: pr, rows: 3 });
    ctx.save(); ctx.globalAlpha = pr;
    fit(ctx, BAD[i][0], LX + 134, y - 18, 28, 700, C.ink, 'left', LW - 170, MONO);
    fit(ctx, BAD[i][1], LX + 134, y + 26, 27, 800, C.red, 'left', LW - 170);
    ctx.restore();
  }
  // 컨텍스트 창 — 차오르다 넘침
  var pm = es(T, TL.meter - 0.3, TL.meter);
  if (pm > 0) {
    var v = 1.06 * es(T, TL.meter, TL.meterEnd), my = PY + 500;
    ctx.save(); ctx.globalAlpha = pm;
    txt(ctx, '컨텍스트 창', LX + 40, my - 36, 28, 700, C.sub, 'left');
    ctx.restore();
    meter(ctx, LX + 40, my, LW - 100, v, v > 0.8 ? C.red : C.brand, pm);
    var pw = es(T, TL.meterEnd - 0.3, TL.meterEnd + 0.3);
    if (pw > 0) { ctx.save(); ctx.globalAlpha = pw; txt(ctx, '컨텍스트 창 낭비 → LLM 정확도 저하', LX + 40, my + 110, 30, 800, C.red, 'left'); ctx.restore(); }
  }
  crossmark(ctx, LX + LW - 60, PY + 60, 34, es(T, TL.cross, TL.cross + 0.5), C.red);
}
function right(ctx, T) {
  var p = es(T, TL.right, TL.right + 0.6);
  if (p <= 0) return;
  card(ctx, RX, PY, RW, PH, { alpha: p, fill: C.greenTint, stroke: rgba(C.green, 0.35), r: 24 });
  ctx.save(); ctx.globalAlpha = p;
  txt(ctx, '권장 탐색 패턴', RX + 40, PY + 60, 36, 800, C.green, 'left');
  // 터미널 카드
  var tx = RX + 40, ty = PY + 110, tw = RW - 80, th = 210;
  ctx.fillStyle = C.ink; rr(ctx, tx, ty, tw, th, 16); ctx.fill();
  ctx.restore();
  for (var i = 0; i < 3; i++) {
    var a = TL.cmd0 + TL.cmdStep * i, pc = seg(T, a, a + 0.7);
    if (pc <= 0) continue;
    var s = CMDS[i].substr(0, Math.round(CMDS[i].length * pc));
    fit(ctx, '$ ' + s, tx + 30, ty + 48 + i * 58, 26, 600, i === 1 ? C.brand : '#FFFFFF', 'left', tw - 60, MONO);
  }
  // path 결과 — 세로 사슬
  var cx = RX + 40, cw = 400, ch = 54, cy0 = PY + 360, cstep = 76;
  var pcap = es(T, TL.path0 - 0.3, TL.path0);
  if (pcap > 0) { ctx.save(); ctx.globalAlpha = pcap; txt(ctx, 'path 결과', cx + cw + 30, cy0 + ch / 2, 26, 700, C.sub, 'left'); ctx.restore(); }
  for (var k = 0; k < PATH.length; k++) {
    var b = TL.path0 + TL.pathStep * k, pk = es(T, b, b + 0.4), y = cy0 + k * cstep;
    if (pk <= 0) continue;
    if (k > 0) arrow(ctx, cx + cw / 2, y - cstep + ch + 2, cx + cw / 2, y - 2, pk, C.green, 4);
    ctx.save(); ctx.globalAlpha = pk;
    ctx.fillStyle = C.paper; rr(ctx, cx, y, cw, ch, ch / 2); ctx.fill();
    ctx.strokeStyle = C.green; ctx.lineWidth = 3; ctx.stroke();
    fit(ctx, PATH[k], cx + cw / 2, y + ch / 2 + 1, 25, 700, C.ink, 'center', cw - 40, MONO);
    ctx.restore();
  }
  // 오른쪽 컨텍스트 창 — 조금만
  var mx = cx + cw + 30, mw = RX + RW - 40 - mx, my = PY + 520;
  var pm = es(T, TL.small - 0.3, TL.small);
  if (pm > 0) {
    ctx.save(); ctx.globalAlpha = pm;
    txt(ctx, '컨텍스트 창', mx, my - 36, 28, 700, C.sub, 'left');
    ctx.restore();
    meter(ctx, mx, my, mw, 0.18 * es(T, TL.small, TL.small + 0.8), C.green, pm);
  }
  var po = es(T, TL.ok, TL.ok + 0.5);
  stamp(ctx, mx + 30, my + 130, 30, po, C.green);
  if (po > 0) { ctx.save(); ctx.globalAlpha = po; fit(ctx, '타겟 파일만 Read', mx + 76, my + 130, 30, 800, C.green, 'left', mw - 80); ctx.restore(); }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '토큰 절약', '전체 Read 대신 — 필요한 노드만', 0.2);
  left(ctx, T);
  right(ctx, T);
  footer(ctx, T, '질의 시 필요한 노드만 가져옴 → 토큰 최소화', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
