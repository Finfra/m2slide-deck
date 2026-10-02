#!/usr/bin/env python3
"""blocks — 범용 인포그래픽 블록 렌더러

골격: ~/.claude/skills/ppt-info/templates/blocks.template.py
계약: render(slide, y, data) -> 다음 y   ← 페이지 파일은 좌표를 모른다.

여기 있는 것은 **어느 프로젝트에서나 쓰는 블록**뿐이다. 특정 원본 한 장을 위해 만든
페이지 전용 조합은 `blocks_extra.py` 로 분리했다 — 범용 템플릿에 남겨 두면 `--ensure`
로 자산을 씨딩한 무관한 프로젝트가 남의 페이지 어휘를 통째로 상속한다(Issue50 D3).

회색조 성립: 블록 구분을 색면에만 싣지 않는다 — 번호 배지·테두리·무늬·제목 텍스트를
중복으로 싣는다. 그래서 색을 잃어도 구조가 남는다.

⚠️ **수치를 여기에 박지 않는다** — theme.yml 이 SSOT 다(설계 §4-1). 코드에 박은 pt·mm 은
   테마 교체·판형 전환·접근성 하한 조정을 전부 막는다(Issue50 3차 실측: 결함 6건이 전부
   이 한 형태였다).
"""
import sys

from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_CONNECTOR
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

import ppt_kit as B

# ⚠️ 수치를 여기에 박지 않는다 — theme.yml 이 SSOT 다(설계 §4-1).
#    블록 높이를 코드에 두면 판형·테마를 바꿔도 배치가 따라오지 않는다.
GAP = B.LAYOUT["gap"]
ND = B.NODE_D                              # 노드 지름 (mm)
_H = {b["id"]: b for b in B.LAYOUT.get("blocks", [])}

# ── 테마 원본 — ppt_kit 이 이름 붙여 주지 않는 키를 여기서 읽는다 ─────────
#    `ppt_kit` 은 골격이 정한 이름만 내보낸다. 블록 고유의 축(액센트 바 무늬·글자색
#    정책·서체 하한)은 블록이 알아야 하므로 원본 dict 에서 직접 읽는다.
_TH = B.TH
_SH = _TH.get("shape", {}) or {}
_PAL = _TH.get("palette", {}) or {}
_FN = _TH.get("font", {}) or {}


def fail(msg, code=1):
    """명시적 실패. `sys.exit("문자열")` 은 종료 코드를 **항상 1** 로 만들어
    "무엇 때문에 죽었는가" 를 코드로 구분할 수 없게 한다 — 메시지와 코드를 분리한다."""
    sys.stderr.write("[blocks] FAIL: %s\n" % msg)
    raise SystemExit(code)


def h_of(bid, fallback):
    """theme.yml `layout.blocks` 에서 블록 높이를 읽는다. 미정의면 fallback."""
    return _H.get(bid, {}).get("h", fallback)


def after_of(bid, fallback=None):
    """블록 뒤 간격. 미정의면 공통 GAP."""
    return _H.get(bid, {}).get("after", GAP if fallback is None else fallback)


def _sz(key, default):
    """서체 크기 — `font.{key}` 를 읽고 `font.min` 을 **하한**으로 건다.

    코드에 pt 를 박으면 서체 하한을 테마로 걸 수 없다(Issue50 3차 실측 ④ — desc 가
    `Pt(7.5)` 로 박혀 있어 8pt 하한을 요구하는 컨셉을 적용할 경로가 없었다)."""
    return B.Pt(max(float(_FN.get(key, default)), float(_FN.get("min", 0))))


SZ_DESC = _sz("desc", 7.5)                 # 카드 부연 설명 — 페이지에서 가장 작은 글자

# ── 액센트 바 — 폭·무늬를 테마가 정한다 ──────────────────────────────────
#    무늬는 "색을 잃어도 단계가 구분되는가" 의 마지막 보루다. solid 로만 칠하면
#    회색조에서 인접 계단이 붙어 버린다.
BAR_W = float(_SH.get("bar_w", 1.8))
BAR_PATTERN = _SH.get("bar_pattern") or {}   # {팔레트 슬롯: OOXML prst 이름}

# ── 색 정책 ───────────────────────────────────────────────────────────────
#    `auto` = 대비를 실측해 고른다. 고정 색을 박으면 밝은 팔레트에서 글자가 사라진다.
ON_ACCENT = _PAL.get("on_accent", "auto")        # 색면 위 글자색
HEAD_ON_PANEL = _PAL.get("head_on_panel", "auto")  # 패널 제목 색
CARDS_ACCENT = (B.LAYOUT.get("cards") or {}).get("accent", "text")


# ── 색 유틸 ───────────────────────────────────────────────────────────────
_SLOT = {"navy": B.NAVY, "green": B.GREEN, "orange": B.ORANGE, "purple": B.PURPLE,
         "band": B.BAND, "primary": B.ACCENT, "ink": B.INK, "muted": B.MUTED,
         "line": B.LINE, "white": B.WHITE}
_BGSLOT = {"navy": B.BG_BLUE, "green": B.BG_GREEN,
           "orange": B.BG_ORANGE, "purple": B.BG_PURPLE}


def _hex(c):
    """RGBColor | '#RRGGBB' → 'RRGGBB'(대문자)."""
    return str(c).lstrip("#").upper()


def _T_rgb(v):
    """'#RRGGBB' 를 RGBColor 로. 팔레트 키가 아닌 직접 지정을 허용한다."""
    s = _hex(v)
    if len(s) != 6 or any(ch not in "0123456789ABCDEF" for ch in s):
        fail("색 값 %r 를 읽을 수 없다 — '#RRGGBB' 또는 팔레트 키(%s) 중 하나여야 한다"
             % (v, ", ".join(sorted(_SLOT))))
    return RGBColor(int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16))


def _slot_rgb(v, default=None):
    """팔레트 슬롯 이름 또는 hex 를 RGBColor 로. 이름을 먼저 본다."""
    if v is None:
        return default
    if isinstance(v, RGBColor):
        return v
    return _SLOT.get(str(v)) or _T_rgb(v)


