// scene.js — LlmAndVibeCoding 강연 모션그래픽 01-paradigm (Code-First → Intent-First) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s01-paradigm.js · 합성: node mg/_src/compose.js
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

// 장면 ② — Code-First → Intent-First (원고 근거: 01-opening «패러다임 전환: Code-First → Intent-First» · «개발자 역할의 변화»)
var NAME = 'mg-01-paradigm', DUR = 17;
var TL = { lp: 0.8, l0: 1.2, run: 3.4, lap: 1.8, laps: 2, done: 7.2, rp: 8.0, r0: 8.4, rrun: 10.2, rlen: 1.6, ok: 11.9, role: 12.6, foot: 14.6 };
var NW = 360, NH = 74, NY0 = 290, NSTEP = 112;
var LX = 400, RX = 1220; // 두 열의 가운데
var LEFT = ['개발자 아이디어', '코드 작성', '실행', '디버깅', '완료'];
var RIGHT = ['개발자 의도', '자연어 설명', 'AI 코드 생성', '검토 및 수정', '완료'];
var LOOPX = LX + NW / 2 + 80;
function ny(i) { return NY0 + i * NSTEP; }
function loopPts() { // 코드 작성 → 실행 → 디버깅 → (수정 필요) → 코드 작성
  return [[LX, ny(1)], [LX, ny(2)], [LX, ny(3)], [LOOPX, ny(3)], [LOOPX, ny(1)], [LX + NW / 2, ny(1)]];
}
function column(ctx, T, cx, names, a0, hot, hotColor, hotTint) {
  for (var i = 0; i < names.length; i++) {
    var a = a0 + 0.35 * i, p = es(T, a, a + 0.5);
    if (p <= 0) continue;
    var y = ny(i), h = hot.indexOf(i) >= 0;
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, cx - NW / 2, y - NH / 2 + (1 - p) * 16, NW, NH, { fill: h ? hotTint : C.paper, stroke: h ? hotColor : C.line, lw: h ? 3 : 2, r: 16 });
    fit(ctx, names[i], cx, y + 1 + (1 - p) * 16, 32, 800, C.ink, 'center', NW - 40);
    ctx.restore();
    if (i > 0) arrow(ctx, cx, ny(i - 1) + NH / 2 + 4, cx, y - NH / 2 - 6, es(T, a - 0.15, a + 0.2), C.muted, 4);
  }
}
function leftLoop(ctx, T) {
  var p = es(T, TL.l0 + 1.6, TL.l0 + 2.2);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.setLineDash([12, 9]);
  ctx.beginPath(); ctx.moveTo(LX + NW / 2 + 6, ny(3)); ctx.lineTo(LOOPX, ny(3)); ctx.lineTo(LOOPX, ny(1)); ctx.lineTo(LX + NW / 2 + 22, ny(1)); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = C.red; ctx.beginPath();
  ctx.moveTo(LX + NW / 2 + 6, ny(1)); ctx.lineTo(LX + NW / 2 + 28, ny(1) - 12); ctx.lineTo(LX + NW / 2 + 28, ny(1) + 12); ctx.closePath(); ctx.fill();
  pill(ctx, '수정 필요?', LOOPX, (ny(1) + ny(3)) / 2, 150, 46, C.redTint, C.red, 24, 800);
  ctx.restore();
  // 반복 점 — 두 바퀴 돌고 완료로
  if (T >= TL.run) {
    var u = (T - TL.run) / TL.lap, xy;
    if (u < TL.laps) xy = along(loopPts(), u - Math.floor(u));
    else xy = along([[LX, ny(1)], [LX, ny(2)], [LX, ny(3)], [LX, ny(4)]], seg(T, TL.run + TL.lap * TL.laps, TL.done));
    dot(ctx, xy[0], xy[1], 13, C.red);
    var n = Math.min(TL.laps, Math.floor(u) + 1);
    txt(ctx, '반복 ×' + n, LOOPX, ny(1) - 66, 26, 800, C.red, 'center');
  }
}
function rightRun(ctx, T) {
  if (T < TL.rrun) return;
  var xy = along([[RX, ny(0)], [RX, ny(4)]], seg(T, TL.rrun, TL.rrun + TL.rlen));
  dot(ctx, xy[0], xy[1], 13, C.green);
  stamp(ctx, RX + NW / 2 + 50, ny(4), 30, es(T, TL.ok, TL.ok + 0.5), C.green);
}
function panelHead(ctx, T, a, cx, s, color, tint) {
  var p = es(T, a, a + 0.5);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  pill(ctx, s, cx, 205, 380, 58, tint, color, 30, 800);
  ctx.restore();
}
function role(ctx, T) {
  var rows = [['코드 작성자', '의도 설계자'], ['디버깅 중심', '품질 검토 중심']];
  for (var i = 0; i < 2; i++) {
    var a = TL.role + 0.6 * i, p = es(T, a, a + 0.5);
    if (p <= 0) continue;
    var y = 880 + i * 58;
    ctx.save(); ctx.globalAlpha = p;
    txt(ctx, rows[i][0], LX, y, 30, 700, C.sub, 'center');
    arrow(ctx, LX + 200, y, RX - 200, y, p, C.brand, 5);
    txt(ctx, rows[i][1], RX, y, 30, 800, C.ink, 'center');
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '1장', '패러다임 전환 — Code-First → Intent-First', 0.2);
  // 점은 카드 아래로 지나간다 — 카드 사이 화살표 구간에서만 보임
  leftLoop(ctx, T);
  rightRun(ctx, T);
  panelHead(ctx, T, TL.lp, LX, 'Code-First · 전통적 개발', C.red, C.redTint);
  column(ctx, T, LX, LEFT, TL.l0, [1, 3], C.red, C.redTint);
  panelHead(ctx, T, TL.rp, RX, 'Intent-First · AI 시대 개발', C.green, C.greenTint);
  column(ctx, T, RX, RIGHT, TL.r0, [2], C.green, C.greenTint);
  role(ctx, T);
  footer(ctx, T, '"무엇을" 만들지 설명하면 AI가 "어떻게" 구현', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
