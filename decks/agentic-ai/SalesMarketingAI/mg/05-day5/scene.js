// scene.js — 영업·마케팅 AI 강의 모션그래픽 05-day5 (5일차 꾸미기) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s05-day5.js · 합성: node mg/_src/compose.js
(function (root) {
// common.js — 영업·마케팅 6일 덱 mg 7개 장면이 공유하는 그리기 도구 (compose.js 가 각 scene.js 에 전문을 싣는다)
// 출발점: DesignRndAI(설계·R&D 덱) mg/_src/common.js — 같은 default_lec 색 체계(lec-tokens.css)라 상수를 그대로 쓴다
// 결정론: Math.random·Date·performance.now 금지 — 모든 값은 시간 T 의 함수다. 글꼴은 시스템 글꼴만.

var W = 1440, H = 1080;
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
  ctx.globalAlpha = ctx.globalAlpha * (o.alpha == null ? 1 : o.alpha);  // 바깥 페이드와 곱함
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
  ctx.globalAlpha = ctx.globalAlpha * (o.alpha == null ? 1 : o.alpha);
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

// ── 공통 틀: 머리(일차 칩 + 제목) · 아래 한 줄 ───────────────────────────────
function header(ctx, T, chip, title, a) {
  var p = es(T, a, a + 0.6);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = p;
  ctx.fillStyle = C.brand;
  rr(ctx, 70, 62, 178, 62, 31);
  ctx.fill();
  txt(ctx, chip, 159, 93, 34, 800, C.ink, 'center');
  txt(ctx, title, 276, 94 + (1 - p) * 10, 52, 800, C.ink, 'left');
  ctx.fillStyle = C.brand;
  ctx.fillRect(70, 148, 1300 * p, 6);
  ctx.restore();
}
function footer(ctx, T, s, a, color) {
  var p = es(T, a, a + 0.8);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = p;
  txt(ctx, s, 720, 1010 + (1 - p) * 12, 38, 700, color || C.brandInk, 'center');
  ctx.restore();
}
function backdrop(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
}

// ── 영업·마케팅 덱 추가 도구 ────────────────────────────────────────────────
// 알약 라벨 — 가운데 정렬, 폭은 글자에 맞춰 잰다
function pill(ctx, s, cx, cy, size, fill, color, padX) {
  ctx.font = '800 ' + size + 'px ' + KR;
  var w = ctx.measureText(s).width + (padX == null ? 36 : padX) * 2, h = size * 1.75;
  ctx.fillStyle = fill;
  rr(ctx, cx - w / 2, cy - h / 2, w, h, h / 2);
  ctx.fill();
  txt(ctx, s, cx, cy + 1, size, 800, color, 'center');
  return w;
}
// 말풍선 — 아래 꼬리
function bubble(ctx, x, y, w, h, o) {
  o = o || {};
  card(ctx, x, y, w, h, { fill: o.fill || C.paper, stroke: o.stroke || C.line, lw: o.lw || 2, alpha: o.alpha, r: 24 });
  ctx.save();
  ctx.globalAlpha = ctx.globalAlpha * (o.alpha == null ? 1 : o.alpha);
  ctx.fillStyle = o.fill || C.paper;
  ctx.strokeStyle = o.stroke || C.line; ctx.lineWidth = o.lw || 2;
  var tx = o.tail == null ? x + 60 : o.tail;
  ctx.beginPath(); ctx.moveTo(tx, y + h - 2); ctx.lineTo(tx + 10, y + h + 28); ctx.lineTo(tx + 36, y + h - 2); ctx.closePath();
  ctx.fill();
  ctx.beginPath(); ctx.moveTo(tx, y + h); ctx.lineTo(tx + 10, y + h + 28); ctx.lineTo(tx + 36, y + h); ctx.stroke();
  ctx.restore();
}
// 브라우저 창 — 주소창 + 본문 영역(콜백)
function browser(ctx, x, y, w, h, url, alpha) {
  card(ctx, x, y, w, h, { fill: C.paper, alpha: alpha, r: 16 });
  ctx.save();
  ctx.globalAlpha = ctx.globalAlpha * (alpha == null ? 1 : alpha);
  ctx.fillStyle = '#F1EEE3';
  rr(ctx, x + 2, y + 2, w - 4, 54, 14); ctx.fill();
  var dots = ['#E5533C', '#F5C518', '#3E8E41'];
  for (var i = 0; i < 3; i++) { ctx.fillStyle = dots[i]; ctx.beginPath(); ctx.arc(x + 30 + i * 26, y + 29, 8, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = C.paper; rr(ctx, x + 120, y + 12, w - 150, 34, 17); ctx.fill();
  if (url) txt(ctx, url, x + 166, y + 30, 22, 600, C.sub, 'left', MONO);
  ctx.restore();
}

// 장면 ⑥ — 5일차 꾸미기 (원고 근거: 5-0 timeline «슬라이드·비주얼·사진·차트·영상» · 5-1 같은 아웃라인을 슬라이드 도구 3탭에
//          · P5-2-2 사진 10장 일괄 처리(크기 제각각 → 규격) · 5-4 수집결과.csv → 후보분석.xlsx 차트 · 5-5 한 줄 지시로 모션 그래픽)
var NAME = 'mg-05-day5', DUR = 16;
var TP = [1.6, 2.2, 2.8, 3.4], TA = [3.8, 6.2, 8.6, 11.0];  // 칸 등장 · 칸 동작 시각
var TL = { src: 0.6, slides: TA[0], photos: TA[1], chart: TA[2], video: TA[3], foot: 13.8 };
var PN = [
  { x: 70, y: 360, t: '슬라이드', s: '도구 3탭에 같은 아웃라인' },
  { x: 740, y: 360, t: '사진', s: '10장을 한 번에 규격화' },
  { x: 70, y: 660, t: '차트', s: 'CSV 를 엑셀 차트로' },
  { x: 740, y: 660, t: '영상', s: '한 줄 지시로 모션 그래픽' },
];
var PW = 630, PH = 270;
function frame(ctx, T, i) {
  var p = es(T, TP[i], TP[i] + 0.6);
  if (p <= 0) return 0;
  var on = T >= TA[i] && (i === 3 || T < TA[i + 1]);
  var P = PN[i];
  card(ctx, P.x, P.y + (1 - p) * 30, PW, PH, { alpha: p, fill: on ? C.tint : C.paper, stroke: on ? C.brand : C.line, lw: on ? 4 : 2 });
  ctx.save(); ctx.globalAlpha = p;
  txt(ctx, P.t, P.x + 32, P.y + 44, 34, 800, C.ink, 'left');
  txt(ctx, P.s, P.x + PW - 32, P.y + 44, 24, 600, C.brandInk, 'right');
  ctx.restore();
  return p;
}
function slides(ctx, T) {
  var P = PN[0], a = es(T, TA[0], TA[0] + 0.6);
  var TAB = ['Gamma', 'Notebook', 'ChatGPT'];
  for (var i = 0; i < 3; i++) {
    var q = es(T, TA[0] + 0.4 * i, TA[0] + 0.4 * i + 0.6), x = P.x + 40 + i * 196;
    if (q <= 0) continue;
    ctx.save(); ctx.globalAlpha = q;
    pill(ctx, TAB[i], x + 86, P.y + 104, 20, C.blueTint, C.blue, 14);
    card(ctx, x, P.y + 136, 172, 110 * q + 1, { fill: C.paper, shadow: 0, r: 8 });
    ctx.fillStyle = C.brand; ctx.fillRect(x + 12, P.y + 150, 100, 12);
    ctx.fillStyle = C.line; ctx.fillRect(x + 12, P.y + 176, 148, 8); ctx.fillRect(x + 12, P.y + 196, 120, 8); ctx.fillRect(x + 12, P.y + 216, 136, 8);
    ctx.restore();
  }
  return a;
}
function photos(ctx, T) {
  var P = PN[1], f = es(T, TA[1] + 0.8, TA[1] + 2.0);
  var SZ = [[70, 50], [46, 62], [80, 44], [54, 54], [66, 40], [40, 58], [74, 56], [50, 46], [60, 64], [44, 40]];
  for (var i = 0; i < 10; i++) {
    var q = es(T, TA[1] + 0.06 * i, TA[1] + 0.06 * i + 0.4);
    if (q <= 0) continue;
    var col = i % 5, row = Math.floor(i / 5);
    var cx = P.x + 90 + col * 112, cy = P.y + 130 + row * 84;
    var w = lerp(SZ[i][0], 84, f), h = lerp(SZ[i][1], 64, f), rot = lerp((i % 3 - 1) * 0.12, 0, f);
    ctx.save(); ctx.globalAlpha = q;
    ctx.translate(cx, cy); ctx.rotate(rot);
    ctx.fillStyle = f > 0.95 ? C.paper : '#EFEBDD'; ctx.strokeStyle = f > 0.95 ? C.brand : C.line; ctx.lineWidth = 3;
    rr(ctx, -w / 2, -h / 2, w, h, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = rgba(C.blue, 0.35); ctx.beginPath(); ctx.arc(0, 4, Math.min(w, h) * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}
function chart(ctx, T) {
  var P = PN[2], a = es(T, TA[2], TA[2] + 0.5);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  pill(ctx, '수집결과.csv', P.x + 130, P.y + 170, 22, C.ink, C.paper, 16);
  ctx.restore();
  arrow(ctx, P.x + 236, P.y + 170, P.x + 290, P.y + 170, es(T, TA[2] + 0.4, TA[2] + 0.9), C.brandInk, 4);
  var V = [0.55, 0.9, 0.4, 0.72, 0.62];
  ctx.save();
  ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(P.x + 310, P.y + 236); ctx.lineTo(P.x + 600, P.y + 236); ctx.stroke();
  for (var i = 0; i < 5; i++) {
    var g = es(T, TA[2] + 0.8 + 0.2 * i, TA[2] + 1.6 + 0.2 * i), h = 140 * V[i] * g;
    ctx.fillStyle = i === 1 ? C.brand : rgba(C.blue, 0.75);
    rr(ctx, P.x + 330 + i * 54, P.y + 236 - h, 36, h, 4); ctx.fill();
  }
  ctx.restore();
}
function video(ctx, T) {
  var P = PN[3], a = es(T, TA[3], TA[3] + 0.5);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  card(ctx, P.x + 40, P.y + 96, 250, 70, { fill: C.paper, shadow: 0, r: 14 });
  txt(ctx, '«모션 그래픽 만들어줘»', P.x + 165, P.y + 132, 22, 700, C.ink, 'center');
  ctx.restore();
  arrow(ctx, P.x + 300, P.y + 130, P.x + 350, P.y + 160, es(T, TA[3] + 0.4, TA[3] + 0.9), C.brandInk, 4);
  var v = es(T, TA[3] + 0.8, TA[3] + 1.3);
  if (v <= 0) return;
  ctx.save(); ctx.globalAlpha = v;
  var x = P.x + 360, y = P.y + 96, w = 230, h = 150;
  ctx.fillStyle = C.ink; rr(ctx, x, y, w, h, 12); ctx.fill();
  // 화면 안에서 움직이는 공 — 장면 시간의 함수(결정론)
  var k = seg(T, TA[3] + 1.0, DUR), bx = x + 30 + (w - 60) * (0.5 - 0.5 * Math.cos(k * Math.PI * 3)), by = y + h / 2 - 30 * Math.sin(k * Math.PI * 6);
  ctx.fillStyle = C.brand; ctx.beginPath(); ctx.arc(bx, by, 16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = rgba('#FFFFFF', 0.35); ctx.fillRect(x + 16, y + h - 22, (w - 32), 6);
  ctx.fillStyle = C.brand; ctx.fillRect(x + 16, y + h - 22, (w - 32) * k, 6);
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '5일차', '꾸미기 — 같은 제품을 슬라이드·사진·차트로', 0.2);
  var s = es(T, TL.src, TL.src + 0.6);
  if (s > 0) {
    ctx.save(); ctx.globalAlpha = s;
    card(ctx, 420, 196, 600, 120, { fill: C.paper, stroke: C.brand, lw: 4 });
    txt(ctx, '같은 제품 · 같은 아웃라인', 720, 240, 34, 800, C.ink, 'center');
    txt(ctx, 'DG-DB 시리즈(가상)', 720, 288, 26, 600, C.brandInk, 'center');
    ctx.restore();
  }
  for (var i = 0; i < 4; i++) {
    if (frame(ctx, T, i) > 0) {
      var P = PN[i], from = { x: i % 2 ? 1020 : 420, y: 316 };
      arrow(ctx, from.x, from.y, P.x + PW / 2, P.y - 6, es(T, TP[i] - 0.1, TP[i] + 0.4) * (i < 2 ? 1 : 0), C.line, 3);
    }
  }
  slides(ctx, T); photos(ctx, T); chart(ctx, T); video(ctx, T);
  footer(ctx, T, '도구마다 한계를 보고 고름', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
