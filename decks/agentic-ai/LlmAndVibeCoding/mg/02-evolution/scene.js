// scene.js — LlmAndVibeCoding 강연 모션그래픽 02-evolution (LLM 코딩 툴 3세대) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s02-evolution.js · 합성: node mg/_src/compose.js
(function (root) {
// common.js — LlmAndVibeCoding 덱 mg 7개 장면이 공유하는 그리기 도구 (compose.js 가 각 scene.js 에 전문을 싣는다)
// 출발점: AgenticCoding mg/_src/common.js — 같은 default_lec 색 체계 · 3:2(1620×1080) 판형. 카드 점선(o.dash) 추가
// 결정론: Math.random·Date·performance.now 금지 — 모든 값은 시간 T 의 함수다. 글꼴은 시스템 글꼴만.

var W = 1620, H = 1080;
var X0 = 70, X1 = W - 70, CW = X1 - X0; // 본문 좌우 여백 70 — 본문 폭 1480
var C = {
  bg: '#FFFDF6', ink: '#222222', sub: '#4A4A44', muted: '#8A877A', line: '#E3DFD0', paper: '#FFFFFF',
  brand: '#F5C518', brandInk: '#7A6000', tint: '#FFF6D5',
  blue: '#0365C0', blueTint: '#EAF2FB', purple: '#6B3FA0', purpleTint: '#F1EAF8', red: '#C82506', redTint: '#FDECE8', green: '#1F7A4D', greenTint: '#E4F3EA',
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
  if (o.dash) ctx.setLineDash(o.dash);
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

// 선 위를 따라가는 점의 위치 — pts: [[x,y],…], u: 0~1 (길이 비례)
function along(pts, u) {
  var L = [], tot = 0, i;
  for (i = 1; i < pts.length; i++) { var d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  var r = clamp(u, 0, 1) * tot;
  for (i = 0; i < L.length; i++) {
    if (r <= L[i] || i === L.length - 1) { var q = L[i] ? clamp(r / L[i], 0, 1) : 0; return [lerp(pts[i][0], pts[i + 1][0], q), lerp(pts[i][1], pts[i + 1][1], q)]; }
    r -= L[i];
  }
  return pts[pts.length - 1];
}
function dot(ctx, x, y, r, color) {
  ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

// 장면 ③ — LLM 코딩 툴 3세대 (원고 근거: 02-llm-tool-evolution «진화 타임라인» · «세대별 비교 요약»)
var NAME = 'mg-02-evolution', DUR = 18;
var TL = { c0: 1.0, cstep: 1.0, env: 4.6, ctx: 6.0, scope: 7.4, auto: 9.2, prod: 10.8, hi: 12.4, foot: 14.6 };
var GEN = [
  { g: '0세대', name: '채팅 기반', year: '2022-2023', tools: 'ChatGPT · Claude · Bard', env: '웹 브라우저', ctx: '대화 내용', scope: '코드 조각', auto: '없음', av: 0.0, prod: '낮음', color: C.muted },
  { g: '1세대', name: 'IDE 통합', year: '2023-2024', tools: 'Cursor · Cline · Windsurf', env: 'IDE 통합', ctx: '현재 파일', scope: '단일 파일', auto: '부분적', av: 0.5, prod: '중간', color: C.blue },
  { g: '2세대', name: 'CLI 기반', year: '2024-현재', tools: 'Claude Code · Gemini CLI · Codex CLI', env: 'CLI / 서버', ctx: '프로젝트 전체', scope: '멀티파일', auto: '전면적', av: 1.0, prod: '높음', color: C.brandInk },
];
var GW = 440, GGAP = (CW - GW * 3) / 2, GY = 190, GH = 760;
function gx(i) { return X0 + i * (GW + GGAP); }
function row(ctx, T, a, x, y, label, val, color) {
  var p = es(T, a, a + 0.5);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  txt(ctx, label, x + 28, y, 23, 700, C.muted, 'left');
  fit(ctx, val, x + GW - 28, y, 29, 800, color || C.ink, 'right', GW - 190);
  ctx.restore();
}
function scopeIcon(ctx, T, a, i, x, y) {
  var p = es(T, a, a + 0.6);
  if (p <= 0) return;
  var cx = x + GW / 2;
  ctx.save(); ctx.globalAlpha = p;
  if (i === 0) { // 코드 조각 — 짧은 줄 세 개
    card(ctx, cx - 70, y, 140, 86, { r: 12 });
    ctx.fillStyle = C.muted;
    for (var k = 0; k < 3; k++) ctx.fillRect(cx - 48, y + 22 + k * 20, k === 1 ? 70 : 96, 7);
  } else if (i === 1) {
    doc(ctx, cx - 40, y - 6, 80, 98, { rows: 3 });
  } else { // 멀티파일 — 문서가 차례로 늘어남
    for (var j = 0; j < 4; j++) {
      var q = es(T, a + 0.15 * j, a + 0.15 * j + 0.4);
      if (q > 0) doc(ctx, cx - 150 + j * 76, y - 6 + (1 - q) * 20, 72, 92, { rows: 3, alpha: q });
    }
  }
  ctx.restore();
}
function gen(ctx, T, i) {
  var a = TL.c0 + TL.cstep * i, p = es(T, a, a + 0.6);
  if (p <= 0) return;
  var G = GEN[i], x = gx(i), hi = i === 2 ? es(T, TL.hi, TL.hi + 0.6) : 0;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, x, GY + (1 - p) * 30, GW, GH, { fill: hi > 0 ? C.tint : C.paper, stroke: hi > 0 ? C.brand : C.line, lw: 2 + 3 * hi });
  ctx.translate(0, (1 - p) * 30);
  pill(ctx, G.g, x + 80, GY + 50, 120, 50, G.color, '#FFFFFF', 26, 800);
  txt(ctx, G.year, x + GW - 28, GY + 50, 24, 700, C.muted, 'right');
  fit(ctx, G.name, x + 28, GY + 118, 42, 800, C.ink, 'left', GW - 56);
  fit(ctx, G.tools, x + 28, GY + 168, 23, 600, C.sub, 'left', GW - 56);
  ctx.fillStyle = C.line; ctx.fillRect(x + 28, GY + 205, GW - 56, 2);
  ctx.restore();
  row(ctx, T, TL.env + 0.25 * i, x, GY + 250, '환경', G.env);
  row(ctx, T, TL.ctx + 0.25 * i, x, GY + 315, '컨텍스트', G.ctx, i === 2 ? C.brandInk : C.ink);
  row(ctx, T, TL.scope + 0.25 * i, x, GY + 380, '작업 범위', G.scope);
  scopeIcon(ctx, T, TL.scope + 0.25 * i + 0.3, i, x, GY + 420);
  // 자동화 막대
  var pa = es(T, TL.auto + 0.25 * i, TL.auto + 0.25 * i + 0.5);
  if (pa > 0) {
    row(ctx, T, TL.auto + 0.25 * i, x, GY + 570, '자동화', G.auto);
    var bx = x + 28, bw = GW - 56, by = GY + 610, fill = es(T, TL.auto + 0.25 * i + 0.3, TL.auto + 0.25 * i + 1.2);
    ctx.save(); ctx.globalAlpha = pa;
    ctx.fillStyle = C.line; rr(ctx, bx, by, bw, 22, 11); ctx.fill();
    if (G.av > 0) { ctx.fillStyle = G.color; rr(ctx, bx, by, Math.max(22, bw * G.av * fill), 22, 11); ctx.fill(); }
    ctx.restore();
  }
  var pp = es(T, TL.prod + 0.3 * i, TL.prod + 0.3 * i + 0.5);
  if (pp > 0) {
    ctx.save(); ctx.globalAlpha = pp;
    txt(ctx, '생산성', x + 28, GY + 700, 23, 700, C.muted, 'left');
    pill(ctx, G.prod, x + GW - 98, GY + 700, 140, 52, i === 2 ? C.brand : C.line, C.ink, 27, 800);
    ctx.restore();
  }
}
function links(ctx, T) {
  for (var i = 0; i < 2; i++) {
    var a = TL.c0 + TL.cstep * (i + 1), p = es(T, a - 0.3, a + 0.2);
    var x1 = gx(i) + GW + 4, x2 = gx(i + 1) - 4;
    arrow(ctx, x1, GY + 118, x2, GY + 118, p, C.brand, 6);
  }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '2장', 'LLM 코딩 툴의 진화 — 채팅 → IDE → CLI', 0.2);
  for (var i = 0; i < 3; i++) gen(ctx, T, i);
  links(ctx, T);
  footer(ctx, T, '컨텍스트는 대화 → 파일 → 프로젝트 전체, 작업 범위는 코드 조각 → 멀티파일', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
