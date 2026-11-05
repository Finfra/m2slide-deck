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

## 라이선스

저장소 기본값 CC BY-NC-SA 4.0 — [LICENSE.md](../../../LICENSE.md).
