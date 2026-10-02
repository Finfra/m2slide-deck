#!/usr/bin/env python3
"""theme (골격) — 수치의 SSOT 로더

사용법
    보통은 **손으로 복사하지 않는다** — `ig-maker`(igpath `_seed()`)와 `ppt-init`(init.py
    `LIB_FILES`)이 씨딩할 때 이 파일을 `{asset}/lib/theme.py` 로 넣는다.
    직접 넣어야 하면 원본은 **여기**다:

        cp ~/.claude/skills/ppt-info/templates/theme.template.py  {asset}/lib/theme.py
        (파일명은 theme.py — ppt_kit 이 그 이름으로 import 한다)

    ✅ **이 파일이 유일한 정본이다** (2026-08-10 · prj5#Issue49 졸업). 이전에는
       `pptx-spec/templates/` 아래에 같은 이름의 옛 사본이 있었고, 그쪽에는
       `_from_design_tokens()` 도 `ASSET_DIRS` 도 없어 복사하면 레거시 design-tokens 를
       못 읽고 `check-theme-origin.py` 가 exit 2 로 죽었다(실측 2026-08-09).
       **그 스킬이 제거되어 갈릴 상대가 없어졌다.**

⚠️ 이 파일은 **거의 그대로 쓴다.** 프로젝트가 고칠 곳은 아래 `DEFAULT` 의 내장 기본 테마뿐이고,
   그것도 보통은 `_asset/theme/{name}/theme.yml` 을 두는 것으로 충분하다.

설계: `_doc_arch/pptx-scar-design.md` §4-1 · §4-2

왜 이게 필요한가
    수치를 코드에 박으면 테마 교체·판형 전환·팔레트 공유가 전부 불가능해진다.
    `theme.yml` 을 만들어 두고 읽지 않으면 그 파일은 **장식**이다(실제로 그 상태였다).

계약
    load(path=None) -> dict     경로가 없거나 파일이 없으면 내장 기본 테마
    rgb("#1A1A1A")  -> RGBColor

폴백 규칙
    ① 파일이 있으면 읽고 기본값 위에 **깊은 병합**한다 — 부분 정의만 해도 동작한다
    ② 파일이 없으면 내장 기본 테마 + **고지 1줄**. 조용히 넘어가지 않는다
    ③ pyyaml 이 없으면 **명시적으로 중단**한다 — 무엇이 적용됐는지 모르는 채
       빌드되는 것이 더 위험하다(잘못된 규격의 산출물이 조용히 나온다)
"""
import os
import sys

from pptx.dml.color import RGBColor

# ── 자산 폴더 후보 (설계 §3-3, 신구조 2026-08-09) ────────────────────────
# ⚠️ 이 로더는 `igpath` 와 **별개로 자체 탐색**을 한다. igpath 만 고치면 여기가 옛
#    경로를 계속 보므로 반드시 함께 바꾼다(Issue51 P2 에서 실제로 빠질 뻔했다).
#    레거시 2종은 지우지 않는다 — 그 프로젝트들이 쓰고 우리는 읽기만 한다.
#
# ⚠️ **세 곳(여기·`info-build.py`·`igpath.ASSET_CANDIDATES`)의 목록은 글자 그대로
#    같아야 한다** (Issue55 P5, 2026-08-09). 정본은 아래 3종이다.
ASSET_DIRS = ("_asset_ppt", "_doc_work/_asset", "_asset")

