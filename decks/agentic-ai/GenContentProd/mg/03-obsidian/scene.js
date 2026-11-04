// scene.js — GenContentProd 강의 모션그래픽 03-obsidian (Obsidian 5단계) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s03-obsidian.js · 합성: node mg/_src/compose.js
(function (root) {
// common.js — GenContentProd 덱 mg 6개 장면이 공유하는 그리기 도구 (compose.js 가 각 scene.js 에 전문을 싣는다)
// 출발점: AgenticCoding mg/_src/common.js — 같은 default_lec 색 체계 · 같은 판형 3:2(1620×1080)
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

// ── GenContentProd 추가 도구 ────────────────────────────────────────────────
// 결정론 의사난수 — 정수 i 에 대해 항상 같은 0~1 값 (Math.random 대신)
function hash01(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
// 꺾쇠 화살표 경로 — 점 배열을 따라 p(0~1) 만큼 그린다 (끝에 화살촉)
function polyArrow(ctx, pts, p, color, lw) {
  if (p <= 0) return;
  var L = [], tot = 0, i;
  for (i = 1; i < pts.length; i++) { var d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  var want = tot * p;
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw || 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  var ex = pts[0][0], ey = pts[0][1], ang = 0;
  for (i = 1; i < pts.length && want > 0; i++) {
    var q = Math.min(1, want / L[i - 1]);
    ex = lerp(pts[i - 1][0], pts[i][0], q); ey = lerp(pts[i - 1][1], pts[i][1], q);
    ang = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]);
    ctx.lineTo(ex, ey); want -= L[i - 1];
  }
  ctx.stroke();
  if (p > 0.95) {
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - 20 * Math.cos(ang - 0.45), ey - 20 * Math.sin(ang - 0.45));
    ctx.lineTo(ex - 20 * Math.cos(ang + 0.45), ey - 20 * Math.sin(ang + 0.45));
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

// 장면 ④ — Obsidian 5단계 (원고 근거: 10 «Obsidian 정리» + «Vault 구조·관리» + «볼트 생성·노트 작성» + «[[링크]]·#태그 실습» + «Smart Connections» + «Obsidian 핵심 특징»)
var NAME = 'mg-03-obsidian', DUR = 18;
var TL = { s0: 1.0, sstep: 0.4, st0: 3.2, ststep: 2.4, foot: 15.2 };
var STEPS = [['폴더', 'Vault'], ['파일', 'Note'], ['연결', 'Link · Tag'], ['시각화', '그래프'], ['증강', '플러그인']];
var SG = 40, SW = (CW - SG * 4) / 5, SY = 182, SH = 100;
var VX = X0, VY = 330, VW = 760, VH = 620;
var GX = VX + VW + 40, GW = X1 - GX, GY = 330, GH = 300, PY = 660, PH = 290;
function stageAt(T) { return T < TL.st0 ? -1 : Math.min(4, Math.floor((T - TL.st0) / TL.ststep)); }
function stA(k) { return TL.st0 + TL.ststep * k; }
function strip(ctx, T) {
  var cur = stageAt(T);
  for (var i = 0; i < 5; i++) {
    var a = TL.s0 + TL.sstep * i, p = es(T, a, a + 0.5);
    if (p <= 0) continue;
    var x = X0 + i * (SW + SG), on = i === cur && T < TL.foot, past = cur >= i;
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, x, SY + (1 - p) * 20, SW, SH, { fill: on ? C.tint : C.paper, stroke: on ? C.brand : past ? C.brandInk : C.line, lw: on ? 5 : 2, r: 16 });
    txt(ctx, String(i + 1), x + 34, SY + SH / 2, 30, 800, past ? C.brandInk : C.muted, 'center');
    fit(ctx, STEPS[i][0], x + 64, SY + 36, 32, 800, C.ink, 'left', SW - 80);
    fit(ctx, STEPS[i][1], x + 64, SY + 72, 24, 600, C.sub, 'left', SW - 80);
    ctx.restore();
    if (i < 4) arrow(ctx, x + SW + 6, SY + SH / 2, x + SW + SG - 6, SY + SH / 2, es(T, a + 0.3, a + 0.6), C.brandInk, 4);
  }
}
function folderIcon(ctx, x, y, color) {
  ctx.fillStyle = color;
  rr(ctx, x, y + 6, 46, 34, 6); ctx.fill();
  rr(ctx, x, y, 22, 14, 4); ctx.fill();
}
function vault(ctx, T) {
  var p = es(T, stA(0), stA(0) + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, VX, VY, VW, VH, {});
  folderIcon(ctx, VX + 36, VY + 34, C.brand);
  txt(ctx, 'lec-vault/', VX + 100, VY + 56, 34, 800, C.ink, 'left', MONO);
  txt(ctx, '1 Vault = 1 폴더', VX + VW - 36, VY + 56, 26, 700, C.muted, 'right');
  ctx.globalAlpha = p * es(T, stA(0) + 0.6, stA(0) + 1.1);
  folderIcon(ctx, VX + 76, VY + 104, C.line);
  txt(ctx, '.obsidian/', VX + 140, VY + 126, 28, 600, C.sub, 'left', MONO);
  txt(ctx, '설정 자동 생성', VX + VW - 36, VY + 126, 24, 600, C.muted, 'right');
  ctx.restore();
  // ② 노트 2개
  var N = ['welcome.md', 'prompt-engineering.md'];
  for (var i = 0; i < 2; i++) {
    var q = es(T, stA(1) + 0.5 * i, stA(1) + 0.5 * i + 0.6);
    if (q <= 0) continue;
    var y = VY + 188 + i * 74;
    ctx.save(); ctx.globalAlpha = q;
    doc(ctx, VX + 80 + (1 - q) * 20, y, 40, 52, { rows: 0 });
    txt(ctx, N[i], VX + 140 + (1 - q) * 20, y + 27, 28, 700, C.ink, 'left', MONO);
    ctx.restore();
  }
  // ③ welcome.md 본문 — 링크·태그
  var r = es(T, stA(2), stA(2) + 0.6);
  if (r > 0) {
    var bx = VX + 36, by = VY + 360, bw = VW - 72, bh = 220;
    ctx.save(); ctx.globalAlpha = r;
    ctx.fillStyle = C.bg; rr(ctx, bx, by, bw, bh, 14); ctx.fill();
    ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
    txt(ctx, 'welcome.md', bx + 24, by + 34, 22, 700, C.muted, 'left', MONO);
    txt(ctx, '# 오늘 배운 것', bx + 24, by + 80, 28, 700, C.ink, 'left', MONO);
    ctx.globalAlpha = r * es(T, stA(2) + 0.5, stA(2) + 1.0);
    ctx.fillStyle = C.blueTint; rr(ctx, bx + 18, by + 106, 400, 46, 10); ctx.fill();
    txt(ctx, '[[prompt-engineering]]', bx + 30, by + 130, 26, 700, C.blue, 'left', MONO);
    ctx.globalAlpha = r * es(T, stA(2) + 1.0, stA(2) + 1.5);
    pill(ctx, '#lec', bx + 80, by + 186, 120, 44, C.tint, C.brandInk, 24, 800);
    pill(ctx, '#day1', bx + 220, by + 186, 130, 44, C.tint, C.brandInk, 24, 800);
    ctx.restore();
    // 링크 → 두 번째 노트 줄을 가리키는 표시 (글자를 피해 오른쪽으로 돌아감)
    var ny = VY + 188 + 74 + 27;
    polyArrow(ctx, [[bx + 412, by + 130], [VX + VW - 90, by + 130], [VX + VW - 90, ny], [VX + 600, ny]], es(T, stA(2) + 0.9, stA(2) + 1.5), C.blue, 3);
  }
}
function graph(ctx, T) {
  var p = es(T, stA(3), stA(3) + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, GX, GY, GW, GH, { fill: C.paper });
  txt(ctx, '그래프 뷰', GX + 32, GY + 42, 28, 800, C.brandInk, 'left');
  txt(ctx, '노드 2 · 엣지 1', GX + GW - 32, GY + 42, 24, 700, C.muted, 'right');
  var ax = GX + 170, ay = GY + 180, bx = GX + GW - 190, by = GY + 160;
  var e = es(T, stA(3) + 0.9, stA(3) + 1.5);
  if (e > 0) { ctx.strokeStyle = C.sub; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(lerp(ax, bx, e), lerp(ay, by, e)); ctx.stroke(); }
  var n1 = es(T, stA(3) + 0.3, stA(3) + 0.7), n2 = es(T, stA(3) + 0.5, stA(3) + 0.9);
  ctx.fillStyle = C.brand;
  if (n1 > 0) { ctx.beginPath(); ctx.arc(ax, ay, 26 * n1, 0, Math.PI * 2); ctx.fill(); }
  if (n2 > 0) { ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(bx, by, 26 * n2, 0, Math.PI * 2); ctx.fill(); }
  ctx.globalAlpha = p * n2;
  txt(ctx, 'welcome', ax, ay + 56, 24, 700, C.ink, 'center', MONO);
  fit(ctx, 'prompt-engineering', bx, by + 56, 24, 700, C.ink, 'center', 300, MONO);
  ctx.restore();
}
function plugin(ctx, T) {
  var p = es(T, stA(4), stA(4) + 0.6);
  if (p <= 0) return;
  var L = ['유사 노트 자동 추천', 'Smart Chat — 출처 인용 답변'];
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, GX + (1 - p) * 30, PY, GW, PH, { fill: C.greenTint, stroke: C.green, lw: 3 });
  txt(ctx, 'Smart Connections', GX + 36, PY + 50, 34, 800, C.green, 'left');
  for (var i = 0; i < L.length; i++) {
    var y = PY + 130 + i * 74;
    stamp(ctx, GX + 56, y, 20, es(T, stA(4) + 0.5 + 0.4 * i, stA(4) + 0.9 + 0.4 * i), C.green);
    fit(ctx, L[i], GX + 92, y, 30, 700, C.ink, 'left', GW - 120);
  }
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, 'Part 2', 'Obsidian — 폴더에서 지식 베이스까지 5단계', 0.2);
  strip(ctx, T);
  vault(ctx, T);
  graph(ctx, T);
  plugin(ctx, T);
  footer(ctx, T, '노트는 로컬 .md 파일 — AI 도구에 그대로 입력', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
