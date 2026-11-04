// common.js — StellarEvolution 덱 mg 4개 장면이 공유하는 그리기 도구 (compose.js 가 각 scene.js 에 전문을 싣는다)
// 출발점: AgenticCoding mg/_src/common.js — 같은 함수 구성. 판형 16:9(1920×1080) · default_dark 에 맞춘 어두운 색 체계
// 결정론: Math.random·Date·performance.now 금지 — 모든 값은 시간 T 의 함수다. 글꼴은 시스템 글꼴만.

var W = 1920, H = 1080;
var X0 = 90, X1 = W - 90, CW = X1 - X0; // 본문 좌우 여백 90 — 본문 폭 1740
var C = {
  bg: '#070A1C', bg2: '#141238', ink: '#F2F4FF', sub: '#B9C0E0', muted: '#7C84A8', line: '#2E3466', paper: '#121736',
  brand: '#FFC24A', brandInk: '#FFD98A', tint: '#2A2440',
  blue: '#6FB4FF', blueTint: '#132A52', red: '#FF6B4A', redTint: '#3A1A22', green: '#5FE0A8', greenTint: '#123A30',
  purple: '#A98BFF', purpleTint: '#241B4A', white: '#FFFFFF',
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
// 고정 해시 — 같은 i 면 늘 같은 0~1 값 (난수 대용)
function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

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
  ctx.globalAlpha = ctx.globalAlpha * (o.alpha == null ? 1 : o.alpha);
  if (o.shadow !== 0) {
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
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
// 둥근 알약 꼬리표 — 가운데 정렬 글자
function pill(ctx, s, cx, cy, w, h, fill, color, size, weight) {
  ctx.fillStyle = fill;
  rr(ctx, cx - w / 2, cy - h / 2, w, h, h / 2);
  ctx.fill();
  fit(ctx, s, cx, cy + 1, size, weight || 800, color, 'center', w - 24);
}
// 빛나는 별 — 중심 cx,cy 반지름 r, 색 color, 후광 세기 g(0~1)
function glowStar(ctx, cx, cy, r, color, g) {
  if (r <= 0) return;
  ctx.save();
  var gr = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * (2.2 + g));
  gr.addColorStop(0, rgba(color, 0.55 * g));
  gr.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.arc(cx, cy, r * (2.2 + g), 0, Math.PI * 2); ctx.fill();
  var core = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, r * 0.1, cx, cy, r);
  core.addColorStop(0, '#FFFFFF');
  core.addColorStop(0.35, color);
  core.addColorStop(1, rgba(color, 0.85));
  ctx.fillStyle = core;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ── 공통 틀: 배경(별밭) · 머리(칩 + 제목) · 아래 한 줄 ─────────────────────────
function backdrop(ctx, T) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.shadowColor = 'transparent';
  var g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, C.bg);
  g.addColorStop(1, C.bg2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // 배경 별 140개 — 위치는 고정 해시, 반짝임은 T 의 함수
  for (var i = 0; i < 140; i++) {
    var x = hash(i) * W, y = hash(i + 500) * H, s = 0.8 + hash(i + 900) * 1.8;
    var a = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(T * (0.8 + hash(i + 1300) * 1.6) + i));
    ctx.fillStyle = 'rgba(220,228,255,' + a.toFixed(3) + ')';
    ctx.fillRect(x, y, s, s);
  }
}
function header(ctx, T, chip, title, a) {
  var p = es(T, a, a + 0.6);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = p;
  pill(ctx, chip, X0 + 110, 96, 220, 64, C.brand, '#1A1400', 34, 800);
  fit(ctx, title, X0 + 250, 97 + (1 - p) * 10, 54, 800, C.ink, 'left', X1 - X0 - 250);
  ctx.fillStyle = C.brand;
  ctx.fillRect(X0, 154, CW * p, 5);
  ctx.restore();
}
function footer(ctx, T, s, a, color) {
  var p = es(T, a, a + 0.8);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = p;
  fit(ctx, s, W / 2, 1010 + (1 - p) * 12, 40, 700, color || C.brandInk, 'center', CW);
  ctx.restore();
}