# ── 내장 기본 테마 ────────────────────────────────────────────────────────
# ⚠️ accent 4종은 **회색조 안전**이다 — 전 쌍 △L* ≥ 15 (실측: 17.0 / 34.2 / 51.0 /
#    17.2 / 34.0 / 16.9). 색을 잃어도 명도만으로 구분된다.
#    bg 는 전부 L* 95 이상 옅은 tint 라 회색조에서는 사실상 흰색이다 — 의도된 것이다.
#    **배경으로 정보를 나르지 않는다.** 구분은 테두리·번호 배지·제목이 한다.
DEFAULT = {
    "meta": {"name": "default", "base": "builtin"},
    "canvas": {"unit": "mm", "w": 338.67, "h": 190.5, "orientation": "landscape"},
    "margin": {"l": 10.0, "w": 318.67, "split": 0.5},
    # `table` — 표 셀 전용(Issue59 P1). 없으면 `cap` 으로 떨어진다. 표는 행이 내용에
    # 딸려 늘어나 슬라이드를 넘기므로 본문보다 한 급 작게 두는 것이 기본이다
    "font": {"family": "Malgun Gothic", "spc": -20,
             "title": 27, "sub": 11, "head": 14, "body": 9.5, "cap": 8.5,
             "table": 8.5, "node": 7},
    "palette": {
        "ink": "#1A1A1A", "muted": "#555F6D", "line": "#C3CEDE", "white": "#FFFFFF",
        "accent": {"navy": "#1E3B67", "green": "#276E61",
                   "orange": "#BC832C", "purple": "#C9B3DB", "band": "#1E3B67"},
        # 골격(ppt-kit.template.py)이 쓰는 범용 키 — 프로젝트는 위 accent 를 자기 이름으로 정의해도 된다
        "primary": "#1E3B67",
        "steps": ["#1E3B67", "#276E61", "#BC832C"],   # 명도 계단 L* 25 / 42 / 59
        "panel": "#F2F5FA",                            # 옅은 배경판
        "bg": {"blue": "#F2F5FA", "green": "#F1F7F5",
               "orange": "#FAF6EE", "purple": "#F7F4FA", "yellow": "#FCF9EE"},
        "grayscale_safe": True,
    },
    "shape": {"panel_adj": 0.08, "chip_adj": 0.16, "badge_adj": 0.20,
              "panel_lw": 1.5, "chip_lw": 0.75, "node_lw": 1.25,
              "node_d": 13.0, "badge": 6.5,
              "shadow": {"blur": 4.5, "dist": 2.0, "dir": 53, "alpha": 22}},
    "margin_text": {"default": {"l": 1.2, "t": 0.6}, "node": {"l": 0.3, "t": 0.2}},
    # ⚠️ y0 = 첫 블록이 시작하는 y. 조직 템플릿에 상단 헤더 밴드가 있으면 그 아래로 내린다.
    #    골격에 40.0 을 박아 뒀더니 헤더가 없는 판형에서 34mm 를 그냥 버렸다(실측).
    "layout": {"gap": 3.5, "y0": 6.0, "blocks": []},
}


def _merge(base, over):
    """깊은 병합 — 부분 정의된 theme.yml 도 동작하게 한다.

    ⚠️ **빈 절(`palette:` 만 있고 값이 없는 경우)은 `None` 으로 파싱된다.** 그대로 덮으면
       `TH["palette"]["accent"]` 가 `TypeError: 'NoneType' object is not subscriptable` 로
       죽는다(2026-08-09 실측 — Issue55 P0 에서 골격을 단일화하자 드러났다).
       씨딩 골격이 `palette:` 를 **의도적으로 빈 자리로 만들기 때문에**(Issue50 D1 — 절이
       없으면 색이 조용히 내장 기본값으로 빠진다) 이 경우는 정상 입력이고, 로더가 견뎌야 한다.
       빈 절 = "아직 안 채웠다" 이므로 **기본값을 그대로 유지**한다.
    """
    out = dict(base)
    for k, v in (over or {}).items():
        if v is None and k in base:
            continue                                    # 빈 절 — 기본값 유지
        out[k] = _merge(base[k], v) if isinstance(v, dict) and isinstance(base.get(k), dict) else v
    return out


