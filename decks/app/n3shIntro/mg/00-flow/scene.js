// scene.js — n3shIntro 모션그래픽 00-flow (n3sh 한눈에) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s00-flow.js · 합성: node decks/app/n3shIntro/mg/_src/compose.js
(function (root) {
// common.js — n3shIntro 덱 mg 장면이 공유하는 그리기 도구 (compose.js 가 각 scene.js 에 전문을 싣는다)
// 출발점: AgenticCoding mg/_src/common.js — 같은 default_lec 색 체계. 판형은 16:9(1920×1080) — _config.yml 에 slide_ratio 없음
// 결정론: Math.random·Date·performance.now 금지 — 모든 값은 시간 T 의 함수다. 글꼴은 시스템 글꼴만.

var W = 1920, H = 1080;
var X0 = 80, X1 = W - 80, CW = X1 - X0; // 본문 좌우 여백 80 — 본문 폭 1760
var C = {
  bg: '#FFFDF6', ink: '#222222', sub: '#4A4A44', muted: '#8A877A', line: '#E3DFD0', paper: '#FFFFFF',
  brand: '#F5C518', brandInk: '#7A6000', tint: '#FFF6D5',
  blue: '#0365C0', blueTint: '#EAF2FB', red: '#C82506', redTint: '#FDECE8', green: '#1F7A4D', greenTint: '#E4F3EA',
};
var KR = '"Apple SD Gothic Neo", "Noto Sans KR", "Noto Sans CJK KR", sans-serif';
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

// 키캡 — 누름 정도 p(0~1) 만큼 내려앉고 색이 찬다. on: 눌렸을 때 채움색
function keycap(ctx, s, cx, cy, size, p, on, font) {
  var d = 10 * p, h = size, w = size;
  ctx.save();
  ctx.fillStyle = '#CFCAB6';
  rr(ctx, cx - w / 2, cy - h / 2 + 10, w, h, 18); ctx.fill(); // 키 옆면
  ctx.fillStyle = p > 0 ? (on || C.brand) : C.paper;
  ctx.globalAlpha = 1;
  rr(ctx, cx - w / 2, cy - h / 2 + d, w, h, 18); ctx.fill();
  if (p > 0 && p < 1) { // 누르는 중엔 흰 면 위로 색이 차오름
    ctx.fillStyle = C.paper; ctx.globalAlpha = 1 - p;
    rr(ctx, cx - w / 2, cy - h / 2 + d, w, h, 18); ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
  rr(ctx, cx - w / 2, cy - h / 2 + d, w, h, 18); ctx.stroke();
  fit(ctx, s, cx, cy + d + 2, Math.round(size * 0.46), 800, C.ink, 'center', w - 16, font);
  ctx.restore();
}

// 장면 ① — n3sh 한눈에 (원고 근거: n3shIntro.ppt.md 장 제목 4개 «n3sh 란 무엇인가»·«작동 원리»·«학습 커리큘럼»·«설치와 생태계» + «정리 — n3sh 한 장 요약»)
var NAME = 'mg-00-flow', DUR = 15;
var TL = { card0: 1.0, step: 1.8, stamp: 9.0, foot: 11.2 };
var CARDS = [
  ['1 무엇', 'n3sh 란 무엇인가', ['자모 2개 →', '완성형 한 글자'], ['254 규칙', '조사·어미는 뒤 공백까지']],
  ['2 원리', '작동 원리', ['모아치기 +', '모디파이어 층'], ['세벌식 390 배열 전제', 'macOS + Karabiner-Elements']],
  ['3 학습', '학습 커리큘럼', ['예비 +', '6단계 드릴'], ['2단계(조사·어미)까지만', '익혀도 이득']],
  ['4 설치', '설치와 생태계', ['3분 설치'], ['pqrs 카탈로그 import', 'md 정본 → JSON 생성']],
];
var GAP = 64, CWD = (CW - GAP * 3) / 4, CY = 230, CH = 640;
function cardX(i) { return X0 + i * (CWD + GAP); }
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, 'n3sh', '무엇 → 원리 → 학습 → 설치', 0.2);
  for (var i = 0; i < CARDS.length; i++) {
    var a = TL.card0 + TL.step * i, p = es(T, a, a + 0.7);
    if (p <= 0) continue;
    var x = cardX(i), y = CY + (1 - p) * 50, c = CARDS[i];
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, x, y, CWD, CH, {});
    pill(ctx, c[0], x + 40 + 85, y + 66, 170, 58, C.brand, C.ink, 32, 800);
    fit(ctx, c[1], x + 40, y + 150, 30, 700, C.muted, 'left', CWD - 80);
    ctx.fillStyle = C.line; ctx.fillRect(x + 40, y + 190, CWD - 80, 3);
    ctx.globalAlpha = p * es(T, a + 0.5, a + 1.0);
    for (var k = 0; k < c[2].length; k++) fit(ctx, c[2][k], x + 40, y + 260 + k * 62, 48, 800, C.ink, 'left', CWD - 80);
    ctx.globalAlpha = p * es(T, a + 0.9, a + 1.4);
    for (k = 0; k < c[3].length; k++) fit(ctx, c[3][k], x + 40, y + 430 + k * 50, 29, 600, C.sub, 'left', CWD - 80);
    ctx.restore();
    // 다음 장으로 넘어가는 화살표 — 칸 사이 틈
    if (i < CARDS.length - 1) arrow(ctx, x + CWD + 10, CY + CH / 2, x + CWD + GAP - 10, CY + CH / 2, es(T, a + 1.2, a + 1.7), C.brandInk, 6);
    stamp(ctx, x + CWD - 64, CY + CH - 64, 30, es(T, TL.stamp + 0.3 * i, TL.stamp + 0.3 * i + 0.4), C.green);
  }
  footer(ctx, T, 'pqrs 카탈로그 import → 2단계까지 드릴 → 몸에 붙는 만큼 확장', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
