// scene.js — 특강 챕터 오프닝 «VS Code» — 흩어진 파일을 한 화면에, AI 에게 바로 시킨다
// 4:3 1600×1200 · 10초 · 결정론(Math.random·Date 금지 — 흩뿌림은 seed 고정 PRNG) · 시스템 글꼴만
// 흐름: 제목 강타 → 파일 카드가 화면에 흩어짐 → 창이 열리며 탐색기로 정렬 → 네 영역 → AI 에게 요청 → 바뀐 줄 표시 → 실행 확인 → 한 줄 결론
// 공통 머리(수학·배경·제목·결론)는 03-git 과 같은 상수 — 장면은 scene.js 한 파일만 읽히므로 복제한다
(function (root) {
var W = 1600, H = 1200, DUR = 10;
var C = {
  bg: '#FFFFFF', panel: '#F1F5F9', ink: '#0F172A', muted: '#64748B', line: '#CBD5E1',
  accent: '#D49B00', green: '#16A34A', red: '#DC2626', blue: '#2563EB',
};
var KR = '"Apple SD Gothic Neo", "Noto Sans KR", sans-serif';
var MONO = 'Menlo, "SF Mono", monospace';

// ── 수학 ──────────────────────────────────────────────────────────────────
function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
function seg(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }
function ease(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
function back(p) { if (p <= 0) return 0; if (p >= 1) return 1; var c = 1.70158; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); }
function es(t, a, b) { return ease(seg(t, a, b)); }
function eb(t, a, b) { return back(seg(t, a, b)); }
function lerp(a, b, p) { return a + (b - a) * p; }
function hex(c) { return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; }
function rgba(c, a) { var x = hex(c); return 'rgba(' + x[0] + ',' + x[1] + ',' + x[2] + ',' + a + ')'; }
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
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var r = Math.imul(a ^ a >>> 15, 1 | a);
    r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r;
    return ((r ^ r >>> 14) >>> 0) / 4294967296;
  };
}

// ── 시간표 (초) — 화면·소리 공용 SSOT ──────────────────────────────────────
var T = {
  slam: 0.15, lift: 1.4, tag: 2.0,
  scatter: 2.2, frame: 3.3, fly: 3.4, regions: 4.3, code: 4.5,
  ask: 5.0, typed: 6.2, insert: 6.4, applied: 7.4, run: 7.6, ok: 7.95, punch: 8.7,
};

