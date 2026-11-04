// scene.js — LlmAndVibeCoding 강연 모션그래픽 03-chatvibe (채팅 방식 vs 바이브 코딩) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s03-chatvibe.js · 합성: node mg/_src/compose.js
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

// 장면 ④ — 채팅 방식 vs 바이브 코딩 (원고 근거: 03.1-chat-limitations «채팅 기반의 주요 한계» · «구체적 사례: React 컴포넌트» · «생산성 차이» / 03.2-vibecoding-start «구체적 사례: React 컴포넌트»)
var NAME = 'mg-03-chatvibe', DUR = 18;
var TL = { lp: 0.8, l0: 1.2, lstep: 0.55, lt: 6.4, rp: 7.2, r0: 7.8, rstep: 0.55, rt: 10.8, ok: 11.0, cmp: 12.4, foot: 14.6 };
var PW = 715, LPX = X0, RPX = X1 - PW, PY = 180, PH = 650;
var LEFT = [
  ['개발자', '"로그인 폼 컴포넌트 만들어줘"'],
  ['개발자', '코드 복사'],
  ['개발자', 'LoginForm.tsx 파일 생성'],
  ['개발자', '붙여넣기'],
  ['오류', 'useState import 안됨'],
  ['개발자', 'import 추가'],
  ['오류', '스타일 컴포넌트 충돌'],
  ['개발자', '다시 ChatGPT — styled-components로 수정'],
  ['', '반복…'],
];
var RIGHT = [
  ['개발자', '"로그인 폼 컴포넌트 만들어줘. 기존 스타일 따라서."'],
  ['AI', 'LoginForm.tsx 파일 생성'],
  ['AI', '필요한 import 자동 추가'],
  ['AI', '프로젝트의 styled-components 패턴 적용'],
  ['', '완료'],
];
var RH = 50, LY0 = PY + 112;
function rows(ctx, T, px, list, a0, step, rowH) {
  for (var i = 0; i < list.length; i++) {
    var a = a0 + step * i, p = es(T, a, a + 0.45);
    if (p <= 0) continue;
    var y = LY0 + i * rowH, who = list[i][0];
    ctx.save(); ctx.globalAlpha = p;
    var tx = px + 40 + (1 - p) * 20;
    if (who === '오류') { crossmark(ctx, tx + 50, y, 18, p, C.red); }
    else if (who === 'AI') pill(ctx, 'AI', tx + 50, y, 90, 36, C.green, '#FFFFFF', 22, 800);
    else if (who === '개발자') pill(ctx, '개발자', tx + 50, y, 90, 36, C.line, C.sub, 20, 800);
    var col = who === '오류' ? C.red : who === '' ? C.muted : C.ink;
    fit(ctx, list[i][1], tx + (who ? 116 : 10), y, 27, who === '' ? 800 : 600, col, 'left', PW - 190);
    if (list[i][1] === '완료') stamp(ctx, tx + 110, y, 22, es(T, TL.ok, TL.ok + 0.5), C.green);
    ctx.restore();
  }
}
function timeBar(ctx, T, px, a, b, frac, color, label, la) {
  var p = es(T, a, b);
  if (p <= 0) return;
  var bx = px + 40, by = PY + PH - 46, bw = (PW - 80) * frac * p;
  ctx.save();
  txt(ctx, '소요 시간', bx, by - 34, 22, 700, C.muted, 'left');
  ctx.fillStyle = C.line; rr(ctx, bx, by - 14, PW - 80, 28, 14); ctx.fill();
  ctx.fillStyle = color; rr(ctx, bx, by - 14, Math.max(28, bw), 28, 14); ctx.fill();
  ctx.globalAlpha = es(T, la, la + 0.5);
  txt(ctx, label, px + PW - 40, by - 34, 28, 800, color, 'right');
  ctx.restore();
}
function panel(ctx, T, a, px, title, color, tint) {
  var p = es(T, a, a + 0.5);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, px, PY, PW, PH, {});
  pill(ctx, title, px + 170, PY + 50, 280, 54, tint, color, 28, 800);
  ctx.restore();
}
function compare(ctx, T) {
  var p = es(T, TL.cmp, TL.cmp + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, X0 + 220, 852 + (1 - p) * 14, CW - 440, 90, { fill: C.tint, stroke: C.brand, lw: 3 });
  fit(ctx, '컴포넌트 생성  15분 → 3분  ·  5배', W / 2, 897 + (1 - p) * 14, 34, 800, C.ink, 'center', CW - 500);
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '3장', '채팅 기반의 한계 → 바이브 코딩', 0.2);
  panel(ctx, T, TL.lp, LPX, 'ChatGPT 방식', C.red, C.redTint);
  rows(ctx, T, LPX, LEFT, TL.l0, TL.lstep, RH);
  timeBar(ctx, T, LPX, TL.l0, TL.lt, 1.0, C.red, '약 15-20분', TL.lt);
  panel(ctx, T, TL.rp, RPX, '바이브 코딩 방식', C.green, C.greenTint);
  rows(ctx, T, RPX, RIGHT, TL.r0, TL.rstep, 80);
  timeBar(ctx, T, RPX, TL.r0, TL.rt, 3 / 20, C.green, '약 2-3분', TL.rt);
  compare(ctx, T);
  footer(ctx, T, '복사-붙여넣기 반복 대신, AI가 개발 환경에서 직접 만들고 고친다', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
