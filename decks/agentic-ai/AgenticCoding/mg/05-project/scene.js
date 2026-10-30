// scene.js — Agentic Coding 강의 모션그래픽 05-project (Part2 미니 프로젝트 흐름) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s05-project.js · 합성: node mg/_src/compose.js
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

// 장면 ⑥ — Part2 미니 프로젝트 흐름 (원고 근거: 02-part2 «Part2 시작» · «미니 프로젝트 목표·산출물» · «MVP 개발 3단계 흐름» · «nPTiR 사이클 복습 + 이번 섹션 시나리오» · «(시연) Plan 자동 생성 + 검토»)
var NAME = 'mg-05-project', DUR = 18;
var TL = { chip0: 1.0, cstep: 0.4, left: 3.4, d0: 4.0, dstep: 0.8, prod: 6.6, bad: 8.0, mid: 9.2, r0: 10.0, rstep: 0.8, res: 12.6, review: 13.6, foot: 15.0 };
var CHIPS = ['셋팅', '1단계 MVP', '(선택) Superpowers', '2단계 기능 개선', '코드 리뷰'];
var CG = 30, CHW = (CW - CG * 4) / 5, CY = 190, CH = 84;
var PY = 330, PH = 570, LW = 620, LX = X0, RX = X1 - LW;
var DOCS = [['PRD.md', '무엇을·왜'], ['tasks.md', '어떻게·언제'], ['코드', 'tasks 1번씩 실행']];
var CHAIN = ['docker-compose.yml → MySQL', 'Node mysql2 연동', '조회수 API + 인기 문서 라우트'];
function curChip(T) { return T < TL.left ? 0 : T < TL.mid ? 1 : T < TL.review ? 3 : 4; }
function chips(ctx, T) {
  var cur = curChip(T);
  for (var i = 0; i < 5; i++) {
    var a = TL.chip0 + TL.cstep * i, p = es(T, a, a + 0.5);
    if (p <= 0) continue;
    var x = X0 + i * (CHW + CG), on = i === cur, opt = i === 2;
    ctx.save(); ctx.globalAlpha = p;
    if (opt) ctx.setLineDash([10, 8]);
    card(ctx, x, CY, CHW, CH, { fill: on ? C.tint : C.paper, stroke: on ? C.brand : opt ? C.muted : C.line, lw: on ? 5 : 2, shadow: on ? 1 : 0 });
    ctx.setLineDash([]);
    fit(ctx, CHIPS[i], x + CHW / 2, CY + CH / 2 + 1, 30, 800, opt ? C.muted : C.ink, 'center', CHW - 30);
    ctx.restore();
    if (i < 4) arrow(ctx, x + CHW + 4, CY + CH / 2, x + CHW + CG - 2, CY + CH / 2, es(T, a + 0.3, a + 0.6), C.brandInk, 4);
  }
}
function leftPanel(ctx, T) {
  var p = es(T, TL.left, TL.left + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, LX, PY, LW, PH, {});
  txt(ctx, '1단계 MVP', LX + 36, PY + 50, 38, 800, C.ink, 'left');
  txt(ctx, 'Node.js만 사용', LX + LW - 36, PY + 52, 26, 600, C.muted, 'right');
  for (var i = 0; i < 3; i++) {
    var a = TL.d0 + TL.dstep * i, q = es(T, a, a + 0.5), cx = LX + 110 + i * 200;
    if (q <= 0) continue;
    ctx.globalAlpha = p * q;
    doc(ctx, cx - 55, PY + 100 + (1 - q) * 20, 110, 136, { rows: 4 });
    fit(ctx, DOCS[i][0], cx, PY + 270, 30, 800, C.ink, 'center', 180);
    fit(ctx, DOCS[i][1], cx, PY + 308, 24, 600, C.sub, 'center', 180);
    ctx.globalAlpha = p;
    if (i < 2) arrow(ctx, cx + 66, PY + 168, cx + 134, PY + 168, es(T, a + 0.4, a + 0.8), C.brandInk, 4);
  }
  var pr = es(T, TL.prod, TL.prod + 0.6);
  if (pr > 0) {
    ctx.globalAlpha = p * pr;
    card(ctx, LX + 30, PY + 350, LW - 60, 76, { fill: C.tint, stroke: 'transparent', shadow: 0, r: 14 });
    fit(ctx, 'Node 서버 + MD 렌더러 + 파일 목록 UI', LX + LW / 2, PY + 389, 30, 700, C.ink, 'center', LW - 100);
  }
  var pb = es(T, TL.bad, TL.bad + 0.6);
  ctx.globalAlpha = p;
  crossmark(ctx, LX + 70, PY + 500, 28, pb, C.red);
  if (pb > 0) {
    ctx.globalAlpha = p * pb;
    fit(ctx, '재시작 시 데이터 소실', LX + 116, PY + 501, 32, 800, C.red, 'left', LW - 150);
  }
  ctx.restore();
}
function middle(ctx, T) {
  var q = es(T, TL.mid, TL.mid + 0.8);
  if (q <= 0) return;
  var y = PY + 500, x1 = LX + LW + 20, x2 = RX - 20;
  arrow(ctx, x1, y, x2, y, q, C.red, 6);
  ctx.save(); ctx.globalAlpha = q;
  fit(ctx, '영속 저장소(DB)', (x1 + x2) / 2, y - 44, 26, 800, C.red, 'center', x2 - x1);
  fit(ctx, '필요', (x1 + x2) / 2, y + 40, 26, 800, C.red, 'center', x2 - x1);
  ctx.restore();
}
function rightPanel(ctx, T) {
  var p = es(T, TL.mid + 0.4, TL.mid + 1.0);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, RX, PY, LW, PH, { fill: C.blueTint, stroke: C.blue, lw: 3 });
  txt(ctx, '2단계 기능 개선', RX + 36, PY + 50, 38, 800, C.blue, 'left');
  txt(ctx, 'DB + Docker', RX + LW - 36, PY + 52, 26, 600, C.blue, 'right');
  for (var i = 0; i < 3; i++) {
    var a = TL.r0 + TL.rstep * i, q = es(T, a, a + 0.5), y = PY + 110 + i * 104;
    if (q <= 0) continue;
    ctx.globalAlpha = p * q;
    card(ctx, RX + 30 + (1 - q) * 30, y, LW - 60, 76, { r: 14, shadow: 0 });
    fit(ctx, CHAIN[i], RX + LW / 2, y + 39, 28, 700, C.ink, 'center', LW - 110, i === 0 ? MONO : KR);
    ctx.globalAlpha = p;
    if (i < 2) arrow(ctx, RX + LW / 2, y + 80, RX + LW / 2, y + 102, es(T, a + 0.5, a + 0.8), C.blue, 4);
  }
  var pr = es(T, TL.res, TL.res + 0.6);
  if (pr > 0) {
    ctx.globalAlpha = p * pr;
    card(ctx, RX + 30, PY + 450, LW - 60, 84, { fill: C.greenTint, stroke: C.green, lw: 3, r: 14, shadow: 0 });
    fit(ctx, '조회수 추적 + 인기 문서 TOP 3', RX + 70, PY + 493, 30, 800, C.green, 'left', LW - 200);
  }
  ctx.restore();
  stamp(ctx, RX + LW - 80, PY + 492, 26, es(T, TL.res + 0.4, TL.res + 0.9), C.green);
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, 'Part 2', 'MD 파일 뷰어 — MVP에서 기능 개선까지', 0.2);
  chips(ctx, T);
  leftPanel(ctx, T);
  middle(ctx, T);
  rightPanel(ctx, T);
  footer(ctx, T, '가져갈 것: 작동하는 코드 + nPTiR 사이클 1회 + Docker 첫 체험', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
