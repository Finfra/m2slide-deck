// scene.js — RamyeonCooking 덱 모션그래픽 01-principles (실패하지 않는 3원칙) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s01-principles.js · 합성: node mg/_src/compose.js
(function (root) {
// common.js — RamyeonCooking 덱 mg 2개 장면이 공유하는 그리기 도구 (compose.js 가 각 scene.js 에 전문을 싣는다)
// 출발점: AgenticCoding mg/_src/common.js — 같은 색 체계. 판형만 16:9(1920×1080)
// 결정론: Math.random·Date·performance.now 금지 — 모든 값은 시간 T 의 함수다. 글꼴은 시스템 글꼴만.

var W = 1920, H = 1080;
var X0 = 70, X1 = W - 70, CW = X1 - X0; // 본문 좌우 여백 70 — 본문 폭 1780
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

// 장면 ② — 실패하지 않는 3원칙 (원고 근거: RamyeonCooking.md «실패하지 않는 3원칙» + «1단계·물 끓이기» + «2단계·스프 먼저» + «3단계·면과 시간»)
var NAME = 'mg-01-principles', DUR = 17;
var TL = { c1: 1.0, water: 1.6, waterEnd: 3.6, c2: 4.6, soup: 5.2, noodle: 6.4, c3: 8.0, timer: 8.6, timerEnd: 11.4, stamp: 12.4, foot: 13.6 };
var GAP = 50, GW = (CW - GAP * 2) / 3, GY = 200, GH = 720;
function gx(i) { return X0 + i * (GW + GAP); }
function frame(ctx, T, i, a, num, name, big, sub) {
  var p = es(T, a, a + 0.6);
  if (p <= 0) return -1;
  var x = gx(i), y = GY + (1 - p) * 50;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, x, y, GW, GH, {});
  pill(ctx, num, x + 40 + 50, y + 60, 100, 52, C.brand, C.ink, 30, 800);
  fit(ctx, name, x + 160, y + 62, 40, 800, C.ink, 'left', GW - 200);
  fit(ctx, big, x + GW / 2, y + 560, 64, 800, C.brandInk, 'center', GW - 60);
  fit(ctx, sub, x + GW / 2, y + 640, 32, 600, C.sub, 'center', GW - 60);
  ctx.restore();
  return p;
}
// 냄비 — 바닥 (cx, by), 폭 w, 높이 h. 물 높이 fill(0~1)
function pot(ctx, cx, by, w, h, fill) {
  var x = cx - w / 2, y = by - h;
  ctx.save();
  if (fill > 0) {
    ctx.fillStyle = rgba(C.blue, 0.35);
    ctx.fillRect(x + 6, by - h * fill, w - 12, h * fill - 6);
  }
  ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, by); ctx.lineTo(x + w, by); ctx.lineTo(x + w, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 50, y + 26); ctx.lineTo(x, y + 26); ctx.moveTo(x + w, y + 26); ctx.lineTo(x + w + 50, y + 26); ctx.stroke();
  ctx.restore();
}
function water(ctx, T) {
  var pf = frame(ctx, T, 0, TL.c1, '01', '물의 양', '550ml', '국물 농도의 기준');
  if (pf < 0) return;
  var cx = gx(0) + GW / 2, by = GY + 440, f = es(T, TL.water, TL.waterEnd);
  ctx.save(); ctx.globalAlpha = pf;
  pot(ctx, cx, by, 300, 240, f * 0.8);
  // 기준선 — 80% 높이
  var my = by - 240 * 0.8;
  ctx.setLineDash([12, 10]); ctx.strokeStyle = C.red; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx - 150, my); ctx.lineTo(cx + 150, my); ctx.stroke(); ctx.setLineDash([]);
  txt(ctx, Math.round(550 * f) + 'ml', cx, by - 100, 46, 800, C.blue, 'center');
  ctx.restore();
}
function order(ctx, T) {
  var pf = frame(ctx, T, 1, TL.c2, '02', '투입 순서', '스프 먼저', '면이 더 쫄깃');
  if (pf < 0) return;
  var cx = gx(1) + GW / 2, by = GY + 440;
  ctx.save(); ctx.globalAlpha = pf;
  pot(ctx, cx, by, 300, 240, 0.8);
  ctx.restore();
  // 스프 → 면 순서로 위에서 냄비로 떨어짐
  var items = [['① 스프', TL.soup, C.red, -60], ['② 면', TL.noodle, C.brand, 60]];
  for (var k = 0; k < items.length; k++) {
    var p = es(T, items[k][1], items[k][1] + 0.9);
    if (p <= 0) continue;
    var y = lerp(GY + 130, by - 120 - k * 70, p);
    ctx.save(); ctx.globalAlpha = pf * Math.min(1, p * 3);
    pill(ctx, items[k][0], cx + items[k][3], y, 160, 60, items[k][2], k === 0 ? '#FFFFFF' : C.ink, 32, 800);
    ctx.restore();
  }
}
function timer(ctx, T) {
  var pf = frame(ctx, T, 2, TL.c3, '03', '시간 엄수', '4분 30초', '타이머 필수');
  if (pf < 0) return;
  var cx = gx(2) + GW / 2, cy = GY + 300, r = 140, f = seg(T, TL.timer, TL.timerEnd);
  var sec = Math.round(270 * f), ang = (sec / 300) * Math.PI * 2; // 한 바퀴 = 5분 (원고 표의 마지막 시점)
  ctx.save(); ctx.globalAlpha = pf;
  ctx.strokeStyle = C.line; ctx.lineWidth = 22;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  if (sec > 0) {
    ctx.strokeStyle = C.brand; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + ang); ctx.stroke();
  }
  // 2분 눈금 — 중간 젓기
  var a2 = -Math.PI / 2 + (120 / 300) * Math.PI * 2;
  ctx.fillStyle = C.sub;
  ctx.beginPath(); ctx.arc(cx + Math.cos(a2) * (r + 34), cy + Math.sin(a2) * (r + 34), 7, 0, Math.PI * 2); ctx.fill();
  txt(ctx, '2분 젓기', cx + Math.cos(a2) * (r + 34) + 18, cy + Math.sin(a2) * (r + 34) + 2, 24, 600, C.sub, 'left');
  var mm = Math.floor(sec / 60), ss = sec % 60;
  txt(ctx, mm + ':' + (ss < 10 ? '0' : '') + ss, cx, cy, 64, 800, C.ink, 'center', MONO);
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '3원칙', '물의 양 · 투입 순서 · 시간 엄수', 0.2);
  water(ctx, T);
  order(ctx, T);
  timer(ctx, T);
  for (var i = 0; i < 3; i++) stamp(ctx, gx(i) + GW - 56, GY + 60, 30, es(T, TL.stamp + 0.3 * i, TL.stamp + 0.3 * i + 0.4), C.green);
  footer(ctx, T, '이 셋만 지키면 언제나 같은 맛', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
