// scene.js — VS Code·Markdown·Git 특강 모션그래픽 04-flow (세 질문 → 세 도구 → 하나의 습관) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s04-flow.js · 합성: node mg/_src/compose.js · 4:3 1600×1200
(function (root) {
// common.js — VSCodeMarkdownGit 덱 추가 mg(04~06) 장면이 공유하는 그리기 도구 (compose.js 가 각 scene.js 에 전문을 싣는다)
// 출발점: AgenticCoding mg/_src/common.js — 판형은 4:3(1600×1200), 색은 이 덱의 기존 mg(01~03)와 같은 밝은 체계
// 결정론: Math.random·Date·performance.now 금지 — 모든 값은 시간 T 의 함수다. 글꼴은 시스템 글꼴만.

var W = 1600, H = 1200;
var X0 = 80, X1 = W - 80, CW = X1 - X0; // 본문 좌우 여백 80 — 본문 폭 1440
var C = {
  bg: '#FFFFFF', ink: '#0F172A', sub: '#334155', muted: '#64748B', line: '#CBD5E1', paper: '#FFFFFF', panel: '#F1F5F9',
  brand: '#F5C518', brandInk: '#8A6400', tint: '#FFF6D5',
  blue: '#2563EB', blueTint: '#EAF1FD', red: '#DC2626', redTint: '#FDECEC', green: '#16A34A', greenTint: '#E6F6EC',
  purple: '#7C3AED', purpleTint: '#F1EAFD',
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
    ctx.shadowColor = 'rgba(15,23,42,0.12)';
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
  ctx.shadowColor = 'rgba(15,23,42,0.12)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 6;
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
  fit(ctx, s, W / 2, 1120 + (1 - p) * 12, 42, 800, color || C.brandInk, 'center', CW);
  ctx.restore();
}
function backdrop(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
}

// 장면 ④ — 덱 전체 흐름 (원고 근거: 머리 주석의 시간 구획 0~5·5~17·17~29·29~44·44~50분 + «쌓이고 나면 답할 수 없는 세 질문» + «세 개가 맞물리는 그림»)
var NAME = 'vscode-md-git-04-flow', DUR = 14;
var TL = { bar0: 1.0, barStep: 0.5, q0: 4.0, qStep: 0.7, a0: 6.4, aStep: 0.5, join: 8.6, habit: 9.8, foot: 11.2 };
var PARTS = [ // [이름, 분 시작, 분 끝, 색, 바탕]
  ['문제', 0, 5, C.muted, C.panel],
  ['VS Code', 5, 17, C.blue, C.blueTint],
  ['Markdown', 17, 29, C.purple, C.purpleTint],
  ['Git', 29, 44, C.green, C.greenTint],
  ['돌파구', 44, 50, C.brandInk, C.tint],
];
var QS = [ // [질문, 답 도구, 칸 번호]
  ['어디 있나', 'VS Code', 1],
  ['무엇을 시켰나', 'Markdown', 2],
  ['무엇이 바뀌었나', 'Git', 3],
];
var BY = 230, BH = 110, BGAP = 8, PERMIN = (CW - BGAP * 4) / 50;
var QY = 480, QH = 300, QGAP = 60, QW = (CW - QGAP * 2) / 3;
var HY = 940;
function partX(i) { return X0 + PARTS[i][1] * PERMIN + i * BGAP; }
function partW(i) { return (PARTS[i][2] - PARTS[i][1]) * PERMIN; }
function bar(ctx, T) {
  for (var i = 0; i < PARTS.length; i++) {
    var a = TL.bar0 + TL.barStep * i, p = es(T, a, a + 0.6);
    if (p <= 0) continue;
    var x = partX(i), w = partW(i), P = PARTS[i];
    card(ctx, x, BY, w * p, BH, { fill: P[4], stroke: P[3], lw: 3, r: 16, shadow: 0 });
    ctx.save();
    ctx.globalAlpha = es(T, a + 0.3, a + 0.7);
    fit(ctx, P[0], x + w / 2, BY + BH / 2, 36, 800, P[3], 'center', w - 20);
    fit(ctx, P[1] + '~' + P[2] + '분', x + w / 2, BY + BH + 36, 26, 600, C.muted, 'center', w);
    ctx.restore();
  }
}
function qx(k) { return X0 + k * (QW + QGAP); }
function questions(ctx, T) {
  for (var k = 0; k < QS.length; k++) {
    var a = TL.q0 + TL.qStep * k, p = es(T, a, a + 0.7);
    if (p <= 0) continue;
    var q = QS[k], P = PARTS[q[2]], x = qx(k), y = QY + (1 - p) * 50;
    // 시간 막대 칸 → 카드로 내려오는 연결선
    ctx.save();
    ctx.globalAlpha = p;
    ctx.strokeStyle = rgba(P[3], 0.5); ctx.lineWidth = 3; ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.moveTo(partX(q[2]) + partW(q[2]) / 2, BY + BH + 60); ctx.lineTo(x + QW / 2, y); ctx.stroke();
    ctx.setLineDash([]);
    card(ctx, x, y, QW, QH, { stroke: P[3], lw: 3 });
    pill(ctx, 'Q' + (k + 1), x + 70, y + 54, 92, 50, P[4], P[3], 28, 800);
    fit(ctx, q[0] + '?', x + QW / 2, y + 140, 52, 800, C.ink, 'center', QW - 60);
    ctx.restore();
    var pa = es(T, TL.a0 + TL.aStep * k, TL.a0 + TL.aStep * k + 0.5);
    if (pa > 0) {
      ctx.save();
      ctx.globalAlpha = pa;
      pill(ctx, q[1], x + QW / 2 - 30, QY + 232 + (1 - pa) * 16, 260, 70, P[3], '#FFFFFF', 36, 800);
      ctx.restore();
      stamp(ctx, x + QW / 2 + 140, QY + 232, 30, pa, C.green);
    }
  }
}
function habit(ctx, T) {
  var pj = es(T, TL.join, TL.join + 1.2);
  if (pj > 0) {
    for (var k = 0; k < QS.length; k++) {
      var sx = qx(k) + QW / 2, sy = QY + QH;
      arrow(ctx, sx, sy + 6, W / 2 + (k - 1) * 120, HY - 52, pj, rgba(PARTS[QS[k][2]][3], 0.75), 4);
    }
  }
  var ph = es(T, TL.habit, TL.habit + 0.7);
  if (ph <= 0) return;
  ctx.save();
  ctx.globalAlpha = ph;
  ctx.translate(W / 2, HY);
  var s = lerp(0.8, 1, ph);
  ctx.scale(s, s);
  pill(ctx, 'AI 를 다루는 습관', 0, 0, 620, 96, C.brand, C.ink, 44, 800);
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '50분', '세 질문 → 세 도구 → 하나의 습관', 0.2);
  bar(ctx, T);
  questions(ctx, T);
  habit(ctx, T);
  footer(ctx, T, '돌파구는 코딩 실력이 아니라, AI 를 다루는 습관', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