def _from_design_tokens(d):
    """레거시 `design-tokens.yml` → `theme.yml` 형태로 옮긴다 (Issue48-① · Issue50 매핑 교정).

    `theme.yml` 이 **정본**이고 이 함수는 읽기 fallback 일 뿐이다. 두 파일이 공존하면
    수치가 갈리므로 새로 만들 때는 `theme.yml` 하나만 둔다. 겹치는 축은 셋뿐이라
    (`canvas`·`color`·`typography`) 나머지 키(zones·grid·components…)는 옮기지 않는다 —
    쓰지도 않는 값을 옮기면 어느 쪽이 유효한지 알 수 없게 된다.

    ⚠️ **이 함수의 산출이 곧 "유래"의 정의다.** `ppt-check/check-theme-origin.py` 가
       여기서 나온 키만 원본 대조 대상으로 삼는다. 매핑을 넓히면 대조 대상이 늘고
       (손으로 베낀 값이 기계 검증으로 승격된다), 좁히면 그 키는 **프로젝트 판단**의
       영역으로 넘어간다. 그래서 무엇을 안 옮기는지도 아래에 적어 둔다.

    옮기지 **않는** 것과 그 이유 (Issue50 3차 실측)
        * `typography.scale_pt.subtitle_band` → `font.sub` : **컴포넌트가 다르다.**
          저쪽은 `zones.subtitle_band` — 네이비 띠 위에 얹는 흰 글자(14pt)이고, 우리
          `font.sub` 는 제목 아래 한 줄 부제다. 그대로 옮기면 sub 14 > head 12 로
          **위계가 역전**된다(부제가 섹션 헤더보다 커진다). 비워 두면 골격 기본값이
          남고 프로젝트가 자기 판단으로 채운다 — 잘못 옮겨 놓고 뒤에서 `--allow` 로
          되돌리는 것보다, 애초에 유래가 아니라고 말하는 편이 정확하다.
        * `color.brand.accent` : `palette.accent` 는 5슬롯 **dict**(navy/green/orange/
          purple/band)다. 단일 hex 를 그 자리에 넣으면 `ppt_kit` 의 `_acc["navy"]` 가
          그 자리에서 죽는다. 원본의 accent 는 "선·아이콘 전용, 면 금지" 라 슬롯 자체가
          없다 — 필요한 프로젝트가 `theme.yml` 에 직접 적는다.
        * `color.ink.body` : 잉크 슬롯이 둘뿐이라(ink·muted) 원본 3종 중 하나는 버려진다.
          strong→ink · muted→muted 가 역할이 맞고 body 가 남는 쪽이다(아래 참조).
        * `grid`·`zones`·`components`·`color.state` : 대응 슬롯이 없다. `grid.left` 는
          `margin.l` 과 비슷해 보이지만 원본 판형(A4 세로) 종속이라, 판형을 바꾼 덱에서는
          폭이 통째로 어긋난다. 판형 환산은 옮기기가 아니라 **판단**이다.
    """
    def hexof(v):
        return v.get("hex") if isinstance(v, dict) else v

    out = {}
    meta, canvas = d.get("meta") or {}, d.get("canvas") or {}
    if meta.get("name"):
        out["meta"] = {"name": meta["name"], "base": "design-tokens"}
    if canvas:
        c = {"unit": canvas.get("unit", "mm")}
        if canvas.get("width"):
            c["w"] = float(canvas["width"])
        if canvas.get("height"):
            c["h"] = float(canvas["height"])
        if meta.get("orientation"):
            c["orientation"] = meta["orientation"]
        out["canvas"] = c

    typo = d.get("typography") or {}
    fam, scale = typo.get("family") or {}, typo.get("scale_pt") or {}
    f = {}
    if isinstance(fam, dict):
        # 본문용을 우선한다 — 제목 전용 굵은 서체를 family 로 잡으면 전체가 굵어진다
        for k in ("medium", "regular", "light", "bold"):
            if fam.get(k):
                f["family"] = fam[k]
                break
    elif fam:
        f["family"] = fam
    # ⚠️ `sub` 는 **일부러 비어 있다** — subtitle_band 는 다른 컴포넌트다(docstring 참조).
    #    여기에 한 줄 추가하고 싶어지면 먼저 "그 원본 이름이 우리 슬롯과 같은 것을
    #    가리키는가" 를 확인한다. 이름이 비슷한 것과 같은 것은 다르다.
    for src, dst in (("page_title", "title"),
                     ("section_head", "head"), ("body", "body"),
                     ("caption", "cap"), ("node", "node")):
        if scale.get(src):
            f[dst] = scale[src]
    if f:
        out["font"] = f

    color = d.get("color") or {}
    pal = {}

    # ── color.brand — 첫 값 하나로 접지 않는다 (Issue50-②) ────────────────────
    # 옛 코드는 `next(iter(brand.values()))` 로 **선언 순서**에 기대 primary 를 골랐다.
    # brand 에 line 을 먼저 적은 토큰 파일에서는 괘선 색(#B8BFC8 급)이 주색이 된다 —
    # 원본을 고친 것도 아닌데 산출이 달라지는, 재현 안 되는 종류의 버그다. 이름으로 고른다.
    # 나머지 셋(line·bg·accent)은 주색 후보가 아니라 **각자 제 슬롯**을 갖는다.
    brand = color.get("brand") or {}
    ROLE = ("line", "bg", "accent")      # 주색 후보에서 제외 — 아래에서 따로 옮긴다
    if brand:
        key = (next((k for k in ("primary", "main", "navy", "base", "blue")
                     if hexof(brand.get(k))), None)
               or next((k for k in brand if k not in ROLE and hexof(brand.get(k))), None))
        if key:
            pal["primary"] = hexof(brand[key])
        if hexof(brand.get("line")):
            pal["line"] = hexof(brand["line"])      # 괘선·테두리 (ppt_kit 의 LINE)
        if hexof(brand.get("bg")):
            pal["panel"] = hexof(brand["bg"])       # 옅은 배경판 (ppt_kit 의 BG)

    step = color.get("step") or {}
    steps = [hexof(step[k]) for k in sorted(step, key=str) if hexof(step.get(k))]
    if steps:
        pal["steps"] = steps

    # ── color.ink — 3종을 2슬롯에 (Issue50-①) ────────────────────────────────
    # 원본은 strong/body/muted 셋, 우리 팔레트는 ink/muted 둘이다. 역할로 맞춘다.
    #   strong → ink   (없으면 body 로 내려앉는다 — 둘 다 "어두운 본문 잉크" 로 같은 역할)
    #   muted  → muted
    # ⚠️ **muted 는 muted 에서만 온다.** 옛 코드는 여기에 ink.body 를 넣어 본문과 캡션이
    #    같은 농도가 됐다(#262626 vs 원본 muted #5B6B7D). 부제·캡션의 위계가 통째로
    #    사라지는데 값은 채워져 있으니 아무도 눈치채지 못한다. 원본에 muted 가 없으면
    #    **비워 둔다** — 골격 기본값이 남는 편이 위계를 뭉개는 것보다 낫다.
    ink = color.get("ink") or {}
    for src in ("strong", "body"):
        if hexof(ink.get(src)):
            pal["ink"] = hexof(ink[src])
            break
    if hexof(ink.get("muted")):
        pal["muted"] = hexof(ink["muted"])

    if pal:
        out["palette"] = pal
    return out


