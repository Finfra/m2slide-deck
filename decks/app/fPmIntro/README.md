# fPM 소개: Claude Code 다중 프로젝트 자동화 프레임워크

* 저자: (원고에 미기재)
* 카테고리: app (앱·도구 소개)
* 요약: hub·웹 대시보드·VSCode 연동·cdf 패밀리·sshf 원격·멀티 프로젝트 관리 (한국어판)
* 발행본: https://finfra.github.io/m2slide/fPmIntro/
* 원고 이력: m2slide 저장소 Projects/fPmIntro 에서 이관 (2026-10-02 · 이력은 m2slide 저장소에 남아 있음)

## 빌드

```bash
# m2slide 저장소에서
./m2slide.sh /경로/m2slide-deck/decks/app/fPmIntro

# 이 저장소를 m2slide 안 Projects_deck/ 로 clone 했다면 덱 이름만으로 된다
./m2slide.sh fPmIntro
```

빌드 결과는 `slide/index.html` (git 미추적, 로컬 생성).

## 구성

* `markdown/` — 슬라이드 소스 (`AGENDA.md` + 챕터 `.md`, chapter mode)
* `img/` — 이미지 자산 (`./img/...` 로 참조)
* `_config.yml` — theme·layout 등 m2slide 설정
* `Info.md` — 기획 메타
* `mg/` — 모션그래픽 6장 (`#layout-_mg`, 16:9 · 1920×1080). 원본·문구 표·합성은 `fPmIntro/mg/_src/` — `node decks/app/fPmIntro/mg/_src/compose.js` 가 ko·en 두 덱을 함께 생성

## 라이선스

저장소 기본값 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — [LICENSE.md](../../../LICENSE.md). 상업적 이용은 별도 허락(`finfra@gmail.com`).
