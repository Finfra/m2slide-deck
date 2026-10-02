# Meet fPM: A Multi-Project Automation Framework for Claude Code

* 저자: (원고에 미기재)
* 카테고리: app (앱·도구 소개)
* 요약: fPM 소개 영문판 — fPmIntro 와 같은 구성(영어)
* 발행본: https://finfra.github.io/m2slide/fPmIntro_en/
* 원고 이력: m2slide 저장소 Projects/fPmIntro_en 에서 이관 (2026-10-02 · 이력은 m2slide 저장소에 남아 있음)

## 빌드

```bash
# m2slide 저장소에서
./m2slide.sh /경로/m2slide-deck/decks/app/fPmIntro_en

# 이 저장소를 m2slide 안 Projects_deck/ 로 clone 했다면 덱 이름만으로 된다
./m2slide.sh fPmIntro_en
```

빌드 결과는 `slide/index.html` (git 미추적, 로컬 생성).

## 구성

* `markdown/` — 슬라이드 소스 (`AGENDA.md` + 챕터 `.md`, chapter mode)
* `img/` — 이미지 자산 (`./img/...` 로 참조)
* `_config.yml` — theme·layout 등 m2slide 설정
* `Info.md` — 기획 메타

## 라이선스

저장소 기본값 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — [LICENSE.md](../../../LICENSE.md). 상업적 이용은 별도 허락(`finfra@gmail.com`).
