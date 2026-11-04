// scene.js — graphify 덱 모션그래픽 00-flow (덱 전체 흐름) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s00-flow.js · 합성: node mg/_src/compose.js
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

// 장면 ① — 덱 전체 흐름 (원고 근거: graphify.md 장 제목 9개 + 각 장 첫 슬라이드 요점 + «graphify가 해결하는 문제»)
var NAME = 'mg-00-flow', DUR = 14;
var TL = { line0: 1.0, step: 0.9, key: 9.4, foot: 11.0 };
var STOPS = [
  ['왜 graphify인가', '토큰 폭탄 · 의존성 미로'],
  ['graphify란', '정의 · 3대 산출물 · edge'],
  ['다른 도구와의 관계', 'Obsidian · llmwiki'],
  ['설치 & 첫 빌드', 'pipx install graphifyy'],
  ['토큰 절약', '직접 Read 금지 · 발췌만'],
  ['CLI 실전', 'query / path / explain'],
  ['graphify + llmwiki', '같은 저장소, 두 계층'],
  ['실전 워크플로', '빌드 → 질의 → 타겟 Read'],
  ['정리 & 다음 단계', '/graphify . 바로 적용'],
];
var LW = 330, LH = 112, LY = 580, SX0 = X0 + LW / 2, SDX = (CW - LW) / 8;
function stopX(i) { return SX0 + i * SDX; }
function stopT(i) { return TL.line0 + 0.2 + TL.step * i; }
// 선 끝(점 위치) — 정거장이 나타나는 시각에 맞춰 이동, 마지막 정거장에서 멈춤
function headX(T) {
  var u = clamp((T - TL.line0 - 0.2) / (TL.step * 8), 0, 1);
  return lerp(SX0 - 60, stopX(8), es(T, TL.line0, TL.line0 + 0.2) > 0 ? u : 0);
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '흐름', '15분 입문 — 문제에서 실전 워크플로까지', 0.2);
  // 가로 선 + 달리는 점
  var p0 = es(T, TL.line0, TL.line0 + 0.3);
  if (p0 > 0) {
    var hx = headX(T);
    ctx.save();
    ctx.globalAlpha = p0;
    ctx.strokeStyle = C.line; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(SX0 - 60, LY); ctx.lineTo(stopX(8) + 60, LY); ctx.stroke();
    ctx.strokeStyle = C.brand;
    ctx.beginPath(); ctx.moveTo(SX0 - 60, LY); ctx.lineTo(hx, LY); ctx.stroke();
    ctx.fillStyle = C.brandInk;
    ctx.beginPath(); ctx.arc(hx, LY, 13, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  var pk = es(T, TL.key, TL.key + 0.6);
  for (var i = 0; i < 9; i++) {
    var a = stopT(i), p = es(T, a, a + 0.5);
    if (p <= 0) continue;
    var x = stopX(i), up = i % 2 === 0, key = i === 4 || i === 5;
    var cy = up ? LY - 150 : LY + 150, cardY = cy - LH / 2;
    var hi = key ? pk : 0;
    // 정거장 원
    ctx.save();
    ctx.globalAlpha = p;
    ctx.fillStyle = hi > 0 ? C.brand : C.ink;
    ctx.beginPath(); ctx.arc(x, LY, lerp(10, 30, p), 0, Math.PI * 2); ctx.fill();
    txt(ctx, String(i + 1), x, LY + 1, 28, 800, hi > 0 ? C.ink : '#FFFFFF', 'center');
    // 원과 카드 잇는 짧은 선
    var pl = es(T, a + 0.2, a + 0.5);
    ctx.strokeStyle = C.muted; ctx.lineWidth = 3;
    ctx.beginPath();
    if (up) { ctx.moveTo(x, LY - 34); ctx.lineTo(x, LY - 34 - (LY - 34 - (cardY + LH)) * pl); }
    else { ctx.moveTo(x, LY + 34); ctx.lineTo(x, LY + 34 + (cardY - LY - 34) * pl); }
    ctx.stroke();
    ctx.restore();
    // 장 카드
    var pc = es(T, a + 0.3, a + 0.8);
    if (pc <= 0) continue;
    var off = (1 - pc) * (up ? 16 : -16);
    card(ctx, x - LW / 2, cardY + off, LW, LH, { alpha: pc, fill: hi > 0 ? C.tint : C.paper, stroke: hi > 0 ? C.brand : C.line, lw: 2 + 3 * hi, r: 16 });
    ctx.save();
    ctx.globalAlpha = pc;
    fit(ctx, STOPS[i][0], x, cardY + off + 38, 32, 800, C.ink, 'center', LW - 36);
    ctx.globalAlpha = es(T, a + 0.6, a + 1.0);
    fit(ctx, STOPS[i][1], x, cardY + off + 80, 25, 600, C.sub, 'center', LW - 36);
    ctx.restore();
  }
  // «핵심» 표지 — 5·6 정거장 사이 아래(선 바로 밑)
  if (pk > 0) {
    var kx = (stopX(4) + stopX(5)) / 2;
    ctx.save(); ctx.globalAlpha = pk;
    pill(ctx, '핵심', kx, LY + 52 + (1 - pk) * 10, 100, 44, C.brandInk, '#FFFFFF', 24, 800);
    ctx.restore();
  }
  footer(ctx, T, '한 번 빌드한 그래프에서 필요한 노드만 질의', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
