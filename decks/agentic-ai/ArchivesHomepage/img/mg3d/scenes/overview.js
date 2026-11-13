/* overview — 2시간 전체: 말로 만들기 → 장부에 저장 → 인터넷에 공개 → 휴대폰으로 (14초) */
(function () {
  var C = MG3D.C, U = MG3D.U;
  var S = {};

  MG3D.register('overview', {
    DUR: 14,
    title: '2시간 — 한눈에 보기',
    punch: [['말로 만들고', C.blue], [' → ', C.muted], ['장부에 저장하고', C.green], [' → ', C.muted], ['인터넷에 공개함', C.accent]],
    punchAt: 11.9,

    build: function (A) {
      var T = A.THREE, sc = A.scene, mk = A.make;

      // ① PC (VS Code + Claude)
      S.pc = mk.monitor();
      S.pc.group.position.set(-6.0, 0, -0.3);
      S.pc.group.rotation.y = 0.30;
      sc.add(S.pc.group);
      S.screen = new T.Vector3(-5.9, 2.2, 0.1);

      // 페이지 카드 — 코드 블록이 쌓여 홈페이지가 됨
      S.card = new T.Group();
      var cb = A.slab(1.72, 2.12, 0.08, 0.1, A.mat('#FFFFFF', { rough: 0.6 }));
      S.faceM = A.basic('#FFFFFF', { map: A.pageTex(false), opacity: 0 });
      var face = A.mesh(new T.PlaneGeometry(1.5, 1.9), S.faceM, { noShadow: true });
      face.position.z = 0.05;
      S.card.add(cb, face);
      S.card.position.set(-2.9, 2.05, 0.8);
      S.card.rotation.y = 0.22;
      sc.add(S.card);
      S.card.updateMatrixWorld(true);

      var cols = [C.blue, C.accent, C.green, '#94A3B8', C.blue, '#F472B6', C.green, C.accent];
      var widths = [1.0, 0.7, 1.15, 0.6, 0.9, 1.05, 0.5, 0.8];
      var ind = [0, 1, 1, 2, 1, 0, 1, 0];
      var r = U.rng(5);
      S.blocks = [];
      for (var k = 0; k < 8; k++) {
        var m = A.slab(widths[k], 0.14, 0.07, 0.06, A.mat(cols[k], { rough: 0.45 }));
        sc.add(m);
        var tgt = S.card.localToWorld(new T.Vector3(-0.62 + widths[k] / 2 + ind[k] * 0.14, 0.76 - k * 0.215, 0.1));
        var st = S.screen.clone().add(new T.Vector3((r() - 0.5) * 2.2, (r() - 0.5) * 1.3, 0));
        S.blocks.push({ m: m, from: st, to: tgt, rz: (r() - 0.5) * 1.6, s: 1.9 + k * 0.16 });
      }

      // ② DB — 방명록 장부
      S.dbPos = new T.Vector3(-0.2, 0, 2.4);
      S.db = mk.db(1.05, 7);
      S.db.group.position.copy(S.dbPos);
      sc.add(S.db.group);
      var dbTop = new T.Vector3(S.dbPos.x, 3.5, S.dbPos.z);

      // ③ 지구본 — 인터넷
      S.gPos = new T.Vector3(2.5, 3.6, -3.6);
      S.globe = mk.globe(1.9, 11, 26);
      S.globe.group.position.copy(S.gPos);
      sc.add(S.globe.group);

      // ④ 휴대폰
      var pp = [[4.9, 0, 2.3], [6.2, 0, 1.3], [7.5, 0, 0.3]];
      S.phones = [];
      for (var i = 0; i < pp.length; i++) {
        var ph = mk.phone();
        ph.group.position.set(pp[i][0], pp[i][1], pp[i][2]);
        ph.group.rotation.y = -0.30;
        sc.add(ph.group);
        ph.top = new T.Vector3(pp[i][0], 2.15, pp[i][2]);
        S.phones.push(ph);
      }

      // 흐름 호
      var cardOut = S.card.localToWorld(new T.Vector3(0.7, -0.5, 0.1));
      S.aCardDb = A.arc(cardOut, dbTop, 1.4, { color: C.green, n: 18 });
      S.aCardGl = A.arc(S.card.localToWorld(new T.Vector3(0.3, 0.9, 0.1)),
        S.gPos.clone().add(new T.Vector3(-1.3, 0.4, 1.2)), 2.6, { color: C.accent, n: 24 });
      S.aGlPh = [];
      S.aPhDb = [];
      for (i = 0; i < S.phones.length; i++) {
        var dir = S.phones[i].top.clone().sub(S.gPos).normalize();
        var gs = S.gPos.clone().add(dir.multiplyScalar(2.0));
        S.aGlPh.push(A.arc(gs, S.phones[i].top, 0.9, { color: C.blue, n: 16 }));
        S.aPhDb.push(A.arc(S.phones[i].top, dbTop, 1.6, { color: C.green, n: 20 }));
      }

      // 나르는 카드
      S.flyDb = [];
      S.flyBack = [];
      for (i = 0; i < 3; i++) {
        var c1 = mk.card(C.green); c1.rotation.y = 0.2; sc.add(c1); S.flyDb.push(c1);
        var c2 = mk.card(C.green); c2.rotation.y = -0.2; sc.add(c2); S.flyBack.push(c2);
      }
      S.ghostM = A.basic('#FFFFFF', { map: A.pageTex(false) });
      S.ghost = A.mesh(new T.PlaneGeometry(1.0, 1.27), S.ghostM, { noShadow: true });
      S.ghost.material.side = T.DoubleSide;
      sc.add(S.ghost);

      // 라벨
      S.bubble = A.label('한빛기록관 홈페이지 만들어 줘', { cls: 'bubble', color: C.blue, anchor: 'bl', dx: -40, dy: -10 });
      S.L1 = A.label('① 만들기 — VS Code + Claude', { color: C.blue });
      S.L2 = A.label('② 저장 — 방명록 장부', { color: C.green, anchor: 't', dy: 14 });
      S.L3 = A.label('③ 공개 — 이름.pages.dev', { color: C.accent, anchor: 'l', dx: 18 });
      S.L4 = A.label('④ 누구나 — 휴대폰으로', { color: C.blue });
    },

    frame: function (t, A) {
      var T = A.THREE, es = U.es, eb = U.eb, seg = U.seg, i;

      // 카메라 — 왼쪽 앞에서 천천히 돌아 들어감
      // 처음엔 PC 에 다가가 있다가 물러나며 전체를 보여 줌
      var cp = es(t, 0, 13), pull = es(t, 3.4, 8.6);
      A.orbit([U.lerp(-4.4, 0.5, pull), U.lerp(2.0, 2.7, pull), U.lerp(0.4, 0.2, pull)],
        U.lerp(17.5, 27.5, pull), U.lerp(-20, -6, cp), U.lerp(23, 21, cp));

      // ① PC · 말풍선 · 코드 블록 → 페이지 카드
      A.pop(S.pc.group, eb(t, 0.3, 0.9));
      S.bubble.set(S.screen.clone().add(new T.Vector3(-0.6, 1.4, 0)), es(t, 1.0, 1.3) * (1 - es(t, 2.9, 3.2)), U.lerp(0.85, 1, eb(t, 1.0, 1.4)));
      A.pop(S.card, eb(t, 1.6, 2.1));
      for (i = 0; i < S.blocks.length; i++) {
        var b = S.blocks[i], p = es(t, b.s, b.s + 0.7);
        var pos = b.from.clone().lerp(b.to, p);
        pos.y += U.bump(t, b.s, b.s + 0.7) * 0.9;
        pos.z += U.bump(t, b.s, b.s + 0.7) * 0.6;
        b.m.position.copy(pos);
        b.m.rotation.set(0, U.lerp(0.3, 0.22, p), b.rz * (1 - p));
        A.pop(b.m, (t >= b.s ? 1 : 0) * (1 - es(t, 3.3, 3.65)));
      }
      S.faceM.opacity = es(t, 3.2, 3.7);
      S.L1.set([-6.0, 3.85, -0.3], es(t, 3.0, 3.4));

      // ② DB — 카드 3장이 장부로
      A.pop(S.db.group, eb(t, 3.8, 4.3));
      S.aCardDb.set(es(t, 4.0, 4.5), 1 - 0.65 * es(t, 6.0, 6.6));
      var fill = seg(t, 3.9, 4.3);
      for (i = 0; i < 3; i++) {
        var s = 4.3 + i * 0.45, u = es(t, s, s + 0.7);
        var c = S.flyDb[i];
        c.visible = t > s && u < 0.995;
        c.position.copy(S.aCardDb.at(u));
        c.position.y += 0.35;
        fill += seg(t, s + 0.6, s + 0.95);
      }
      S.L2.set([S.dbPos.x, 0, S.dbPos.z + 1.15], es(t, 4.6, 5.0));

      // ③ 지구본 — 페이지가 인터넷으로
      A.pop(S.globe.group, eb(t, 5.4, 6.0));
      S.globe.spin.rotation.y = t * 0.3;
      S.aCardGl.set(es(t, 5.8, 6.4), 1 - 0.65 * es(t, 7.6, 8.2));
      var gu = es(t, 6.0, 7.0);
      S.ghost.visible = t > 6.0 && gu < 0.99;
      S.ghost.position.copy(S.aCardGl.at(gu));
      S.ghost.position.y += 0.3;
      S.ghost.rotation.set(0, 0.2 + gu * 1.2, 0);
      S.ghost.scale.setScalar(U.lerp(1, 0.35, gu));
      S.globe.light(seg(t, 6.8, 7.9));
      S.L3.set(S.gPos.clone().add(new T.Vector3(1.95, 0.6, 0)), es(t, 7.0, 7.4));

      // ④ 휴대폰 — 주소로 접속
      for (i = 0; i < S.phones.length; i++) {
        var ph = S.phones[i], d = i * 0.2;
        A.pop(ph.group, eb(t, 7.6 + d * 0.75, 8.1 + d * 0.75));
        S.aGlPh[i].set(es(t, 8.0 + d, 8.6 + d), 1 - 0.65 * es(t, 9.6, 10.2));
        ph.pageMat.opacity = es(t, 8.5 + d, 8.9 + d);
      }
      S.L4.set([6.2, 2.45, 1.3], es(t, 9.0, 9.4));

      // 방명록 — 휴대폰에서 쓴 글이 장부로
      for (i = 0; i < S.phones.length; i++) {
        var s2 = 9.8 + i * 0.3;
        S.aPhDb[i].set(es(t, s2 - 0.2, s2 + 0.4), 1 - 0.65 * es(t, 11.4, 12.0));
        var u2 = es(t, s2, s2 + 0.8), fc = S.flyBack[i];
        fc.visible = t > s2 && u2 < 0.995;
        fc.position.copy(S.aPhDb[i].at(u2));
        fc.position.y += 0.35;
        S.phones[i].hiMat.opacity = U.bump(t, s2 - 0.2, s2 + 0.5);
        fill += seg(t, s2 + 0.7, s2 + 1.05);
      }
      S.db.fill(fill);
    },
  });
})();
