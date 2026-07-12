# m2slide-deck

[m2slide](https://github.com/finfra/m2slide) 로 제작한 프레젠테이션 덱을 **공개·공유·협업**하기 위한 저장소입니다. 여러 사람이 만든 슬라이드 결과물을 **Pull Request** 로 모읍니다.

## 목적

* 공개(public) 덱 공유 — 완성한 m2slide 프레젠테이션을 누구나 열람·재사용
* 협업(collaboration) — Fork → 작업 → PR 흐름으로 여러 저자의 덱을 한곳에 수집
* 소스 우선 — 빌드 산출물(`slide/`, `*.epub`, `*.pdf`)이 아니라 **마크다운 소스**를 공유. 각자 `m2slide.sh` 로 재빌드

## 폴더 구조

```
m2slide-deck/
├── decks/              # 실제 덱 프로젝트 (카테고리별 2단계)
│   ├── tech/           # 기술
│   ├── ai/             # AI·ML
│   ├── business/       # 비즈니스
│   ├── education/      # 교육·강의
│   └── misc/           # 기타
├── docs/               # GitHub Pages 배포 산출물 (git doc)
├── _template/          # 새 덱 스캐폴드 (복사해서 시작)
│   ├── README.md       # 덱 문서 템플릿 (모든 덱은 README 기본 지원)
│   ├── _config.yml     # m2slide 설정 예시
│   ├── markdown/       # 슬라이드 소스
│   └── img/            # 이미지 자산
└── .github/
    ├── PULL_REQUEST_TEMPLATE.md
    └── workflows/      # CI (선택)
```

## 새 덱 추가 방법

1. 이 저장소를 Fork
2. `_template/` 를 원하는 카테고리 폴더로 복사 후 이름 변경
   ```bash
   cp -R _template decks/tech/MyDeck
   ```
3. `decks/<카테고리>/MyDeck/markdown/` 에 슬라이드 작성 + `README.md` 채우기
4. 로컬 빌드로 확인
   ```bash
   # m2slide 저장소에서
   ./m2slide.sh /경로/m2slide-deck/decks/tech/MyDeck
   ```
5. commit → push → **Pull Request** 생성

## 덱 문서(git doc) 기본 지원

모든 덱은 폴더 안에 `README.md` 를 **기본 포함**합니다(`_template/README.md` 기준). 제목·저자·요약·빌드 방법을 적어 두면 GitHub 에서 바로 읽을 수 있습니다. 저장소 전역 문서는 `docs/`(GitHub Pages) 에 배포합니다.

## 라이선스·기여

* 기여 규칙: [CONTRIBUTING.md](./CONTRIBUTING.md)
* 각 덱의 저작권은 해당 덱 `README.md` 에 명시
