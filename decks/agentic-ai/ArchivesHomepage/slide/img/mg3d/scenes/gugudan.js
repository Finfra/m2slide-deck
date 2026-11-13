/* gugudan — 냅다 구구단: 내 PC 에서는 잘 되지만 남은 못 보고, 새로고침하면 사라짐 → 공개·저장 두 문 (12초) */
(function () {
  var C = MG3D.C, U = MG3D.U;
  var S = {};
  var GX = -1.0, GZ = 0;          // 구구단 격자 가운데
  var WALL = 2.2;                 // 유리 상자 오른쪽 벽 x
  function gpos(i, j) { return [GX + (j - 5) * 0.5, GZ + (5 - i) * 0.5]; }   // i=단(앞→뒤), j=곱하는 수(왼→오)

  MG3D.register('gugudan', {
    DUR: 12,
    title: '냅다 구구단 — 내 PC 에서는 잘 됨',
    punch: [['내 PC 밖으로', C.blue], [' — ', C.muted], ['두 가지가 더 필요함', C.accent]],
    punchAt: 10.6,

    build: function (A) {
      var T = A.THREE, sc = A.scene, mk = A.make, i, j;

      S.pc = mk.monitor();
      S.pc.group.position.set(-6.3, 0, -0.6);
      S.pc.group.rotation.y = 0.32;
      sc.add(S.pc.group);

      // 9×9 막대 — 높이 = i×j
      var cA = new T.Color(C.blue), cB = new T.Color(C.accent);
      S.cubes = [];
      for (i = 1; i <= 9; i++) {
        var m = A.mat('#FFFFFF', { rough: 0.5 });
        m.color.copy(cA).lerp(cB, (i - 1) / 8);
        for (j = 1; j <= 9; j++) {
          var b = A.footBox(0.42, 1, 0.42, m);
          var p = gpos(i, j);
          b.position.set(p[0], 0, p[1]);
          sc.add(b);
          S.cubes.push({ m: b, h: i * j * 0.045, s: 0.8 + (i + j - 2) * 0.12, i: i, j: j });
        }
      }
      function topOf(i, j) { var p = gpos(i, j); return [p[0], i * j * 0.045 + 0.05, p[1]]; }
      S.eq = [
        { l: A.label('2×3=6', { cls: 'code', color: C.blue }), at: topOf(2, 3), s: 2.0 },
        { l: A.label('7×8=56', { cls: 'code', color: '#B7791F' }), at: topOf(7, 8), s: 2.5 },
        { l: A.label('9×9=81', { cls: 'code', color: C.accent }), at: topOf(9, 9), s: 3.0 },
      ];

      // 유리 상자 — 내 PC 안
      var bw = WALL + 8.6, bx = WALL - bw / 2;
      var geo = new T.BoxGeometry(bw, 5.0, 5.8);
      S.glassM = A.mat(C.sky, { opacity: 0.0, transparent: true, depthWrite: false, rough: 0.2 });
      S.glass = A.mesh(geo, S.glassM, { noShadow: true });
      S.glass.position.set(bx, 2.5, 0);
      sc.add(S.glass);
      S.edgeM = new T.LineBasicMaterial({ color: new T.Color(C.blue), transparent: true, opacity: 0 });
      S.edges = new T.LineSegments(new T.EdgesGeometry(geo), S.edgeM);
      S.edges.position.copy(S.glass.position);
      sc.add(S.edges);
      S.boxL = A.label('내 PC 안', { cls: 'badge', color: C.blue });
      S.boxAt = [bx - bw / 2 + 1.6, 5.0, 2.9];

      // 바깥 휴대폰 — 막힘 (막히는 높이를 다르게 해 ✕ 가 겹치지 않게)
      var pp = [[8.9, 0, 1.7], [10.1, 0, 0.9], [11.3, 0, 0.1]];
      var hitY = [0.8, 2.3, 3.8];
      S.pp = pp;
      S.phones = [];
      S.block = [];
      for (i = 0; i < pp.length; i++) {
        var ph = mk.phone();
        ph.group.position.set(pp[i][0], 0, pp[i][2]);
        ph.group.rotation.y = 0.08;
        sc.add(ph.group);
        S.phones.push(ph);
        var from = new T.Vector3(pp[i][0], 2.2, pp[i][2]);
        var to = new T.Vector3(GX + 0.6, hitY[i], 0.6 - i * 0.6);
        var a = A.arc(from, to, 0.5, { color: '#94A3B8', n: 26 });
        var uw = (from.x - WALL) / (from.x - to.x);
        S.block.push({ a: a, uw: uw, x: A.label('✕', { cls: 'mark', color: C.red, anchor: 'c' }), s: 4.6 + i * 0.2 });
      }
      S.noSee = A.label('남은 볼 수 없음', { color: C.red });

      // 점수 판 → 새로고침 → 조각
      S.plateAt = new T.Vector3(-2.7, 4.0, 2.0);
      S.plate = mk.textPlate('점수 8/10', { pw: 3.4, size: 128, bg: C.accent });
      S.plate.position.copy(S.plateAt);
      S.plate.rotation.y = 0.08;
      sc.add(S.plate);
      S.ringM = A.basic(C.accent, { opacity: 0 });
      S.ring = A.mesh(new T.TorusGeometry(2.0, 0.07, 10, 64), S.ringM, { noShadow: true });
      S.ring.position.copy(S.plateAt);
      S.ring.rotation.y = 0.08;
      sc.add(S.ring);
      S.refresh = A.label('새로고침', { cls: 'badge', color: C.accent });
      S.gone = A.label('새로고침하면 사라짐', { color: C.red });
      var r = U.rng(19), pm = A.mat(C.accent, { rough: 0.5 });
      S.shards = [];
      for (i = 0; i < 12; i++) {
        var sh = A.box(0.75 + r() * 0.2, 0.36 + r() * 0.12, 0.07, pm);
        var ox = ((i % 4) - 1.5) * 0.8, oy = (Math.floor(i / 4) - 1) * 0.4;
        sh.userData = {
          p0: new T.Vector3(S.plateAt.x + ox * 0.95, S.plateAt.y + oy, S.plateAt.z + ox * 0.3),
          v: new T.Vector3(ox * 1.6 + (r() - 0.5), 1.5 + r() * 2.0, 0.6 + r() * 1.6),
          w: new T.Vector3(r() * 6 - 3, r() * 6 - 3, r() * 6 - 3),
        };
        sc.add(sh);
        S.shards.push(sh);
      }

      // 두 문 — 공개(Cloudflare) · 저장(Supabase): 문틀 + 열린 문짝 + 문 안의 서비스
      function door(color, light) {
        var g = new T.Group(), fm = A.mat(color, { rough: 0.45 });
        var p1 = A.box(0.24, 3.0, 0.24, fm); p1.position.set(-1.05, 1.5, 0);
        var p2 = A.box(0.24, 3.0, 0.24, fm); p2.position.set(1.05, 1.5, 0);
        var li = A.box(2.34, 0.24, 0.24, fm); li.position.set(0, 3.0, 0);
        var hinge = new T.Group(); hinge.position.set(-0.95, 0, 0.05);
        var leaf = A.slab(1.86, 2.84, 0.1, 0.06, A.mat(light, { rough: 0.6 }));
        leaf.position.set(0.93, 1.44, 0);
        hinge.add(leaf);
        g.add(p1, p2, li, hinge);
        return { group: g, hinge: hinge };
      }
      S.dCF = door(C.blue, '#BFDBFE'); S.dCF.group.position.set(5.0, 0, 1.3); sc.add(S.dCF.group);
      S.dSB = door(C.green, '#BBF7D0'); S.dSB.group.position.set(5.6, 0, -2.4); sc.add(S.dSB.group);
      S.miniGlobe = mk.globe(0.72, 4, 10);
      S.miniGlobe.group.position.set(5.0, 1.5, 1.2);
      sc.add(S.miniGlobe.group);
      S.miniDb = mk.db(0.62, 3);
      S.miniDb.group.position.set(5.6, 0.25, -2.5);
      sc.add(S.miniDb.group);
      S.lCF = A.label('공개 → Cloudflare', { color: C.blue, anchor: 't', dy: 14 });
      S.lSB = A.label('저장 → Supabase', { color: C.green });

      // 문을 지나는 호
      S.goCF = A.arc(new T.Vector3(GX + 1.0, 3.4, 0.2), new T.Vector3(5.0, 1.6, 1.3), 1.4, { color: C.blue, n: 20 });
      S.goSB = A.arc(new T.Vector3(GX + 1.0, 2.2, -0.8), new T.Vector3(5.6, 1.7, -2.4), 1.8, { color: C.green, n: 20 });
      S.out = [];
      for (i = 0; i < pp.length; i++) {
        S.out.push(A.arc(new T.Vector3(5.0, 1.6, 1.3), new T.Vector3(pp[i][0], 2.15, pp[i][2]), 1.0, { color: C.blue, n: 14 }));
      }
    },

    frame: function (t, A) {
      var T = A.THREE, es = U.es, eb = U.eb, seg = U.seg, i;
      var back = es(t, 3.2, 4.4), cp = es(t, 0, 12);
      A.orbit([U.lerp(-2.6, 2.5, back), U.lerp(2.6, 2.6, back), 0.2], U.lerp(19.5, 31.5, back), U.lerp(12, 5, cp), U.lerp(26, 22, cp));

      A.pop(S.pc.group, eb(t, 0.1, 0.6));
      for (i = 0; i < S.cubes.length; i++) {
        var c = S.cubes[i], p = eb(t, c.s, c.s + 0.45);
        c.m.visible = p > 0.001;
        c.m.scale.set(1, Math.max(0.001, c.h * p), 1);
      }
      for (i = 0; i < S.eq.length; i++) S.eq[i].l.set(S.eq[i].at, es(t, S.eq[i].s, S.eq[i].s + 0.3));

      // 유리 상자
      var g = es(t, 3.2, 4.0);
      S.glassM.opacity = 0.13 * g;
      S.edgeM.opacity = 0.85 * g;
      S.glass.visible = S.edges.visible = g > 0.001;
      S.boxL.set(S.boxAt, es(t, 3.6, 4.0));

      // 바깥에서 막힘
      for (i = 0; i < S.phones.length; i++) {
        var ph = S.phones[i], bl = S.block[i];
        A.pop(ph.group, eb(t, 4.2 + i * 0.12, 4.6 + i * 0.12));
        ph.pageMat.opacity = es(t, 10.3 + i * 0.15, 10.7 + i * 0.15);
        var fade = 1 - es(t, 8.0, 8.5);
        bl.a.set(bl.uw * es(t, bl.s, bl.s + 0.6), fade);
        bl.x.set(bl.a.at(bl.uw), es(t, bl.s + 0.55, bl.s + 0.7) * fade, U.lerp(1.6, 1, eb(t, bl.s + 0.55, bl.s + 0.85)));
      }
      S.noSee.set([10.1, 2.5, 0.9], es(t, 5.4, 5.8) * (1 - es(t, 8.0, 8.5)));

      // 점수 → 새로고침 → 조각
      var broke = 6.9;
      A.pop(S.plate, t < broke ? eb(t, 5.8, 6.3) : 0);
      var rp = seg(t, 6.3, 7.0);
      S.ring.visible = rp > 0 && rp < 1;
      S.ringM.opacity = Math.sin(rp * Math.PI);
      S.ring.scale.setScalar(U.lerp(0.7, 1.35, rp));
      S.refresh.set(S.plateAt.clone().add(new T.Vector3(0, 0.75, 0)), U.bump(t, 6.2, 7.0) * 1.6);
      for (i = 0; i < S.shards.length; i++) {
        var sh = S.shards[i], d = sh.userData, dt = t - broke;
        if (dt <= 0) { sh.visible = false; continue; }
        var pos = d.p0.clone().addScaledVector(d.v, dt);
        pos.y -= 4.9 * dt * dt;
        if (pos.y < 0.15) pos.y = 0.15;
        sh.position.copy(pos);
        sh.rotation.set(d.w.x * dt, d.w.y * dt, d.w.z * dt);
        A.pop(sh, 1 - es(t, 7.6, 8.1));
      }
      S.gone.set(S.plateAt, es(t, 7.0, 7.3) * (1 - es(t, 8.4, 8.8)));

      // 두 문 — 열리고 서비스가 보임
      A.pop(S.dCF.group, eb(t, 8.2, 8.7));
      S.dCF.hinge.rotation.y = -1.25 * es(t, 8.7, 9.3);
      A.pop(S.miniGlobe.group, eb(t, 8.9, 9.4));
      S.miniGlobe.spin.rotation.y = t * 0.6;
      S.miniGlobe.light(seg(t, 10.0, 10.6));
      A.pop(S.dSB.group, eb(t, 8.5, 9.0));
      S.dSB.hinge.rotation.y = -1.25 * es(t, 9.0, 9.6);
      A.pop(S.miniDb.group, eb(t, 9.2, 9.7));
      S.miniDb.fill(3);
      S.lCF.set([5.0, 0, 2.2], es(t, 8.8, 9.2));
      S.lSB.set([5.6, 3.35, -2.4], es(t, 9.1, 9.5));
      S.goCF.set(es(t, 9.7, 10.2));
      S.goSB.set(es(t, 9.9, 10.4));
      for (i = 0; i < S.out.length; i++) S.out[i].set(es(t, 10.2 + i * 0.12, 10.7 + i * 0.12));
    },
  });
})();
