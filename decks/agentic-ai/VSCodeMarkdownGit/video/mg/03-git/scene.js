// scene.js — 특강 챕터 오프닝 «Git» — 되돌아갈 수 있으니, 마음껏 시도한다
// 4:3 1600×1200 · 10초 · 결정론(Math.random·Date 금지 — 모든 값은 t 의 함수) · 시스템 글꼴만
// 흐름: 제목 강타 → 저장 지점 5개 → 5번 망가짐 → 3번으로 되감기 → 갈래(실험) → 합치기 → 한 줄 결론
(function (root) {
var W = 1600, H = 1200, DUR = 10;
var C = {
  bg: '#FFFFFF', panel: '#F1F5F9', ink: '#0F172A', muted: '#64748B', line: '#CBD5E1',
  accent: '#D49B00', green: '#16A34A', red: '#DC2626', blue: '#2563EB',
};
var KR = '"Apple SD Gothic Neo", "Noto Sans KR", sans-serif';

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
function mix(a, b, p) { var x = hex(a), y = hex(b); return 'rgb(' + Math.round(lerp(x[0], y[0], p)) + ',' + Math.round(lerp(x[1], y[1], p)) + ',' + Math.round(lerp(x[2], y[2], p)) + ')'; }
function bez(p0, p1, p2, p3, u) {
  var v = 1 - u;
  return [v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0],
          v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]];
}