def load(path=None, quiet=False):
    """theme.yml 을 읽어 기본값 위에 병합한다. 없으면 내장 기본 테마.

    레거시 `design-tokens.yml` 을 받으면 `_from_design_tokens()` 로 옮겨 읽는다.
    """
    if not path or not os.path.isfile(path):
        if not quiet:
            print("[theme] %s → 내장 기본 테마 사용"
                  % ("경로 미지정" if not path else "파일 없음: %s" % path))
        return dict(DEFAULT)
    try:
        import yaml
    except ImportError:
        sys.exit("[theme] FAIL: pyyaml 이 없어 %s 를 읽을 수 없다.\n"
                 "  기본값으로 조용히 넘어가지 않는다 — 잘못된 규격의 산출물이 나오기 때문이다.\n"
                 "  설치: pip3 install pyyaml" % path)
    with open(path, encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}
    if os.path.basename(path) == "design-tokens.yml" or "scale_pt" in str(data.get("typography", "")):
        if not quiet:
            print("[theme] 레거시 design-tokens.yml 을 읽었다(fallback) — 정본은 theme.yml 이다: %s" % path)
        data = _from_design_tokens(data)
    return _accent_from_steps(_merge(DEFAULT, data), data, quiet)


def _accent_from_steps(th, raw, quiet=False):
    """테마가 `palette.steps` 를 선언했는데 `accent` 를 안 적었으면 **거기서 채운다.**

    왜 필요한가: `theme-extract` 는 원본에서 `primary`·`steps` 만 실측한다(스스로
    *"scheme:accent1 등은 실측되지 않는다"* 라고 적어 뒀다). 그런데 블록이 읽는 슬롯은
    `palette.accent.{navy,green,orange,purple}` 라, 실측 테마를 줘도 **그 슬롯은 비어
    내장 기본값이 이긴다** — 즉 *"모범 덱을 실측해 테마로 삼는다"* 가 색에 대해서는
    성립하지 않았다(2026-08-10 실측 · 정의표 4번 `모범.pptx`: 이탈 11색 중 4색이
    내장 accent, 나머지는 그 배경 틴트).

    ⚠️ **덮어쓰기가 아니라 빈 자리 채우기다.** `accent` 를 적은 테마는 그대로 이긴다.
       기존 테마 12종은 전부 `accent` 미기재 + `steps` 가 내장 기본값과 동일하므로
       이 폴백을 타도 **색이 바뀌지 않는다**(회귀 0 — 실측으로 확인).
    """
    pal = (raw or {}).get("palette") or {}
    if pal.get("accent") or not pal.get("steps"):
        return th
    steps = [s for s in pal["steps"] if isinstance(s, str) and s.startswith("#")]
    if not steps:
        return th
    primary = pal.get("primary") or steps[0]
    # 슬롯은 4개인데 계단은 보통 3색이다 — 모자라면 순환시킨다. 원본에 없던 색을
    # 지어내는 것보다 **원본 색을 다시 쓰는 쪽**이 "실측 규격을 따른다" 에 가깝다.
    names = ["navy", "green", "orange", "purple"]
    acc = {n: steps[i % len(steps)] for i, n in enumerate(names)}
    acc["navy"] = primary          # 주색은 primary 가 맡는다
    acc["band"] = primary
    th["palette"]["accent"] = acc
    # 배경 틴트도 같은 자리에서 온다. 여기를 두면 accent 만 실측색이 되고 **그 뒤에 깔리는
    # 옅은 판은 내장 색**이라, 한 장 안에서 두 팔레트가 섞인다(실측: 이탈 11→7 에서 남은
    # 3색이 정확히 `bg.{green,orange,purple}` 이었다).
    if not (pal.get("bg") or {}):
        th["palette"]["bg"] = dict(th["palette"].get("bg") or {},
                                   **{k: _tint(v) for k, v in acc.items() if k != "band"})
        th["palette"]["bg"]["blue"] = _tint(acc["navy"])
    if not quiet:
        print("[theme] accent 미기재 → palette.steps 로 채움 (%s)"
              % " ".join("%s=%s" % (k, v) for k, v in acc.items() if k != "band"))
    return th


