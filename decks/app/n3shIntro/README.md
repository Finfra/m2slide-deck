# n3sh — 한글을 2타로 치는 자판 위의 속기

* 저자: (원고에 미기재)
* 카테고리: app (앱·도구 소개)
* 요약: 세벌식 390 용 Karabiner-Elements 속기 확장 소개
* 발행본: https://finfra.github.io/m2slide/n3shIntro/
* 원고 이력: m2slide 저장소 Projects/n3shIntro 에서 이관 (2026-10-02 · 이력은 m2slide 저장소에 남아 있음)

## 빌드

```bash
# m2slide 저장소에서
./m2slide.sh /경로/m2slide-deck/decks/app/n3shIntro

# 이 저장소를 m2slide 안 Projects_deck/ 로 clone 했다면 덱 이름만으로 된다
./m2slide.sh n3shIntro
```

빌드 결과는 `slide/index.html` (git 미추적, 로컬 생성).

## 구성

* `n3shIntro.ppt.md` — 슬라이드 소스 (single mode, `---` 구분)
* `ppt/` · `.claude/pptx.yml` — 도형 pptx(인포그래픽) 작업 자산
* `img/` — 이미지 자산 (`./img/...` 로 참조)
* `mg/` — 모션그래픽 2장 (`#layout-_mg`, 16:9 · 1920×1080). 원본·시나리오·합성은 `mg/_src/` — `node decks/app/n3shIntro/mg/_src/compose.js`
* `_config.yml` — theme·layout 등 m2slide 설정
* `Info.md` — 기획 메타

## 라이선스

저장소 기본값 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — [LICENSE.md](../../../LICENSE.md). 상업적 이용은 별도 허락(`finfra@gmail.com`).
