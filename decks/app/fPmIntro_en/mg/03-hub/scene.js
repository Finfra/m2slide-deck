// scene.js — fPM 소개 모션그래픽 03-hub (hub 모드) [en] — 생성 파일, 직접 고치지 않는다
// 원본: fPmIntro/mg/_src/TEXT.js(en) + common.js + s03-hub.js · 합성: node decks/app/fPmIntro/mg/_src/compose.js
(function (root) {
var LANG = 'en';
var L = {
  "chip": "hub",
  "title": "One trigger word turns chat into a doc or a form",
  "chat": "Claude Code",
  "browser": "Browser",
  "prompt1": "What's in my Desktop folder? ",
  "trig1": "..show",
  "prompt2": "Suggest folders I could remove. ",
  "trig2": "..ask",
  "rendered": "Rendered as an HTML doc",
  "docTitle": "Desktop folder contents",
  "cols": [
    "Name",
    "Kind",
    "Size"
  ],
  "keep": "Stays as a file / link to re-read and share",
  "formTitle": "Pick folders to remove",
  "opts": [
    "Folder A",
    "Folder B",
    "Folder C"
  ],
  "send": "Submit",
  "inbox": "Server inbox",
  "poll": "Poll form answer inbox",
  "recv": "Answer received → work continues",
  "foot": "Answers persist as docs; choices come back via forms"
};
// common.js — 6개 장면이 공유하는 그리기 도구 (compose.js 가 각 scene.js 에 전문을 싣는다)
// 결정론: 난수·시계 API 금지 — 모든 값은 시간 T 의 함수다. 글꼴은 시스템 글꼴만.
// 캔버스 1920×1080 — 덱 _config.yml 에 slide_ratio 미지정 → m2slide 기본 16:9
// compose.js 가 이 파일 앞에 LANG('ko'|'en') 과 문구 L 을 주입한다.

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

// ── 수학 ──────────────────────────────────────────────────────────────────
function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
function seg(T, a, b) { return clamp((T - a) / (b - a), 0, 1); }
function ease(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
function es(T, a, b) { return ease(seg(T, a, b)); }
function lerp(a, b, p) { return a + (b - a) * p; }
function hex(c) { return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; }
function rgba(c, a) { var x = hex(c); return 'rgba(' + x[0] + ',' + x[1] + ',' + x[2] + ',' + a + ')'; }
// 타이핑 — a 부터 초당 cps 글자씩 드러난 앞부분
function typed(s, T, a, cps) { return s.substr(0, Math.floor(clamp((T - a) * cps, 0, s.length))); }

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
// 글자 — size px, weight, color, align(left|center|right), 기준선 middle
// maxW 를 주면 넘칠 때 글자 크기를 줄여 맞춘다 (ko·en 길이 차이 흡수)
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
  ctx.globalAlpha *= Math.min(1, p * 1.6);
  var s = lerp(1.5, 1, p);
  ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-r * 0.42, 0); ctx.lineTo(-r * 0.1, r * 0.34); ctx.lineTo(r * 0.45, -r * 0.34); ctx.stroke();
  ctx.restore();
}
// 자리표시 막대 — 원고에 없는 예시 데이터 대신
function bar(ctx, x, y, w, h, color) {
  ctx.fillStyle = color || C.line;
  rr(ctx, x, y - h / 2, w, h, h / 2);
  ctx.fill();
}
// 알약 — 글자 폭에 맞춘 둥근 칩. 너비를 돌려준다
function pill(ctx, s, x, y, size, fill, ink, align, font) {
  var w = tw(ctx, s, size, 700, font) + size * 1.2, h = size * 1.7;
  var x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.fillStyle = fill;
  rr(ctx, x0, y - h / 2, w, h, h / 2);
  ctx.fill();
  txt(ctx, s, x0 + w / 2, y + 1, size, 700, ink, 'center', 0, font);
  return w;
}
// 창 틀 — 어두운 터미널(dark) 또는 밝은 브라우저. 제목 표시줄 높이 52
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
// 프롬프트 줄 — 앞 글자는 기본색, 트리거(..show 등)는 강조색. 커서는 T 로 깜빡임
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

// ── 공통 틀: 머리(칩 + 제목) · 아래 한 줄 ──────────────────────────────────
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

// 장면 ③ — hub 모드 ..show · ..ask (원고 근거: 02 «..show — 응답을 HTML 문서로» · 02.1 «..ask — 폼으로 묻고 자동 회수» 흐름도)
var NAME = 'mg-03-hub', DUR = 18;
var TL = { win: 0.6, p1: 1.2, show: 3.4, doc: 4.2, keep: 6.8, p2: 8.2, form: 10.2, chkA: 11.4, chkB: 11.9, send: 12.4, toInbox: 12.8, toChat: 13.8, recv: 14.6, foot: 15.8 };
var CW = { x: 80, y: 190, w: 740, h: 720 }, BW = { x: 1100, y: 190, w: 740, h: 720 };
var INBOX = { x: 850, y: 740, w: 220, h: 72 };
var SEND = { x: BW.x + 60, y: BW.y + 560, w: 220, h: 72 };
function chat(ctx, T) {
  var a = es(T, TL.win, TL.win + 0.5);
  win(ctx, CW.x, CW.y, CW.w, CW.h, L.chat, true, a);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  var x = CW.x + 36, mw = CW.w - 72;
  if (T < TL.p2) promptLine(ctx, T, x, CW.y + 110, L.prompt1, L.trig1, TL.p1, 14, 28, C.termInk, '#7FB2FF', mw);
  else txt(ctx, '> ' + L.prompt1 + L.trig1, x, CW.y + 110, 28, 600, C.termDim, 'left', mw, MONO);
  // ..show 응답 — 본문 대신 짧은 회색 줄 (내용은 브라우저 쪽에)
  var r = es(T, TL.show, TL.show + 0.6);
  if (r > 0) {
    ctx.globalAlpha = a * r;
    bar(ctx, x, CW.y + 166, 360, 14, '#3A4456');
    bar(ctx, x, CW.y + 200, 260, 14, '#3A4456');
    ctx.globalAlpha = a;
  }
  promptLine(ctx, T, x, CW.y + 290, L.prompt2, L.trig2, TL.p2, 16, 28, C.termInk, '#7FB2FF', mw);
  var q = es(T, TL.toChat + 0.4, TL.toChat + 0.9);
  if (q > 0) {
    ctx.globalAlpha = a * q;
    txt(ctx, '⟳ ' + L.poll, x, CW.y + 380, 26, 600, C.termDim, 'left', mw, MONO);
  }
  var v = es(T, TL.recv, TL.recv + 0.5);
  if (v > 0) {
    ctx.globalAlpha = a * v;
    txt(ctx, '✓ ' + L.recv, x, CW.y + 432, 28, 700, '#5FD08E', 'left', mw);
  }
  ctx.restore();
}
function browserDoc(ctx, T, a) {
  var d = es(T, TL.doc, TL.doc + 0.5) * (1 - es(T, TL.form - 0.4, TL.form));
  if (d <= 0) return;
  ctx.save(); ctx.globalAlpha = a * d;
  var x = BW.x + 50, w = BW.w - 100;
  txt(ctx, L.docTitle, x, BW.y + 110, 34, 800, C.ink, 'left', w);
  ctx.fillStyle = C.brand; ctx.fillRect(x, BW.y + 140, w, 4);
  var cx = [x + 20, x + 330, x + 500];
  ctx.fillStyle = C.tint; rr(ctx, x, BW.y + 168, w, 56, 10); ctx.fill();
  for (var c = 0; c < 3; c++) txt(ctx, L.cols[c], cx[c], BW.y + 196, 24, 800, C.brandInk, 'left', 150);
  for (var i = 0; i < 4; i++) {
    var p = es(T, TL.doc + 0.6 + 0.4 * i, TL.doc + 1.0 + 0.4 * i), y = BW.y + 262 + i * 62;
    if (p <= 0) continue;
    ctx.globalAlpha = a * d * p;
    bar(ctx, cx[0], y, 200 - 30 * (i % 2), 16, C.line);
    bar(ctx, cx[1], y, 90, 16, C.line);
    bar(ctx, cx[2], y, 70 + 20 * ((i + 1) % 3), 16, C.line);
    ctx.fillStyle = C.line; ctx.fillRect(x, y + 31, w, 2);
  }
  var k = es(T, TL.keep, TL.keep + 0.5);
  if (k > 0) {
    ctx.globalAlpha = a * d * k;
    pill(ctx, '✓ ' + L.keep, BW.x + BW.w / 2, BW.y + 600, 26, C.greenTint, C.green, 'center');
  }
  ctx.restore();
}
function checkbox(ctx, x, y, on, label) {
  ctx.fillStyle = on > 0 ? C.brand : C.paper;
  ctx.strokeStyle = on > 0 ? C.brand : C.muted; ctx.lineWidth = 3;
  rr(ctx, x, y - 20, 40, 40, 8); ctx.fill(); ctx.stroke();
  if (on > 0) {
    ctx.save(); ctx.globalAlpha *= on;
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x + 9, y); ctx.lineTo(x + 17, y + 9); ctx.lineTo(x + 31, y - 9); ctx.stroke();
    ctx.restore();
  }
  txt(ctx, label, x + 64, y, 30, 700, C.ink, 'left', 300);
}
function browserForm(ctx, T, a) {
  var f = es(T, TL.form, TL.form + 0.8);
  if (f <= 0) return;
  ctx.save(); ctx.globalAlpha = a * f;
  var x = BW.x + 50, w = BW.w - 100;
  txt(ctx, L.formTitle, x, BW.y + 110, 34, 800, C.ink, 'left', w);
  ctx.fillStyle = C.brand; ctx.fillRect(x, BW.y + 140, w, 4);
  var on = [es(T, TL.chkA, TL.chkA + 0.25), es(T, TL.chkB, TL.chkB + 0.25), 0];
  for (var i = 0; i < 3; i++) {
    var y = BW.y + 230 + i * 92;
    card(ctx, x, y - 38, w, 76, { fill: on[i] > 0 ? C.tint : C.paper, stroke: on[i] > 0 ? C.brand : C.line, shadow: 0, r: 12 });
    checkbox(ctx, x + 24, y, on[i], L.opts[i]);
    bar(ctx, x + w - 190, y, 150, 14, C.line);
  }
  var s = es(T, TL.send, TL.send + 0.2) * (1 - es(T, TL.send + 0.25, TL.send + 0.5));
  var k = 1 - 0.06 * s;
  ctx.save();
  ctx.translate(SEND.x + SEND.w / 2, SEND.y + SEND.h / 2); ctx.scale(k, k);
  ctx.fillStyle = s > 0 ? C.brandInk : C.brand;
  rr(ctx, -SEND.w / 2, -SEND.h / 2, SEND.w, SEND.h, 14); ctx.fill();
  txt(ctx, L.send, 0, 2, 30, 800, '#FFFFFF', 'center', SEND.w - 30);
  ctx.restore();
  ctx.restore();
}
function browser(ctx, T) {
  var a = es(T, TL.win, TL.win + 0.5);
  var tab = T < TL.form ? (T < TL.doc ? L.browser : L.trig1 + ' — ' + L.docTitle) : L.trig2 + ' — ' + L.formTitle;
  win(ctx, BW.x, BW.y, BW.w, BW.h, tab, false, a);
  if (a <= 0) return;
  browserDoc(ctx, T, a);
  browserForm(ctx, T, a);
}
function links(ctx, T) {
  // ..show — 채팅에서 브라우저로
  var p = es(T, TL.show, TL.show + 0.8);
  arrow(ctx, CW.x + CW.w + 16, CW.y + 110, BW.x - 16, CW.y + 110, p, C.brand, 6);
  var q = es(T, TL.show + 0.4, TL.show + 0.9) * (1 - es(T, TL.p2, TL.p2 + 0.4));
  if (q > 0) { ctx.save(); ctx.globalAlpha = q; txt(ctx, L.rendered, W / 2 , CW.y + 64, 22, 700, C.brandInk, 'center', 260); ctx.restore(); }
  // ..ask — 채팅에서 브라우저로
  arrow(ctx, CW.x + CW.w + 16, CW.y + 290, BW.x - 16, CW.y + 290, es(T, TL.p2 + 1.6, TL.p2 + 2.2), C.brand, 6);
  // 응답 — 폼 전송 → 서버 inbox → Claude
  var b = es(T, TL.toInbox - 0.3, TL.toInbox);
  if (b <= 0) return;
  ctx.save(); ctx.globalAlpha = b;
  card(ctx, INBOX.x, INBOX.y, INBOX.w, INBOX.h, { fill: C.ink, stroke: C.ink, r: 14 });
  txt(ctx, L.inbox, INBOX.x + INBOX.w / 2, INBOX.y + INBOX.h / 2 + 1, 26, 800, '#FFFFFF', 'center', INBOX.w - 24);
  ctx.setLineDash([10, 10]); ctx.strokeStyle = rgba(C.green, 0.6); ctx.lineWidth = 4;
  var sx = SEND.x, sy = SEND.y + SEND.h / 2, ix = INBOX.x + INBOX.w / 2, iy = INBOX.y, cx = CW.x + CW.w, cy = CW.y + 432;
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(INBOX.x + INBOX.w, INBOX.y + INBOX.h / 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ix, iy); ctx.lineTo(cx, cy); ctx.stroke();
  ctx.setLineDash([]);
  var u = es(T, TL.toInbox, TL.toInbox + 0.8), v = es(T, TL.toChat, TL.toChat + 0.8), px, py;
  if (T < TL.toChat) { px = lerp(sx, INBOX.x + INBOX.w, u); py = lerp(sy, INBOX.y + INBOX.h / 2, u); }
  else { px = lerp(ix, cx, v); py = lerp(iy, cy, v); }
  if (v < 1) {
    ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(px, py, 14, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, L.chip, L.title, 0.2);
  chat(ctx, T);
  browser(ctx, T);
  links(ctx, T);
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
