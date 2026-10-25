// scene.js — 특강 챕터 오프닝 «Markdown» — 기호 몇 개로, 사람도 AI 도 같은 문서를 읽는다
// 4:3 1600×1200 · 10초 · 결정론(Math.random·Date 금지 — 모든 값은 t 의 함수) · 시스템 글꼴만
// 흐름: 제목 강타 → 기호를 붙여 타이핑 → 한 줄씩 제목·목록·인용으로 변신 → «AI 가 읽음 / 사람이 읽음» → 같은 파일 하나 → 한 줄 결론
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

// ── 시간표 (초) — 화면·소리 공용 SSOT ──────────────────────────────────────
var T = {
  slam: 0.15, lift: 1.4, tag: 2.0,
  panels: 2.2, type: 2.6, typed: 4.6, conv: 4.9,
  ai: 6.6, human: 7.0, same: 7.6, punch: 8.7,
};
var CONV_GAP = 0.35, CONV_LEN = 0.6;

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

// ── 두 패널: 적는 그대로(원문) · 보이는 모습(렌더) ──────────────────────────
var PL = { x: 130, y: 400, w: 640, h: 470 }, PR = { x: 830, y: 400, w: 640, h: 470 };
var RAW = [['#', ' 회원가입 기능'], ['-', ' 이메일로 가입'], ['-', ' 가입하면 환영 메일'], ['>', ' 비밀번호는 암호화']];
var RAW_Y = [480, 570, 650, 740], OUT_Y = [482, 572, 640, 742];
var RAW_FONT = '600 36px ' + MONO;
var TOTAL = (function () { var n = 0; for (var i = 0; i < RAW.length; i++) n += RAW[i][0].length + RAW[i][1].length; return n; })();

function convAt(i) { return T.conv + i * CONV_GAP; }