// ── 공통: 배경 · 제목 · 한 줄 결론 ────────────────────────────────────────
function drawBg(ctx) {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  var g = ctx.createRadialGradient(W / 2, H * 0.48, 0, W / 2, H * 0.48, 900);
  g.addColorStop(0, rgba(C.accent, 0.07));
  g.addColorStop(1, rgba(C.accent, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = rgba(C.ink, 0.05);
  for (var x = 25; x < W; x += 50) for (var y = 25; y < H; y += 50) ctx.fillRect(x, y, 2, 2);
}
function drawRich(ctx, parts, cx, y, font) {
  ctx.font = font;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  var total = 0, i;
  for (i = 0; i < parts.length; i++) total += ctx.measureText(parts[i][0]).width;
  var x = cx - total / 2;
  for (i = 0; i < parts.length; i++) {
    ctx.fillStyle = parts[i][1];
    ctx.fillText(parts[i][0], x, y);
    x += ctx.measureText(parts[i][0]).width;
  }
}
function drawTitle(ctx, t, word, tag) {
  var a = seg(t, T.slam, T.slam + 0.3);
  if (a <= 0) return;
  var s = lerp(1.9, 1, eb(t, T.slam, T.slam + 0.75));
  var m = es(t, T.lift, T.lift + 0.8);
  var size = lerp(300, 150, m);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(W / 2, lerp(H * 0.47, 200, m));
  ctx.scale(s, s);
  ctx.fillStyle = C.ink;
  ctx.font = '800 ' + size + 'px ' + KR;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(word, 0, 0);
  var tw = ctx.measureText(word).width, u = es(t, T.slam + 0.5, T.slam + 1.1);
  ctx.fillStyle = C.accent;
  ctx.fillRect(-tw / 2 * u, size * 0.5, tw * u, size * 0.07);
  ctx.restore();
  var ta = seg(t, T.tag, T.tag + 0.6);
  if (ta > 0) {
    ctx.save();
    ctx.globalAlpha = ta;
    drawRich(ctx, tag, W / 2, 320 + (1 - ta) * 16, '600 36px ' + KR);
    ctx.restore();
  }
}
function drawPunch(ctx, t, parts) {
  var a = es(t, T.punch, T.punch + 0.6);
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;
  drawRich(ctx, parts, W / 2, 1070 + (1 - a) * 24, '700 54px ' + KR);
  ctx.restore();
}
function text(ctx, s, x, y, col, font, align, alpha) {
  if (alpha <= 0) return;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = col;
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
  ctx.globalAlpha = 1;
}

// ── 창 배치 (네 영역) ─────────────────────────────────────────────────────
var WIN = { x: 160, y: 370, w: 1280, h: 540 }, BAR = 36;
var EXP_R = 420, AI_L = 1140, TERM_T = 760;
var FILES = ['login.js', 'index.html', 'style.css', 'README.md', 'api.py', 'db.sql', 'app.js',
             'test.js', 'config.yml', 'utils.py', 'notes.md', 'main.py', 'server.js', 'logo.png'];
var SCAT = (function () {
  var r = mulberry32(20261106), out = [];
  for (var i = 0; i < FILES.length; i++) {
    out.push({ x: 120 + r() * 1210, y: 390 + r() * 560, rot: (r() - 0.5) * 0.6 });
  }
  return out;
})();
var CODE = [[90, 300], [60, 200], [90, 260], [0, 0], [60, 320], [90, 240], [60, 180]];   // [들여쓰기, 길이]
var ADD = [[90, 280], [120, 220], [90, 250]];
var LH = 30, CODE_Y = 450, INS_AT = 3;

function drawFiles(ctx, t) {
  for (var i = 0; i < FILES.length; i++) {
    var a = eb(t, T.scatter + i * 0.05, T.scatter + 0.4 + i * 0.05);
    if (a <= 0) continue;
    var f = es(t, T.fly + i * 0.05, T.fly + 0.8 + i * 0.05);
    var s = SCAT[i];
    var w = lerp(160, 228, f), h = lerp(54, 26, f);
    var cx = lerp(s.x + 80, 178 + 114, f), cy = lerp(s.y, 448 + i * 30, f);   // 카드 중심 — 끝은 탐색기 줄
    var hl = i === 0 ? es(t, T.insert, T.insert + 0.4) : 0;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(lerp(s.rot, 0, f));
    ctx.scale(a, a);
    ctx.fillStyle = hl > 0 ? rgba(C.accent, lerp(0, 0.28, hl)) : rgba(C.panel, lerp(1, 0, f));
    rr(ctx, -w / 2, -h / 2, w, h, lerp(10, 5, f));
    ctx.fill();
    ctx.strokeStyle = rgba(C.ink, lerp(0.25, 0, f));
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = hl > 0 ? C.accent : C.ink;
    ctx.font = (hl > 0 ? '700 ' : '500 ') + Math.round(lerp(24, 19, f)) + 'px ' + MONO;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(FILES[i], -w / 2 + lerp(16, 12, f), 1);
    ctx.restore();
  }
}

function drawWindow(ctx, t) {
  var wa = es(t, T.frame, T.frame + 0.6);
  if (wa <= 0) return;
  ctx.globalAlpha = wa;
  ctx.fillStyle = '#F8FAFC';
  rr(ctx, WIN.x, WIN.y, WIN.w, WIN.h, 18);
  ctx.fill();
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = C.panel;
  rr(ctx, WIN.x, WIN.y, WIN.w, BAR, 18);
  ctx.fill();
  ctx.fillRect(WIN.x, WIN.y + BAR / 2, WIN.w, BAR / 2);
  var dots = [C.red, C.accent, C.green];
  for (var d = 0; d < 3; d++) {
    ctx.fillStyle = rgba(dots[d], 0.7);
    ctx.beginPath(); ctx.arc(WIN.x + 26 + d * 24, WIN.y + BAR / 2, 7, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // 네 영역 구분선 + 이름
  var ra = es(t, T.regions, T.regions + 0.5);
  if (ra <= 0) return;
  ctx.globalAlpha = ra;
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(EXP_R, WIN.y + BAR); ctx.lineTo(EXP_R, WIN.y + WIN.h);
  ctx.moveTo(AI_L, WIN.y + BAR); ctx.lineTo(AI_L, WIN.y + WIN.h);
  ctx.moveTo(EXP_R, TERM_T); ctx.lineTo(AI_L, TERM_T);
  ctx.stroke();
  ctx.globalAlpha = 1;
  var lf = '700 20px ' + KR;
  text(ctx, '① 탐색기', 178, WIN.y + BAR + 16, C.muted, lf, 'left', ra);
  text(ctx, '② 편집기', EXP_R + 18, WIN.y + BAR + 16, C.muted, lf, 'left', ra);
  text(ctx, '③ 터미널', EXP_R + 18, TERM_T + 20, C.muted, lf, 'left', ra);
  text(ctx, '④ AI', AI_L + 18, WIN.y + BAR + 16, C.muted, lf, 'left', ra);
}

function bar(ctx, x, y, w, col) {
  ctx.fillStyle = col;
  rr(ctx, x, y - 6, w, 12, 6);
  ctx.fill();
}
function drawCode(ctx, t) {
  var ca = es(t, T.code, T.code + 0.5);
  if (ca <= 0) return;
  var ip = es(t, T.insert, T.insert + 0.5);
  var gx = EXP_R + 20, x0 = EXP_R + 60;
  ctx.globalAlpha = ca;
  for (var i = 0; i < CODE.length; i++) {
    var y = CODE_Y + i * LH + (i >= INS_AT ? ADD.length * LH * ip : 0);
    text(ctx, String(i + 1), gx + 14, y, rgba(C.muted, 0.6), '500 16px ' + MONO, 'right', ca);
    ctx.globalAlpha = ca;
    if (CODE[i][1] > 0) {
      bar(ctx, x0 + CODE[i][0] - 60, y, 46, rgba(C.blue, 0.55));
      bar(ctx, x0 + CODE[i][0] - 4, y, CODE[i][1], rgba(C.ink, 0.2));
    }
  }
  ctx.globalAlpha = 1;
  for (var k = 0; k < ADD.length; k++) {
    var ka = es(t, T.insert + 0.2 + k * 0.15, T.insert + 0.5 + k * 0.15);
    if (ka <= 0) continue;
    var yk = CODE_Y + (INS_AT + k) * LH;
    ctx.globalAlpha = ka;
    ctx.fillStyle = rgba(C.green, 0.14);
    ctx.fillRect(EXP_R + 2, yk - LH / 2, AI_L - EXP_R - 4, LH);
    ctx.fillStyle = C.green;
    ctx.fillRect(EXP_R + 2, yk - LH / 2, 4, LH);
    text(ctx, '+', gx + 14, yk, C.green, '700 20px ' + MONO, 'right', ka);
    ctx.globalAlpha = ka;
    bar(ctx, x0 + ADD[k][0] - 60, yk, lerp(0, ADD[k][1], ka), rgba(C.green, 0.85));
    ctx.globalAlpha = 1;
  }
}

function drawAI(ctx, t) {
  var ba = eb(t, T.ask, T.ask + 0.4);
  if (ba <= 0) return;
  var bx = AI_L + 16, by = WIN.y + BAR + 40, bw = WIN.x + WIN.w - 16 - bx, bh = 116;
  ctx.save();
  ctx.translate(bx + bw, by);
  ctx.scale(ba, ba);
  ctx.fillStyle = rgba(C.accent, 0.16);
  rr(ctx, -bw, 0, bw, bh, 16);
  ctx.fill();
  ctx.strokeStyle = rgba(C.accent, 0.6);
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  var msg = ['로그인 화면을', '추가해 줘'];
  var n = Math.floor(seg(t, T.ask + 0.3, T.typed) * (msg[0].length + msg[1].length));
  var l1 = msg[0].substr(0, Math.min(n, msg[0].length));
  var l2 = n > msg[0].length ? msg[1].substr(0, n - msg[0].length) : '';
  text(ctx, l1, bx + 18, by + 38, C.ink, '700 28px ' + KR, 'left', 1);
  text(ctx, l2, bx + 18, by + 78, C.ink, '700 28px ' + KR, 'left', 1);
  var ra = es(t, T.applied, T.applied + 0.4);
  if (ra > 0) {
    ctx.globalAlpha = ra;
    ctx.fillStyle = rgba(C.green, 0.14);
    rr(ctx, bx, by + bh + 22, bw, 64, 14);
    ctx.fill();
    ctx.globalAlpha = 1;
    text(ctx, '✓ 편집기에 반영함', bx + 18, by + bh + 54, C.green, '700 24px ' + KR, 'left', ra);
  }
}

function drawTerm(ctx, t) {
  text(ctx, '▶ 실행', EXP_R + 24, TERM_T + 66, C.muted, '600 24px ' + KR, 'left', es(t, T.run, T.run + 0.3));
  text(ctx, '✓ 새 화면이 열림', EXP_R + 24, TERM_T + 106, C.green, '700 26px ' + KR, 'left', es(t, T.ok, T.ok + 0.3));
}

function draw(ctx, t) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  drawBg(ctx);
  drawTitle(ctx, t, 'VS Code', [['질문 1  ', C.accent], ['그 코드가 어디에 있지?', C.muted]]);
  drawWindow(ctx, t);
  drawCode(ctx, t);
  drawAI(ctx, t);
  drawTerm(ctx, t);
  drawFiles(ctx, t);
  drawPunch(ctx, t, [['흩어진 파일을 ', C.ink], ['한 화면에', C.accent], [' — AI 에게 바로 시킨다', C.ink]]);
  ctx.restore();
}

root.MG = {
  NAME: 'vscode-md-git-01-vscode',
  W: W, H: H, FPS: 30, DUR: DUR,
  T: T,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () {
    var ev = [{ t: T.slam, type: 'thump' }, { t: T.lift, type: 'whoosh', dur: 0.6 }];
    for (var i = 0; i < FILES.length; i += 2) ev.push({ t: Math.round((T.scatter + i * 0.05) * 1000) / 1000, type: 'tick' });
    ev.push({ t: T.fly, type: 'whoosh', dur: 0.8 });
    for (var k = 0; k < 6; k++) ev.push({ t: Math.round((T.ask + 0.3 + k * 0.15) * 1000) / 1000, type: 'key', seed: k + 1 });
    ev.push({ t: T.insert + 0.2, type: 'pop' });
    ev.push({ t: T.ok, type: 'ding', gain: 0.6 });
    return ev;
  },
};
})(typeof window !== 'undefined' ? window : globalThis);
