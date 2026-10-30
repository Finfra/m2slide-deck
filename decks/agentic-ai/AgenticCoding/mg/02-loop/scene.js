// scene.js — Agentic Coding 강의 모션그래픽 02-loop (Agentic Coding 의 흐름) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s02-loop.js · 합성: node mg/_src/compose.js
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

// 장면 ③ — Agentic Coding 의 흐름 (원고 근거: 01-part1 «Agentic Coding의 흐름» + 02-part2 «코드 생성 단계 — Claude Code 자율 실행 흐름»)
var NAME = 'mg-02-loop', DUR = 18;
var TL = { node0: 1.0, nstep: 0.4, run: 3.4, lap: 5.0, laps: 2, center: 4.0, ok: 8.6, once: 9.4, loop: 10.6, safe: 12.0, foot: 15.0 };
var CX = 470, CY = 600, R = 260, NW = 270, NH = 100;
var NODES = [
  ['사용자 의도', ''], ['Plan', ''], ['Tool 실행', 'Bash · Edit · Read'], ['검증', ''], ['결과 보고', ''],
];
var PX = 950, PW = X1 - PX; // 오른쪽 판
function nodeAng(i) { return (-90 + 72 * i) * Math.PI / 180; }
// 점의 각도(도, -90 에서 시작해 시계 방향) — 끝나면 사용자 의도 위에서 멈춤
function dotDeg(T) { return -90 + 360 * TL.laps * clamp((T - TL.run) / (TL.lap * TL.laps), 0, 1); }
function ring(ctx, T) {
  var p = es(T, TL.node0, TL.node0 + TL.nstep * 5 + 0.4);
  if (p <= 0) return;
  ctx.save();
  ctx.strokeStyle = C.line; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.arc(CX, CY, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); ctx.stroke();
  // 시계 방향 화살촉 — 마디 사이 가운데
  ctx.fillStyle = C.muted;
  for (var i = 0; i < 5; i++) {
    var a = nodeAng(i) + 36 * Math.PI / 180;
    if ((a + Math.PI / 2) / (Math.PI * 2) > p) continue;
    var x = CX + R * Math.cos(a), y = CY + R * Math.sin(a), t = a + Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(x + 16 * Math.cos(t), y + 16 * Math.sin(t));
    ctx.lineTo(x - 12 * Math.cos(t) + 14 * Math.cos(a), y - 12 * Math.sin(t) + 14 * Math.sin(a));
    ctx.lineTo(x - 12 * Math.cos(t) - 14 * Math.cos(a), y - 12 * Math.sin(t) - 14 * Math.sin(a));
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  // 고리를 도는 점 — 마디 카드 아래로 지나감
  if (T >= TL.run) {
    var r = dotDeg(T) * Math.PI / 180;
    ctx.save();
    ctx.fillStyle = C.brandInk;
    ctx.beginPath(); ctx.arc(CX + R * Math.cos(r), CY + R * Math.sin(r), 14, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}
function nodes(ctx, T) {
  var running = T >= TL.run && T < TL.run + TL.lap * TL.laps + 0.3;
  var d = ((dotDeg(T) + 90) % 360 + 360) % 360;
  for (var i = 0; i < 5; i++) {
    var a = TL.node0 + TL.nstep * i, p = es(T, a, a + 0.5);
    if (p <= 0) continue;
    var ang = nodeAng(i), x = CX + R * Math.cos(ang), y = CY + R * Math.sin(ang);
    var nd = Math.abs(d - 72 * i); nd = Math.min(nd, 360 - nd);
    var on = running && nd < 22 ? 1 : 0;
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, x - NW / 2, y - NH / 2, NW, NH, { fill: on ? C.tint : C.paper, stroke: on ? C.brand : C.line, lw: on ? 5 : 2 });
    if (NODES[i][1]) {
      fit(ctx, NODES[i][0], x, y - 18, 34, 800, C.ink, 'center', NW - 30);
      fit(ctx, NODES[i][1], x, y + 24, 24, 600, C.sub, 'center', NW - 30, MONO);
    } else {
      fit(ctx, NODES[i][0], x, y + 1, 36, 800, C.ink, 'center', NW - 30);
    }
    ctx.restore();
  }
}
function center(ctx, T) {
  var p = es(T, TL.center, TL.center + 0.6);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = p;
    txt(ctx, '1턴', CX, CY - 34, 34, 700, C.muted, 'center');
    txt(ctx, '5~30초', CX, CY + 22, 54, 800, C.ink, 'center');
    ctx.restore();
  }
  // 검토·승인 — 결과 보고 → 사용자 의도 구간
  var q = es(T, TL.ok, TL.ok + 0.6);
  if (q > 0) {
    var a = 230 * Math.PI / 180, x = CX + 350 * Math.cos(a), y = CY + 350 * Math.sin(a) + (1 - q) * 14;
    ctx.save(); ctx.globalAlpha = q;
    pill(ctx, '검토·승인', x, y, 160, 48, C.ink, '#FFFFFF', 26, 800);
    ctx.restore();
  }
}
function panel(ctx, T) {
  var p1 = es(T, TL.once, TL.once + 0.6), p2 = es(T, TL.loop, TL.loop + 0.6), p3 = es(T, TL.safe, TL.safe + 0.6);
  if (p1 > 0) {
    ctx.save(); ctx.globalAlpha = p1;
    card(ctx, PX + (1 - p1) * 40, 250, PW, 160, {});
    txt(ctx, '단발 프롬프트', PX + 36, 306, 36, 800, C.sub, 'left');
    fit(ctx, '단발 요청 — 재사용 어려움', PX + 36, 362, 28, 600, C.muted, 'left', PW - 72);
    ctx.restore();
  }
  if (p2 > 0) {
    ctx.save(); ctx.globalAlpha = p2;
    card(ctx, PX + (1 - p2) * 40, 440, PW, 160, { fill: C.tint, stroke: C.brand, lw: 4 });
    txt(ctx, '자율 반복 루프', PX + 36, 496, 36, 800, C.ink, 'left');
    fit(ctx, 'tasks 를 1번씩 — Plan · 실행 · 검증', PX + 36, 552, 28, 600, C.sub, 'left', PW - 72);
    ctx.restore();
  }
  if (p3 > 0) {
    ctx.save(); ctx.globalAlpha = p3;
    card(ctx, PX + (1 - p3) * 40, 630, PW, 230, { fill: C.greenTint, stroke: C.green, lw: 3 });
    txt(ctx, '안전망', PX + 36, 684, 34, 800, C.green, 'left');
    fit(ctx, 'git status 자주 확인', PX + 36, 746, 28, 600, C.ink, 'left', PW - 72, MONO);
    fit(ctx, '망가지면 git reset --hard', PX + 36, 800, 28, 600, C.ink, 'left', PW - 72, MONO);
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, 'Part 1', 'Agentic Coding — 한 턴의 흐름', 0.2);
  ring(ctx, T);
  nodes(ctx, T);
  center(ctx, T);
  panel(ctx, T);
  footer(ctx, T, '자율 실행 ≠ 무인 실행 — 매 task 후 검토·승인', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
