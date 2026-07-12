# {덱 제목}

* 저자: {이름}
* 카테고리: {tech / ai / business / education / misc}
* 요약: {한두 문장으로 이 덱이 무엇을 다루는지}

## 빌드

```bash
# m2slide 저장소에서
./m2slide.sh /경로/m2slide-deck/decks/{카테고리}/{덱이름}
```

빌드 결과는 `slide/index.html` (git 미추적, 로컬 생성). EPUB 은 `--epub` 옵션.

## 구성

* `markdown/` — 슬라이드 소스 (`AGENDA.md` + 섹션 `.md` 또는 단일 `.md`)
* `img/` — 이미지 자산 (`./img/...` 로 참조)
* `_config.yml` — theme·layout 등 m2slide 설정

## 라이선스

{예: CC BY 4.0 / MIT / All rights reserved}