// ── 시간표 (초) — 화면·소리 공용 SSOT ──────────────────────────────────────
var T = {
  slam: 0.15, lift: 1.4, tag: 2.0, line: 2.2,
  c1: 2.6, c2: 3.0, c3: 3.4, c4: 3.8, c5: 4.2,
  broke: 4.8, rewind: 5.6, back: 6.6,
  branch: 6.8, b1: 7.3, b2: 7.7, merge: 8.0, merged: 8.4, punch: 8.7,
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

// ── Git 그래프 ────────────────────────────────────────────────────────────
var Y0 = 640, XS = [250, 470, 690, 910, 1130], YB = 440;
var BR1 = [[690, Y0], [810, Y0], [810, YB], [910, YB]];
var MG1 = [[1130, YB], [1230, YB], [1230, Y0], [1330, Y0]];

function commit(ctx, x, y, r, col, alpha) {
  if (r <= 0) return;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.bg;
  ctx.beginPath(); ctx.arc(x, y, r * 0.42, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}
function label(ctx, text, x, y, col, alpha, font, align) {
  if (alpha <= 0) return;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = col;
  ctx.font = font || ('600 30px ' + KR);
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.globalAlpha = 1;
}
function curve(ctx, pts, p, col, width) {
  if (p <= 0) return;
  ctx.strokeStyle = col;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  var n = 40, k;
  for (k = 0; k <= n; k++) {
    var q = bez(pts[0], pts[1], pts[2], pts[3], p * k / n);
    if (k === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]);
  }
  ctx.stroke();
}

function drawGit(ctx, t) {
  var lp = es(t, T.line, T.line + 0.9);
  if (lp <= 0) return;
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(170, Y0); ctx.lineTo(lerp(170, 1450, lp), Y0); ctx.stroke();

  var rw = es(t, T.rewind, T.back);
  var keys = [T.c1, T.c2, T.c3, T.c4, T.c5];
  for (var i = 0; i < 5; i++) {
    var p = eb(t, keys[i], keys[i] + 0.45);
    if (p <= 0) continue;
    var alpha = i >= 3 ? lerp(1, 0.22, rw) : 1;
    var col = C.accent, x = XS[i];
    if (i === 4) {
      var br = seg(t, T.broke, T.broke + 0.25);
      col = mix(C.accent, C.red, br);
      var shake = seg(t, T.broke, T.broke + 0.08) * (1 - seg(t, T.broke + 0.45, T.broke + 0.65));
      x += Math.sin(t * 70) * 12 * shake;
    }
    commit(ctx, x, Y0, 30 * p, col, alpha);
    label(ctx, '저장 ' + (i + 1), XS[i], Y0 + 78, C.muted, seg(t, keys[i] + 0.1, keys[i] + 0.4) * alpha);
  }
  // 망가짐 — 금 간 표시
  var bk = seg(t, T.broke, T.broke + 0.3);
  if (bk > 0) {
    var ba = bk * lerp(1, 0.18, rw);
    ctx.globalAlpha = ba;
    ctx.strokeStyle = C.red;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(XS[4] - 22, Y0 - 44); ctx.lineTo(XS[4] - 4, Y0 - 62); ctx.lineTo(XS[4] + 6, Y0 - 46); ctx.lineTo(XS[4] + 24, Y0 - 66);
    ctx.stroke();
    ctx.globalAlpha = 1;
    label(ctx, '망가짐', XS[4], Y0 - 104, C.red, ba, '800 40px ' + KR);
  }
  // 되감기 — 고리가 3번으로 돌아감
  if (t >= T.rewind) {
    var rx = lerp(XS[4], XS[2], rw);
    var fade = 1 - seg(t, T.back + 0.2, T.back + 0.8);
    ctx.globalAlpha = 0.45 * fade;
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 12;
    ctx.beginPath(); ctx.moveTo(rx, Y0); ctx.lineTo(XS[4], Y0); ctx.stroke();
    ctx.globalAlpha = 1;
    var pulse = t > T.back ? 1 + 0.12 * Math.sin((t - T.back) * 6) * (1 - seg(t, T.back, T.back + 2)) : 1;
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(rx, Y0, 48 * pulse, 0, Math.PI * 2); ctx.stroke();
    label(ctx, '◀ 되돌리기', (XS[2] + XS[4]) / 2, Y0 - 34, C.accent, seg(t, T.rewind, T.rewind + 0.3) * fade, '800 34px ' + KR);
    label(ctx, '잘 되던 시점', XS[2] + 10, Y0 - 100, C.accent, seg(t, T.back - 0.1, T.back + 0.3), '800 36px ' + KR, 'right');
  }
  // 갈래(실험) — 3번에서 위로 갈라져 두 번 저장
  var s1 = es(t, T.branch, T.b1), s2 = es(t, T.b1 + 0.05, T.b2), s3 = es(t, T.merge, T.merged);
  curve(ctx, BR1, s1, C.blue, 8);
  if (s2 > 0) {
    ctx.strokeStyle = C.blue; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(910, YB); ctx.lineTo(lerp(910, 1130, s2), YB); ctx.stroke();
  }
  curve(ctx, MG1, s3, C.green, 8);
  commit(ctx, 910, YB, 30 * eb(t, T.b1, T.b1 + 0.45), C.blue, 1);
  commit(ctx, 1130, YB, 30 * eb(t, T.b2, T.b2 + 0.45), C.blue, 1);
  label(ctx, '실험', 1020, YB - 64, C.blue, seg(t, T.b1, T.b1 + 0.4), '800 36px ' + KR);
  commit(ctx, 1330, Y0, 36 * eb(t, T.merged, T.merged + 0.5), C.green, 1);
  label(ctx, '합치기', 1330, Y0 + 82, C.green, seg(t, T.merged, T.merged + 0.4), '800 34px ' + KR);
}

function draw(ctx, t) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  drawBg(ctx);
  drawTitle(ctx, t, 'Git', [['질문 3  ', C.accent], ['무엇이 언제 바뀌었지?', C.muted]]);
  drawGit(ctx, t);
  drawPunch(ctx, t, [['되돌아갈 수 있으니, ', C.ink], ['마음껏 시도', C.accent], ['한다', C.ink]]);
  ctx.restore();
}

root.MG = {
  NAME: 'vscode-md-git-03-git',
  W: W, H: H, FPS: 30, DUR: DUR,
  T: T,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () {
    return [
      { t: T.slam, type: 'thump' },
      { t: T.lift, type: 'whoosh', dur: 0.6 },
      { t: T.c1, type: 'pop' }, { t: T.c2, type: 'pop' }, { t: T.c3, type: 'pop' },
      { t: T.c4, type: 'pop' }, { t: T.c5, type: 'pop' },
      { t: T.broke, type: 'alert', gain: 0.5 },
      { t: T.rewind, type: 'whoosh', dur: 0.9 },
      { t: T.b1, type: 'pop' }, { t: T.b2, type: 'pop' },
      { t: T.merged, type: 'ding', gain: 0.6 },
    ];
  },
};
})(typeof window !== 'undefined' ? window : globalThis);
