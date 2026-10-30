// scene.js — Agentic Coding 강의 모션그래픽 04-nptir (nPTiR 5단계) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s04-nptir.js · 합성: node mg/_src/compose.js
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

// 장면 ⑤ — nPTiR 5단계 (원고 근거: 01-part1 «nPTiR 5단계 흐름도» + 02-part2 «needs 단계» · «issue·Report 단계» · «nPTiR 사이클 1회 정리»)
var NAME = 'mg-04-nptir', DUR = 18;
var TL = { t0: 1.0, tstep: 0.4, folder: 3.4, s0: 4.2, sstep: 1.6, done: 11.8, out: 12.6, foot: 15.0 };
var TILES = [
  ['n', 'needs', '무엇이 필요한가', 'Issue.md 이슈후보'],
  ['P', 'Plan', '어떻게 할까', '_doc_work/plan/'],
  ['T', 'Task', '단계별 체크리스트', '_doc_work/tasks/'],
  ['i', 'issue', '진행 추적', 'Issue.md'],
  ['R', 'Report', '완료 회고', '_doc_work/report/'],
];
var TG = 28, TW = (CW - TG * 4) / 5, TY = 190, TH = 310;
var FX = X0, FY = 560, FW = 1000, FH = 380;
var OX = FX + FW + 40, OW = X1 - OX;
var FILES = [ // [폴더에 들어오는 단계, 경로, 꼬리]
  [0, 'Issue.md', ''],
  [1, '_doc_work/plan/{주제}_plan.md', ''],
  [2, '_doc_work/tasks/{주제}_task.md', ''],
  [4, '_doc_work/report/{주제}_issue{번호}_report.md', '(선택)'],
];
function stageAt(T) { return T < TL.s0 ? -1 : Math.min(4, Math.floor((T - TL.s0) / TL.sstep)); }
function tiles(ctx, T) {
  var cur = T < TL.done ? stageAt(T) : -1;
  for (var i = 0; i < 5; i++) {
    var a = TL.t0 + TL.tstep * i, p = es(T, a, a + 0.5);
    if (p <= 0) continue;
    var x = X0 + i * (TW + TG), y = TY + (1 - p) * 30, on = i === cur, past = stageAt(T) >= i;
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, x, y, TW, TH, { fill: on ? C.tint : C.paper, stroke: on ? C.brand : C.line, lw: on ? 5 : 2 });
    ctx.fillStyle = past ? C.brand : C.line;
    ctx.beginPath(); ctx.arc(x + TW / 2, y + 68, 44, 0, Math.PI * 2); ctx.fill();
    txt(ctx, TILES[i][0], x + TW / 2, y + 70, 52, 800, C.ink, 'center');
    fit(ctx, TILES[i][1], x + TW / 2, y + 150, 36, 800, C.ink, 'center', TW - 30);
    fit(ctx, TILES[i][2], x + TW / 2, y + 200, 27, 600, C.sub, 'center', TW - 30);
    ctx.fillStyle = C.blueTint; rr(ctx, x + 16, y + 238, TW - 32, 48, 12); ctx.fill();
    fit(ctx, TILES[i][3], x + TW / 2, y + 263, 22, 600, C.blue, 'center', TW - 52, MONO);
    ctx.restore();
    if (i < 4) arrow(ctx, x + TW + 3, TY + 68, x + TW + TG - 3, TY + 68, es(T, a + 0.3, a + 0.6), C.brandInk, 4);
  }
}
function folder(ctx, T) {
  var p = es(T, TL.folder, TL.folder + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, FX, FY, FW, FH, {});
  txt(ctx, '프로젝트 폴더', FX + 40, FY + 46, 30, 800, C.brandInk, 'left');
  var st = stageAt(T);
  for (var i = 0; i < FILES.length; i++) {
    var f = FILES[i], s = TL.s0 + TL.sstep * f[0], q = es(T, s + 0.2, s + 0.8);
    if (q <= 0) continue;
    var y = FY + 120 + i * 68;
    ctx.globalAlpha = p * q;
    doc(ctx, FX + 40 + (1 - q) * 30, y - 24, 38, 48, { rows: 0 });
    fit(ctx, f[1], FX + 100 + (1 - q) * 30, y, 26, 600, C.ink, 'left', FW - 300, MONO);
    if (f[2]) txt(ctx, f[2], FX + FW - 40, y, 26, 700, C.muted, 'right');
    if (i === 0) {
      // Issue.md 상태 칩 — 이슈후보 → 진행중 → 완료
      var lab = T >= TL.done ? '완료' : st >= 3 ? '진행중' : '이슈후보';
      var col = T >= TL.done ? C.green : st >= 3 ? C.brand : C.line;
      pill(ctx, lab, FX + 360, y, 150, 46, col, T >= TL.done ? '#FFFFFF' : C.ink, 26, 800);
    }
  }
  ctx.restore();
}
function outputs(ctx, T) {
  var p = es(T, TL.out, TL.out + 0.6);
  if (p <= 0) return;
  var L = ['plan', 'task', 'issue 항목', '(선택) report'];
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, OX, FY, OW, FH, { fill: C.greenTint, stroke: C.green, lw: 3 });
  txt(ctx, '산출물', OX + 36, FY + 46, 30, 800, C.green, 'left');
  for (var i = 0; i < L.length; i++) {
    var y = FY + 120 + i * 68;
    stamp(ctx, OX + 54, y, 20, es(T, TL.out + 0.3 + 0.25 * i, TL.out + 0.7 + 0.25 * i), C.green);
    fit(ctx, L[i], OX + 92, y, 30, 700, C.ink, 'left', OW - 120);
  }
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, 'nPTiR', '5단계 — 의도·과정·결과를 남김', 0.2);
  tiles(ctx, T);
  folder(ctx, T);
  outputs(ctx, T);
  footer(ctx, T, '의도·과정·결과가 한 폴더에 — 1주일 후에도 재현', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
