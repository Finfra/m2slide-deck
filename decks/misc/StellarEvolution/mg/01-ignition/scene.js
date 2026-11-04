// scene.js — 항성의 진화 모션그래픽 01-ignition (점화와 힘의 균형) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s01-ignition.js · 합성: node mg/_src/compose.js
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

// 장면 ② — 점화와 힘의 균형 (원고 근거: «별의 탄생: 성운에서 원시별로» + «원시별에서 주계열성으로»)
var NAME = 'mg-01-ignition', DUR = 16;
var TL = { cloud: 1.0, shrink0: 1.6, shrink1: 5.6, proto: 5.6, ignite: 6.6, push: 8.0, ms: 10.2, foot: 13.0 };
var SX = 620, SY = 545;                    // 별 가운데
var PX = 1120, PW = X1 - PX;               // 오른쪽 판
var STEPS = [
  ['온도 상승', '중심 약 1000만 K', TL.shrink0],
  ['수소 점화', '핵융합 시작', TL.ignite],
  ['힘의 균형', '복사압 = 중력', TL.push],
  ['주계열성', '안정 상태', TL.ms],
];
var NP = 110;
function cloud(ctx, T) {
  var pa = es(T, TL.cloud, TL.cloud + 0.8) * (1 - es(T, TL.proto, TL.ignite));
  if (pa <= 0) return;
  var k = lerp(1, 0.14, es(T, TL.shrink0, TL.shrink1));
  ctx.save();
  for (var i = 0; i < NP; i++) {
    var r0 = 90 + hash(i + 3) * 330, a0 = hash(i + 41) * Math.PI * 2;
    var a = a0 + (1 - k) * (0.6 + hash(i + 77)) + 0.05 * Math.sin(T + i);
    var r = r0 * k;
    var x = SX + r * Math.cos(a), y = SY + r * Math.sin(a) * 0.85;
    var heat = 1 - k;
    ctx.fillStyle = heat > 0.6 ? rgba('#FF9A4A', 0.8 * pa) : rgba('#9C8CFF', (0.35 + 0.4 * hash(i + 9)) * pa);
    ctx.beginPath(); ctx.arc(x, y, 3 + hash(i + 13) * 5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
function star(ctx, T) {
  // 원시별: 어두운 주황 → 점화 후 노란 주계열성
  var pp = es(T, TL.shrink1 - 1.0, TL.proto + 0.4), pi = es(T, TL.ignite, TL.ignite + 0.8);
  if (pp > 0) {
    var col = pi > 0.5 ? '#FFD35A' : '#FF7A3A';
    var r = lerp(56, 92, pi) * (1 + 0.02 * Math.sin(T * 3));
    ctx.save(); ctx.globalAlpha = pp;
    glowStar(ctx, SX, SY, r, col, lerp(0.25, 1, pi));
    ctx.restore();
  }
  // 점화 섬광 — 퍼지는 고리
  var f = seg(T, TL.ignite, TL.ignite + 1.0);
  if (f > 0 && f < 1) {
    ctx.save();
    ctx.strokeStyle = rgba('#FFF2C0', 1 - f); ctx.lineWidth = 10 * (1 - f) + 2;
    ctx.beginPath(); ctx.arc(SX, SY, 92 + f * 300, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  var pl = es(T, TL.proto, TL.proto + 0.5) * (1 - es(T, TL.ignite, TL.ignite + 0.4));
  if (pl > 0) {
    ctx.save(); ctx.globalAlpha = pl;
    pill(ctx, '원시별', SX, SY + 140, 160, 50, C.redTint, C.red, 26, 800);
    ctx.restore();
  }
}
// 힘 화살표 — 중력(안쪽, 파랑) · 복사압(바깥쪽, 주황). 같은 길이 = 균형
function forces(ctx, T) {
  var pg = es(T, TL.shrink0, TL.shrink0 + 0.8), pr = es(T, TL.push, TL.push + 1.0);
  for (var i = 0; i < 8; i++) {
    var a = i * Math.PI / 4, b = a + Math.PI / 8;
    if (pg > 0) {
      ctx.save(); ctx.globalAlpha = pg;
      arrow(ctx, SX + 300 * Math.cos(a), SY + 300 * Math.sin(a), SX + 190 * Math.cos(a), SY + 190 * Math.sin(a), pg, C.blue, 6);
      ctx.restore();
    }
    if (pr > 0) arrow(ctx, SX + 190 * Math.cos(b), SY + 190 * Math.sin(b), SX + 300 * Math.cos(b), SY + 300 * Math.sin(b), pr, '#FF9A4A', 6);
  }
  if (pg > 0) {
    ctx.save(); ctx.globalAlpha = pg;
    pill(ctx, '중력 ↘ 안으로', SX - 330, SY - 300, 230, 52, C.blueTint, C.blue, 26, 800);
    ctx.restore();
  }
  if (pr > 0) {
    ctx.save(); ctx.globalAlpha = pr;
    pill(ctx, '복사압 ↗ 바깥으로', SX + 310, SY - 300, 260, 52, C.redTint, '#FF9A4A', 26, 800);
    ctx.restore();
  }
  var pb = es(T, TL.push + 1.0, TL.push + 1.6);
  if (pb > 0) {
    ctx.save(); ctx.globalAlpha = pb;
    pill(ctx, '복사압 = 중력', SX, SY + 355, 300, 56, C.brand, '#1A1400', 32, 800);
    ctx.restore();
  }
}
function panel(ctx, T) {
  var p = es(T, TL.cloud, TL.cloud + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  // 중심 온도 막대
  txt(ctx, '중심 온도', PX, 230, 28, 700, C.sub, 'left');
  var by = 260, bh = 34;
  card(ctx, PX, by, PW, bh, { fill: C.paper, stroke: C.line, r: 17, shadow: 0 });
  var q = es(T, TL.shrink0, TL.ignite);
  if (q > 0) {
    var g = ctx.createLinearGradient(PX, 0, PX + PW, 0);
    g.addColorStop(0, '#6B5BD0'); g.addColorStop(0.6, '#FF7A3A'); g.addColorStop(1, '#FFE070');
    ctx.fillStyle = g; rr(ctx, PX, by, Math.max(bh, PW * q), bh, 17); ctx.fill();
  }
  var qm = es(T, TL.ignite - 0.4, TL.ignite + 0.2);
  ctx.globalAlpha = p * (0.35 + 0.65 * qm);
  txt(ctx, '약 1000만 K → 점화', PX + PW, by + bh + 30, 26, 800, C.brandInk, 'right');
  ctx.globalAlpha = p;
  // 단계 칩
  for (var i = 0; i < STEPS.length; i++) {
    var y = 400 + i * 108, on = T >= STEPS[i][2], cur = on && (i === STEPS.length - 1 || T < STEPS[i + 1][2]);
    var pa = es(T, STEPS[i][2], STEPS[i][2] + 0.4);
    card(ctx, PX, y, PW, 88, { fill: cur ? C.tint : C.paper, stroke: on ? rgba(C.brand, 0.4 + 0.6 * pa) : C.line, lw: cur ? 4 : 2, r: 16 });
    ctx.fillStyle = on ? C.brand : C.line;
    ctx.beginPath(); ctx.arc(PX + 44, y + 44, 18, 0, Math.PI * 2); ctx.fill();
    txt(ctx, String(i + 1), PX + 44, y + 45, 22, 800, on ? '#1A1400' : C.muted, 'center');
    fit(ctx, STEPS[i][0], PX + 84, y + 44, 32, 800, on ? C.ink : C.muted, 'left', 230);
    fit(ctx, STEPS[i][1], PX + PW - 28, y + 44, 28, 600, on ? C.sub : C.muted, 'right', PW - 360);
  }
  ctx.restore();
  var ps = es(T, TL.ms + 0.4, TL.ms + 1.0);
  if (ps > 0) {
    ctx.save(); ctx.globalAlpha = ps;
    fit(ctx, '우리 태양도 지금 이 단계 (약 46억 년째)', PX + PW / 2, 870, 30, 700, C.brandInk, 'center', PW);
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx, T);
  header(ctx, T, '점화', '원시별 → 주계열성 — 수소 점화와 힘의 균형', 0.2);
  cloud(ctx, T);
  forces(ctx, T);
  star(ctx, T);
  panel(ctx, T);
  footer(ctx, T, '바깥으로 미는 복사압 = 안으로 당기는 중력 → 안정된 주계열성', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