def _tint(c, k=0.90):
    """색을 흰쪽으로 k 만큼 민다. 팔레트 슬롯이 아닌 hex 를 `color` 로 받았을 때
    배경면을 **조용히 BG_BLUE 로 떨어뜨리지 않기** 위한 유도값이다(Issue50 재측정 ②)."""
    s = _hex(c)
    r, g, b = (int(s[i:i + 2], 16) for i in (0, 2, 4))
    return RGBColor(*(int(round(v + (255 - v) * k)) for v in (r, g, b)))


def _lin(v):
    v /= 255.0
    return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4


def _relY(c):
    """상대 휘도 (WCAG 2.x)."""
    s = _hex(c)
    r, g, b = (int(s[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * _lin(r) + 0.7152 * _lin(g) + 0.0722 * _lin(b)


def contrast(fg, bg):
    """대비비. 검증기(`ppt-check`)가 사후에 재는 것과 **같은 식**을 렌더 시점에 쓴다 —
    나중에 걸릴 것을 미리 피하는 편이 후처리 스크립트를 얹는 것보다 싸다."""
    a, b = _relY(fg) + 0.05, _relY(bg) + 0.05
    return max(a, b) / min(a, b)


def _pt(v, default):
    """`Pt(...)`(Length) 든 숫자든 pt 실수로. 대비 요구치는 **글자 크기**로 갈린다."""
    return float(default) if v is None else float(getattr(v, "pt", v))


def _need(pt, bold):
    """WCAG AA 요구 대비 — 18pt 이상 또는 14pt 이상 굵게면 large text(3.0)."""
    return 3.0 if (pt >= 18 or (pt >= 14 and bold)) else 4.5


_BLACK, _WHITE = RGBColor(0, 0, 0), RGBColor(0xFF, 0xFF, 0xFF)


def _on(bg, size=None, bold=True):
    """**색면 위** 글자색. `palette.on_accent` 가 'auto'(기본)면 대비를 실측해 고른다.

    ① 테마의 white / ink 중 대비가 큰 쪽
    ② 그것이 AA 에 못 미치면 **순백·순검**까지 한 단계 더 간다. 팔레트 순도보다
       가독이 앞선다 — 순도를 지켜야 하면 `on_accent` 로 색을 고정한다

    ⚠️ 흰색으로 박아 두던 것이 결함이었다(Issue50 3차 실측 ②). 실측: 밝은 계단
       #79B79C 위 흰 글자는 2.32:1, 잉크로 바꾸면 6.26:1 이다. ② 가 필요한 이유도
       실측이다 — #C2650F 위에서는 테마 흰(4.07)·테마 잉크(3.57) **둘 다** 4.5 에
       못 미치고 순검만 5.16 으로 넘는다."""
    if ON_ACCENT != "auto":
        return _slot_rgb(ON_ACCENT)
    best = max((B.WHITE, B.INK), key=lambda c: contrast(c, bg))
    if contrast(best, bg) >= _need(_pt(size, _FN.get("body", 9.5)), bold):
        return best
    return max((_BLACK, _WHITE), key=lambda c: contrast(c, bg))


def _head_color(stage, bg, size=None, bold=True):
    """**밝은 면 위** 제목 색. `palette.head_on_panel` 로 정책을 고른다.

    auto(기본)  단계 색이 AA 를 만족하면 그대로, 아니면 primary → ink 순으로 내려온다
    stage       항상 단계 색 (옛 동작 — 밝은 계단에서 3.39:1·2.05:1 로 AA 미달)
    primary | ink | '#RRGGBB'   고정

    ⚠️ 단계 색을 그대로 칠하던 것이 결함이었다(Issue50 3차 실측 ③). 단계 구분은
       배지 번호·무늬 바·테두리가 이미 나르므로 제목까지 색으로 할 필요가 없다."""
    if HEAD_ON_PANEL == "stage":
        return stage
    if HEAD_ON_PANEL != "auto":
        return _slot_rgb(HEAD_ON_PANEL)
    need = _need(_pt(size, _FN.get("head", 14)), bold)
    for c in (stage, B.ACCENT, B.INK):
        if contrast(c, bg) >= need:
            return c
    return _on(bg, size, bold)      # 팔레트로 안 되면 순백·순검까지 — 판정 단일 지점


# ── 도형 유틸 ─────────────────────────────────────────────────────────────
def _pad(sp, mg=None):
    """텍스트 여백을 테마(`margin_text.default`)로 건다.

    `ppt_kit.shape()` 이 1.2/0.6 을 박고 시작하므로 **만든 뒤 덮어쓴다**. 이 경로가
    없으면 컨셉의 card_padding 을 반영할 방법이 아예 없다(Issue50 죽은 키 목록)."""
    m = mg or B.MG_TEXT
    tf = sp.text_frame
    tf.margin_left = tf.margin_right = B.Mm(float(m.get("l", 1.2)))
    tf.margin_top = tf.margin_bottom = B.Mm(float(m.get("t", 0.6)))
    return sp


def _pattern_fill(sp, fg, bg, prst):
    """`a:solidFill` 을 **같은 자리에서** `a:pattFill` 로 갈아 끼운다.

    ⚠️ 자리를 지켜야 한다 — `CT_ShapeProperties` 자식 순서는
       xfrm → prstGeom → fill → ln → effectLst 다. 뒤에 append 하면 ln 뒤로 밀려
       **PowerPoint 만** 파일을 거부한다(`check-xml-order` 가 잡는 바로 그 위반)."""
    spPr = sp._element.spPr
    old = spPr.find(B.qn("a:solidFill"))
    if old is None:
        fail("무늬 채우기 실패 — 대상 도형에 solidFill 이 없다(prst=%s)" % prst)
    i = list(spPr).index(old)
    spPr.remove(old)
    spPr.insert(i, B.parse_xml(
        '<a:pattFill %s prst="%s"><a:fgClr><a:srgbClr val="%s"/></a:fgClr>'
        '<a:bgClr><a:srgbClr val="%s"/></a:bgClr></a:pattFill>'
        % (B.nsdecls("a"), prst, _hex(fg), _hex(bg))))
    return sp


def _panel(slide, x, y, w, h, fill, line):
    """큰 컨테이너. `B.panel()` 은 adj·lw 를 박아 두므로 **테마 값으로** 직접 만든다."""
    return B.card(slide, x, y, w, h, fill=fill, line=line,
                  lw=B.LW_PANEL, adj=B.ADJ_PANEL, shadow=True)


def _box(slide, x, y, w, h, fill=B.WHITE, line=B.LINE, shadow=False):
    """작은 카드 — 모서리·선 굵기·텍스트 여백을 전부 테마에서 받는다."""
    return _pad(B.card(slide, x, y, w, h, fill=fill, line=line,
                       lw=B.LW_CHIP, adj=B.ADJ_CHIP, shadow=shadow))


# ── 공통 조각 ─────────────────────────────────────────────────────────────
def _head(slide, x, y, no, title, color, w=90.0, bg=None):
    """번호 배지 + 블록 제목. 반환: 제목 하단 y

    `w` 는 제목 **상자** 폭이다. 텍스트가 짧아도 상자는 그대로 자리를 차지하므로,
    옆에 다른 도형이 오는 블록에서는 좁혀야 한다 — 안 그러면 텍스트는 안 겹치는데
    `check-conform` 의 겹침 검사가 박스 기준으로 잡는다(v05 블록5 실측 46%).

    `bg` 는 제목이 **얹히는 면색**이다. 주면 `palette.head_on_panel` 정책을 타서
    대비 미달 색이 그대로 나가지 않는다 — 밝은 액센트(L\\* 74)를 옅은 면 위에 쓰면
    1.76:1 로 읽히지 않는다(실측). 안 주면 옛 동작(액센트 색 그대로)."""
    d = float(B.BADGE)
    bd = B.card(slide, x, y, d, d, fill=color, line=color, adj=B.ADJ_BADGE, lw=B.LW_CHIP)
    B.text(bd, no, size=B.SZ_HEAD, color=_on(color, B.SZ_HEAD), bold=True)
    B.label(slide, x + d + 1.0, y - 0.4, w, d + 0.8, title, size=B.SZ_HEAD,
            color=color if bg is None else _head_color(color, bg, B.SZ_HEAD), bold=True,
            align=PP_ALIGN.LEFT)
    return y + d


def _node(slide, cx, cy, icon, name, color, bg, d=ND):
    """원형 엔티티 노드. **라벨을 원 안에** 둔다 —
    원 밖 라벨은 아래 블록의 캡션 박스와 겹친다(v01 P6 리뷰에서 실제 발생)."""
    o = B.oval(slide, cx - d / 2, cy - d / 2, d, d, fill=bg, line=color, lw=B.LW_NODE)
    # 원 안 좌우 여백은 기본(1.2mm)이면 "노트북"이 2줄로 접힌다(v03 실측) → `margin_text.node`
    _pad(o, B.MG_NODE)
    B.text(o, [(icon, {"size": B.Pt(9.5), "space_after": 0}),
               (name, {"size": B.SZ_NODE, "bold": True})])
    return cx, cy


def _rel(slide, x1, cy, x2, name, color=B.INK):
    """관계 화살표 + 위 라벨. 라벨은 화살표 바로 위(원 사이 빈 구간)에 둔다."""
    B.label(slide, (x1 + x2) / 2 - 13, cy - 5.4, 26, 4.4, name,
            size=B.SZ_CAP, color=color, bold=True)
    B.arrow(slide, x1, cy, x2, cy, color=color)


def _note(slide, x, y, w, h, runs, bg, line):
    """캡션 박스 — 블록 안 설명 문장."""
    c = _box(slide, x, y, w, h, fill=bg, line=line)
    B.text(c, runs, size=B.SZ_CAP, color=B.INK)
    return c


def _chip(slide, x, y, w, h, runs, bg, line, size=None, bold=True, align=PP_ALIGN.LEFT):
    c = _box(slide, x, y, w, h, fill=bg, line=line)
    B.text(c, runs, size=size or B.SZ_CAP, color=B.INK, bold=bold, align=align)
    return c


# ── 앵커 레지스트리 ───────────────────────────────────────────────────────
# `flow_arrow` 가 *"무엇이 무엇을 잇는가"* 를 **이름으로** 말하려면 앞 블록이 그린
# 도형의 위치를 알아야 한다. 그런데 렌더러 계약은 `render(slide, y, data) -> 다음 y` 라
# 좌표를 돌려주지 않는다. 계약을 바꾸면 **모든 블록이 함께 바뀌므로**, 그리는 쪽이
# 이름표를 붙이는 방식을 택했다 — 추가 비용은 dict 대입 한 줄이고 기존 블록의 반환값·
# 호출부는 그대로다.
#
# 슬라이드를 넘는 커넥터는 만들 수 없으므로 `render_page` 가 페이지마다 비운다.
ANCHORS = {}


def anchor(name, sp, x, y, w, h):
    """도형에 이름표를 붙인다. `name` 이 없으면 아무것도 하지 않는다(비용 0)."""
    if name:
        ANCHORS[str(name)] = {"sp": sp, "x": x, "y": y, "w": w, "h": h}
    return sp


# 상자 변 → preset geometry 의 연결점 인덱스. PowerPoint 가 이 번호로 커넥터를
# 도형에 **붙인다** — 붙어 있으면 사용자가 도형을 옮겨도 화살표가 따라온다.
_SIDE_IDX = {"top": 0, "left": 1, "bottom": 2, "right": 3}


def _side_pt(a, side):
    if side == "top":
        return a["x"] + a["w"] / 2, a["y"]
    if side == "bottom":
        return a["x"] + a["w"] / 2, a["y"] + a["h"]
    if side == "left":
        return a["x"], a["y"] + a["h"] / 2
    return a["x"] + a["w"], a["y"] + a["h"] / 2


def _pick_sides(a, b):
    """두 상자 사이에서 **가장 짧고 상자를 가로지르지 않는** 변 쌍을 고른다."""
    if b["x"] >= a["x"] + a["w"]:
        return "right", "left"
    if a["x"] >= b["x"] + b["w"]:
        return "left", "right"
    if b["y"] >= a["y"] + a["h"]:
        return "bottom", "top"
    if a["y"] >= b["y"] + b["h"]:
        return "top", "bottom"
    # 겹친다 — 중심 간 델타가 큰 축으로 정한다
    dx = (b["x"] + b["w"] / 2) - (a["x"] + a["w"] / 2)
    dy = (b["y"] + b["h"] / 2) - (a["y"] + a["h"] / 2)
    if abs(dx) >= abs(dy):
        return ("right", "left") if dx >= 0 else ("left", "right")
    return ("bottom", "top") if dy >= 0 else ("top", "bottom")


_CXN = {"straight": MSO_CONNECTOR.STRAIGHT, "elbow": MSO_CONNECTOR.ELBOW,
        "curve": MSO_CONNECTOR.CURVE}


def _connector(slide, p1, p2, kind, color, lw, dashed, head, tail):
    """커넥터 1개. `ppt_kit.arrow()` 를 대체하지 않는다 — 그쪽은 실선/점선 **단방향**
    전용이고 여기는 머리·꼬리·엘보를 함께 다룬다.

    ⚠️ `CT_LineProperties` 자식 순서는 fill → prstDash → join → headEnd → tailEnd 다.
       순서를 어기면 Quick Look·LibreOffice 는 열리는데 **PowerPoint 만** 파일을
       거부한다(`ppt_kit.arrow` 주석의 실측 3건과 같은 함정)."""
    cn = slide.shapes.add_connector(kind, B.Mm(p1[0]), B.Mm(p1[1]), B.Mm(p2[0]), B.Mm(p2[1]))
    cn.line.color.rgb = color
    cn.line.width = B.Pt(lw)
    ln = cn.line._get_or_add_ln()
    if dashed:
        ln.append(B.parse_xml('<a:prstDash %s val="dash"/>' % B.nsdecls("a")))
    if head:
        ln.append(B.parse_xml('<a:headEnd %s type="triangle" w="med" len="med"/>' % B.nsdecls("a")))
    if tail:
        ln.append(B.parse_xml('<a:tailEnd %s type="triangle" w="med" len="med"/>' % B.nsdecls("a")))
    return cn


# ── 블록 렌더러 ───────────────────────────────────────────────────────────
def title(slide, y, d):
    h = h_of("title", 19.0)
    t = B.label(slide, B.L, y, B.W, h * 0.658, d["title"],
                size=B.SZ_TITLE, color=B.NAVY, bold=True)
    _pad(t)
    _pad(B.label(slide, B.L, y + h * 0.658, B.W, h * 0.342, d["sub"],
                 size=B.SZ_SUB, color=B.INK))
    anchor(d.get("id"), t, B.L, y, B.W, h * 0.658)
    return y + h + after_of("title", 1.5)


def footer(slide, y, d):
    h = h_of("footer", 7.0)
    f = _pad(B.label(slide, B.L, y, B.W, h, d["text"],
                     size=_sz("footer", 11.5), color=B.NAVY, bold=True))
    anchor(d.get("id"), f, B.L, y, B.W, h)
    return y + h


def cards(slide, y, data):
    """카드 나열 — data = {"items": [{"no": "01.", "title": …, "desc": …}, …]}

    회색조 대응: 번호(no) + 명도 계단(STEP) + 테두리를 함께 싣는다.

    `accent` — 계단색을 **어디에 싣는가**. 테마 `layout.cards.accent` 가 기본값이다.
        text(기본)  글자색       bar  왼쪽 액센트 바(글자는 ink)      none  색 미사용
    ⚠️ `text` 로 고정돼 있던 것이 결함이었다 — 계단 팔레트를 **면·바 전용**으로 정의한
       컨셉(step/3 은 "검정만")에서는 그 색을 글자에 얹는 순간 대비 2.05:1 이 되어
       읽히지 않는다(Issue50 3차 실측 ⑤). 항목별 `color` 로도 받는다(재측정 ③).
    """
    items = data["items"]
    n = len(items)
    gap = B.ROW_GAP
    cw = (B.W - gap * (n - 1)) / n
    h = data.get("h", 26.0)
    # 그림자는 **데이터로 받는다** — 패널만 입체이고 카드가 평면이면 층위가 갈린다.
    # SmartArt 풍 요구에서 드러난 것: `shadow: true` 를 적어도 조용히 무시됐다(2026-08-09)
    shadow = bool(data.get("shadow", False))
    mode = data.get("accent", CARDS_ACCENT)
    for i, it in enumerate(items):
        x = B.L + i * (cw + gap)
        c = _box(slide, x, y, cw, h, fill=B.BG, shadow=shadow)
        col = _slot_rgb(it.get("color"), B.STEP[i % len(B.STEP)])
        if mode == "bar":
            B.rect(slide, x, y, BAR_W, h, fill=col)
        B.text(c, [it.get("no", "") + " " + it["title"], it.get("desc", "")],
               color=col if mode == "text" else B.INK, bold=True, anchor=MSO_ANCHOR.MIDDLE)
        anchor(it.get("id"), c, x, y, cw, h)
    return y + h + gap


def section(slide, y, data):
    """섹션 헤더 밴드 — data = {"title": …}

    ⚠️ 헤더 하단 ↔ 콘텐츠 상단 간격은 **SEC_GAP 한 곳**에서만 온다.
    이 값을 고치면 전 페이지가 함께 교정되는 것이 이 구조의 목적이다.
    """
    h = data.get("h", 9.0)
    band = _pad(B.rect(slide, B.L, y, B.W, h, fill=B.ACCENT))
    B.text(band, data["title"], size=B.SZ_HEAD, color=_on(B.ACCENT, B.SZ_HEAD), bold=True,
           anchor=MSO_ANCHOR.MIDDLE)
    anchor(data.get("id"), band, B.L, y, B.W, h)
    return y + h + B.SEC_GAP


def bullets(slide, y, data):
    """불릿 문단 — data = {"items": [str, …]}

    텍스트로 '• ' 를 찍지 않는다. 진짜 buChar 문단이어야 들여쓰기·줄바꿈이 맞는다.
    """
    h = data.get("h", 6.0) * len(data["items"]) + 6.0
    box = _box(slide, B.L, y, B.W, h)
    B.text(box, data["items"], bullet="•")
    anchor(data.get("id"), box, B.L, y, B.W, h)
    return y + h + B.ROW_GAP


def compare(slide, y, data):
    """As-Is ↔ To-Be 대비 — data = {"left": {...}, "right": {...}}

    좌우를 **색으로만** 가르지 않는다. 제목 텍스트와 명도 차이를 함께 싣는다.
    """
    h = data.get("h", 40.0)
    gap = B.ROW_GAP
    cw = (B.W - gap) / 2
    for i, (key, fill) in enumerate((("left", B.BG), ("right", B.WHITE))):
        d = data[key]
        x = B.L + i * (cw + gap)
        c = _box(slide, x, y, cw, h, fill=fill)
        # ⚠️ 제목을 본문과 같은 크기로 두면 좌우가 **색으로만** 구분된다(실측: m2slide 강점 덱).
        #    회색조·저품질 프로젝터에서 무너지고, 컬러에서도 어느 쪽이 To-Be 인지 읽히지 않는다.
        accent = B.MUTED if i == 0 else B.ACCENT
        B.text(c, [(d["title"], {"size": B.SZ_HEAD, "bold": True,
                                 "color": _head_color(accent, fill, B.SZ_HEAD),
                                 "space_after": 3})]
               + [(t, {"align": PP_ALIGN.LEFT}) for t in d.get("items", [])],
               color=B.INK, anchor=MSO_ANCHOR.TOP)
        anchor(d.get("id"), c, x, y, cw, h)
    return y + h + gap


def tree_compare(slide, y, data):
    """AS-IS 트리 ↔ TO-BE 트리 + 결론 — prj82 `tree_compare` 를 theme 기반으로 이식.

    원본 도해가 **이미지로 구워진** 자리를 대체하는 대표 블록이다. 구조 비교는
    카드 나열로 표현되지 않는다 — 좌우 트리와 계층이 보여야 "무엇이 어떻게 바뀌는지" 가 읽힌다.

    ⚠️ prj82 원본은 A4 세로 216×303 전제였다. 좌표를 그대로 쓰지 않고
       `B.W`·`B.L` 로 환산해 판형 무관하게 만들었다.

    data = {title, asis:{title,items[],caption}, tobe:{title,band,core[],cats[],depth},
            punch:[str]}
    """
    h = data.get("h", 52.0)
    p = _panel(slide, B.L, y, B.W, h, B.BG_BLUE, B.NAVY)
    anchor(data.get("id"), p, B.L, y, B.W, h)
    top = _head(slide, B.L + 4, y + 2.5, data.get("no", "▸"), data["title"], B.NAVY,
                w=120, bg=B.BG_BLUE)
    ny = y + h - 9.0                      # 결론 밴드 상단 = 트리 하한
    cw = (B.W - 12) / 2 - 4

    # ── 좌: AS-IS
    a = data.get("asis", {})
    ax = B.L + 4
    _chip(slide, ax, top + 1.0, cw, 5.6, a.get("title", "AS-IS"), B.WHITE, B.MUTED,
          align=PP_ALIGN.CENTER)
    items = a.get("items", [])
    n = max(1, len(items))
    ih = min(5.4, (ny - top - 14.0) / n)
    for i, it in enumerate(items):
        _chip(slide, ax + cw * 0.18, top + 8.0 + i * (ih + 0.8), cw * 0.64, ih, it,
              B.WHITE, B.LINE, size=SZ_DESC, bold=False, align=PP_ALIGN.CENTER)
    if a.get("caption"):
        # ⚠️ 캡션을 하한선 기준으로 두면 항목이 많을 때 마지막 항목과 겹친다(실측 7개).
        #    항목 스택의 **실제 끝** 다음에 놓는다.
        cy = top + 8.0 + n * (ih + 0.8) + 1.0
        if cy + 5.0 <= ny:
            _pad(B.label(slide, ax, cy, cw, 5.0, a["caption"], size=B.SZ_CAP, color=B.MUTED))

    # ── 변환 화살표
    B.arrow(slide, B.L + cw + 5, (top + ny) / 2, B.L + cw + 11, (top + ny) / 2,
            color=B.NAVY, lw=3.0)

    # ── 우: TO-BE
    t = data.get("tobe", {})
    tx = B.L + cw + 12
    _chip(slide, tx, top + 1.0, cw, 5.6, t.get("title", "TO-BE"), B.NAVY, B.NAVY,
          align=PP_ALIGN.CENTER).text_frame.paragraphs[0].runs[0].font.color.rgb = \
        _on(B.NAVY, B.SZ_CAP)
    yy = top + 8.0
    if t.get("band"):
        _chip(slide, tx, yy, cw, 5.2, t["band"], B.BG_GREEN, B.GREEN, align=PP_ALIGN.CENTER)
        yy += 6.2
    core = t.get("core", [])
    if core:
        w1 = (cw - 2 * (len(core) - 1)) / len(core)
        for i, c in enumerate(core):
            _chip(slide, tx + i * (w1 + 2), yy, w1, 5.4, c, B.WHITE, B.GREEN,
                  align=PP_ALIGN.CENTER)
        yy += 6.4
    cats = t.get("cats", [])
    if cats:
        w2 = (cw - 1.5 * (len(cats) - 1)) / len(cats)
        for i, c in enumerate(cats):
            _chip(slide, tx + i * (w2 + 1.5), yy, w2, 5.0, c, B.BG_BLUE, B.NAVY,
                  size=B.SZ_NODE, align=PP_ALIGN.CENTER)
        yy += 6.0
    if t.get("depth"):
        _chip(slide, tx + cw * 0.25, yy, cw * 0.5, 5.0, t["depth"], B.BG_YELLOW, B.ORANGE,
              align=PP_ALIGN.CENTER)

    # ── 결론
    if data.get("punch"):
        _note(slide, B.L + 4, ny, B.W - 8, 7.2,
              [(" ".join(data["punch"]), {"bold": True, "color": B.NAVY})], B.WHITE, B.NAVY)
    return y + h + GAP


def columns(slide, y, data):
    """좌우 다단 — 한 장에 블록을 나란히 놓는다.

    ⚠️ 세로 스택만으로는 **원본 도해를 재현할 수 없다.** prj82 는 `COL_L`·`COL_R` 두 단에
       블록을 얹어 장당 도형 52개를 만든다(24장 1248). 그것을 데이터로 표현한 것이 이 블록이다.

    data = {cols: [{w: 0.5, blocks: [...]}, ...], gap: 4.0, h: <최대 높이 강제(선택)>}
    각 단은 자기 하위 블록을 세로로 쌓는다. 반환 y 는 **가장 긴 단**의 끝.
    """
    cols = data.get("cols", [])
    if not cols:
        return y
    gap = data.get("gap", 4.0)
    total = sum(c.get("w", 1.0) for c in cols)
    keep = (B.L, B.W)
    x = keep[0]
    ends = []
    try:
        for c in cols:
            cw = (keep[1] - gap * (len(cols) - 1)) * (c.get("w", 1.0) / total)
            B.L, B.W = x, cw            # 하위 블록은 전역 L/W 를 보므로 잠시 바꿔 끼운다
            yy = y
            for blk in c.get("blocks", []):
                fn = RENDER.get(blk.get("kind"))
                if fn is None:
                    fail("모르는 블록 kind=%r (columns 안). 쓸 수 있는 것: %s"
                         % (blk.get("kind"), ", ".join(sorted(RENDER))))
                yy = fn(slide, yy, blk)
            ends.append(yy)
            x += cw + gap
    finally:
        B.L, B.W = keep
    return max(ends) if ends else y


def stage_panel(slide, y, data):
    """단계 패널 — 번호 배지 + 액센트 바 + 카드 스택. **N단계 파이프라인의 기본 단위**.

    왜 `cards` 로 안 되나: `cards` 는 items 를 **가로로 균등 분할**한다. 그래서 columns 안에
    넣으면 3단 패널이 아니라 N칸이 옆으로 펴진다(실측: 3단계가 6칸이 됐다).
    단계는 **세로로 쌓인 카드 묶음**이고 소속을 색으로 보여야 하므로 별도 블록이 필요하다.

    컨셉 근거: 단계 번호를 원형 배지로 명시 · 카드 왼쪽에 단계 색상 액센트 바 ·
    색은 의미 있는 곳에만, 본문은 무채색.

    data = {id, no, title, color: navy|green|orange|purple|"#RRGGBB", bg,
            bar_w, bar_pattern, badge, items: [{id, title, desc}], item_h, h, foot}

    색·치수는 전부 테마에서 온다 — 액센트 바 폭/무늬(`shape.bar_w`·`shape.bar_pattern`),
    배지 지름(`shape.badge`), 배지 글자색(`palette.on_accent`), 제목색
    (`palette.head_on_panel`), 부연 서체(`font.desc`·`font.min`).
    """
    h = data.get("h", 44.0)
    col = data.get("color", "navy")
    c = _slot_rgb(col)
    # 팔레트 슬롯이면 짝지어진 배경면, 아니면 **조용히 BG_BLUE 로 떨어지지 않고** 그 색에서 유도한다
    bg = _BGSLOT.get(col) if isinstance(col, str) else None
    if bg is None:
        bg = _slot_rgb(data["bg"]) if data.get("bg") else _tint(c)

    p = _panel(slide, B.L, y, B.W, h, bg, c)
    anchor(data.get("id"), p, B.L, y, B.W, h)

    # 액센트 바 — 소속 단계를 색면 하나가 아니라 **위치 + 색 + 무늬**로 알린다.
    # 무늬는 회색조에서 인접 계단이 붙는 것을 막는 마지막 보루다(테마 `shape.bar_pattern`).
    bw = float(data.get("bar_w", BAR_W))
    if bw > 0:
        bar = B.rect(slide, B.L, y, bw, h, fill=c)
        prst = data.get("bar_pattern", BAR_PATTERN.get(col) if isinstance(col, str) else None)
        if prst:
            _pattern_fill(bar, c, bg, prst)

    top = y + 2.5
    bd = float(data.get("badge", B.BADGE))
    if data.get("no"):
        badge = B.oval(slide, B.L + 4, top, bd, bd, fill=c, line=c)
        B.text(badge, data["no"], size=B.SZ_HEAD, color=_on(c, B.SZ_HEAD), bold=True)
        tx = B.L + 4 + bd + 1.5
    else:
        tx = B.L + 4
    B.label(slide, tx, top - 0.3, B.W - (tx - B.L) - 4, 7.6, data.get("title", ""),
            size=B.SZ_HEAD, color=_head_color(c, bg, B.SZ_HEAD), bold=True,
            align=PP_ALIGN.LEFT)

    yy = top + 8.5
    items = data.get("items", [])
    foot_h = 6.4 if data.get("foot") else 0.0
    avail = (y + h - 2.5 - foot_h) - yy
    n = max(1, len(items))
    ih = min(data.get("item_h", 13.0), (avail - 1.6 * (n - 1)) / n)
    for it in items:
        card = _box(slide, B.L + 4, yy, B.W - 8, ih)
        runs = [(it.get("title", ""), {"bold": True, "size": B.SZ_CAP, "color": B.INK})]
        if it.get("desc"):
            runs.append((it["desc"], {"size": SZ_DESC, "color": B.MUTED}))
        B.text(card, runs, anchor=MSO_ANCHOR.MIDDLE)
        anchor(it.get("id"), card, B.L + 4, yy, B.W - 8, ih)
        yy += ih + 1.6
    if data.get("foot"):
        _chip(slide, B.L + 4, y + h - 2.0 - foot_h, B.W - 8, foot_h, data["foot"],
              bg, c, align=PP_ALIGN.CENTER)
    return y + h + GAP


def flow_arrow(slide, y, data):
    """연결 화살표 — *"무엇이 무엇을 잇는가"* 를 **네이티브 커넥터**로 그린다.

    왜 독립 블록인가
        `columns` 에 `connect: true` 옵션을 다는 안은 채택하지 않았다 — 칼럼 **밖**의
        연결·분기·역방향을 못 그린다. 의존 그래프처럼 연결이 본질인 도해에서는 그것이
        표현의 전부다. 실측 근거: 같은 내용의 SVG 는 `marker-end` 3개인데 pptx 는
        화살표 도형 **0개**였다 — 두 발행 포맷의 유일한 표현 격차(Issue50 재측정 ①).

    왜 커넥터인가 (3안 실측 후 선택)
        직선 line·삼각형 조합·블록 화살표 autoshape 도 전부 네이티브 도형으로 남지만,
        `p:cxnSp` 만 `a:stCxn`/`a:endCxn` 으로 **양 끝 도형에 붙는다**. 붙어 있으면
        사용자가 PowerPoint 에서 패널을 옮겨도 화살표가 따라온다. 나머지는 그 자리에
        남아 어긋난다 — "편집 가능" 의 실질이 여기서 갈린다.

    ⚠️ 이 블록은 **덧그리기**다. 세로 자리를 먹지 않으므로 기본 반환은 받은 y 그대로다
       (`gap` 을 주면 그만큼 내려간다). 잇고자 하는 블록 **뒤에** 놓는다.

    data = {from, to, label, dir: forward|back|both, style: straight|elbow|curve,
            dash, color, lw, gap, from_side, to_side, label_w, label_h, label_dy}
    """
    src, dst = data.get("from"), data.get("to")
    if not src or not dst:
        fail("flow_arrow: `from`·`to` 가 모두 필요하다 (from=%r to=%r)" % (src, dst))
    a, b = ANCHORS.get(str(src)), ANCHORS.get(str(dst))
    miss = [n for n, v in ((src, a), (dst, b)) if v is None]
    if miss:
        fail("flow_arrow: 앵커 %s 를 찾지 못했다.\n"
             "  잇고 싶은 블록(또는 그 항목)에 `id:` 를 주면 그 이름으로 등록된다.\n"
             "  화살표는 그 블록들 **뒤에** 와야 한다. 지금 등록된 것: %s"
             % (", ".join(repr(m) for m in miss), ", ".join(sorted(ANCHORS)) or "(없음)"))

    sa, sb = _pick_sides(a, b)
    sa, sb = data.get("from_side", sa), data.get("to_side", sb)
    for s in (sa, sb):
        if s not in _SIDE_IDX:
            fail("flow_arrow: 변 이름 %r 를 모른다 — %s 중 하나여야 한다"
                 % (s, ", ".join(sorted(_SIDE_IDX))))
    p1, p2 = _side_pt(a, sa), _side_pt(b, sb)

    style = data.get("style", "straight")
    if style not in _CXN:
        fail("flow_arrow: style=%r 를 모른다 — %s 중 하나여야 한다"
             % (style, ", ".join(sorted(_CXN))))
    direction = data.get("dir", "forward")
    if direction not in ("forward", "back", "both"):
        fail("flow_arrow: dir=%r 를 모른다 — forward|back|both" % direction)
    col = _slot_rgb(data.get("color"), B.INK)

    cn = _connector(slide, p1, p2, _CXN[style], col, float(data.get("lw", 1.75)),
                    bool(data.get("dash", False)),
                    head=direction in ("back", "both"),
                    tail=direction in ("forward", "both"))
    # 도형에 **붙인다** — 이 두 줄이 `B.arrow` 와의 차이 전부다
    cn.begin_connect(a["sp"], _SIDE_IDX[sa])
    cn.end_connect(b["sp"], _SIDE_IDX[sb])

    if data.get("label"):
        lh = float(data.get("label_h", 4.6))
        horiz = abs(p2[0] - p1[0]) >= abs(p2[1] - p1[1])
        # ⚠️ 라벨 **상자** 폭 기본값을 넉넉히 잡으면 안 된다 — 나란한 두 패널 사이 6mm 를
        #    26mm 상자로 채우면 텍스트는 안 겹치는데 `check-conform` 의 겹침 검사가
        #    박스 기준으로 21% 를 잡는다(실측). 가로 화살표는 **화살표가 건너는 폭**에 맞춘다.
        lw_ = float(data.get("label_w", max(abs(p2[0] - p1[0]), 6.0) if horiz else 26.0))
        mx, my = (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2
        # 가로 화살표는 선 위에, 세로 화살표는 선 오른쪽에 — 선과 겹치면 둘 다 안 읽힌다
        dx = 0.0 if horiz else lw_ / 2 + 1.0
        dy = float(data.get("label_dy", -(lh + 0.6) if horiz else -lh / 2))
        lb = _pad(B.label(slide, mx - lw_ / 2 + dx, my + dy, lw_, lh, data["label"],
                          size=B.SZ_CAP, color=col, bold=True))
        # 좁은 상자에서 두 글자가 세로로 접히지 않게 — 커넥터 라벨은 한 줄이 정상이다
        lb.text_frame.word_wrap = False
    return y + float(data.get("gap", 0.0))


RENDER = {"title": title, "section": section, "cards": cards, "bullets": bullets,
          "compare": compare, "tree_compare": tree_compare, "columns": columns,
          "stage_panel": stage_panel, "flow_arrow": flow_arrow, "footer": footer}


def _load_extra():
    """같은 폴더에 `blocks_extra.py` 가 있으면 그 `RENDER` 를 합친다 (**옵트인**).

    페이지 전용 블록은 범용 템플릿에서 뺐다 — 씨딩(`--ensure`)만으로 남의 페이지 어휘를
    상속하면 어휘가 계속 불어나고, 실제로 그것 때문에 §8-5 측정이 편향됐다(Issue50 D3).
    필요한 프로젝트는 파일 하나를 자기 `lib/` 에 복사한다:

        cp ~/.claude/skills/ppt-info/templates/blocks_extra.template.py \\
           _asset_ppt/lib/blocks_extra.py

    ⚠️ **파일이 있는데 못 읽으면 중단한다.** 조용히 무시하면 등록됐다고 믿은 블록이
       "모르는 kind" 로 죽고, 원인이 여기라는 것을 알 방법이 없다.
    """
    import importlib.util
    import os

    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "blocks_extra.py")
    if not os.path.isfile(p):
        return 0
    # `blocks_extra` 는 공통 조각을 쓰려고 `import blocks` 한다. 우리가 아직 import 를
    # **끝내지 않은** 상태이므로, 지금 모듈을 그 이름으로 먼저 걸어 둔다 —
    # 안 걸면 파이썬이 blocks.py 를 다시 실행해 무한 재귀에 빠진다.
    sys.modules.setdefault("blocks", sys.modules[__name__])
    spec = importlib.util.spec_from_file_location("blocks_extra", p)
    mod = importlib.util.module_from_spec(spec)
    sys.modules["blocks_extra"] = mod
    spec.loader.exec_module(mod)
    extra = getattr(mod, "RENDER", None)
    if not isinstance(extra, dict) or not extra:
        fail("blocks_extra.py 에 `RENDER` dict 가 없다 — %s" % p)
    dup = sorted(set(extra) & set(RENDER))
    if dup:
        fail("blocks_extra.py 가 범용 블록 %s 를 덮어쓰려 한다. 다른 이름을 쓴다" % ", ".join(dup))
    RENDER.update(extra)
    return len(extra)


EXTRA_COUNT = _load_extra()


# ── 블록별 허용 키 (Issue55 P2, 2026-08-09) ──────────────────────────────
# ⚠️ **정본 문서는 `ppt-info/references/inputs.md` 다.** 여기 표는 그 문서의 기계 사본이며
#    런타임 검증에만 쓴다. 블록을 늘리면 **세 곳을 함께** 고친다 — 함수 docstring · 이 표 ·
#    그 문서(+ `SKILL.md` 어휘 표). 하나만 고치면 오탐이 난다.
#
# 왜 FAIL 이 아니라 경고인가: 상위 호환을 막지 않기 위해서다. 모르는 키가 곧 오류는 아니다.
# 왜 필요한가: `cards` 에 `shadow: true` 를 적었는데 **아무 일도 일어나지 않고 경고도 없던**
#    일이 있었다(2026-08-09 실측). 오타(`shadwo`)와 미지원이 구분되지 않는 것이 문제였다.
_COMMON_KEYS = {"kind", "id"}
SPEC = {
    "title":        {"title", "sub"},
    "section":      {"title", "h"},
    "cards":        {"items", "h", "accent", "shadow"},
    "bullets":      {"items", "h"},
    "compare":      {"left", "right", "h"},
    "tree_compare": {"title", "asis", "tobe", "no", "punch", "h"},
    "columns":      {"cols", "gap"},
    "stage_panel":  {"no", "title", "color", "bg", "items", "item_h", "foot",
                     "bar_w", "bar_pattern", "badge", "h"},
    "flow_arrow":   {"from", "to", "dir", "style", "color", "lw", "dash", "label",
                     "label_w", "label_h", "label_dy", "from_side", "to_side", "gap"},
    "footer":       {"text"},
    # blocks_extra (옵트인) — 로드되지 않아도 표는 둔다. 미로드 시 애초에 kind 에서 걸린다
    "why":          {"title", "left", "right"},
    "idea":         {"title", "before", "after", "conclusion"},
    "duo":          {"left", "right"},
    "oneline":      {"title", "tags", "ribbon"},
}


def check_keys(blocks, where="page"):
    """정의에 없는 키를 **경고**한다. 반환은 경고 건수.

    `columns` 안의 중첩 블록까지 재귀로 본다. `items[]` 하위 키는 범위 밖이다 —
    블록마다 항목 스키마가 달라 여기서 일괄 판정하면 오탐이 더 많아진다.
    """
    n = 0
    for i, blk in enumerate(blocks):
        if not isinstance(blk, dict):
            continue
        kind = blk.get("kind")
        allowed = SPEC.get(kind)
        if allowed is None:                      # 미등록 kind 는 render_page 가 FAIL 시킨다
            continue
        unknown = sorted(set(blk) - allowed - _COMMON_KEYS)
        if unknown:
            n += 1
            sys.stderr.write(
                "[blocks] WARN %s[%d] kind=%s — 정의에 없는 키 %s\n"
                "         오타인지 미지원인지 확인할 것. 의도한 키라면 "
                "`references/inputs.md` 와 `SPEC` 에 먼저 추가한다.\n"
                "         쓸 수 있는 키: %s\n"
                % (where, i, kind, ", ".join(unknown), ", ".join(sorted(allowed | _COMMON_KEYS))))
        if kind == "columns":
            for j, col in enumerate(blk.get("cols", []) or []):
                if isinstance(col, dict):
                    n += check_keys(col.get("blocks", []) or [], "%s[%d].cols[%d]" % (where, i, j))
    return n


def render_page(slide, blocks, y0=6.0):
    # 슬라이드를 넘는 커넥터는 만들 수 없다 — 페이지마다 앵커를 비운다
    ANCHORS.clear()
    check_keys(blocks)
    y = y0
    for blk in blocks:
        fn = RENDER.get(blk["kind"])
        if fn is None:
            fail("모르는 블록 kind=%r. `RENDER` 에 등록한다. 쓸 수 있는 것: %s"
                 % (blk["kind"], ", ".join(sorted(RENDER))))
        y = fn(slide, y, blk)
    return y
