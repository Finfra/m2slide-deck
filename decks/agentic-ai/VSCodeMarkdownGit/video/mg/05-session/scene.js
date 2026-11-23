// scene.js — VS Code·Markdown·Git 특강 모션그래픽 05-session (대화 한 개 vs 기능별 세션) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s05-session.js · 합성: node mg/_src/compose.js · 4:3 1600×1200
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

// 장면 ⑤ — 대화 한 개 vs 기능별 세션 (원고 근거: «대화 한 개 vs 기능별 세션 분리» + «VS Code 정리» 세션을 나눔)
var NAME = 'vscode-md-git-05-session', DUR = 14;
var TL = { left: 0.8, m0: 1.3, mStep: 0.45, tangle: 4.6, lost: 6.2, right: 7.0, f0: 7.6, fStep: 0.3, ok: 10.2, foot: 11.4 };
var FEAT = [['①', C.blue, C.blueTint], ['②', C.purple, C.purpleTint], ['③', C.green, C.greenTint]];
var MSG = [0, 1, 0, 2, 1, 2, 0]; // 지시 순서 — 기능 번호
var PY = 200, PH = 840, PW = 680, LX = X0, RX = X1 - PW;
var LBX = LX + 60, LBW = 400, LBH = 62, LBY = 290, LSTEP = 80;
var CGAP = 20, CWID = (PW - 40 - CGAP * 2) / 3, RBH = 70, RSTEP = 92, RBY = 390;
function panel(ctx, x, title, sub, p, color) {
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = p;
  card(ctx, x, PY + (1 - p) * 30, PW, PH, { fill: C.panel, stroke: C.line, r: 24, shadow: 0 });
  txt(ctx, title, x + 40, PY + 50, 40, 800, color, 'left');
  txt(ctx, sub, x + PW - 40, PY + 50, 28, 700, C.muted, 'right');
  ctx.restore();
}
function bubble(ctx, x, y, w, h, f, s, alpha) {
  var F = FEAT[f];
  ctx.save();
  ctx.globalAlpha = alpha;
  card(ctx, x, y, w, h, { fill: F[2], stroke: F[1], lw: 3, r: 14, shadow: 0 });
  fit(ctx, s, x + w / 2, y + h / 2, 28, 700, F[1], 'center', w - 24);
  ctx.restore();
}
function order(i) { var n = 0; for (var j = 0; j < i; j++) if (MSG[j] === MSG[i]) n++; return n; }
function left(ctx, T) {
  panel(ctx, LX, '대화 한 개', '한 줄기', es(T, TL.left, TL.left + 0.5), C.red);
  // 꼬인 선 — 같은 기능 지시끼리 잇는다
  var pt = es(T, TL.tangle, TL.tangle + 1.2);
  if (pt > 0) {
    for (var i = 0; i < MSG.length; i++) {
      for (var j = i + 1; j < MSG.length; j++) {
        if (MSG[j] !== MSG[i]) continue;
        var y1 = LBY + i * LSTEP + LBH / 2, y2 = LBY + j * LSTEP + LBH / 2, xr = LBX + LBW;
        var bulge = 40 + MSG[i] * 50;
        ctx.save();
        ctx.strokeStyle = rgba(FEAT[MSG[i]][1], 0.8); ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(xr, y1);
        var u = pt, xm = xr + bulge * 2.2;
        ctx.bezierCurveTo(xm, lerp(y1, y2, 0.15 * u), xr + bulge * 0.4, lerp(y1, y2, 0.6 * u), xr, lerp(y1, y2, u));
        ctx.stroke();
        ctx.restore();
        break;
      }
    }
    ctx.save(); ctx.globalAlpha = pt;
    txt(ctx, '맥락이 뒤엉킴', LX + 40, 890, 34, 800, C.red, 'left');
    ctx.restore();
  }
  var pl = es(T, TL.lost, TL.lost + 0.6);
  for (var k = 0; k < MSG.length; k++) {
    var a = TL.m0 + TL.mStep * k, p = es(T, a, a + 0.4);
    if (p <= 0) continue;
    var al = p * (k === 0 ? lerp(1, 0.25, pl) : 1);
    bubble(ctx, LBX - (1 - p) * 30, LBY + k * LSTEP, LBW, LBH, MSG[k], '기능 ' + FEAT[MSG[k]][0] + ' 지시 ' + (order(k) + 1), al);
  }
  if (pl > 0) {
    crossmark(ctx, LBX - 28, LBY + LBH / 2, 22, pl, C.red);
    ctx.save(); ctx.globalAlpha = pl;
    fit(ctx, '앞의 지시를 AI 가 놓침', LX + 40, 950, 34, 800, C.red, 'left', PW - 80);
    ctx.restore();
  }
}
function right(ctx, T) {
  var pr = es(T, TL.right, TL.right + 0.5);
  panel(ctx, RX, '기능별 세션', '나눠서', pr, C.green);
  if (pr <= 0) return;
  ctx.save(); ctx.globalAlpha = pr;
  for (var c = 0; c < 3; c++) {
    var cx = RX + 20 + c * (CWID + CGAP);
    ctx.strokeStyle = rgba(FEAT[c][1], 0.45); ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    rr(ctx, cx, 290, CWID, 420, 16); ctx.stroke();
    ctx.setLineDash([]);
    fit(ctx, '세션 ' + FEAT[c][0], cx + CWID / 2, 336, 30, 800, FEAT[c][1], 'center', CWID - 16);
  }
  ctx.restore();
  // 지시가 왼쪽에서 제 칸으로 들어간다
  for (var k = 0; k < MSG.length; k++) {
    var a = TL.f0 + TL.fStep * k, p = es(T, a, a + 0.7);
    if (p <= 0) continue;
    var f = MSG[k], n = order(k);
    var tx = RX + 20 + f * (CWID + CGAP) + 10, ty = RBY + n * RSTEP;
    var sx = LBX + LBW - CWID, sy = LBY + k * LSTEP;
    bubble(ctx, lerp(sx, tx, p), lerp(sy, ty, p), CWID - 20, RBH, f, '지시 ' + (n + 1), Math.min(1, p * 2));
  }
  for (var c2 = 0; c2 < 3; c2++) {
    var ps = es(T, TL.ok + 0.25 * c2, TL.ok + 0.25 * c2 + 0.4);
    stamp(ctx, RX + 20 + c2 * (CWID + CGAP) + CWID / 2, 770, 32, ps, C.green);
  }
  var pk = es(T, TL.ok, TL.ok + 0.6);
  if (pk > 0) {
    ctx.save(); ctx.globalAlpha = pk;
    txt(ctx, '각자 맥락이 깨끗함', RX + 40, 890, 34, 800, C.green, 'left');
    fit(ctx, '무엇을 시켰는지 추적됨', RX + 40, 950, 34, 800, C.green, 'left', PW - 80);
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '세션', '대화 한 개 vs 기능별 세션', 0.2);
  left(ctx, T);
  right(ctx, T);
  footer(ctx, T, '기능마다 세션을 따로 엶 — 각자 맥락이 깨끗함', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
