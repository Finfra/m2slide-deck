/* supabase — 휴대폰에서 쓴 방명록이 인터넷 장부(guestbook 표)에 쌓이고, 자물쇠(RLS)가 허락한 일만 됨 (12초) */
(function () {
  var C = MG3D.C, U = MG3D.U;
  var S = {};
  var BW = 5.6, BH = 3.4, BY = 4.75;           // 표 판 크기·가운데 높이
  var ROWS = [0.78, 0.33, -0.12, -0.57, -1.02];  // 행 가운데(판 기준)
  var LAND = [];                                // 카드 도착 시각
  var RING_R = 2.5, RING_Y = 1.4;

  MG3D.register('supabase', {
    DUR: 12,
    title: 'Supabase — 인터넷에 있는 장부',
    punch: [['글은 인터넷 장부에', C.green], [' — ', C.muted], ['자물쇠가 허락한 일만', C.accent]],
    punchAt: 10.2,

    build: function (A) {
      var T = A.THREE, sc = A.scene, mk = A.make, rr = A.rr2d, i;

      S.db = mk.db(1.6, 6);
      sc.add(S.db.group);

      // 표 판 (글자 없음 — 머리글은 HTML 라벨)
      var tex = A.canvasTex(1120, 680, function (g, w, h) {
        g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, w, h);
        g.fillStyle = '#DCFCE7'; g.fillRect(0, 0, w, 96);
        g.strokeStyle = '#CBD5E1'; g.lineWidth = 3;
        for (var k = 1; k <= 5; k++) { var y = 96 + k * 90 - 2; g.beginPath(); g.moveTo(24, y); g.lineTo(w - 24, y); g.stroke(); }
        g.beginPath(); g.moveTo(300, 110); g.lineTo(300, h - 30); g.stroke();
        g.strokeStyle = C.green; g.lineWidth = 8; rr(g, 4, 4, w - 8, h - 8, 26); g.stroke();
      });
      S.board = new T.Group();
      var back = A.slab(BW + 0.2, BH + 0.2, 0.12, 0.16, A.mat('#E2E8F0'));
      var face = A.mesh(new T.PlaneGeometry(BW, BH), A.basic('#FFFFFF', { map: tex, opaque: true }), { noShadow: true });
      face.position.z = 0.075;
      S.board.add(back, face);
      S.board.position.set(0, BY, 0);
      sc.add(S.board);
      S.post = A.box(0.18, 0.5, 0.18, A.mat('#94A3B8'));
      sc.add(S.post);

      // 행 막대
      var nameCols = [C.blue, C.accent, C.green, C.blue, C.accent];
      var textLen = [2.9, 2.3, 3.2, 2.0, 2.7];
      S.rows = [];
      for (i = 0; i < 5; i++) {
        var nm = A.basic(nameCols[i], { opacity: 0 }); nm.depthWrite = false;
        var ng = new T.PlaneGeometry(0.95, 0.2); ng.translate(0.475, 0, 0);
        var n = A.mesh(ng, nm, { noShadow: true }); n.renderOrder = 2;
        n.position.set(-BW / 2 + 0.25, BY + ROWS[i], 0.09);
        var tm = A.basic('#94A3B8', { opacity: 0 }); tm.depthWrite = false;
        var tg = new T.PlaneGeometry(textLen[i], 0.16); tg.translate(textLen[i] / 2, 0, 0);
        var tx = A.mesh(tg, tm, { noShadow: true }); tx.renderOrder = 2;
        tx.position.set(-BW / 2 + 1.75, BY + ROWS[i], 0.09);
        sc.add(n, tx);
        S.rows.push({ n: n, nm: nm, t: tx, tm: tm });
      }

      // 휴대폰 4대
      var pp = [[-7.0, 0, 1.6, 0.45], [-5.6, 0, -2.4, 0.45], [5.6, 0, -2.4, -0.45], [7.0, 0, 1.6, -0.45]];
      S.phones = [];
      for (i = 0; i < pp.length; i++) {
        var ph = mk.phone();
        ph.group.position.set(pp[i][0], 0, pp[i][2]);
        ph.group.rotation.y = pp[i][3];
        ph.pageMat.opacity = 1;
        sc.add(ph.group);
        ph.top = new T.Vector3(pp[i][0], 2.2, pp[i][2]);
        S.phones.push(ph);
      }

      // 카드 5장 — 휴대폰 → 표의 행
      var order = [0, 3, 1, 2, 0];
      S.cards = [];
      for (i = 0; i < 5; i++) {
        var s = 1.2 + i * 0.95;
        LAND[i] = s + 0.9;
        var dst = new T.Vector3(-0.6, BY + ROWS[i], 0.5);
        var a = A.arc(S.phones[order[i]].top, dst, 1.4, { color: C.green, n: 22 });
        var cd = mk.card(C.green);
        sc.add(cd);
        S.cards.push({ a: a, c: cd, s: s, ph: order[i] });
      }

      // 자물쇠 고리 + 자물쇠
      S.ringM = A.mat(C.accent, { rough: 0.35, metal: 0.15 });
      S.ring = A.mesh(new T.TorusGeometry(RING_R, 0.09, 12, 96), S.ringM);
      S.ring.rotation.x = Math.PI / 2;
      S.ring.position.y = RING_Y;
      sc.add(S.ring);
      S.lock = mk.padlock(C.accent);
      S.lock.position.set(0, RING_Y, RING_R + 0.05);
      sc.add(S.lock);

      // 허락 — 읽기·쓰기
      S.okArc = A.arc(S.phones[0].top, new T.Vector3(-1.1, 1.9, 1.0), 2.2, { color: C.green, n: 22 });
      S.okCard = mk.card(C.green); sc.add(S.okCard);
      S.okBack = mk.card(C.green); sc.add(S.okBack);
      // 거절 — 지우기
      S.noArc = A.arc(S.phones[3].top, new T.Vector3(0.9, 1.6, 0.6), 2.2, { color: C.red, n: 22 });
      var uh = 1;
      for (var k2 = 0; k2 <= 200; k2++) {
        var q = S.noArc.at(k2 / 200);
        if (Math.sqrt(q.x * q.x + q.z * q.z) <= RING_R + 0.15) { uh = k2 / 200; break; }
      }
      S.uHit = uh;
      S.hitP = S.noArc.at(uh);
      S.noCard = mk.card(C.red); sc.add(S.noCard);

      // 라벨
      S.lName = A.label('guestbook', { cls: 'code', color: C.green, dy: -12 });
      S.lCols = A.label('이름 · 한 줄', { cls: 'plain', color: C.ink, anchor: 'c' });
      S.lRls = A.label('RLS — 자물쇠 규칙', { cls: 'badge', color: C.accent, anchor: 't', dy: 16 });
      S.lOk = A.label('읽기 ✓ · 쓰기 ✓', { color: C.green });
      S.lNo = A.label('지우기', { color: C.red });
      S.xNo = A.label('✕', { cls: 'mark', color: C.red, anchor: 'c' });
    },

    frame: function (t, A) {
      var T = A.THREE, es = U.es, eb = U.eb, seg = U.seg, i;
      var cp = es(t, 0, 12);
      A.orbit([0, 3.0, 0.3], U.lerp(25.5, 24.5, cp), U.lerp(-12, 6, cp), U.lerp(21, 17, cp));

      // 장부 · 표
      A.pop(S.db.group, eb(t, 0.2, 0.7));
      var fill = seg(t, 0.4, 0.8);
      var dbTop = 6 * S.db.step;
      A.pop(S.board, eb(t, 0.5, 1.0));
      S.post.visible = S.board.visible;
      S.post.position.set(0, (dbTop + BY - BH / 2) / 2, 0);
      S.post.scale.set(1, (BY - BH / 2 - dbTop + 0.1) / 0.5, 1);
      S.lName.set([0, BY + BH / 2 + 0.12, 0], es(t, 0.9, 1.3));
      S.lCols.set([0, BY + BH / 2 - 0.24, 0.1], es(t, 1.0, 1.4));

      for (i = 0; i < S.phones.length; i++) A.pop(S.phones[i].group, eb(t, 0.6 + i * 0.1, 1.0 + i * 0.1));

      // 카드 → 행
      for (i = 0; i < S.phones.length; i++) S.phones[i].hiMat.opacity = 0;
      for (i = 0; i < S.cards.length; i++) {
        var c = S.cards[i], u = es(t, c.s, c.s + 0.9);
        c.a.set(es(t, c.s - 0.15, c.s + 0.45), 0.8 * (1 - es(t, c.s + 1.0, c.s + 1.5)));
        c.c.visible = t > c.s && u < 0.99;
        c.c.position.copy(c.a.at(u));
        c.c.rotation.y = U.lerp(c.ph < 2 ? 0.4 : -0.4, 0, u);
        S.phones[c.ph].hiMat.opacity = Math.max(S.phones[c.ph].hiMat.opacity, U.bump(t, c.s - 0.2, c.s + 0.4));
        var r = S.rows[i], rp = es(t, LAND[i] - 0.05, LAND[i] + 0.35);
        r.nm.opacity = r.tm.opacity = rp > 0 ? 1 : 0;
        r.n.scale.x = Math.max(0.001, rp);
        r.t.scale.x = Math.max(0.001, es(t, LAND[i] + 0.1, LAND[i] + 0.5));
        fill += seg(t, LAND[i], LAND[i] + 0.35);
      }
      S.db.fill(fill);

      // 자물쇠
      var rg = eb(t, 6.2, 6.8);
      A.pop(S.ring, rg);
      S.ring.rotation.z = t * 0.2;
      A.pop(S.lock, eb(t, 6.4, 6.9), 1.4);
      S.lRls.set([0, RING_Y - 0.55, RING_R + 0.1], es(t, 6.7, 7.1));

      // 읽기 · 쓰기 — 허락
      S.okArc.set(es(t, 7.0, 7.4), 1);
      var wu = es(t, 7.1, 7.7);
      S.okCard.visible = t > 7.1 && wu < 0.99;
      S.okCard.position.copy(S.okArc.at(wu));
      var ru = es(t, 7.8, 8.4);
      S.okBack.visible = t > 7.8 && ru < 0.99;
      S.okBack.position.copy(S.okArc.at(1 - ru));
      S.lOk.set(S.phones[0].top.clone().add(new T.Vector3(0, 0.45, 0)), es(t, 7.4, 7.8));

      // 지우기 — 고리에 막혀 튕김
      S.noArc.set(S.uHit * es(t, 8.4, 8.9), 1);
      S.lNo.set(S.phones[3].top.clone().add(new T.Vector3(0, 0.45, 0)), es(t, 8.3, 8.7));
      var hu = es(t, 8.4, 8.9) * S.uHit, dt = t - 8.9;
      if (t < 8.9) {
        S.noCard.visible = t > 8.4;
        S.noCard.position.copy(S.noArc.at(hu));
        S.noCard.rotation.set(0, -0.3, 0);
        S.noCard.scale.setScalar(1);
      } else {
        var out = new T.Vector3(S.hitP.x, 0, S.hitP.z).normalize();
        var p = S.hitP.clone().addScaledVector(out, dt * 3.0);
        p.y += dt * 2.4 - 4.9 * dt * dt;
        S.noCard.position.copy(p);
        S.noCard.rotation.set(dt * 5, -0.3, dt * 7);
        var f = 1 - es(t, 9.1, 9.5);
        S.noCard.visible = f > 0.01;
        S.noCard.scale.setScalar(Math.max(0.001, f));
      }
      S.xNo.set(S.hitP, es(t, 8.85, 9.05), U.lerp(2.0, 1.3, eb(t, 8.85, 9.2)));
    },
  });
})();
