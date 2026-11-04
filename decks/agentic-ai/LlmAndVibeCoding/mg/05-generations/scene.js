// scene.js — LlmAndVibeCoding 강연 모션그래픽 05-generations (1세대 IDE vs 2세대 CLI) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s05-generations.js · 합성: node mg/_src/compose.js
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

// 장면 ⑥ — 바이브 코딩 1세대 IDE vs 2세대 CLI (원고 근거: 04-vibecoding-generations «세대 구분의 기준» · «세대별 핵심 차이» · «하이브리드 활용» / 04.1 «1세대: 단점» / 04.2 «2세대: 장점»)
var NAME = 'mg-05-generations', DUR = 17;
var TL = { pl: 1.0, pr: 1.8, r0: 3.0, rstep: 0.9, par: 8.8, hyb: 11.2, foot: 13.6 };
var PW = 560, LPX = X0, RPX = X1 - PW, MX = W / 2, PY = 180;
var ROWS = [
  ['실행 환경', 'IDE 내부', '터미널'],
  ['인터페이스', 'GUI', 'CLI'],
  ['메모리 사용', '높음 (8GB+)', '낮음 (<1GB)'],
  ['병렬 작업', '제한적', '무제한'],
  ['실행 위치', '로컬', '서버/클라우드'],
  ['자동화', '제한적', '완전 자동화'],
  ['진입 장벽', '낮음', '중간'],
];
var RY0 = 490, RSTEP = 62;
function ideIcon(ctx, x, y, w, h) {
  card(ctx, x, y, w, h, { r: 12, shadow: 0, stroke: C.blue, lw: 3 });
  ctx.fillStyle = C.blueTint; ctx.fillRect(x + 2, y + 2, w - 4, 24);
  ctx.fillStyle = C.blue;
  for (var k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(x + 18 + k * 18, y + 14, 5, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = C.line; ctx.fillRect(x + 10, y + 36, 40, h - 46); // 파일 탐색기
  ctx.fillStyle = C.muted;
  for (k = 0; k < 4; k++) ctx.fillRect(x + 62, y + 44 + k * 22, (w - 150) * (k % 2 ? 0.6 : 0.9), 7);
  ctx.fillStyle = C.blueTint; ctx.fillRect(x + w - 74, y + 36, 64, h - 46); // 채팅 패널
}
function termIcon(ctx, x, y, w, h, alpha) {
  ctx.save(); ctx.globalAlpha = alpha == null ? 1 : alpha;
  ctx.fillStyle = '#26241F'; rr(ctx, x, y, w, h, 12); ctx.fill();
  fit(ctx, '$ claude', x + 16, y + 28, 20, 700, C.brand, 'left', w - 28, MONO);
  fit(ctx, '> 테스트 코드도 작성해줘', x + 16, y + 60, 16, 600, '#E8E4D6', 'left', w - 28);
  txt(ctx, '✓ npm test', x + 16, y + 90, 17, 600, '#8FD3A8', 'left', MONO);
  ctx.restore();
}
function panel(ctx, T, a, left) {
  var p = es(T, a, a + 0.6);
  if (p <= 0) return;
  var x = left ? LPX : RPX, color = left ? C.blue : C.purple;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, x, PY + (1 - p) * 30, PW, 230, { stroke: color, lw: 3 });
  ctx.translate(0, (1 - p) * 30);
  if (left) ideIcon(ctx, x + 26, PY + 52, 220, 140); else termIcon(ctx, x + 26, PY + 62, 200, 120);
  pill(ctx, left ? '1세대' : '2세대', x + 330, PY + 66, 120, 48, color, '#FFFFFF', 26, 800);
  fit(ctx, left ? 'IDE 기반' : 'CLI 기반', x + 272, PY + 124, 40, 800, C.ink, 'left', PW - 296);
  fit(ctx, left ? 'Cursor · Cline · Windsurf · Continue' : 'Claude Code · Gemini CLI · Codex CLI', x + 272, PY + 176, 21, 600, C.sub, 'left', PW - 296);
  ctx.restore();
}
function rows(ctx, T) {
  for (var i = 0; i < ROWS.length; i++) {
    var a = TL.r0 + TL.rstep * i * 0.75, p = es(T, a, a + 0.4), pl = es(T, a + 0.25, a + 0.65), pr = es(T, a + 0.45, a + 0.85);
    if (p <= 0) continue;
    var y = RY0 + i * RSTEP;
    ctx.save();
    ctx.globalAlpha = p;
    if (i % 2 === 0) { ctx.fillStyle = 'rgba(227,223,208,0.35)'; rr(ctx, X0, y - RSTEP / 2 + 4, CW, RSTEP - 8, 12); ctx.fill(); }
    txt(ctx, ROWS[i][0], MX, y, 26, 700, C.muted, 'center');
    ctx.globalAlpha = pl;
    fit(ctx, ROWS[i][1], LPX + PW / 2, y, 30, 800, C.blue, 'center', PW - 40);
    ctx.globalAlpha = pr;
    fit(ctx, ROWS[i][2], RPX + PW / 2, y, 30, 800, C.purple, 'center', PW - 40);
    ctx.restore();
  }
}
// 병렬 작업 — 2세대 패널에 터미널이 겹겹이 늘어남
function parallel(ctx, T) {
  var p = es(T, TL.par, TL.par + 0.5);
  if (p <= 0) return;
  for (var k = 1; k <= 3; k++) {
    var q = es(T, TL.par + 0.3 * k, TL.par + 0.3 * k + 0.4);
    if (q > 0) termIcon(ctx, RPX + 26 + k * 10, PY + 62 - k * 10, 200, 120, q);
  }
  ctx.save(); ctx.globalAlpha = p;
  pill(ctx, '여러 터미널에서 동시 작업', RPX + PW / 2, PY + 256, 330, 42, C.purpleTint, C.purple, 22, 800);
  pill(ctx, '한 번에 하나의 프로젝트', LPX + PW / 2, PY + 256, 310, 42, C.blueTint, C.blue, 22, 800);
  ctx.restore();
}
function hybrid(ctx, T) {
  var p = es(T, TL.hyb, TL.hyb + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, X0 + 120, 905 + (1 - p) * 12, CW - 240, 64, { fill: C.tint, stroke: C.brand, lw: 3, r: 32 });
  fit(ctx, '하이브리드 — 1세대로 UI 컴포넌트 · 2세대로 빌드 설정과 배포 자동화', W / 2, 937 + (1 - p) * 12, 27, 800, C.ink, 'center', CW - 300);
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '4장', '바이브 코딩 세대 구분 — IDE vs CLI', 0.2);
  panel(ctx, T, TL.pl, true);
  panel(ctx, T, TL.pr, false);
  parallel(ctx, T);
  rows(ctx, T);
  hybrid(ctx, T);
  footer(ctx, T, '실행 환경과 작업 방식이 세대를 가른다', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