def _tint(hex6, keep=0.10):
    """색을 흰색에 섞어 **옅은 배경판**을 만든다 (기본 10% 유지 = 90% 흰색).

    내장 기본 틴트(`#F2F5FA` 등)의 실측 농도와 같은 급으로 맞춘 값이다.
    """
    h = hex6.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return "#%02X%02X%02X" % tuple(round(c * keep + 255 * (1 - keep)) for c in (r, g, b))


def rgb(v):
    """'#RRGGBB' → RGBColor. 이미 RGBColor 면 그대로."""
    if isinstance(v, RGBColor):
        return v
    s = str(v).lstrip("#")
    return RGBColor(int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16))


def find(start, name=None):
    """빌더 위치에서 위로 올라가며 `_asset/theme/{name}/theme.yml` 을 찾는다.

    name 미지정이면 theme/ 아래 **첫 번째** 테마. 프로젝트가 경로를 강제받지 않도록
    탐색으로 해결한다(설계 §3-1 — SCAR 는 경로를 강제하지 않는다).
    """
    d = os.path.abspath(start)
    for _ in range(6):
        troot = next((os.path.join(d, a, "theme") for a in ASSET_DIRS
                      if os.path.isdir(os.path.join(d, a, "theme"))), None)
        if troot:
            if name:
                p = os.path.join(troot, name, "theme.yml")
                return p if os.path.isfile(p) else None
            cands = [e for e in sorted(os.listdir(troot))
                     if os.path.isfile(os.path.join(troot, e, "theme.yml"))]
            if len(cands) == 1:
                return os.path.join(troot, cands[0], "theme.yml")
            if len(cands) > 1:
                # ⚠️ **조용히 첫 번째를 고르지 않는다.** 테마가 늘어난 순간 남의 규격을
                #    집어 엉뚱한 판형으로 산출된다(실측: reifier 가 A4 세로로 나왔다).
                print("[theme] ⚠️ 테마 %d 종 발견(%s) — 어느 것인지 알 수 없다.\n"
                      "        빌더에서 PPT_THEME 를 지정하라. 지금은 내장 기본 테마를 쓴다."
                      % (len(cands), ", ".join(cands)))
                return None
        nd = os.path.dirname(d)
        if nd == d:
            break
        d = nd
    # theme/ 가 아예 없는 레거시 자산(`10-rfp/_asset` 실측)을 위한 fallback.
    # 정본은 theme.yml 이므로 **theme/ 를 다 뒤진 뒤에만** 본다 — 순서가 뒤집히면
    # theme.yml 을 둔 프로젝트에서도 옛 파일이 이긴다.
    d = os.path.abspath(start)
    for _ in range(6):
        for a in ASSET_DIRS:
            p = os.path.join(d, a, "design-tokens.yml")
            if os.path.isfile(p):
                return p
        nd = os.path.dirname(d)
        if nd == d:
            break
        d = nd
    return None


if __name__ == "__main__":
    t = load(sys.argv[1] if len(sys.argv) > 1 else None)
    print("테마: %s (base=%s)" % (t["meta"].get("name"), t["meta"].get("base")))
    print("캔버스: %.2f × %.2f %s" % (t["canvas"]["w"], t["canvas"]["h"], t["canvas"]["unit"]))
    print("폰트: %s / title %s" % (t["font"]["family"], t["font"]["title"]))
    print("accent: %s" % ", ".join("%s=%s" % kv for kv in t["palette"]["accent"].items()))
