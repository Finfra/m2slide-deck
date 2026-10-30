// scene.js — fPM intro motion graphic 04-board [en] — generated file, do not edit by hand
// source: fPmIntro/mg/_src/TEXT.js(en) + common.js + s04-board.js · compose: node decks/app/fPmIntro/mg/_src/compose.js
(function (root) {
var LANG = 'en';
var L = {
  "chip": "board",
  "title": "..board — see where it is now, don't wait",
  "steps": [
    "Run ..board",
    "SSE push",
    "Card refresh",
    "Completion alert"
  ],
  "term": "tmux · runner",
  "cmd": "..board create 1000 folders",
  "started": "runner started — tmux window",
  "sse": "SSE push",
  "card": "Dashboard",
  "running": "running",
  "done": "done",
  "prog": "Folders created",
  "elapsed": "Elapsed",
  "check": "Done when",
  "notice": "Completion alert — elapsed · result · artifacts",
  "foot": "\"Wait until it ends\" → \"See how far it got, live\""
};

var W = 1920, H = 1080;
var C = {
  bg: '#F7F9FC', ink: '#1C2430', sub: '#4A5566', muted: '#8892A0', line: '#DCE3EC', paper: '#FFFFFF',
  brand: '#2563EB', brandInk: '#1E40AF', tint: '#EAF1FE',
  red: '#C8341E', redTint: '#FDECE8', green: '#1F7A4D', greenTint: '#E4F3EA',
  term: '#1E2430', termInk: '#E6EDF3', termDim: '#7D8794', amber: '#E0A526',
};
var KR = LANG === 'ko'
  ? '"Apple SD Gothic Neo", "Noto Sans KR", sans-serif'
  : '"Helvetica Neue", Arial, "Noto Sans", sans-serif';
var MONO = 'Menlo, "SF Mono", "DejaVu Sans Mono", monospace';

function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
function seg(T, a, b) { return clamp((T - a) / (b - a), 0, 1); }
function ease(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
function es(T, a, b) { return ease(seg(T, a, b)); }
function lerp(a, b, p) { return a + (b - a) * p; }
function hex(c) { return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; }
function rgba(c, a) { var x = hex(c); return 'rgba(' + x[0] + ',' + x[1] + ',' + x[2] + ',' + a + ')'; }
function typed(s, T, a, cps) { return s.substr(0, Math.floor(clamp((T - a) * cps, 0, s.length))); }

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
function card(ctx, x, y, w, h, o) {
  o = o || {};
  ctx.save();
  ctx.globalAlpha *= (o.alpha == null ? 1 : o.alpha);
  if (o.shadow !== 0) {
    ctx.shadowColor = 'rgba(20,40,80,0.12)';
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
function txt(ctx, s, x, y, size, weight, color, align, maxW, font) {
  var f = font || KR;
  ctx.font = weight + ' ' + size + 'px ' + f;
  if (maxW) {
    var m = ctx.measureText(s).width;
    if (m > maxW) { size = Math.max(12, Math.floor(size * maxW / m)); ctx.font = weight + ' ' + size + 'px ' + f; }
  }
  ctx.fillStyle = color;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}
function tw(ctx, s, size, weight, font) {
  ctx.font = weight + ' ' + size + 'px ' + (font || KR);
  return ctx.measureText(s).width;
}
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
function stamp(ctx, cx, cy, r, p, color) {
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha *= Math.min(1, p * 1.6);
  var s = lerp(1.5, 1, p);
  ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-r * 0.42, 0); ctx.lineTo(-r * 0.1, r * 0.34); ctx.lineTo(r * 0.45, -r * 0.34); ctx.stroke();
  ctx.restore();
}
function bar(ctx, x, y, w, h, color) {
  ctx.fillStyle = color || C.line;
  rr(ctx, x, y - h / 2, w, h, h / 2);
  ctx.fill();
}
function pill(ctx, s, x, y, size, fill, ink, align, font) {
  var w = tw(ctx, s, size, 700, font) + size * 1.2, h = size * 1.7;
  var x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.fillStyle = fill;
  rr(ctx, x0, y - h / 2, w, h, h / 2);
  ctx.fill();
  txt(ctx, s, x0 + w / 2, y + 1, size, 700, ink, 'center', 0, font);
  return w;
}
function win(ctx, x, y, w, h, title, dark, a) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a;
  card(ctx, x, y, w, h, { fill: dark ? C.term : C.paper, stroke: dark ? C.term : C.line, r: 16 });
  ctx.fillStyle = dark ? '#2B3342' : '#EEF2F7';
  rr(ctx, x, y, w, 52, 16); ctx.fill();
  ctx.fillRect(x, y + 36, w, 16);
  var dots = ['#FF5F57', '#FEBC2E', '#28C840'];
  for (var i = 0; i < 3; i++) { ctx.fillStyle = dots[i]; ctx.beginPath(); ctx.arc(x + 30 + i * 26, y + 26, 8, 0, Math.PI * 2); ctx.fill(); }
  txt(ctx, title, x + w / 2, y + 27, 24, 700, dark ? C.termDim : C.sub, 'center', w - 220);
  ctx.restore();
}
function promptLine(ctx, T, x, y, head, trig, a, cps, size, color, accent, maxW) {
  var full = head + trig, s = typed(full, T, a, cps);
  if (T < a) return;
  var h = s.substr(0, Math.min(s.length, head.length)), g = s.length > head.length ? s.substr(head.length) : '';
  var fit = 1, fullW = tw(ctx, '> ' + full, size, 600, MONO);
  if (maxW && fullW > maxW) fit = maxW / fullW;
  var sz = Math.floor(size * fit);
  txt(ctx, '> ' + h, x, y, sz, 600, color, 'left', 0, MONO);
  var hw = tw(ctx, '> ' + h, sz, 600, MONO);
  if (g) txt(ctx, g, x + hw, y, sz, 800, accent, 'left', 0, MONO);
  var cw = tw(ctx, '> ' + s, sz, 600, MONO);
  if (s.length < full.length || Math.floor(T * 2) % 2 === 0) { ctx.fillStyle = color; ctx.fillRect(x + cw + 4, y - sz * 0.55, sz * 0.5, sz * 1.1); }
}

function header(ctx, T, chip, title, a) {
  var p = es(T, a, a + 0.6);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = p;
  var cw = Math.max(150, tw(ctx, chip, 34, 800) + 56);
  ctx.fillStyle = C.brand;
  rr(ctx, 70, 58, cw, 64, 32);
  ctx.fill();
  txt(ctx, chip, 70 + cw / 2, 91, 34, 800, '#FFFFFF', 'center');
  txt(ctx, title, 70 + cw + 30, 92 + (1 - p) * 10, 52, 800, C.ink, 'left', W - 70 - (70 + cw + 30));
  ctx.fillStyle = C.brand;
  ctx.fillRect(70, 146, (W - 140) * p, 6);
  ctx.restore();
}
function footer(ctx, T, s, a, color) {
  var p = es(T, a, a + 0.8);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = p;
  txt(ctx, s, W / 2, 1012 + (1 - p) * 12, 40, 800, color || C.brandInk, 'center', W - 200);
  ctx.restore();
}
function backdrop(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
}

var NAME = 'mg-04-board', DUR = 16;
var TL = { steps: 0.6, cmd: 1.0, start: 2.4, run: 2.8, end: 12.0, notice: 12.4, foot: 14.0 };
var TW = { x: 80, y: 300, w: 640, h: 600 }, DB = { x: 1080, y: 300, w: 760, h: 600 };
var MARKS = [100, 500, 1000];
function count(T) { return Math.round(1000 * seg(T, TL.run, TL.end)); }
function stepIndex(T) { return T < TL.run ? 0 : T < TL.run + 1.4 ? 1 : T < TL.end ? 2 : 3; }
function steps(ctx, T) {
  var cur = stepIndex(T), sw = 400, gap = 40, x0 = (W - (4 * sw + 3 * gap)) / 2;
  for (var i = 0; i < 4; i++) {
    var a = TL.steps + 0.15 * i, p = es(T, a, a + 0.5), x = x0 + i * (sw + gap);
    if (p <= 0) continue;
    ctx.save(); ctx.globalAlpha = p;
    var on = i === cur, past = i < cur;
    card(ctx, x, 186, sw, 80, { fill: on ? C.tint : C.paper, stroke: on ? C.brand : C.line, lw: on ? 4 : 2, shadow: on ? 1 : 0, r: 40 });
    ctx.fillStyle = on || past ? C.brand : C.line; ctx.beginPath(); ctx.arc(x + 42, 226, 22, 0, Math.PI * 2); ctx.fill();
    txt(ctx, String(i + 1), x + 42, 227, 26, 800, '#FFFFFF', 'center');
    txt(ctx, L.steps[i], x + 78, 226, 28, 700, C.ink, 'left', sw - 100);
    if (i < 3) arrow(ctx, x + sw + 6, 226, x + sw + gap - 6, 226, p, C.muted, 3);
    ctx.restore();
  }
}
function term(ctx, T) {
  var a = es(T, TL.cmd - 0.4, TL.cmd);
  win(ctx, TW.x, TW.y, TW.w, TW.h, L.term, true, a);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  var x = TW.x + 32, mw = TW.w - 64;
  if (T < TL.start) promptLine(ctx, T, x, TW.y + 100, L.cmd, '', TL.cmd, 24, 28, C.termInk, C.termInk, mw);
  else txt(ctx, '> ' + L.cmd, x, TW.y + 100, 28, 600, C.termInk, 'left', mw, MONO);
  var s = es(T, TL.start, TL.start + 0.4);
  if (s > 0) { ctx.globalAlpha = a * s; txt(ctx, '▶ ' + L.started, x, TW.y + 150, 26, 700, '#5FD08E', 'left', mw); }
  var n = Math.floor(clamp((Math.min(T, TL.end) - TL.run) * 4, 0, 999));
  for (var k = 0; k < 8; k++) {
    var idx = n - 8 + k;
    if (idx < 0) continue;
    var y = TW.y + 210 + k * 44;
    ctx.globalAlpha = a * (0.45 + 0.07 * k);
    txt(ctx, '#' + (idx + 1), x, y, 22, 600, C.termDim, 'left', 0, MONO);
    bar(ctx, x + 90, y, 120 + ((idx * 53) % 260), 12, '#3A4456');
  }
  ctx.restore();
}
function sse(ctx, T) {
  var a = es(T, TL.run, TL.run + 0.4) * (1 - es(T, TL.end + 0.2, TL.end + 0.8));
  if (a <= 0) return;
  var x1 = TW.x + TW.w + 30, x2 = DB.x - 30, y = DB.y + 300;
  ctx.save(); ctx.globalAlpha = a;
  ctx.strokeStyle = C.line; ctx.lineWidth = 4; ctx.setLineDash([8, 10]);
  ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke(); ctx.setLineDash([]);
  for (var k = 0; k < 5; k++) {
    var f = ((T - TL.run) * 0.8 + k / 5) % 1;
    ctx.fillStyle = rgba(C.brand, 0.3 + 0.7 * Math.sin(f * Math.PI));
    ctx.beginPath(); ctx.arc(lerp(x1, x2, f), y, 11, 0, Math.PI * 2); ctx.fill();
  }
  txt(ctx, L.sse, (x1 + x2) / 2, y - 48, 28, 800, C.brandInk, 'center', x2 - x1);
  ctx.restore();
}
function mmss(s) { var m = Math.floor(s / 60), r = s % 60; return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r; }
function dashboard(ctx, T) {
  var a = es(T, TL.cmd, TL.cmd + 0.6);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  card(ctx, DB.x, DB.y, DB.w, DB.h, { r: 18 });
  var x = DB.x + 44, w = DB.w - 88, n = count(T), done = T >= TL.end;
  txt(ctx, L.card, x, DB.y + 56, 34, 800, C.ink, 'left', w - 220);
  if (T >= TL.run) pill(ctx, done ? L.done : L.running, DB.x + DB.w - 44, DB.y + 56, 26, done ? C.green : C.amber, '#FFFFFF', 'right');
  txt(ctx, L.prog, x, DB.y + 130, 26, 700, C.sub, 'left', w / 2);
  txt(ctx, n + ' / 1000', x, DB.y + 186, 60, 800, C.ink, 'left', w / 2, MONO);
  var el = Math.floor(clamp(T - TL.run, 0, TL.end - TL.run) * 60);
  txt(ctx, L.elapsed, x + w, DB.y + 130, 26, 700, C.sub, 'right', w / 2);
  txt(ctx, mmss(el), x + w, DB.y + 186, 60, 800, C.ink, 'right', w / 2, MONO);
  ctx.fillStyle = C.line; rr(ctx, x, DB.y + 240, w, 26, 13); ctx.fill();
  if (n > 0) { ctx.fillStyle = done ? C.green : C.brand; rr(ctx, x, DB.y + 240, Math.max(26, w * n / 1000), 26, 13); ctx.fill(); }
  txt(ctx, L.check, x, DB.y + 316, 26, 700, C.sub, 'left', w);
  for (var i = 0; i < 3; i++) {
    var cx = x + i * (w / 3), y = DB.y + 380, hit = n >= MARKS[i];
    card(ctx, cx, y - 34, w / 3 - 20, 68, { fill: hit ? C.greenTint : C.paper, stroke: hit ? C.green : C.line, shadow: 0, r: 14 });
    txt(ctx, String(MARKS[i]), cx + 30, y + 1, 32, 800, hit ? C.green : C.muted, 'left', 0, MONO);
    if (hit) { var t0 = TL.run + (TL.end - TL.run) * MARKS[i] / 1000; stamp(ctx, cx + w / 3 - 64, y, 22, es(T, t0, t0 + 0.4), C.green); }
  }
  var q = es(T, TL.notice, TL.notice + 0.6);
  if (q > 0) {
    ctx.globalAlpha = a * q;
    card(ctx, x, DB.y + 470 + (1 - q) * 20, w, 86, { fill: C.green, stroke: C.green, r: 16 });
    txt(ctx, L.notice, x + w / 2, DB.y + 514 + (1 - q) * 20, 28, 800, '#FFFFFF', 'center', w - 40);
  }
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, L.chip, L.title, 0.2);
  steps(ctx, T);
  term(ctx, T);
  sse(ctx, T);
  dashboard(ctx, T);
  footer(ctx, T, L.foot, TL.foot);
}

root.MG = {
  NAME: NAME,
  W: W, H: H, FPS: 30, DUR: DUR,
  T: TL,
  renderFrame: function (ctx, t) { draw(ctx, clamp(t, 0, DUR)); },
  sfxEvents: function () { return []; },
};
})(typeof window !== 'undefined' ? window : globalThis);
