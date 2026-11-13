/* cloudflare — 내 PC 의 site/ 폴더를 올리면 세계 곳곳 서버에 복사되고 주소(이름.pages.dev)가 생김 (12초) */
(function () {
  var C = MG3D.C, U = MG3D.U;
  var S = {};
  var GR = 2.4;                                   // 지구본 반지름
  var PP = [[3.6, 0, 3.2], [5.0, 0, 2.2], [6.3, 0, 1.0], [7.4, 0, -0.4], [8.3, 0, -1.9]];

  MG3D.register('cloudflare', {
    DUR: 12,
    title: 'Cloudflare Pages — 폴더가 주소가 됨',
    punch: [['폴더 하나를 올리면', C.accent], [' — ', C.muted], ['주소가 생김', C.blue]],
    punchAt: 9.4,

    build: function (A) {
      var T = A.THREE, sc = A.scene, mk = A.make, i;

      // 지구본 — 인터넷
      S.gPos = new T.Vector3(0, 3.0, -0.5);
      S.globe = mk.globe(GR, 17, 30);
      S.globe.group.position.copy(S.gPos);
      sc.add(S.globe.group);

      // 내 PC 의 site/ 폴더 (원본은 그대로 남음)
      S.fPos = new T.Vector3(-7.0, 0, 1.0);
      S.folder = mk.folder();
      S.folder.position.copy(S.fPos);
      S.folder.rotation.y = 0.35;
      sc.add(S.folder);

      // 올라가는 사본 폴더
      S.ghost = mk.folder();
      sc.add(S.ghost);
      var fTop = S.fPos.clone().add(new T.Vector3(1.1, 1.8, -0.4));   // 폴더 오른쪽 위 모서리
      var inDir = fTop.clone().sub(S.gPos).normalize();
      S.land = S.gPos.clone().add(inDir.multiplyScalar(GR + 0.15));
      S.upArc = A.arc(fTop, S.land, 2.6, { color: C.accent, n: 24 });
      S.flash = A.glow(C.accent, 3.2);
      S.flash.position.copy(S.land);
      sc.add(S.flash);

      // 휴대폰 5대 — 오른쪽 앞 부채꼴
      S.phones = [];
      S.dnArc = [];
      for (i = 0; i < PP.length; i++) {
        var ph = mk.phone();
        ph.group.position.set(PP[i][0], 0, PP[i][2]);
        ph.group.rotation.y = -0.45 - i * 0.06;
        sc.add(ph.group);
        ph.top = new T.Vector3(PP[i][0], 2.15, PP[i][2]);
        S.phones.push(ph);
        var d = ph.top.clone().sub(S.gPos).normalize();
        S.dnArc.push(A.arc(S.gPos.clone().add(d.multiplyScalar(GR + 0.1)), ph.top, 1.0, { color: C.blue, n: 18 }));
      }

      // 라벨
      S.lSite = A.label('site/', { cls: 'code', color: C.accent, dy: -8 });
      S.lFiles = A.label('index.html · style.css', { cls: 'plain', color: C.muted, anchor: 't', dy: 10 });
      S.lUp = A.label('올리기', { cls: 'badge', color: C.accent, anchor: 'c' });
      S.lCopy = A.label('세계 곳곳 서버에 복사됨', { cls: 'tag', color: C.blue, anchor: 't', dy: 12 });
      S.lUrl = A.label('https://이름.pages.dev', { cls: 'banner', color: C.blue, dy: -14 });
      S.lPh = A.label('주소만 알면 누구나 — 휴대폰으로', { color: C.green });
    },

    frame: function (t, A) {
      var T = A.THREE, es = U.es, eb = U.eb, seg = U.seg, i;
      var cp = es(t, 0, 12);
      A.orbit([0.6, 2.6, 0.4], 25, U.lerp(-14, 4, cp), U.lerp(20, 16, cp));

      // 지구본
      A.pop(S.globe.group, eb(t, 0.3, 0.9));
      S.globe.spin.rotation.y = t * 0.28;
      S.globe.light(seg(t, 3.0, 5.0));

      // 폴더
      A.pop(S.folder, eb(t, 0.8, 1.3));
      S.lSite.set(S.fPos.clone().add(new T.Vector3(-0.5, 2.3, 0.2)), es(t, 1.1, 1.5));
      S.lFiles.set(S.fPos.clone().add(new T.Vector3(0, 0, 0.7)), es(t, 1.3, 1.7));

      // 사본이 호를 따라 지구본으로 — 작아지며 빨려 들어감
      S.upArc.set(es(t, 1.4, 2.0), 1 - 0.6 * es(t, 4.0, 4.6));
      var u = es(t, 1.6, 3.0);
      S.ghost.visible = t > 1.6 && u < 0.99;
      S.ghost.position.copy(S.upArc.at(u));
      S.ghost.position.y -= 0.6;
      S.ghost.rotation.set(0, U.lerp(0.35, 0.9, u), U.lerp(0, -0.25, u));
      S.ghost.scale.setScalar(Math.max(0.001, U.lerp(0.55, 0.12, es(t, 2.2, 3.0))));
      S.flash.material.opacity = U.bump(t, 2.8, 3.6);
      S.flash.visible = S.flash.material.opacity > 0.01;
      S.lUp.set(S.upArc.at(0.45).add(new T.Vector3(0, -1.1, 0)), es(t, 1.9, 2.2) * (1 - es(t, 3.4, 3.8)));

      S.lCopy.set(S.gPos.clone().add(new T.Vector3(0, -GR - 0.15, GR * 0.6)), es(t, 4.0, 4.4));

      // 주소
      S.lUrl.set(S.gPos.clone().add(new T.Vector3(0, GR + 0.25, 0)), eb(t, 5.0, 5.6), U.lerp(0.8, 1, eb(t, 5.0, 5.6)));

      // 휴대폰 — 주소로 접속
      for (i = 0; i < S.phones.length; i++) {
        var ph = S.phones[i], s = 6.0 + i * 0.35;
        A.pop(ph.group, eb(t, s - 0.5, s - 0.1));
        S.dnArc[i].set(es(t, s, s + 0.5), 1 - 0.6 * es(t, 9.0, 9.6));
        ph.pageMat.opacity = es(t, s + 0.4, s + 0.8);
      }
      S.lPh.set([6.8, 4.9, 0.2], es(t, 8.0, 8.4));
    },
  });
})();
