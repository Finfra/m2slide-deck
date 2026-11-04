// scene.js — 항성의 진화 모션그래픽 03-remnant (초기 질량과 최종 잔해) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s03-remnant.js · 합성: node mg/_src/compose.js
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

// 장면 ④ — 초기 질량과 최종 잔해 (원고 근거: «초신성 이후: 중성자별과 블랙홀» 표·인용 + «고질량 별의 최후: 초거성에서 초신성으로»)
var NAME = 'mg-03-remnant', DUR = 17;
var TL = { axis: 1.0, start: 2.8, m1a: 4.6, m1b: 5.6, spoon: 7.0, m2a: 8.8, m2b: 9.8, sum: 11.4, foot: 14.0 };
var AX0 = 170, AX1 = 1750, AY = 830, MMIN = 0.5, MMAX = 40;
var M0 = 1, M1 = 12, M2 = 30; // 표시기가 머무는 자리 (구간 안쪽 아무 곳 — 화면에 수치로 쓰지 않음)
var ZONES = [
  { a: MMIN, b: 8, name: '백색왜성', size: '지구 크기', mass: '초기 질량 태양 8배 미만', col: '#E8F0FF' },
  { a: 8, b: 20, name: '중성자별', size: '도시 크기, 태양보다 무거움', mass: '초기 질량 태양 8~20배', col: '#6FB4FF' },
  { a: 20, b: MMAX, name: '블랙홀', size: '빛조차 탈출 못 함', mass: '초기 질량 태양 20배 이상', col: '#A98BFF' },
];
var PCX = 560, PCY = 470; // 잔해 그림 가운데
function mx(m) { return AX0 + (Math.log(m) - Math.log(MMIN)) / (Math.log(MMAX) - Math.log(MMIN)) * (AX1 - AX0); }
function logLerp(a, b, p) { return Math.exp(lerp(Math.log(a), Math.log(b), p)); }
function mass(T) {
  if (T < TL.m1a) return M0;
  if (T < TL.m2a) return logLerp(M0, M1, seg(T, TL.m1a, TL.m1b));
  return logLerp(M1, M2, seg(T, TL.m2a, TL.m2b));
}
// 경계(8배·20배)를 넘는 시각 — 로그 선형 보간이므로 바로 계산된다
var TX8 = TL.m1a + (TL.m1b - TL.m1a) * Math.log(8 / M0) / Math.log(M1 / M0);
var TX20 = TL.m2a + (TL.m2b - TL.m2a) * Math.log(20 / M1) / Math.log(M2 / M1);
function stage(T) { return T < TX8 ? 0 : T < TX20 ? 1 : 2; }
function axis(ctx, T) {
  var p = es(T, TL.axis, TL.axis + 1.4);
  if (p <= 0) return;
  ctx.save();
  // 구간 띠
  for (var i = 0; i < ZONES.length; i++) {
    var z = ZONES[i], x0 = mx(z.a), x1 = mx(z.b), on = stage(T) === i && T >= TL.start;
    ctx.globalAlpha = p * (on ? 0.5 : 0.22);
    ctx.fillStyle = z.col;
    ctx.fillRect(x0, AY - 40, (x1 - x0) * p, 80);
  }
  ctx.globalAlpha = 1;
  arrow(ctx, AX0, AY + 40, AX1 + 30, AY + 40, p, C.sub, 4);
  var ticks = [[1, '1'], [8, '8'], [20, '20']];
  for (var k = 0; k < ticks.length; k++) {
    var pt = es(T, TL.axis + 0.6 + 0.2 * k, TL.axis + 1.0 + 0.2 * k);
    if (pt <= 0) continue;
    var x = mx(ticks[k][0]);
    ctx.globalAlpha = pt;
    ctx.fillStyle = C.sub; ctx.fillRect(x - 2, AY + 28, 4, 24);
    txt(ctx, ticks[k][1], x, AY + 80, 30, 800, C.ink, 'center');
  }
  ctx.globalAlpha = es(T, TL.axis + 1.0, TL.axis + 1.6);
  txt(ctx, '초기 질량 (태양 질량의 배수)', AX1 + 30, AY + 124, 24, 700, C.muted, 'right');
  // 요약 — 띠마다 이름
  var ps = es(T, TL.sum, TL.sum + 0.8);
  if (ps > 0) {
    for (var j = 0; j < ZONES.length; j++) {
      ctx.globalAlpha = ps;
      fit(ctx, ZONES[j].name, (mx(ZONES[j].a) + mx(ZONES[j].b)) / 2, AY + 1, 30, 800, C.ink, 'center', mx(ZONES[j].b) - mx(ZONES[j].a) - 20);
    }
  }
  ctx.restore();
}
function marker(ctx, T) {
  var p = es(T, TL.start, TL.start + 0.5) * (1 - es(T, TL.sum, TL.sum + 0.6)); // 요약 때는 물러남
  if (p <= 0) return;
  var x = mx(mass(T)), y = AY - 58;
  ctx.save(); ctx.globalAlpha = p;
  ctx.fillStyle = C.brand;
  ctx.beginPath(); ctx.moveTo(x, y + 14); ctx.lineTo(x - 16, y - 12); ctx.lineTo(x + 16, y - 12); ctx.closePath(); ctx.fill();
  ctx.fillRect(x - 2, y + 10, 4, 88);
  ctx.restore();
}
function remnant(ctx, T) {
  var p = es(T, TL.start, TL.start + 0.6);
  if (p <= 0) return;
  var s = stage(T), tc = s === 0 ? TL.start : s === 1 ? TX8 : TX20;
  var q = es(T, tc + 0.15, tc + 0.8); // 새 잔해 나타남
  ctx.save(); ctx.globalAlpha = p * (s === 0 ? 1 : q);
  if (s === 0) {
    glowStar(ctx, PCX, PCY, 34, '#E8F0FF', 0.7);
  } else if (s === 1) {
    // 중성자별 — 작은 푸른 점 + 도는 빛줄기
    var a = T * 2.4;
    ctx.save();
    ctx.translate(PCX, PCY); ctx.rotate(a);
    var g = ctx.createLinearGradient(0, -220, 0, 220);
    g.addColorStop(0, rgba('#6FB4FF', 0)); g.addColorStop(0.5, rgba('#BFE0FF', 0.75)); g.addColorStop(1, rgba('#6FB4FF', 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-34, -220); ctx.lineTo(34, -220); ctx.lineTo(6, 0);
    ctx.lineTo(34, 220); ctx.lineTo(-34, 220); ctx.closePath(); ctx.fill();
    ctx.restore();
    glowStar(ctx, PCX, PCY, 20, '#8CC4FF', 1);
  } else {
    // 블랙홀 — 밝은 고리 + 검은 원
    ctx.save();
    ctx.translate(PCX, PCY);
    ctx.rotate(-0.25);
    for (var k = 0; k < 3; k++) {
      ctx.strokeStyle = rgba(k === 1 ? '#FFC24A' : '#FF7A3A', 0.55 - k * 0.12);
      ctx.lineWidth = 16 - k * 4;
      ctx.beginPath(); ctx.ellipse(0, 0, 200 + k * 18, 56 + k * 6, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
    var gr = ctx.createRadialGradient(PCX, PCY, 80, PCX, PCY, 130);
    gr.addColorStop(0, rgba('#A98BFF', 0.5)); gr.addColorStop(1, rgba('#A98BFF', 0));
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(PCX, PCY, 130, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(PCX, PCY, 88, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  // 초신성 섬광 — 경계를 넘을 때
  var flashes = [TX8, TX20];
  for (var i = 0; i < flashes.length; i++) {
    var f = seg(T, flashes[i] - 0.1, flashes[i] + 0.9);
    if (f <= 0 || f >= 1) continue;
    ctx.save();
    var gf = ctx.createRadialGradient(PCX, PCY, 0, PCX, PCY, 60 + f * 380);
    gf.addColorStop(0, rgba('#FFF4D0', 0.95 * (1 - f))); gf.addColorStop(1, rgba('#FFB04A', 0));
    ctx.fillStyle = gf; ctx.beginPath(); ctx.arc(PCX, PCY, 60 + f * 380, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = Math.sin(f * Math.PI);
    pill(ctx, '초신성', PCX, PCY - 250, 170, 54, C.brand, '#1A1400', 28, 800);
    ctx.restore();
  }
}
function info(ctx, T) {
  var p = es(T, TL.start, TL.start + 0.6);
  if (p <= 0) return;
  var s = stage(T), tc = s === 0 ? TL.start : s === 1 ? TX8 : TX20;
  var q = es(T, tc + 0.15, tc + 0.8), z = ZONES[s];
  var x = 1040, y = 260, w = X1 - x, h = 300;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, x, y, w, h, { fill: C.paper, stroke: rgba(z.col, 0.4 + 0.5 * q), lw: 4 });
  ctx.globalAlpha = p * q;
  txt(ctx, '최종 잔해', x + 44, y + 56, 26, 700, C.muted, 'left');
  fit(ctx, z.name, x + 44, y + 128, 64, 800, z.col, 'left', w - 88);
  fit(ctx, z.size, x + 44, y + 204, 34, 700, C.ink, 'left', w - 88);
  fit(ctx, z.mass, x + 44, y + 256, 26, 600, C.sub, 'left', w - 88);
  ctx.restore();
  var ps = es(T, TL.spoon, TL.spoon + 0.6);
  if (ps > 0) {
    ctx.save(); ctx.globalAlpha = ps;
    pill(ctx, '중성자별 한 찻숟가락 = 수십억 톤', x + w / 2, y + h + 70, w, 64, C.blueTint, C.blue, 30, 800);
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx, T);
  header(ctx, T, '최후', '초기 질량 → 초신성 이후 남는 잔해', 0.2);
  remnant(ctx, T);
  info(ctx, T);
  axis(ctx, T);
  marker(ctx, T);
  footer(ctx, T, '초신성 이후 남는 핵의 운명도 질량이 결정', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
