// scene.js — 설계·R&D AI 강의 모션그래픽 03-day3 (3일차 찾기) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s03-day3.js · 합성: node mg/_src/compose.js
(function (root) {
// common.js — 7개 장면이 공유하는 그리기 도구 (compose.js 가 각 scene.js 에 전문을 싣는다)
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

// 장면 ④ — 3일차 찾기 (원고 근거: 3-0 «자료 묶음»·3-3 «출처 검증의 3단 확인»)
var NAME = 'mg-03-day3', DUR = 17;
var TL = { src: 1.0, arr: 4.0, nb: 4.6, ans: 7.0, cite: 8.6, v: 10.6, foot: 15.0 };
var SRC = [
  ['특허 공보', 'KIPRIS · Google Patents'],
  ['학술 논문', 'Google Scholar'],
  ['사내 산출물', '1~2일차에 만든 표와 요약'],
];
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '3일차', '찾기 — 흩어진 자료를 한 노트북으로', 0.2);
  for (var i = 0; i < 3; i++) {
    var a = TL.src + 0.7 * i, p = es(T, a, a + 0.6), y = 215 + i * 170;
    if (p > 0) {
      ctx.save(); ctx.globalAlpha = p;
      var hot = es(T, TL.cite + 1.0 + 0.6 * i, TL.cite + 1.4 + 0.6 * i) * (1 - es(T, TL.cite + 1.6 + 0.6 * i, TL.cite + 2.0 + 0.6 * i));
      card(ctx, 70 - (1 - p) * 40, y, 400, 140, { fill: hot > 0 ? C.tint : C.paper, stroke: hot > 0 ? C.brand : C.line, lw: hot > 0 ? 5 : 2 });
      txt(ctx, SRC[i][0], 100 - (1 - p) * 40, y + 48, 40, 800, C.ink, 'left');
      txt(ctx, SRC[i][1], 100 - (1 - p) * 40, y + 100, 27, 500, C.muted, 'left');
      ctx.restore();
    }
    arrow(ctx, 480, y + 70, 560, 395, es(T, TL.arr + 0.3 * i, TL.arr + 0.3 * i + 0.6), C.brandInk, 5);
  }
  // 노트북
  var pn = es(T, TL.nb, TL.nb + 0.7);
  if (pn > 0) {
    ctx.save(); ctx.globalAlpha = pn;
    card(ctx, 570, 250, 280, 290, { fill: C.blueTint, stroke: C.blue, lw: 3 });
    txt(ctx, 'Gemini', 710, 330, 38, 800, C.blue, 'center');
    txt(ctx, 'Notebook', 710, 376, 38, 800, C.blue, 'center');
    txt(ctx, '소스 3묶음', 710, 450, 32, 600, C.ink, 'center');
    ctx.restore();
  }
  arrow(ctx, 860, 395, 930, 395, es(T, TL.ans - 0.5, TL.ans), C.brandInk, 5);
  // 답 + 인용
  var pa = es(T, TL.ans, TL.ans + 0.7);
  if (pa > 0) {
    ctx.save(); ctx.globalAlpha = pa;
    card(ctx, 940, 215, 430, 450, {});
    txt(ctx, '답변', 975, 262, 34, 800, C.brandInk, 'left');
    for (var l = 0; l < 6; l++) { ctx.fillStyle = C.line; rr(ctx, 975, 310 + l * 52, l % 3 === 2 ? 260 : 360, 18, 9); ctx.fill(); }
    ctx.restore();
    for (var c = 0; c < 3; c++) {
      var pc = es(T, TL.cite + 0.6 * c - 0.4, TL.cite + 0.6 * c), cx = 1295 - 0 , cy = 330 + c * 104;
      if (pc <= 0) continue;
      ctx.save(); ctx.globalAlpha = pc;
      ctx.fillStyle = C.brand; rr(ctx, 1280, cy - 24, 62, 48, 24); ctx.fill();
      txt(ctx, String(c + 1), 1311, cy + 1, 30, 800, C.ink, 'center');
      ctx.restore();
    }
  }
  // 인용 → 원문 (연결선)
  for (var k = 0; k < 3; k++) {
    var q = es(T, TL.cite + 1.0 + 0.6 * k, TL.cite + 1.5 + 0.6 * k) * (1 - es(T, TL.cite + 1.8 + 0.6 * k, TL.cite + 2.2 + 0.6 * k));
    if (q > 0) {
      ctx.save(); ctx.globalAlpha = q; ctx.setLineDash([10, 10]); ctx.strokeStyle = C.red; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(1280, 330 + k * 104); ctx.quadraticCurveTo(900, 170, 480, 285 + k * 170); ctx.stroke(); ctx.restore();
    }
  }
  // 출처 검증 3단
  var V = [['인용을 눌러', '원문 구절로 이동'], ['구절에 그 내용이', '있는지 봄'], ['숫자·단위가 원문과', '같은지 대조']];
  for (var j = 0; j < 3; j++) {
    var a2 = TL.v + 0.6 * j, p3 = es(T, a2, a2 + 0.5);
    if (p3 <= 0) continue;
    var x = 70 + j * 445;
    ctx.save(); ctx.globalAlpha = p3;
    card(ctx, x, 740, 420, 150, {});
    ctx.fillStyle = C.brand; ctx.beginPath(); ctx.arc(x + 46, 815, 28, 0, Math.PI * 2); ctx.fill();
    txt(ctx, String(j + 1), x + 46, 816, 34, 800, C.ink, 'center');
    lines(ctx, V[j], x + 92, 800, 42, 30, 700, C.ink, 'left');
    stamp(ctx, x + 380, 770, 20, es(T, TL.v + 2.4 + 0.5 * j, TL.v + 2.8 + 0.5 * j), C.green);
    ctx.restore();
  }
  footer(ctx, T, '3건만 확인 — 하나라도 어긋나면 그 답 전체를 다시 봄', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
