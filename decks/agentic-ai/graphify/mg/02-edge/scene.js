// scene.js — graphify 덱 모션그래픽 02-edge (edge 신뢰도) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s02-edge.js · 합성: node mg/_src/compose.js
(function (root) {
// common.js — graphify 덱 mg 4개 장면이 공유하는 그리기 도구 (compose.js 가 각 scene.js 에 전문을 싣는다)
// 출발점: AgenticCoding mg/_src/common.js — 같은 default_lec 색 체계. 판형만 16:9(1920×1080)
// 결정론: Math.random·Date·performance.now 금지 — 모든 값은 시간 T 의 함수다. 글꼴은 시스템 글꼴만.

var W = 1920, H = 1080;
var X0 = 80, X1 = W - 80, CW = X1 - X0; // 본문 좌우 여백 80 — 본문 폭 1760
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
// 선분 — 시작점에서 p(0~1) 만큼 그려진다. dash: [길이, 간격] (없으면 실선)
function dline(ctx, x1, y1, x2, y2, p, color, lw, dash) {
  if (p <= 0) return;
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = lw || 4; ctx.lineCap = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(lerp(x1, x2, p), lerp(y1, y2, p)); ctx.stroke();
  ctx.restore();
}
// 그래프 노드 — 채운 원 + 흰 테두리, p 로 튀어나옴
function node(ctx, cx, cy, r, p, fill) {
  if (p <= 0) return;
  var s = p < 1 ? lerp(0.2, 1, p) + Math.sin(p * Math.PI) * 0.18 : 1;
  ctx.save();
  ctx.globalAlpha = Math.min(1, p * 1.5);
  ctx.fillStyle = fill;
  ctx.beginPath(); ctx.arc(cx, cy, r * s, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
}

// 장면 ③ — edge 신뢰도 (원고 근거: «핵심 개념: edge 신뢰도» + «graphify가 해결하는 문제»)
var NAME = 'mg-02-edge', DUR = 15;
var TL = { src: 1.0, arr: 1.8, dia: 2.2, lane0: 3.0, laneStep: 2.4, gauge: 6.2, hi: 9.8, foot: 12.0 };
var LANES = [
  { branch: '명시적 참조', name: 'EXTRACTED', note: '함수 호출, import 등', tag: '신뢰도 높음', color: C.green, tint: C.greenTint, dash: null, lw: 7 },
  { branch: '의미 추론', name: 'INFERRED', note: '문맥 기반 추론', tag: '', color: C.blue, tint: C.blueTint, dash: [16, 12], lw: 6 },
  { branch: '불명확', name: 'AMBIGUOUS', note: '', tag: '', color: C.muted, tint: C.paper, dash: [4, 14], lw: 5 },
];
var DX = 520, DY = 600, DR = 120;     // «추출 방식» 마름모
var LX = 780, LW2 = X1 - LX, LH = 210; // 줄 카드
function laneY(i) { return 340 + i * 260; }
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '핵심 개념', 'edge 신뢰도 — EXTRACTED · INFERRED · AMBIGUOUS', 0.2);
  // 코드/문서 아이콘
  var ps = es(T, TL.src, TL.src + 0.6);
  if (ps > 0) {
    doc(ctx, X0 + 20, DY - 110 + (1 - ps) * 20, 170, 210, { alpha: ps, rows: 6 });
    ctx.save(); ctx.globalAlpha = ps;
    txt(ctx, '코드/문서', X0 + 105, DY + 150, 30, 800, C.ink, 'center');
    ctx.restore();
  }
  arrow(ctx, X0 + 210, DY, DX - DR - 14, DY, es(T, TL.arr, TL.arr + 0.5), C.muted, 5);
  // 마름모
  var pd = es(T, TL.dia, TL.dia + 0.6);
  if (pd > 0) {
    ctx.save();
    ctx.globalAlpha = pd;
    ctx.translate(DX, DY); ctx.scale(lerp(0.6, 1, pd), lerp(0.6, 1, pd));
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.moveTo(0, -DR); ctx.lineTo(DR, 0); ctx.lineTo(0, DR); ctx.lineTo(-DR, 0); ctx.closePath(); ctx.fill();
    txt(ctx, '추출', 0, -18, 30, 800, '#FFFFFF', 'center');
    txt(ctx, '방식', 0, 22, 30, 800, '#FFFFFF', 'center');
    ctx.restore();
  }
  var ph = es(T, TL.hi, TL.hi + 0.6);
  for (var i = 0; i < 3; i++) {
    var L = LANES[i], a = TL.lane0 + TL.laneStep * i, y = laneY(i);
    // 분기 화살표 — 마름모 오른쪽 꼭짓점에서 줄 카드로
    arrow(ctx, DX + DR + 8, DY + (i - 1) * 40, LX - 14, y, es(T, a, a + 0.5), L.color, 5);
    var pc = es(T, a + 0.3, a + 0.8);
    if (pc <= 0) continue;
    var hi = i < 2 ? ph : 0;
    card(ctx, LX + (1 - pc) * 30, y - LH / 2, LW2, LH, { alpha: pc, fill: L.tint, stroke: hi > 0 ? L.color : C.line, lw: 2 + 3 * hi, r: 20 });
    var x0 = LX + (1 - pc) * 30;
    ctx.save(); ctx.globalAlpha = pc;
    pill(ctx, L.branch, x0 + 130, y, 210, 56, C.paper, L.color, 27, 800);
    ctx.strokeStyle = L.color; ctx.lineWidth = 3;
    rr(ctx, x0 + 25, y - 28, 210, 56, 28); ctx.stroke();
    ctx.restore();
    // 노드 쌍 + 선 모양
    var n1 = x0 + 310, n2 = x0 + 560, pe = es(T, a + 0.7, a + 1.3);
    dline(ctx, n1, y, n2, y, pe, L.color, L.lw, L.dash);
    node(ctx, n1, y, 26, es(T, a + 0.5, a + 0.9), C.ink);
    node(ctx, n2, y, 26, es(T, a + 1.1, a + 1.5), C.ink);
    // 이름 · 설명
    var pn = es(T, a + 1.0, a + 1.5);
    if (pn <= 0) continue;
    ctx.save(); ctx.globalAlpha = pn;
    var tx = x0 + 640, tw = X1 - tx - 30;
    fit(ctx, L.name, tx, y - 42, 44, 800, L.color, 'left', tw, MONO);
    if (i < 2) fit(ctx, L.note, tx, y + 14, 29, 700, C.sub, 'left', tw);
    if (L.tag && i === 0) fit(ctx, L.tag, tx, y + 58, 27, 800, C.ink, 'left', tw);
    ctx.restore();
    // INFERRED — 신뢰도 막대 0 → 0.7
    if (i === 1) {
      var pg = es(T, TL.gauge, TL.gauge + 1.0), gy = y + 58, gx = tx + 196, gw = 120;
      if (pg > 0) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, pg * 2);
        txt(ctx, 'avg confidence', tx, gy, 22, 700, C.blue, 'left', MONO);
        ctx.fillStyle = C.paper; rr(ctx, gx, gy - 12, gw, 24, 12); ctx.fill();
        ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = C.blue; rr(ctx, gx, gy - 12, Math.max(24, gw * 0.7 * pg), 24, 12); ctx.fill();
        txt(ctx, (0.7 * pg).toFixed(1), gx + gw + 14, gy, 28, 800, C.blue, 'left', MONO);
        ctx.restore();
      }
    }
  }
  footer(ctx, T, 'EXTRACTED + INFERRED edge로 숨겨진 연결 발견', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
