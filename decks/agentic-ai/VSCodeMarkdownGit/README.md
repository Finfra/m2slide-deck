# VS Code · Markdown · Git — 왜 AI 프로젝트에 필요한가?

* 저자: 남중구 (핀프라)
* 카테고리: agentic-ai
* 요약: 코딩을 몰라도 알아야 할 3가지 — VS Code·Markdown·Git 을 «왜 쓰는가» 에 초점을 두고 설명하는 50분 특강 덱(4:3, 54장). AI 가 만든 결과가 쌓인 뒤 «어디 있나·무엇을 시켰나·무엇이 바뀌었나» 에 답하는 도구로 세 가지를 묶고, 챕터마다 모션그래픽(mg) 오프닝과 인포그래픽 도해를 둔다.

## 빌드

```bash
# m2slide 저장소에서
./m2slide.sh /경로/m2slide-deck/decks/agentic-ai/VSCodeMarkdownGit
```

빌드 결과는 `slide/index.html` 이다. 이 덱은 장표별 확인을 위해 빌드본(`slide/`)까지 git 에 올린다. EPUB 은 `--epub` 옵션.

## 구성

* `VSCodeMarkdownGit.md` — 슬라이드 원고 (single mode, 덱 폴더 이름과 같은 파일명)
* `img/` — 인포그래픽·도해 이미지 (`./img/...` 로 참조)
* `mg/` — 챕터 오프닝 모션그래픽 3종 (`01-vscode`·`02-markdown`·`03-git`, 각 `scene.js`)
* `_config.yml` — theme(`default_lec`)·4:3·layout 등 m2slide 설정

## 영상판 — `video/`

* 이 특강을 코딩을 모르는 AI 입문자용으로 줄인 **영상 강의판**(표지 + 25장, 16:9, 약 13분). YouTube 영상 «VS Code · Markdown · Git — AI 와 일하려면 알아야 할 세 도구» 의 슬라이드 정본이다 — 영상 제작 쪽은 여기서 가져다 쓴다
* 빌드: `./m2slide.sh /경로/m2slide-deck/decks/agentic-ai/VSCodeMarkdownGit/video` → `video/slide/index.html` (git 미추적)
* 구성
    - `video/vscodeMarkdownGit.ppt.md` — 슬라이드 소스 (single mode, 16:9). 영상 제작 도구가 같은 파일명을 쓰므로 이름을 바꾸지 않는다
    - `video/img/` — `ig-01`~`ig-09`·`md-raw-vs-rendered` 는 이 덱 `img/` 의 그림을 흰 여백만 잘라 재사용, `cover`·`intro` 는 새로 생성한 배경 그림(codex 이미지 생성, 글자 없음)
    - `video/mg/` — 모션그래픽 6개. `04-flow` 는 머리 칩 «50분» → «흐름», 분 표기를 뺀 범용판이고 나머지는 이 덱 `mg/` 사본
    - `video/_config.yml` — 16:9 설정
* `video/` 안에 `README.md` 를 두지 않는다 — single mode 가 README 를 원고로 골라 덱이 1장이 된다

## 라이선스

저장소 기본값 CC BY-NC-SA 4.0 — [LICENSE.md](../../../LICENSE.md).