function drawPanels(ctx, t) {
  var a = es(t, T.panels, T.panels + 0.5);
  if (a <= 0) return;
  var p = [PL, PR], lab = ['적는 그대로', '보이는 모습'];
  for (var k = 0; k < 2; k++) {
    var dy = (1 - a) * 30;
    ctx.globalAlpha = a;
    ctx.fillStyle = k === 0 ? '#F8FAFC' : C.panel;
    rr(ctx, p[k].x, p[k].y + dy, p[k].w, p[k].h, 20);
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;
    text(ctx, lab[k], p[k].x + 24, p[k].y + 32 + dy, C.muted, '700 22px ' + KR, 'left', a);
  }
  // 가운데 화살표
  var ar = es(t, T.conv - 0.2, T.conv + 0.3);
  if (ar > 0) {
    ctx.globalAlpha = ar;
    ctx.fillStyle = C.accent;
    ctx.beginPath();
    ctx.moveTo(782, 610); ctx.lineTo(818, 635); ctx.lineTo(782, 660);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawRaw(ctx, t) {
  var n = Math.floor(seg(t, T.type, T.typed) * TOTAL);
  var used = 0, curX = -1, curY = 0;
  ctx.font = RAW_FONT;
  for (var i = 0; i < RAW.length; i++) {
    var sym = RAW[i][0], rest = RAW[i][1];
    var len = sym.length + rest.length, k = clamp(n - used, 0, len);
    used += len;
    if (k <= 0) continue;
    var x = PL.x + 40, y = RAW_Y[i];
    // 변신 순간 기호가 빛난다
    var c0 = convAt(i), glow = seg(t, c0, c0 + 0.2) * (1 - seg(t, c0 + 0.4, c0 + 0.9));
    ctx.font = RAW_FONT;
    var sw = ctx.measureText(sym).width;
    if (glow > 0) {
      ctx.fillStyle = rgba(C.accent, 0.35 * glow);
      rr(ctx, x - 8, y - 26, sw + 16, 52, 10);
      ctx.fill();
    }
    text(ctx, sym, x, y, C.accent, '800 36px ' + MONO, 'left', 1);
    var shown = rest.substr(0, k - sym.length);
    if (k > sym.length) text(ctx, shown, x + sw, y, C.ink, RAW_FONT, 'left', 1);
    ctx.font = RAW_FONT;
    curX = x + sw + (k > sym.length ? ctx.measureText(shown).width : 0);
    curY = y;
  }
  if (curX >= 0 && t < T.conv && Math.floor(t * 2.5) % 2 === 0) {
    ctx.fillStyle = C.accent;
    ctx.fillRect(curX + 4, curY - 22, 16, 44);
  }
}

function drawRendered(ctx, t) {
  var x = PR.x + 40;
  for (var i = 0; i < RAW.length; i++) {
    var c0 = convAt(i), a = es(t, c0, c0 + CONV_LEN);
    if (a <= 0) continue;
    var dx = (1 - a) * -70, y = OUT_Y[i], body = RAW[i][1].substr(1);
    // 원문에서 건너오는 빛줄기
    var st = seg(t, c0, c0 + 0.45);
    if (st > 0 && st < 1) {
      ctx.globalAlpha = 0.6 * (1 - st);
      ctx.fillStyle = C.accent;
      ctx.fillRect(lerp(PL.x + 200, PR.x + 40, st), RAW_Y[i] - 2 + (y - RAW_Y[i]) * st, 120, 4);
      ctx.globalAlpha = 1;
    }
    ctx.save();
    ctx.translate(dx, 0);
    if (i === 0) {
      text(ctx, body, x, y, C.ink, '800 50px ' + KR, 'left', a);
      ctx.globalAlpha = a;
      ctx.fillStyle = C.line;
      ctx.fillRect(x, y + 38, 560, 3);
    } else if (RAW[i][0] === '-') {
      ctx.globalAlpha = a;
      ctx.fillStyle = C.accent;
      ctx.beginPath(); ctx.arc(x + 10, y, 7, 0, Math.PI * 2); ctx.fill();
      text(ctx, body, x + 34, y, C.ink, '500 36px ' + KR, 'left', a);
    } else {
      ctx.globalAlpha = a;
      ctx.fillStyle = C.accent;
      ctx.fillRect(x, y - 30, 7, 60);
      text(ctx, body, x + 28, y, C.muted, '600 34px ' + KR, 'left', a);
    }
    ctx.restore();
  }
}

function badge(ctx, s, cx, y, col, p) {
  if (p <= 0) return;
  ctx.save();
  ctx.translate(cx, y);
  ctx.scale(p, p);
  ctx.font = '800 30px ' + KR;
  var w = ctx.measureText(s).width + 56;
  ctx.fillStyle = rgba(col, 0.18);
  rr(ctx, -w / 2, -30, w, 60, 30);
  ctx.fill();
  ctx.strokeStyle = col;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = col;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, 0, 1);
  ctx.restore();
}
function drawReaders(ctx, t) {
  var lx = PL.x + PL.w / 2, rx = PR.x + PR.w / 2, by = 912;
  badge(ctx, 'AI 가 읽음', lx, by, C.green, eb(t, T.ai, T.ai + 0.45));
  badge(ctx, '사람이 읽음', rx, by, C.blue, eb(t, T.human, T.human + 0.45));
  var sp = es(t, T.same, T.same + 0.6);
  if (sp <= 0) return;
  var y = 968;
  ctx.strokeStyle = rgba(C.ink, 0.45);
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(lx, by + 32); ctx.lineTo(lx, y);
  ctx.lineTo(lerp(lx, (lx + rx) / 2, sp), y);
  ctx.moveTo(rx, by + 32); ctx.lineTo(rx, y);
  ctx.lineTo(lerp(rx, (lx + rx) / 2, sp), y);
  ctx.stroke();
  var la = seg(t, T.same + 0.4, T.same + 0.8);
  if (la > 0) {
    ctx.globalAlpha = la;
    ctx.fillStyle = C.bg;
    rr(ctx, (lx + rx) / 2 - 150, y - 22, 300, 44, 22);   // 선 위에 얹는 바탕
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  text(ctx, '같은 .md 파일 하나', (lx + rx) / 2, y + 1, C.ink, '700 28px ' + KR, 'center', la);
}

function draw(ctx, t) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  drawBg(ctx);
  drawTitle(ctx, t, 'Markdown', [['질문 2  ', C.accent], ['AI 에게 무엇을 시켰더라?', C.muted]]);
  drawPanels(ctx, t);
  drawRaw(ctx, t);
  drawRendered(ctx, t);
  drawReaders(ctx, t);
  drawPunch(ctx, t, [['기호 몇 개로 — ', C.ink], ['사람도 AI 도', C.accent], [' 같은 문서를 읽는다', C.ink]]);
  ctx.restore();
}

root.MG = {
  NAME: 'vscode-md-git-02-markdown',
  W: W, H: H, FPS: 30, DUR: DUR,
  T: T,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () {
    var ev = [{ t: T.slam, type: 'thump' }, { t: T.lift, type: 'whoosh', dur: 0.6 }];
    for (var k = 0; k < 12; k++) ev.push({ t: Math.round((T.type + k * (T.typed - T.type) / 12) * 1000) / 1000, type: 'key', seed: k + 1 });
    for (var i = 0; i < RAW.length; i++) ev.push({ t: Math.round(convAt(i) * 1000) / 1000, type: 'pop' });
    ev.push({ t: T.ai, type: 'click' }, { t: T.human, type: 'click' });
    ev.push({ t: T.same + 0.4, type: 'ding', gain: 0.6 });
    return ev;
  },
};
})(typeof window !== 'undefined' ? window : globalThis);
