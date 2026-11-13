# Claude 로 만드는 첫 홈페이지 — Supabase · Cloudflare

* 저자: 남중구 (핀프라)
* 카테고리: agentic-ai
* 요약: 코딩 경험이 없는 기록관 종사자 대상 2시간 특강 덱(3:2). Claude 에게 말로 시켜 홈페이지(가상의 «한빛기록관»)를 만들고, Supabase 로 저장하고, Cloudflare Pages 로 인터넷에 공개하는 과정을 따라 한다. 부록(GitHub 연동·Google 로그인·프롬프트 한 장 자동 실행)은 수업 중 진행하지 않는 선택 학습.

* 슬라이드 보기: https://finfra.github.io/m2slide-deck/ArchivesHomepage/ (main push 후 Pages 배포)
* 원고 보기: [ArchivesHomepage.md](./ArchivesHomepage.md)

## 빌드

```bash
# m2slide 저장소에서
./m2slide.sh /경로/m2slide-deck/decks/agentic-ai/ArchivesHomepage
```

빌드 결과는 `slide/index.html` 이다. 이 덱은 장표별 확인을 위해 빌드본(`slide/`)까지 git 에 올린다.

## 구성

* `ArchivesHomepage.md` — 슬라이드 원고 (single mode)
* `img/` — 인포그래픽(`ig-*`)·화면 캡처·3D 모션그래픽(`mg3d/`) 자산
* `ig-src/` — 인포그래픽 SVG 원본
* `mg/` — 2D 모션그래픽(`md`)
* `실습_프롬프트.md` — 수강생 복사용 프롬프트 모음
* `css/deck.css` — 코드 블록 글자 키움 (테마 무수정)
* `_config.yml` — theme(`default_lec`)·3:2·전환 없음 등 m2slide 설정

## 라이선스

저장소 기본값 CC BY-NC-SA 4.0 — [LICENSE.md](../../../LICENSE.md).
