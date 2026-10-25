// 장면 ⑤ — 4일차 알리기 (원고 근거: 4-0 «3일차 제안서의 차별점이 4일차 소재가 됨» · 4-1 사양표 → 홈페이지 시안
//          · «배포 주소는 공개로 바꾸면 누구나 열 수 있음 — 기본 비공개, 공개 전환은 사람이 정함»
//          · 4-3 «링크드인 — 믿고 문의하게 · 인스타그램 — 기억에 남게» · 4-5 공개 표 → directory.csv(5일차로))
var NAME = 'mg-04-day4', DUR = 17;
var TL = { line: 0.7, site: 2.0, hero: 2.6, url: 5.4, pub: 7.0, sns: 8.8, csv: 12.0, foot: 14.4 };
var B = { x: 70, y: 300, w: 740, h: 560 };
function lock(ctx, x, y, open, color) {
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 4;
  ctx.beginPath();
  if (open) ctx.arc(x + 4, y - 10, 9, Math.PI, Math.PI * 1.9);
  else ctx.arc(x, y - 10, 9, Math.PI, 0);
  ctx.stroke();
  rr(ctx, x - 13, y - 8, 26, 22, 4); ctx.fill();
  ctx.restore();
}
function draw(ctx, T) {
  backdrop(ctx);
  header(ctx, T, '4일차', '알리기 — 차별점 한 줄이 홈페이지와 SNS 로', 0.2);
  // 3일차에서 받은 차별점 한 줄
  var l = es(T, TL.line, TL.line + 0.6);
  if (l > 0) {
    ctx.save(); ctx.globalAlpha = l;
    txt(ctx, '3일차에서 받음', 70, 222, 26, 700, C.muted, 'left');
    card(ctx, 270, 186, 1100, 74, { fill: C.tint, stroke: C.brand, lw: 3, r: 37, shadow: 0 });
    txt(ctx, '차별점 — 납기 사전 통보 · 소량 주문', 820, 224, 32, 800, C.ink, 'center');
    ctx.restore();
  }
  // 홈페이지 시안 — 브라우저
  var s = es(T, TL.site, TL.site + 0.7);
  if (s > 0) {
    var pub = es(T, TL.pub, TL.pub + 0.6), u = es(T, TL.url, TL.url + 0.6);
    browser(ctx, B.x, B.y + (1 - s) * 30, B.w, B.h, u > 0 ? 'dg-db.netlify.app' : 'index.html', s);
    ctx.save(); ctx.globalAlpha = s;
    var h = es(T, TL.hero, TL.hero + 0.8);
    ctx.fillStyle = rgba(C.brand, 0.9 * h); rr(ctx, B.x + 30, B.y + 80, B.w - 60, 200, 14); ctx.fill();
    ctx.globalAlpha = s * h;
    txt(ctx, 'DG-DB 시리즈', B.x + 60, B.y + 150, 46, 800, C.ink, 'left');
    txt(ctx, '납기 사전 통보 · 소량 주문', B.x + 60, B.y + 214, 30, 700, C.brandInk, 'left');
    for (var k = 0; k < 3; k++) {
      var q = es(T, TL.hero + 0.6 + 0.3 * k, TL.hero + 1.0 + 0.3 * k);
      ctx.globalAlpha = s * q;
      card(ctx, B.x + 30 + k * 230, B.y + 310, 210, 150, { fill: C.paper, shadow: 0, r: 12 });
      ctx.fillStyle = C.line;
      ctx.fillRect(B.x + 54 + k * 230, B.y + 344, 120, 14);
      ctx.fillRect(B.x + 54 + k * 230, B.y + 380, 160, 10);
      ctx.fillRect(B.x + 54 + k * 230, B.y + 408, 140, 10);
    }
    ctx.globalAlpha = s * u;
    lock(ctx, B.x + 146, B.y + 31, pub > 0.5, pub > 0.5 ? C.green : C.red);
    ctx.globalAlpha = s * u;
    var lab = pub > 0.5 ? '공개 — 누구나 열 수 있음' : '기본 비공개';
    pill(ctx, lab, B.x + B.w / 2, B.y + B.h - 46, 26, pub > 0.5 ? C.greenTint : C.redTint, pub > 0.5 ? C.green : C.red, 22);
    ctx.globalAlpha = s * es(T, TL.pub - 0.6, TL.pub) * (1 - es(T, TL.sns, TL.sns + 0.6));
    txt(ctx, '공개 전환은 사람이 정함', B.x + B.w / 2, B.y + B.h + 44, 28, 800, C.red, 'center');
    ctx.restore();
  }
  // SNS 두 채널 — 같은 소식, 다른 톤
  var SN = [['링크드인', '믿고 문의하게', '사전 통보 방식과 사양을 정리해 소개함'], ['인스타그램', '기억에 남게', '한 장 사진 + 짧은 한 줄']];
  for (var i = 0; i < 2; i++) {
    var p = es(T, TL.sns + 0.7 * i, TL.sns + 0.7 * i + 0.6), y = 300 + i * 290;
    if (p <= 0) continue;
    ctx.save(); ctx.globalAlpha = p;
    card(ctx, 860 + (1 - p) * 40, y, 510, 260, { fill: C.paper, stroke: C.brand, lw: 3 });
    txt(ctx, SN[i][0], 896, y + 50, 34, 800, C.ink, 'left');
    pill(ctx, SN[i][1], 1240, y + 50, 24, C.tint, C.brandInk, 18);
    txt(ctx, SN[i][2], 896, y + 120, 26, 600, C.sub, 'left');
    ctx.fillStyle = C.blueTint; rr(ctx, 896, y + 162, 440, 60, 12); ctx.fill();
    txt(ctx, '🔗 dg-db.netlify.app', 920, y + 193, 24, 700, C.blue, 'left', MONO);
    ctx.restore();
    arrow(ctx, B.x + B.w + 6, B.y + 60 + i * 30, 852, y + 130, es(T, TL.sns + 0.7 * i - 0.2, TL.sns + 0.7 * i + 0.4), C.brandInk, 4);
  }
  // 4-5 공개 표 → CSV → 5일차
  var c = es(T, TL.csv, TL.csv + 0.6);
  if (c > 0) {
    ctx.save(); ctx.globalAlpha = c;
    txt(ctx, '4-5 공개 표 모으기', 860, 930, 28, 700, C.muted, 'left');
    pill(ctx, 'directory.csv', 1180, 930, 28, C.ink, C.paper, 24);
    ctx.restore();
    arrow(ctx, 1300, 930, 1366, 930, es(T, TL.csv + 0.5, TL.csv + 1.0), C.brandInk, 5);
  }
  footer(ctx, T, '홈페이지에 못 올릴 내용이면 배포도 하지 않음', TL.foot);
}
