/* ego — 로그인은 사람이 하고, 메뉴 찾기·클릭·확인은 Claude 가 같은 창에서 이어서 함 (10초) */
(function () {
  var C = MG3D.C, U = MG3D.U;
  var S = {};
  var PW = 9, PH = 5.4, PCY = 3.3, PCX = -0.8; // 브라우저 판 크기·가운데
  var TW = 1800, TH = 1080;                    // 텍스처 px (200px = 1 단위)
  function P(px, py, z) { return [PCX - PW / 2 + px / 200, PCY + PH / 2 - py / 200, z == null ? 0.10 : z]; }
  var BTN = [370, 530, 690];                   // 오른쪽 메뉴 버튼 세로 가운데(px)
  var CLICK = [5.25, 6.25, 7.25];

  MG3D.register('ego', {
    DUR: 10,
    title: 'ego — 로그인은 사람이, 클릭은 AI 가',
    punch: [['사람이 열어 두면', C.blue], [' — ', C.muted], ['AI 가 이어서 씀', C.accent]],
    punchAt: 8.0,

    build: function (A) {
      var T = A.THREE, sc = A.scene, mk = A.make, rr = A.rr2d, i;

      // 브라우저 창 텍스처 (글자 없음 — 글자는 HTML 라벨)
      var tex = A.canvasTex(TW, TH, function (g) {
        g.fillStyle = '#F8FAFC'; g.fillRect(0, 0, TW, TH);
        g.fillStyle = '#E2E8F0'; g.fillRect(0, 0, TW, 92);
        ['#F87171', '#FBBF24', '#4ADE80'].forEach(function (c, k) { g.fillStyle = c; g.beginPath(); g.arc(44 + k * 40, 46, 12, 0, Math.PI * 2); g.fill(); });
        [C.ink, C.green, C.accent].forEach(function (c, k) {
          var x = 190 + k * 330;
          g.fillStyle = k === 0 ? '#FFFFFF' : '#F1F5F9'; rr(g, x, 20, 310, 90, 18); g.fill();
          g.fillStyle = c; g.beginPath(); g.arc(x + 42, 56, 15, 0, Math.PI * 2); g.fill();
          g.fillStyle = '#94A3B8'; rr(g, x + 72, 49, 180, 14, 7); g.fill();
        });
        g.fillStyle = '#FFFFFF'; rr(g, 30, 110, TW - 60, 60, 30); g.fill();
        g.fillStyle = '#94A3B8'; g.beginPath(); g.arc(72, 140, 12, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#CBD5E1'; rr(g, 104, 133, 560, 16, 8); g.fill();
        // 로그인 카드
        g.fillStyle = '#FFFFFF'; rr(g, 140, 240, 700, 620, 30); g.fill();
        g.strokeStyle = '#CBD5E1'; g.lineWidth = 4; rr(g, 140, 240, 700, 620, 30); g.stroke();
        g.fillStyle = '#E2E8F0'; g.beginPath(); g.arc(490, 336, 54, 0, Math.PI * 2); g.fill();
        [430, 540].forEach(function (y) {
          g.fillStyle = '#F1F5F9'; rr(g, 210, y, 560, 70, 14); g.fill();
          g.strokeStyle = '#94A3B8'; g.lineWidth = 4; rr(g, 210, y, 560, 70, 14); g.stroke();
        });
        g.fillStyle = C.blue; rr(g, 210, 680, 560, 80, 16); g.fill();
        g.fillStyle = 'rgba(255,255,255,.75)'; rr(g, 400, 712, 180, 16, 8); g.fill();
        // 오른쪽 메뉴
        g.fillStyle = '#CBD5E1'; rr(g, 1000, 250, 420, 26, 13); g.fill();
        BTN.forEach(function (yc, k) {
          g.fillStyle = '#FFFFFF'; rr(g, 1000, yc - 50, 660, 100, 22); g.fill();
          g.strokeStyle = '#94A3B8'; g.lineWidth = 4; rr(g, 1000, yc - 50, 660, 100, 22); g.stroke();
          g.fillStyle = [C.ink, C.green, C.accent][k]; g.beginPath(); g.arc(1062, yc, 26, 0, Math.PI * 2); g.fill();
          g.fillStyle = '#94A3B8'; rr(g, 1112, yc - 11, 320 - k * 40, 22, 11); g.fill();
        });
        g.fillStyle = '#E2E8F0'; rr(g, 1000, 800, 660, 24, 12); g.fill(); rr(g, 1000, 840, 480, 24, 12); g.fill();
      });
      S.win = new T.Group();
      var frame = A.slab(PW + 0.24, PH + 0.24, 0.14, 0.2, A.mat('#CBD5E1', { rough: 0.5 }));
      var face = A.mesh(new T.PlaneGeometry(PW, PH), A.basic('#FFFFFF', { map: tex, opaque: true }), { noShadow: true });
      face.position.z = 0.09;
      S.win.add(frame, face);
      S.win.position.set(PCX, PCY, 0);
      sc.add(S.win);
      // 받침 다리
      var leg = A.box(0.3, PCY - PH / 2, 0.3, A.mat('#94A3B8'));
      leg.position.set(PCX, (PCY - PH / 2) / 2, -0.2);
      S.win.parent.add(leg);
      S.leg = leg;

      function plane(w, h, color, at, o) {
        var m = A.basic(color, { opacity: 0 });
        if (o && o.map) { m.map = o.map; m.color.set('#FFFFFF'); }
        var g = new T.PlaneGeometry(w, h);
        if (o && o.left) g.translate(w / 2, 0, 0);
        m.depthWrite = false;
        var me = A.mesh(g, m, { noShadow: true });
        me.renderOrder = 2;
        me.position.set(at[0], at[1], at[2]);
        sc.add(me);
        return { m: me, mat: m };
      }
      function strokeTex(w, h, color) {
        return A.canvasTex(w, h, function (g) { g.strokeStyle = color; g.lineWidth = 14; rr(g, 8, 8, w - 16, h - 16, 32); g.stroke(); });
      }
      // 로그인 칸 채움 · 성공 표시
      S.fill = [430, 540].map(function (y) {
        var at = P(232, y + 35, 0.10);
        return plane(2.6, 0.13, '#334155', at, { left: true });
      });
      S.btnOk = plane(2.8, 0.4, C.green, P(490, 720, 0.10));
      S.cardOk = plane(3.62, 3.22, '#FFFFFF', P(490, 550, 0.11), { map: strokeTex(724, 644, C.green) });
      // 메뉴 버튼 눌림
      S.btn = BTN.map(function (yc) {
        return {
          fill: plane(3.3, 0.5, '#DCFCE7', P(1330, yc, 0.10)),
          ring: plane(3.42, 0.62, '#FFFFFF', P(1330, yc, 0.11), { map: strokeTex(684, 124, C.green) }),
        };
      });

      // 사람 + 열쇠
      S.person = mk.person(C.blue);
      S.person.position.set(-7.0, 0, 2.4);
      S.person.rotation.y = 0.6;
      sc.add(S.person);
      S.key = mk.key(C.accent);
      S.key.scale.setScalar(1.3);
      sc.add(S.key);
      S.keyFrom = new T.Vector3(-6.2, 1.6, 2.9);
      S.keyTo = new T.Vector3(P(300, 465)[0] - 0.4, P(300, 465)[1], 0.45);

      // AI 빛 구
      S.ai = new T.Group();
      var orb = A.mesh(new T.SphereGeometry(0.58, 40, 24), A.mat('#60A5FA', { emissive: C.blue, ei: 0.55, rough: 0.3 }));
      S.aiRing = A.mesh(new T.TorusGeometry(0.92, 0.04, 8, 64), A.basic(C.blue, { opacity: 0.7 }), { noShadow: true });
      S.aiRing.rotation.x = 1.2;
      S.ai.add(orb, S.aiRing, A.glow(C.blue, 3.4));
      S.aiPos = new T.Vector3(5.7, 3.0, 2.2);
      sc.add(S.ai);

      // 커서 (끝점 = 원점)
      var sh = new T.Shape();
      var pts = [[0, 0], [0, -0.66], [0.16, -0.51], [0.3, -0.78], [0.41, -0.73], [0.28, -0.46], [0.49, -0.46]];
      sh.moveTo(0, 0);
      for (i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], pts[i][1]);
      sh.closePath();
      var cg = new T.ExtrudeGeometry(sh, { depth: 0.06, bevelEnabled: false });
      S.cursor = new T.Group();
      var cIn = A.mesh(cg, A.mat(C.ink, { rough: 0.4 }));
      var cOut = A.mesh(cg, A.basic('#FFFFFF'), { noShadow: true });
      cOut.scale.set(1.28, 1.2, 1); cOut.position.set(-0.05, 0.08, -0.03);
      S.cursor.add(cOut, cIn);
      sc.add(S.cursor);
      S.ripM = A.basic(C.green, { opacity: 0 });
      S.rip = A.mesh(new T.TorusGeometry(0.32, 0.035, 8, 48), S.ripM, { noShadow: true });
      sc.add(S.rip);
      S.targets = BTN.map(function (yc) { var p = P(1470, yc + 8, 0.36); return new T.Vector3(p[0], p[1], p[2]); });

      // 라벨
      S.lEgo = A.label('ego 창', { cls: 'badge', color: C.blue, anchor: 'r', dx: -22 });
      S.lSites = A.label('GitHub · Supabase · Cloudflare', { color: C.muted, dy: -14 });
      S.lHuman = A.label('로그인은 사람이', { color: C.blue });
      S.lKeep = A.label('로그인 상태가 남음', { cls: 'badge', color: C.green, anchor: 't', dy: 18 });
      S.lAi = A.label('메뉴 찾기 · 클릭 ·<br>확인은 Claude 가', { cls: 'bubble tail-c', color: C.accent, dy: -34 });
      S.ok = BTN.map(function () { return A.label('✓', { cls: 'mark', color: C.green, anchor: 'l', dx: 14 }); });
    },

    frame: function (t, A) {
      var T = A.THREE, es = U.es, eb = U.eb, seg = U.seg, i;
      var cp = es(t, 0, 10);
      A.orbit([-0.4, 3.0, 0.6], U.lerp(23.5, 22.5, cp), U.lerp(-9, 5, cp), U.lerp(13, 10, cp));

      A.pop(S.win, eb(t, 0.1, 0.6));
      A.pop(S.leg, eb(t, 0.1, 0.6));
      S.lEgo.set([PCX - PW / 2 - 0.1, P(0, 46)[1], 0], es(t, 0.6, 1.0));
      S.lSites.set([PCX, PCY + PH / 2 + 0.15, 0], es(t, 0.7, 1.1));

      // 사람 — 열쇠로 로그인
      A.pop(S.person, eb(t, 0.6, 1.1));
      S.lHuman.set(S.person.position.clone().add(new T.Vector3(0, 3.05, 0)), es(t, 1.2, 1.6));
      var ku = es(t, 1.3, 2.4);
      var kp = S.keyFrom.clone().lerp(S.keyTo, ku);
      kp.y += U.bump(t, 1.3, 2.4) * 1.6;
      S.key.position.copy(kp);
      S.key.rotation.set(0, 0, U.lerp(0.6, 0, ku) + es(t, 2.35, 2.6) * -1.2);
      A.pop(S.key, (t > 1.25 ? 1 : 0) * (1 - es(t, 2.55, 2.85)), 1.3);
      for (i = 0; i < 2; i++) {
        var fp = es(t, 2.2 + i * 0.15, 2.5 + i * 0.15);
        S.fill[i].mat.opacity = fp > 0 ? 1 : 0;
        S.fill[i].m.scale.x = Math.max(0.001, fp);
      }
      S.btnOk.mat.opacity = es(t, 2.6, 3.0);
      S.cardOk.mat.opacity = es(t, 2.7, 3.1);
      S.lKeep.set(P(490, 862, 0.1), es(t, 3.0, 3.4), U.lerp(0.85, 1, eb(t, 3.0, 3.5)));

      // AI — 같은 창에서 이어서
      var ap = eb(t, 3.8, 4.3);
      A.pop(S.ai, ap);
      S.ai.position.copy(S.aiPos);
      S.ai.position.y += Math.sin(t * 2.4) * 0.08;
      S.aiRing.rotation.z = t * 1.4;
      S.lAi.set(S.aiPos.clone().add(new T.Vector3(0, 0.95, 0)), es(t, 4.4, 4.8), U.lerp(0.85, 1, eb(t, 4.4, 4.9)));

      // 커서 경로: AI → 버튼1 → 2 → 3
      var path = [S.aiPos.clone().add(new T.Vector3(-0.6, 0.2, 0)), S.targets[0], S.targets[1], S.targets[2]];
      var moves = [[4.6, 5.2], [5.6, 6.2], [6.6, 7.2]];
      var cpos = path[0].clone();
      for (i = 0; i < 3; i++) {
        var mu = es(t, moves[i][0], moves[i][1]);
        if (t >= moves[i][0]) {
          cpos = path[i].clone().lerp(path[i + 1], mu);
          cpos.z += U.bump(t, moves[i][0], moves[i][1]) * 0.8;
        }
      }
      S.cursor.position.copy(cpos);
      var press = 0;
      for (i = 0; i < 3; i++) press = Math.max(press, U.bump(t, CLICK[i] - 0.08, CLICK[i] + 0.16));
      A.pop(S.cursor, eb(t, 4.45, 4.75) * (1 - 0.22 * press));
      S.rip.visible = false;
      for (i = 0; i < 3; i++) {
        var c = CLICK[i], on = es(t, c + 0.02, c + 0.3);
        S.btn[i].fill.mat.opacity = 0.9 * on;
        S.btn[i].ring.mat.opacity = on;
        S.ok[i].set(P(1660, BTN[i], 0.1), es(t, c + 0.1, c + 0.3), U.lerp(1.6, 1, eb(t, c + 0.1, c + 0.45)));
        var rp = seg(t, c, c + 0.45);
        if (rp > 0 && rp < 1) {
          S.rip.visible = true;
          S.rip.position.copy(S.targets[i]);
          S.rip.position.z = 0.2;
          S.rip.scale.setScalar(U.lerp(0.4, 1.8, rp));
          S.ripM.opacity = 1 - rp;
        }
      }
    },
  });
})();
