// scene.js — Agentic Coding 강의 모션그래픽 03-scar (SCAR 4요소) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s03-scar.js · 합성: node mg/_src/compose.js
(function (root) {
// common.js — Agentic Coding 덱 mg 6개 장면이 공유하는 그리기 도구 (compose.js 가 각 scene.js 에 전문을 싣는다)
// 출발점: DesignRndAI mg/_src/common.js — 같은 default_lec 색 체계. 판형만 3:2(1620×1080)로 넓힘
// 결정론: Math.random·Date·performance.now 금지 — 모든 값은 시간 T 의 함수다. 글꼴은 시스템 글꼴만.

var W = 1620, H = 1080;
var X0 = 70, X1 = W - 70, CW = X1 - X0; // 본문 좌우 여백 70 — 본문 폭 1480
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

// 장면 ④ — SCAR 4요소 (원고 근거: 01-part1 «SCAR 4요소» + «하네스(Harness)란?» + «프롬프트 엔지니어링이란?»)
var NAME = 'mg-03-scar', DUR = 17;
var TL = { c0: 1.0, step: 1.6, fly: 8.0, band: 9.6, hl: 11.6, foot: 13.8 };
var CARDS = [
  ['S', 'Skill', '트리거 키워드로 자동 호출되는 능력 단위', '', '/needs → plan 생성'],
  ['C', 'Command', '사용자 진입점', '슬래시 입력으로 트리거', '/init · /review'],
  ['A', 'Agent', '별도 컨텍스트의 subagent', '메인 컨텍스트 보호 + 병렬 실행', 'code-reviewer'],
  ['R', 'Rule', '모델 행동 제약 정책', '', '“한국어 답변”'],
];
var GG = 36, KW = (CW - GG) / 2, KH = 300, KY = [190, 190 + KH + 30];
var BY = 860, BH = 96; // 아래 띠
function cardPos(i) { return { x: X0 + (i % 2) * (KW + GG), y: KY[Math.floor(i / 2)] }; }
function letterHome(i) { var c = cardPos(i); return { x: c.x + 76, y: c.y + 76 }; }
function letterBand(i) { return { x: X0 + 70 + i * 78, y: BY + BH / 2 }; }
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, 'SCAR', '하네스의 핵심 4요소', 0.2);
  var pf = es(T, TL.fly, TL.fly + 1.2), hl = es(T, TL.hl, TL.hl + 0.6);
  for (var i = 0; i < 4; i++) {
    var a = TL.c0 + TL.step * i, p = es(T, a, a + 0.6);
    if (p <= 0) continue;
    var c = cardPos(i), k = CARDS[i], on = (i === 0 || i === 3) ? hl : 0;
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, c.x, c.y + (1 - p) * 30, KW, KH, { stroke: on > 0 ? C.blue : C.line, lw: 2 + 3 * on });
    // 글자 자리 — 날아간 뒤에는 옅은 원만 남음
    ctx.fillStyle = pf > 0 ? rgba(C.brand, 0.25 + 0.75 * (1 - pf)) : C.brand;
    ctx.beginPath(); ctx.arc(c.x + 76, c.y + 76, 46, 0, Math.PI * 2); ctx.fill();
    txt(ctx, k[1], c.x + 146, c.y + 78, 46, 800, C.ink, 'left');
    ctx.globalAlpha = p * es(T, a + 0.4, a + 0.9);
    fit(ctx, k[2], c.x + 40, c.y + 160, 30, 700, C.ink, 'left', KW - 80);
    if (k[3]) fit(ctx, k[3], c.x + 40, c.y + 204, 28, 600, C.sub, 'left', KW - 80);
    ctx.globalAlpha = p * es(T, a + 0.8, a + 1.3);
    ctx.font = '600 26px ' + MONO;
    var ew = Math.min(KW - 136, ctx.measureText(k[4]).width + 48);
    txt(ctx, 'ex)', c.x + 40, c.y + 259, 26, 700, C.muted, 'left');
    ctx.fillStyle = C.blueTint; rr(ctx, c.x + 96, c.y + 236, ew, 46, 12); ctx.fill();
    fit(ctx, k[4], c.x + 120, c.y + 260, 26, 600, C.blue, 'left', ew - 48, MONO);
    ctx.restore();
  }
  // 아래 띠
  var pb = es(T, TL.fly - 0.4, TL.fly + 0.3);
  if (pb > 0) {
    ctx.save(); ctx.globalAlpha = pb;
    card(ctx, X0, BY, CW, BH, { fill: C.tint, stroke: C.brand, lw: 3 });
    ctx.globalAlpha = pb * es(T, TL.band, TL.band + 0.8);
    fit(ctx, '+  CLAUDE.md · settings.json  +  Hook  =  하네스', X0 + 70 + 4 * 78 + 10, BY + BH / 2 + 1, 36, 800, C.ink, 'left', CW - 70 - 4 * 78 - 50);
    ctx.restore();
  }
  // 날아가는 글자 S·C·A·R — 카드 원에서 띠로
  for (var j = 0; j < 4; j++) {
    var a2 = TL.c0 + TL.step * j, p2 = es(T, a2, a2 + 0.6);
    if (p2 <= 0) continue;
    var q = es(T, TL.fly + 0.15 * j, TL.fly + 0.15 * j + 1.0), h = letterHome(j), b = letterBand(j);
    var x = lerp(h.x, b.x, q), y = lerp(h.y, b.y, q) - Math.sin(Math.PI * q) * 60;
    ctx.save(); ctx.globalAlpha = p2;
    txt(ctx, CARDS[j][0], x, y + 2, lerp(56, 60, q), 800, C.ink, 'center');
    ctx.restore();
  }
  footer(ctx, T, '프롬프트는 Skill·Rule 에 담겨 재사용됨', TL.foot, C.blue);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
