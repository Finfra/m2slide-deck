// scene.js — 항성의 진화 모션그래픽 00-lifecycle (별의 일생 전체 흐름) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s00-lifecycle.js · 합성: node mg/_src/compose.js
(function (root) {
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

// 장면 ① — 별의 일생 전체 흐름 (원고 근거: «정리: 별의 일생, 질량이 쓰는 각본» + «질량이 운명을 가른다» + «행성상성운과 백색왜성» + «항성 핵합성»)
var NAME = 'mg-00-lifecycle', DUR = 17;
var TL = { left0: 1.0, lstep: 0.8, fork: 3.8, up0: 4.8, low0: 8.0, step: 0.8, upTag: 7.4, lowTag: 10.6, back: 11.6, foot: 14.4 };
var MY = 560, UY = 360, LY = 760;           // 가운데 · 위 · 아래 줄 높이
var LW = 190, NWD = 240, NH = 130;          // 왼쪽 마디 폭 · 갈래 마디 폭 · 높이
var LEFT = [
  [190, '성운', '가스·먼지 구름', '#8C7BFF'],
  [410, '원시별', '중력 수축', '#FF8A4A'],
  [630, '주계열성', '수소 → 헬륨', '#FFD35A'],
];
var GX = [1080, 1370, 1660];
var UP = [['적색거성', '외피 팽창', '#FF6B4A'], ['행성상성운', '외피 방출', '#5FD0E0'], ['백색왜성', '뜨거운 잔핵', '#E8F0FF']];
var LOW = [['초거성', '철(Fe)까지 융합', '#FF9A4A'], ['초신성', '대폭발', '#FFF0B0'], ['중성자별 / 블랙홀', '질량이 결정', '#A98BFF']];
var FX = 835; // 분기 표지 가운데
function node(ctx, T, a, cx, cy, w, name, sub, color) {
  var p = es(T, a, a + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  var y = cy + (1 - p) * 30;
  card(ctx, cx - w / 2, y - NH / 2, w, NH, { fill: C.paper, stroke: rgba(color, 0.7), lw: 3 });
  glowStar(ctx, cx, y - 30, 13, color, 0.6 + 0.2 * Math.sin(T * 2 + cx));
  fit(ctx, name, cx, y + 14, 32, 800, C.ink, 'center', w - 24);
  fit(ctx, sub, cx, y + 46, 22, 600, C.sub, 'center', w - 24);
  ctx.restore();
}
// 분기 곡선 — 표지 오른쪽에서 갈래 첫 마디 왼쪽으로, p 만큼
function forkCurve(ctx, p, ty, color) {
  if (p <= 0) return;
  var x0 = FX + 75, y0 = MY, x1 = GX[0] - NWD / 2 - 6, n = 30;
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath();
  for (var i = 0; i <= n * p; i++) {
    var s = i / n, u = 1 - s;
    var x = u * u * u * x0 + 3 * u * u * s * (x0 + 40) + 3 * u * s * s * (x1 - 40) + s * s * s * x1;
    var y = u * u * u * y0 + 3 * u * u * s * y0 + 3 * u * s * s * ty + s * s * s * ty;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}
function chain(ctx, T) {
  for (var i = 0; i < LEFT.length; i++) {
    var a = TL.left0 + TL.lstep * i;
    node(ctx, T, a, LEFT[i][0], MY, LW, LEFT[i][1], LEFT[i][2], LEFT[i][3]);
    if (i > 0) arrow(ctx, LEFT[i - 1][0] + LW / 2 + 4, MY, LEFT[i][0] - LW / 2 - 4, MY, es(T, a - 0.3, a + 0.2), C.muted, 4);
  }
  // 분기 표지 — 태양 질량 약 8배
  var pf = es(T, TL.fork, TL.fork + 0.6);
  arrow(ctx, LEFT[2][0] + LW / 2 + 4, MY, FX - 80, MY, es(T, TL.fork - 0.3, TL.fork + 0.2), C.muted, 4);
  if (pf > 0) {
    ctx.save(); ctx.globalAlpha = pf;
    card(ctx, FX - 75, MY - 52, 150, 104, { fill: C.tint, stroke: C.brand, lw: 3, r: 18 });
    txt(ctx, '태양 질량', FX, MY - 18, 24, 700, C.brandInk, 'center');
    txt(ctx, '약 8배', FX, MY + 20, 34, 800, C.brand, 'center');
    ctx.restore();
  }
  forkCurve(ctx, es(T, TL.up0 - 0.6, TL.up0), UY, C.sub);
  forkCurve(ctx, es(T, TL.low0 - 0.6, TL.low0), LY, C.sub);
  for (var k = 0; k < 3; k++) {
    var au = TL.up0 + TL.step * k, al = TL.low0 + TL.step * k;
    node(ctx, T, au, GX[k], UY, NWD, UP[k][0], UP[k][1], UP[k][2]);
    node(ctx, T, al, GX[k], LY, NWD, LOW[k][0], LOW[k][1], LOW[k][2]);
    if (k > 0) {
      arrow(ctx, GX[k - 1] + NWD / 2 + 4, UY, GX[k] - NWD / 2 - 4, UY, es(T, au - 0.3, au + 0.2), C.muted, 4);
      arrow(ctx, GX[k - 1] + NWD / 2 + 4, LY, GX[k] - NWD / 2 - 4, LY, es(T, al - 0.3, al + 0.2), C.muted, 4);
    }
  }
  // 갈래 표지
  var pu = es(T, TL.upTag, TL.upTag + 0.6), pl = es(T, TL.lowTag, TL.lowTag + 0.6);
  if (pu > 0) {
    ctx.save(); ctx.globalAlpha = pu;
    pill(ctx, '8배 미만 · 저·중질량 → 조용한 최후', GX[1], UY - 112, 560, 54, C.blueTint, C.blue, 26, 800);
    ctx.restore();
  }
  if (pl > 0) {
    ctx.save(); ctx.globalAlpha = pl;
    pill(ctx, '8배 이상 · 고질량 → 격렬한 최후', GX[1], LY + 108, 560, 54, C.redTint, C.red, 26, 800);
    ctx.restore();
  }
}
// 되돌림 — 두 갈래 끝에서 오른쪽으로 모여, 아래를 돌아 성운으로
function back(ctx, T) {
  var p = es(T, TL.back, TL.back + 1.4);
  if (p <= 0) return;
  var xe = GX[2] + NWD / 2, xr = 1830, yb = 930, xn = LEFT[0][0];
  // 경로 길이 기준으로 p 만큼 — 위 갈래 꼬리 → 오른쪽 세로 → 아래 → 성운
  var path = [[xe, UY], [xr, UY], [xr, yb], [xn, yb], [xn, MY + NH / 2 + 8]];
  var len = 0, L = [];
  for (var i = 1; i < path.length; i++) { var d = Math.abs(path[i][0] - path[i - 1][0]) + Math.abs(path[i][1] - path[i - 1][1]); L.push(d); len += d; }
  var want = len * p;
  ctx.save();
  ctx.strokeStyle = C.green; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.setLineDash([14, 10]);
  ctx.beginPath(); ctx.moveTo(path[0][0], path[0][1]);
  var tipX = path[0][0], tipY = path[0][1];
  for (var j = 1; j < path.length && want > 0; j++) {
    var q = Math.min(1, want / L[j - 1]);
    tipX = lerp(path[j - 1][0], path[j][0], q); tipY = lerp(path[j - 1][1], path[j][1], q);
    ctx.lineTo(tipX, tipY);
    want -= L[j - 1];
  }
  // 아래 갈래 꼬리
  ctx.moveTo(xe, LY); ctx.lineTo(lerp(xe, xr, Math.min(1, p * 4)), LY);
  ctx.stroke();
  ctx.setLineDash([]);
  if (p > 0.97) arrow(ctx, xn, MY + NH / 2 + 60, xn, MY + NH / 2 + 8, 1, C.green, 5);
  ctx.restore();
  var pt = es(T, TL.back + 0.8, TL.back + 1.4);
  if (pt > 0) {
    ctx.save(); ctx.globalAlpha = pt;
    pill(ctx, '원소를 우주로 환원 → 새 별·행성·생명', 1010, yb, 640, 56, C.greenTint, C.green, 28, 800);
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx, T);
  header(ctx, T, '별의 일생', '성운에서 최후까지 — 질량이 가르는 두 갈래', 0.2);
  back(ctx, T);
  chain(ctx, T);
  footer(ctx, T, '모든 갈림길의 열쇠는 초기 질량 하나', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
