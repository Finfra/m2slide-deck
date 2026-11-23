# 라면 끓이는 방법

* 저자: Finfra
* 카테고리: misc
* 요약: 물의 양·투입 순서·조리 시간 세 가지로 완성하는 표준 라면 레시피 프레젠테이션.

## 빌드

```bash
# m2slide 저장소에서
./m2slide.sh /경로/m2slide-deck/decks/misc/RamyeonCooking
```

빌드 결과는 `slide/index.html` (git 미추적, 로컬 생성).

## 구성

* `RamyeonCooking.md` — 슬라이드 소스 (single mode, `---` 구분)
* `img/` — 이미지 자산
* `_config.yml` — m2slide 설정

## 영상판 — `video/`

* 3분 영상용으로 따로 쓴 짧은 판(표지 + 준비물·끓이는 법·마무리 3장, 16:9). YouTube 영상 «라면 끓이기 — 3분 안에 완성하는 인생 라면 레시피» 의 슬라이드 정본이다 — 영상 제작 쪽은 여기서 가져다 쓴다
* 빌드: `./m2slide.sh /경로/m2slide-deck/decks/misc/RamyeonCooking/video` → `video/slide/index.html` (git 미추적)
* 구성
    - `video/ramen.ppt.md` — 슬라이드 소스 (single mode, 16:9). 영상 제작 도구가 같은 파일명을 쓰므로 이름을 바꾸지 않는다
    - `video/img/` — 표지·배경·재료 4·단계 4·완성 11장
    - `video/_config.yml` — 16:9 · warm 팔레트
* `video/` 안에 `README.md` 를 두지 않는다 — single mode 가 README 를 원고로 골라 덱이 1장이 된다

## 라이선스

CC BY 4.0
