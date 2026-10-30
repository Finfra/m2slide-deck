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
