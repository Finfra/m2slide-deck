// scene.js — 설계·R&D AI 강의 모션그래픽 02-day2 (2일차 보기) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s02-day2.js · 합성: node mg/_src/compose.js
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

// 장면 ③ — 2일차 보기 (원고 근거: 2-4 «교차 검증의 판정 규칙»·«기계 먼저, LLM 나중»)
var NAME = 'mg-02-day2', DUR = 17;
var TL = { doc: 0.8, ocr: 2.0, llm: 4.6, diff: 8.0, flag: 9.4, steps: 11.4, foot: 14.6 };
var OCR = ['101', '102', '103', '104', '105'];
var LLM = ['101', '102', '104', '105', '106'];
function chips(ctx, T, list, x, y, a, other, flagColor) {
  for (var i = 0; i < list.length; i++) {
    var p = es(T, a + 0.35 * i, a + 0.35 * i + 0.4);
    if (p <= 0) continue;
    var odd = other.indexOf(list[i]) < 0;
    var fl = odd ? es(T, TL.diff, TL.diff + 0.6) : 0;
    ctx.save(); ctx.globalAlpha = p;
    ctx.fillStyle = fl > 0 ? flagColor : C.blueTint;
    rr(ctx, x + i * 96, y, 84, 64, 14); ctx.fill();
    ctx.strokeStyle = fl > 0 ? C.red : C.blue; ctx.lineWidth = fl > 0 ? 4 : 2; ctx.stroke();
    txt(ctx, list[i], x + i * 96 + 42, y + 33, 32, 800, fl > 0 ? C.red : C.blue, 'center', MONO);
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '2일차', '보기 — 기계가 먼저, LLM 이 나중', 0.2);
  var pd = es(T, TL.doc, TL.doc + 0.8);
  if (pd > 0) {
    ctx.save(); ctx.globalAlpha = pd;
    doc(ctx, 70, 250, 250, 330, { rows: 8 });
    txt(ctx, '도면 이미지', 195, 625, 32, 700, C.ink, 'center');
    txt(ctx, '부품번호 35종', 195, 666, 28, 500, C.muted, 'center');
    ctx.restore();
  }
  // 두 갈래 읽기
  var lanes = [
    { y: 220, t: '기계 OCR', s: '모든 문자열을 긁음', a: TL.ocr, list: OCR, other: LLM },
    { y: 420, t: '비전 LLM', s: '표 형태 결과를 만듦', a: TL.llm, list: LLM, other: OCR },
  ];
  for (var k = 0; k < 2; k++) {
    var L = lanes[k], p = es(T, L.a - 0.4, L.a + 0.4);
    arrow(ctx, 335, 415, 410, L.y + 90, p, C.brandInk, 5);
    if (p <= 0) continue;
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, 420, L.y, 560, 170, {});
    txt(ctx, L.t, 450, L.y + 40, 38, 800, C.ink, 'left');
    txt(ctx, L.s, 700, L.y + 42, 28, 500, C.muted, 'left');
    ctx.restore();
    chips(ctx, T, L.list, 450, L.y + 82, L.a + 0.4, L.other, C.redTint);
  }
  // 차이 카드
  var pf = es(T, TL.flag, TL.flag + 0.6);
  if (pf > 0) {
    ctx.save(); ctx.globalAlpha = pf;
    card(ctx, 1020, 220, 350, 370, { fill: C.redTint, stroke: C.red, lw: 3 });
    txt(ctx, '차이만 추림', 1195, 262, 36, 800, C.red, 'center');
    txt(ctx, '103', 1070, 330, 34, 800, C.red, 'left', MONO);
    lines(ctx, ['OCR 에만 있음', 'LLM 누락 후보'], 1170, 318, 36, 27, 600, C.ink, 'left');
    txt(ctx, '106', 1070, 450, 34, 800, C.red, 'left', MONO);
    lines(ctx, ['LLM 에만 있음', '지어냈을 가능성'], 1170, 438, 36, 27, 600, C.ink, 'left');
    txt(ctx, '도면에서 직접 확인', 1195, 548, 30, 800, C.brandInk, 'center');
    ctx.restore();
  }
  var pm = es(T, TL.diff + 0.3, TL.diff + 0.9);
  if (pm > 0) {
    ctx.save(); ctx.globalAlpha = pm;
    txt(ctx, '양쪽 일치 4건 — 넘어감', 700, 640, 32, 700, C.green, 'center');
    ctx.restore();
  }
  // 4단계 순서
  var S = ['기계 OCR', '비전 LLM', '차집합', '사람 확인'];
  for (var i = 0; i < 4; i++) {
    var a = TL.steps + 0.5 * i, p2 = es(T, a, a + 0.5);
    if (p2 <= 0) continue;
    var x = 70 + i * 335;
    ctx.save(); ctx.globalAlpha = p2;
    var last = i === 3;
    card(ctx, x, 740, 290, 130, { fill: last ? C.brand : C.paper, stroke: last ? C.brandInk : C.line, lw: last ? 4 : 2 });
    txt(ctx, String(i + 1), x + 46, 805, 42, 800, last ? C.ink : C.brandInk, 'center');
    txt(ctx, S[i], x + 92, 805, 34, 800, C.ink, 'left');
    ctx.restore();
    if (i < 3) arrow(ctx, x + 296, 805, x + 329, 805, es(T, a + 0.3, a + 0.7), C.brandInk, 4);
  }
  footer(ctx, T, '전수 검증이 아니라 차이만 봄', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
