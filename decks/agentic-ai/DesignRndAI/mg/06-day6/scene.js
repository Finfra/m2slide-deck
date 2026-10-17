// scene.js — 설계·R&D AI 강의 모션그래픽 06-day6 (6일차 쌓기) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s06-day6.js · 합성: node mg/_src/compose.js
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

// 장면 ⑦ — 6일차 쌓기 (원고 근거: 6-1 «RAG 세 글자의 뜻 — 찾고·붙이고·답함»)
var NAME = 'mg-06-day6', DUR = 17;
var TL = { st: 0.8, grid: 1.2, q: 3.4, pick: 5.2, fly: 7.4, ans: 10.6, cite: 12.0, foot: 14.4 };
var ST = [['질문', '부시 허용하중은?'], ['Retrieval', '찾기'], ['Augmented', '붙이기'], ['Generation', '답하기']];
var PICK = [4, 9, 20];
function gridPos(i) { return { x: 70 + (i % 6) * 116, y: 470 + Math.floor(i / 6) * 100 }; }
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '6일차', '쌓기 — 찾고 · 붙이고 · 답함', 0.2);
  // 단계 표시줄 — 진행 중인 칸이 노랗다
  var cur = T < TL.q ? -1 : T < TL.pick + 1.6 ? 1 : T < TL.ans ? 2 : 3;
  if (T >= TL.q && T < TL.pick) cur = 0;
  for (var s = 0; s < 4; s++) {
    var a = TL.st + 0.3 * s, p = es(T, a, a + 0.5), x = 70 + s * 336;
    if (p <= 0) continue;
    ctx.save(); ctx.globalAlpha = p;
    var on = s === cur;
    card(ctx, x, 200, 290, 150, { fill: on ? C.tint : C.paper, stroke: on ? C.brand : C.line, lw: on ? 5 : 2, shadow: on ? 1 : 0 });
    txt(ctx, ST[s][0], x + 145, 252, s === 0 ? 40 : 34, 800, C.ink, 'center');
    txt(ctx, ST[s][1], x + 145, 306, s === 0 ? 29 : 40, s === 0 ? 600 : 800, s === 0 ? C.sub : C.brandInk, 'center');
    ctx.restore();
    if (s < 3) arrow(ctx, x + 295, 275, x + 331, 275, es(T, a + 0.3, a + 0.7), C.brandInk, 4);
  }
  // 창고 — 문서 조각 24개
  var pg = es(T, TL.grid - 0.2, TL.grid + 0.6);
  if (pg > 0) {
    ctx.save(); ctx.globalAlpha = pg;
    txt(ctx, '문서 창고 — 잘게 자른 조각', 70, 420, 32, 700, C.muted, 'left');
    ctx.restore();
  }
  // 붙이기 — 프롬프트 카드
  var pp = es(T, TL.fly - 0.6, TL.fly + 0.2);
  if (pp > 0) {
    ctx.save(); ctx.globalAlpha = pp;
    card(ctx, 790, 430, 580, 235, { fill: C.paper });
    txt(ctx, '질문 + 조각', 830, 470, 34, 800, C.brandInk, 'left');
    txt(ctx, '질문 뒤에 조각을 붙여 넘김', 1080, 636, 28, 700, C.muted, 'center');
    ctx.restore();
  }
  for (var i = 0; i < 24; i++) {
    var gp = es(T, TL.grid + 0.04 * i, TL.grid + 0.04 * i + 0.5), pos = gridPos(i);
    if (gp <= 0) continue;
    var pi = PICK.indexOf(i), hl = pi >= 0 ? es(T, TL.pick + 0.5 * pi, TL.pick + 0.5 * pi + 0.5) : 0;
    var fly = pi >= 0 ? es(T, TL.fly + 0.5 * pi, TL.fly + 0.5 * pi + 1.0) : 0;
    var tx = 880 + pi * 150, ty = 520;
    var x = lerp(pos.x, tx, fly), y = lerp(pos.y, ty, fly);
    ctx.save(); ctx.globalAlpha = gp * (pi >= 0 ? 1 : 1 - 0.55 * es(T, TL.pick, TL.pick + 0.6));
    ctx.fillStyle = hl > 0 ? C.brand : C.paper;
    rr(ctx, x, y, 104, 84, 12); ctx.fill();
    ctx.strokeStyle = hl > 0 ? C.brandInk : C.line; ctx.lineWidth = hl > 0 ? 4 : 2; ctx.stroke();
    for (var l = 0; l < 3; l++) { ctx.fillStyle = hl > 0 ? C.brandInk : C.line; ctx.fillRect(x + 14, y + 18 + l * 18, l === 2 ? 40 : 76, 6); }
    if (pi >= 0 && fly > 0.9) txt(ctx, String(pi + 1), x + 52, y - 18, 28, 800, C.brandInk, 'center');
    ctx.restore();
  }
  // 질문 말풍선(창고 위로 들어오는 신호)
  var pq = es(T, TL.q, TL.q + 0.6) * (1 - es(T, TL.fly, TL.fly + 0.6));
  if (pq > 0) {
    ctx.save(); ctx.globalAlpha = pq;
    ctx.fillStyle = C.blueTint; rr(ctx, 520, 392, 330, 54, 27); ctx.fill();
    txt(ctx, '질문과 비슷한 조각을 찾음', 685, 419, 27, 700, C.blue, 'center');
    ctx.restore();
  }
  // 답 + 인용
  var pa = es(T, TL.ans, TL.ans + 0.7);
  if (pa > 0) {
    ctx.save(); ctx.globalAlpha = pa;
    card(ctx, 790, 720, 580, 180, { fill: C.tint, stroke: C.brandInk, lw: 4 });
    txt(ctx, '답', 830, 760, 34, 800, C.brandInk, 'left');
    for (var l2 = 0; l2 < 2; l2++) { ctx.fillStyle = C.brandInk; ctx.globalAlpha = pa * 0.35; rr(ctx, 830, 798 + l2 * 36, l2 ? 300 : 440, 16, 8); ctx.fill(); }
    ctx.restore();
    for (var c = 0; c < 3; c++) {
      var pc = es(T, TL.cite + 0.5 * c, TL.cite + 0.5 * c + 0.4);
      if (pc <= 0) continue;
      ctx.save(); ctx.globalAlpha = pc;
      ctx.fillStyle = C.brand; rr(ctx, 830 + c * 84, 850, 70, 40, 20); ctx.fill();
      txt(ctx, '[' + (c + 1) + ']', 865 + c * 84, 871, 26, 800, C.ink, 'center');
      ctx.restore();
    }
  }
  footer(ctx, T, '어느 조각을 썼는지 남기면 그것이 인용임', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
