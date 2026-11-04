// scene.js — n3shIntro 모션그래픽 01-chord (동시타 + 모디파이어 층) — 생성 파일, 직접 고치지 않는다
// 원본: mg/_src/common.js + mg/_src/s01-chord.js · 합성: node decks/app/n3shIntro/mg/_src/compose.js
(function (root) {
// common.js — n3shIntro 덱 mg 장면이 공유하는 그리기 도구 (compose.js 가 각 scene.js 에 전문을 싣는다)
// 출발점: AgenticCoding mg/_src/common.js — 같은 default_lec 색 체계. 판형은 16:9(1920×1080) — _config.yml 에 slide_ratio 없음
// 결정론: Math.random·Date·performance.now 금지 — 모든 값은 시간 T 의 함수다. 글꼴은 시스템 글꼴만.

var W = 1920, H = 1080;
var X0 = 80, X1 = W - 80, CW = X1 - X0; // 본문 좌우 여백 80 — 본문 폭 1760
var C = {
  bg: '#FFFDF6', ink: '#222222', sub: '#4A4A44', muted: '#8A877A', line: '#E3DFD0', paper: '#FFFFFF',
  brand: '#F5C518', brandInk: '#7A6000', tint: '#FFF6D5',
  blue: '#0365C0', blueTint: '#EAF2FB', red: '#C82506', redTint: '#FDECE8', green: '#1F7A4D', greenTint: '#E4F3EA',
};
var KR = '"Apple SD Gothic Neo", "Noto Sans KR", "Noto Sans CJK KR", sans-serif';
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

// 키캡 — 누름 정도 p(0~1) 만큼 내려앉고 색이 찬다. on: 눌렸을 때 채움색
function keycap(ctx, s, cx, cy, size, p, on, font) {
  var d = 10 * p, h = size, w = size;
  ctx.save();
  ctx.fillStyle = '#CFCAB6';
  rr(ctx, cx - w / 2, cy - h / 2 + 10, w, h, 18); ctx.fill(); // 키 옆면
  ctx.fillStyle = p > 0 ? (on || C.brand) : C.paper;
  ctx.globalAlpha = 1;
  rr(ctx, cx - w / 2, cy - h / 2 + d, w, h, 18); ctx.fill();
  if (p > 0 && p < 1) { // 누르는 중엔 흰 면 위로 색이 차오름
    ctx.fillStyle = C.paper; ctx.globalAlpha = 1 - p;
    rr(ctx, cx - w / 2, cy - h / 2 + d, w, h, 18); ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
  rr(ctx, cx - w / 2, cy - h / 2 + d, w, h, 18); ctx.stroke();
  fit(ctx, s, cx, cy + d + 2, Math.round(size * 0.46), 800, C.ink, 'center', w - 16, font);
  ctx.restore();
}

// 장면 ② — 동시타 + 모디파이어 층 (원고 근거: n3shIntro.ppt.md «자모 2개 → 완성형 한 글자»(img/curriculum-4-content.svg) · «얼마나 줄어드나» 표 · «모아치기 + 모디파이어 층»(img/curriculum-5-content.svg))
var NAME = 'mg-01-chord', DUR = 18;
var TL = { panels: 0.8, chord: 2.0, seq0: 2.0, seqStep: 0.6, out: 4.4, verdict: 5.4, order: 7.0, mod0: 8.6, modStep: 1.0, hangul: 12.2, foot: 14.2 };
var PY = 190, PH = 400, PW = (CW - 40) / 2, LX = X0, RX = X0 + PW + 40; // 위 두 칸
var BY = 640, BH = 320, OW = 600, MX = X0 + OW + 40, MW = CW - OW - 40;  // 아래 두 칸
var SEQ = ['ㅇ', 'ㅡ', 'ㄹ', '␣'];
var MODS = [['무수식', '.'], ['⇧', '?'], ['⇧⌘', '!']];
function outBox(ctx, cx, cy, s, p, color) {
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, cx - 120, cy - 44 + (1 - p) * 14, 240, 88, { fill: C.tint, stroke: color, lw: 3, r: 16, shadow: 0 });
  txt(ctx, s, cx, cy + (1 - p) * 14, 46, 800, C.ink, 'center');
  ctx.restore();
}
function panels(ctx, T) {
  var p = es(T, TL.panels, TL.panels + 0.6);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, LX, PY, PW, PH, { stroke: C.brand, lw: 3 });
  card(ctx, RX, PY, PW, PH, {});
  pill(ctx, 'n3sh — 동시타', LX + 40 + 130, PY + 54, 260, 54, C.brand, C.ink, 28, 800);
  pill(ctx, '일반 타건 — 순차 입력', RX + 40 + 170, PY + 54, 340, 54, C.line, C.sub, 28, 800);
  ctx.restore();
  // 왼쪽: j + h 를 한 번에
  var kc = es(T, TL.chord, TL.chord + 0.35), lc = LX + PW / 2, ky = PY + 196;
  keycap(ctx, 'j', lc - 90, ky, 120, kc, C.brand, MONO);
  keycap(ctx, 'h', lc + 90, ky, 120, kc, C.brand, MONO);
  if (kc > 0) { ctx.save(); ctx.globalAlpha = kc; txt(ctx, '+', lc, ky + 6, 40, 800, C.muted, 'center'); ctx.restore(); }
  var po = es(T, TL.out - 1.4, TL.out - 0.9);
  outBox(ctx, lc, PY + 334, '을␣', po, C.brand);
  if (po > 0) { ctx.save(); ctx.globalAlpha = po; txt(ctx, '동시에 1번', LX + PW - 40, PY + 334, 32, 800, C.green, 'right'); ctx.restore(); }
  // 오른쪽: ㅇ → ㅡ → ㄹ → ␣ 한 타씩
  var rc = RX + PW / 2;
  for (var i = 0; i < SEQ.length; i++) {
    var a = TL.seq0 + TL.seqStep * i;
    keycap(ctx, SEQ[i], rc - 210 + i * 140, ky, 110, es(T, a, a + 0.25), C.line);
    if (T >= a) { ctx.save(); ctx.globalAlpha = es(T, a, a + 0.2); txt(ctx, (i + 1) + '타', rc - 210 + i * 140, ky - 86, 26, 800, C.red, 'center'); ctx.restore(); }
  }
  var pr = es(T, TL.out, TL.out + 0.5);
  outBox(ctx, rc, PY + 334, '을␣', pr, C.line);
  if (pr > 0) { ctx.save(); ctx.globalAlpha = pr; txt(ctx, '4타', RX + PW - 40, PY + 334, 32, 800, C.red, 'right'); ctx.restore(); }
  // 판정 — 두 칸 경계 위
  var pv = es(T, TL.verdict, TL.verdict + 0.6);
  if (pv > 0) {
    ctx.save(); ctx.globalAlpha = pv;
    var s = lerp(1.2, 1, pv); ctx.translate(W / 2, PY + PH + 2); ctx.scale(s, s);
    pill(ctx, '같은 결과 · 절반 타수', 0, 0, 400, 60, C.ink, '#FFFFFF', 30, 800);
    ctx.restore();
  }
}
function order(ctx, T) {
  var p = es(T, TL.order, TL.order + 0.6);
  if (p <= 0) return;
  var y = BY + (1 - p) * 40;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, X0, y, OW, BH, {});
  txt(ctx, '모아치기 — 순서 무관', X0 + 40, y + 52, 34, 800, C.ink, 'left');
  fit(ctx, 'j + h  =  h + j', X0 + OW / 2, y + 150, 60, 800, C.blue, 'center', OW - 80, MONO);
  ctx.globalAlpha = p * es(T, TL.order + 0.6, TL.order + 1.1);
  txt(ctx, '어느 쪽이 먼저든 같은 글자', X0 + OW / 2, y + 220, 28, 600, C.sub, 'center');
  ctx.globalAlpha = p * es(T, TL.hangul, TL.hangul + 0.6);
  pill(ctx, '한글 입력 상태에서만 발동', X0 + OW / 2, y + 274, 420, 50, C.greenTint, C.green, 26, 800);
  ctx.restore();
}
function mods(ctx, T) {
  var p = es(T, TL.mod0 - 0.6, TL.mod0);
  if (p <= 0) return;
  var y = BY + (1 - p) * 40;
  ctx.save(); ctx.globalAlpha = p;
  card(ctx, MX, y, MW, BH, {});
  txt(ctx, '모디파이어 층 — 같은 두 키, 다른 글자', MX + 40, y + 52, 34, 800, C.ink, 'left');
  fit(ctx, 'ex) 어미 끝 문장부호', MX + MW - 40, y + 52, 26, 600, C.muted, 'right', 300);
  ctx.restore();
  var TW = (MW - 80 - 2 * 30) / 3;
  for (var i = 0; i < MODS.length; i++) {
    var a = TL.mod0 + TL.modStep * i, q = es(T, a, a + 0.5);
    if (q <= 0) continue;
    var tx = MX + 40 + i * (TW + 30), ty = y + 100;
    ctx.save(); ctx.globalAlpha = q;
    card(ctx, tx, ty + (1 - q) * 20, TW, 190, { fill: i === 0 ? C.paper : C.blueTint, stroke: i === 0 ? C.line : C.blue, lw: 2, r: 16, shadow: 0 });
    fit(ctx, MODS[i][0] + ' + 두 키', tx + TW / 2, ty + 56, 32, 800, i === 0 ? C.sub : C.blue, 'center', TW - 30);
    arrow(ctx, tx + TW / 2, ty + 86, tx + TW / 2, ty + 122, es(T, a + 0.2, a + 0.5), C.muted, 4);
    txt(ctx, MODS[i][1], tx + TW / 2, ty + 156, 56, 800, C.ink, 'center', MONO);
    ctx.restore();
  }
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '원리', '자모 2개를 동시에 → 완성형 한 글자', 0.2);
  panels(ctx, T);
  order(ctx, T);
  mods(ctx, T);
  footer(ctx, T, '단어 확장기가 아니라 속기다', TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
