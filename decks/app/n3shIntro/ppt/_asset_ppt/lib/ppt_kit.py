#!/usr/bin/env python3
"""ppt_kit — 인포그래픽용 팔레트·그리드·저수준 헬퍼

골격: 이 파일이 정본 (구 pptx-spec 사본은 졸업과 함께 제거 — prj5#Issue49)

⚠️ **수치를 여기에 박지 않는다.** 값은 전부 `_asset/theme/{name}/theme.yml` 이 SSOT 이고
   이 모듈은 그것을 읽어 이름에 붙일 뿐이다(설계 §4-1). 파일이 없으면 내장 기본 테마.

   API 이름(`NAVY`·`L`·`SZ_TITLE`…)은 **유지**한다 — blocks.py 가 그 이름을 쓰므로
   이름까지 바꾸면 회귀 범위가 전체로 번진다. 바뀐 것은 **값의 출처**뿐이다.

   다른 테마를 쓰려면: `PPT_THEME=<이름>` 환경변수 또는 `theme.find(start, name)` 경로 지정
"""
import os

from pptx import Presentation
from pptx.util import Mm, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.oxml.ns import nsdecls, qn
from pptx.oxml import parse_xml

import theme as _T

# ── 테마 로드 (수치의 유일한 출처) ────────────────────────────────────────
THEME_PATH = _T.find(os.path.dirname(os.path.abspath(__file__)), os.environ.get("PPT_THEME"))
# 테마를 찾았으면 조용히, **못 찾아 기본값으로 떨어지면 고지**한다 —
# 어떤 규격으로 만들어졌는지 모르는 채 산출물이 나오는 것이 가장 위험하다.
TH = _T.load(THEME_PATH, quiet=bool(THEME_PATH))
THEME_NAME = TH["meta"].get("name", "?")

_pal, _acc, _bg = TH["palette"], TH["palette"]["accent"], TH["palette"]["bg"]
_fn, _sh, _mg = TH["font"], TH["shape"], TH["margin"]

# ── 팔레트 ────────────────────────────────────────────────────────────────
NAVY   = _T.rgb(_acc["navy"])
GREEN  = _T.rgb(_acc["green"])
ORANGE = _T.rgb(_acc["orange"])
PURPLE = _T.rgb(_acc["purple"])
BAND   = _T.rgb(_acc["band"])

BG_BLUE   = _T.rgb(_bg["blue"])
BG_GREEN  = _T.rgb(_bg["green"])
BG_ORANGE = _T.rgb(_bg["orange"])
BG_PURPLE = _T.rgb(_bg["purple"])
BG_YELLOW = _T.rgb(_bg["yellow"])

INK   = _T.rgb(_pal["ink"])
MUTED = _T.rgb(_pal["muted"])
LINE  = _T.rgb(_pal["line"])
WHITE = _T.rgb(_pal["white"])

# ── 폰트 ──────────────────────────────────────────────────────────────────
FONT = _fn["family"]
SZ_TITLE, SZ_SUB = Pt(_fn["title"]), Pt(_fn["sub"])
SZ_HEAD, SZ_BODY, SZ_CAP = Pt(_fn["head"]), Pt(_fn["body"]), Pt(_fn["cap"])
SZ_NODE = Pt(_fn["node"])
SPC = _fn["spc"]                # 자간 1/100pt

# ── 그리드 ────────────────────────────────────────────────────────────────
CW, CH = TH["canvas"]["w"], TH["canvas"]["h"]
L, W = _mg["l"], _mg["w"]
SPLIT = _mg["split"]

# ── 도형·그림자 ───────────────────────────────────────────────────────────
SHADOW = dict(blur=_sh["shadow"]["blur"], dist=_sh["shadow"]["dist"],
              dir_deg=_sh["shadow"]["dir"], alpha=_sh["shadow"]["alpha"])
ADJ_PANEL, ADJ_CHIP, ADJ_BADGE = _sh["panel_adj"], _sh["chip_adj"], _sh["badge_adj"]
LW_PANEL, LW_CHIP, LW_NODE = _sh["panel_lw"], _sh["chip_lw"], _sh["node_lw"]
NODE_D, BADGE = _sh["node_d"], _sh["badge"]
MG_TEXT, MG_NODE = TH["margin_text"]["default"], TH["margin_text"]["node"]
LAYOUT = TH["layout"]

# ── 골격 호환 별칭 ────────────────────────────────────────────────────────
# 범용 블록(section·cards·bullets·compare)은 색을 **이름이 아니라 역할**로 참조한다.
# 프로젝트가 팔레트 키를 자기 이름으로 정의해도(navy/green/…) 이 별칭으로 흡수된다.
ACCENT = _T.rgb(_pal.get("primary", _acc.get("navy", "#1E3B67")))
BG = _T.rgb(_pal.get("panel", _bg.get("blue", "#F2F5FA")))
STEP = [_T.rgb(c) for c in _pal.get("steps", [])] or [ACCENT, GREEN, ORANGE]
SEC_GAP = TH["layout"].get("sec_gap", 4.95)
ROW_GAP = TH["layout"]["gap"]
SPC_BODY = SPC
SZ_CAPTION = SZ_CAP
BOLD = MED = LIGHT = FONT


def add_shadow(shape, **kw):
    """outerShdw 직접 주입. python-pptx 는 만들지 못한다(shadow.inherit 뿐).

    ⚠️ 두 가지를 동시에 지켜야 PowerPoint 가 파일을 받는다. 어기면 Quick Look·LibreOffice 는
       그냥 열리는데 **PowerPoint 만 "복구하시겠습니까"** 로 거부한다(실측 — reifier v04).

    1) `a:effectLst` 는 `a:ln` **뒤**에 온다 (CT_ShapeProperties 순서)
    2) `a:effectLst` 는 **최대 1개**다. 그런데 `shape.shadow.inherit = False` 가 이미 빈
       `<a:effectLst/>` 를 만들어 둔다 — 그 위에 append 하면 2개가 되어 스키마 위반이다.
       그래서 **기존 것을 먼저 제거**한다. (스킬 골격 ppt-kit.template.py 에 있던 결함)
    """
    s = dict(SHADOW, **{k: v for k, v in kw.items() if v is not None})
    spPr = shape._element.spPr
    for el in spPr.findall(qn("a:effectLst")):
        spPr.remove(el)
    xml = ('<a:effectLst %s><a:outerShdw blurRad="%d" dist="%d" dir="%d" rotWithShape="0">'
           '<a:prstClr val="black"><a:alpha val="%d"/></a:prstClr>'
           '</a:outerShdw></a:effectLst>') % (
        nsdecls("a"), int(s["blur"] * 12700), int(s["dist"] * 12700),
        int(s["dir_deg"] * 60000), int(s["alpha"] * 1000))
    spPr.append(parse_xml(xml))
    return shape


# ── 저수준 헬퍼 ───────────────────────────────────────────────────────────
def shape(slide, kind, x, y, w, h, fill=None, line=None, lw=0.75):
    sp = slide.shapes.add_shape(kind, Mm(x), Mm(y), Mm(w), Mm(h))
    sp.shadow.inherit = False
    if fill is None:
        sp.fill.background()
    else:
        sp.fill.solid()
        sp.fill.fore_color.rgb = fill
    if line is None:
        sp.line.fill.background()
    else:
        sp.line.color.rgb = line
        sp.line.width = Pt(lw)
    tf = sp.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = Mm(1.2)
    tf.margin_top = tf.margin_bottom = Mm(0.6)
    return sp


def rect(slide, x, y, w, h, **kw):
    return shape(slide, MSO_SHAPE.RECTANGLE, x, y, w, h, **kw)


def card(slide, x, y, w, h, fill=WHITE, line=LINE, lw=0.75, adj=0.16, shadow=False):
    sp = shape(slide, MSO_SHAPE.ROUNDED_RECTANGLE, x, y, w, h, fill, line, lw)
    sp.adjustments[0] = adj
    if shadow:
        add_shadow(sp)
    return sp


def panel(slide, x, y, w, h, fill, line):
    """큰 컨테이너 — 모서리 adj 0.08 + 그림자 (spec.md 5절)."""
    return card(slide, x, y, w, h, fill=fill, line=line, lw=1.5, adj=0.08, shadow=True)


def oval(slide, x, y, w, h, **kw):
    return shape(slide, MSO_SHAPE.OVAL, x, y, w, h, **kw)


def text(sp, runs, size=None, color=INK, bold=False, align=PP_ALIGN.CENTER,
         anchor=MSO_ANCHOR.MIDDLE, spc=SPC, space_after=0, font=None, bullet=None):
    """도형에 문단을 넣는다. runs = str | list[str] | list[(str, dict)]"""
    tf = sp.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    items = [runs] if isinstance(runs, str) else list(runs)
    for i, it in enumerate(items):
        t, over = (it, {}) if isinstance(it, str) else it
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = over.get("align", align)
        p.space_after = Pt(over.get("space_after", space_after))
        r = p.add_run()
        r.text = t
        f = r.font
        f.size = over.get("size", size or SZ_BODY)
        f.bold = over.get("bold", bold)
        f.color.rgb = over.get("color", color)
        f.name = over.get("font", font or FONT)
        r._r.get_or_add_rPr().set("spc", str(over.get("spc", spc)))
        if bullet:
            # ⚠️ 텍스트로 '• ' 를 찍지 않는다 — 진짜 buChar 문단이어야 들여쓰기·줄바꿈이 맞는다
            pPr = p._p.get_or_add_pPr()
            pPr.set("marL", str(int(4.0 * 36000)))
            pPr.set("indent", str(int(-4.0 * 36000)))
            pPr.append(parse_xml('<a:buFont %s typeface="Arial"/>' % nsdecls("a")))
            pPr.append(parse_xml('<a:buChar %s char="%s"/>' % (nsdecls("a"), bullet)))
    return sp


def label(slide, x, y, w, h, runs, **kw):
    """배경 없는 텍스트 상자."""
    return text(rect(slide, x, y, w, h), runs, **kw)


def arrow(slide, x1, y1, x2, y2, color=INK, lw=1.75, dashed=False):
    """직선 화살표 — 실선(관계) / 점선(속성 연결).

    ⚠️ `CT_LineProperties` 자식 순서는 **fill → prstDash → join → headEnd → tailEnd** 다.
       tailEnd 를 먼저 넣고 prstDash 를 뒤에 붙이면 PowerPoint 가 파일을 거부한다(실측 3건).
       그래서 dash 를 **먼저** 넣는다.
    """
    cn = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Mm(x1), Mm(y1), Mm(x2), Mm(y2))
    cn.line.color.rgb = color
    cn.line.width = Pt(lw)
    ln = cn.line._get_or_add_ln()
    if dashed:
        ln.append(parse_xml('<a:prstDash %s val="dash"/>' % nsdecls("a")))
    ln.append(parse_xml('<a:tailEnd %s type="triangle" w="med" len="med"/>' % nsdecls("a")))
    return cn


# 검증기 후보 — 정본은 `ppt-check` 하나다.
# ⚠️ 글로벌 폴백은 **반드시 앞의 것**이어야 한다(Issue53 P5, 2026-08-09 교정).
#    이전에는 루프 변수 `rel` 을 그대로 써서 **마지막 후보(pptx-spec)** 가 폴백이 됐고,
#    격리 폴더 빌드가 항상 FAIL 했다(실측).
# ⚠️ 2026-08-10(prj5#Issue49 졸업) — `pptx-spec` 후보를 **제거했다.** 그 스킬이 실제로
#    사라졌으므로 남겨 두면 *"없는 것을 찾는 후보"* 이고, 위 사고를 되살릴 자리만 된다.
CHECKER_RELS = (
    os.path.join(".claude", "skills", "ppt-check", "scripts", "check-xml-order.py"),
)


def _find_checker():
    """검증기를 위로 올라가며 찾는다 — 정본은 `ppt-check` 다.
    못 찾으면 **정본의 글로벌 경로**를 돌려주고, 호출부가 부재를 명시적으로 알린다
    (조용한 통과 금지)."""
    for rel in CHECKER_RELS:
        hit = _walk_up(rel)
        if hit:
            return hit
    return os.path.expanduser(os.path.join("~", CHECKER_RELS[0]))


def _walk_up(rel):
    d = os.path.dirname(os.path.abspath(__file__))
    for _ in range(8):
        c = os.path.join(d, rel)
        if os.path.isfile(c):
            return c
        nd = os.path.dirname(d)
        if nd == d:
            break
        d = nd
    return None

def _patch_theme_xml(path):
    """저장된 pptx 의 `theme1.xml` 을 theme.yml 값으로 맞춘다.

    ⚠️ lane B 는 도형에 서식을 **직접** 넣으므로 렌더는 이것 없이도 맞다. 그런데
       `theme1.xml` 을 그대로 두면 PowerPoint 의 "테마 색" 팔레트가 Calibri·파랑을
       가리키고, 사용자가 나중에 도형을 하나 추가하면 **엉뚱한 색이 붙는다**(실측).
       산출물이 자기 테마를 갖고 있어야 이어서 편집할 수 있다.
    """
    import re, zipfile, shutil, tempfile
    acc = [_T.rgb(c) for c in ([_acc.get("navy"), _acc.get("green"),
                                _acc.get("orange"), _acc.get("purple")] )if c]
    hexes = ["%02X%02X%02X" % (c[0], c[1], c[2]) for c in
             [(int(str(x)[0:2], 16), int(str(x)[2:4], 16), int(str(x)[4:6], 16))
              for x in [str(v) for v in acc]]] if False else \
            [str(_acc.get(k, "")).lstrip("#").upper()
             for k in ("navy", "green", "orange", "purple", "band")]
    hexes = [h for h in hexes if len(h) == 6] or ["1E3B67"]
    ink = str(_pal.get("ink", "#1A1A1A")).lstrip("#").upper()

    def patch(x):
        for i in range(1, 7):
            c = hexes[(i - 1) % len(hexes)]
            x = re.sub(r'(<a:accent%d>).*?(</a:accent%d>)' % (i, i),
                       r'\1<a:srgbClr val="%s"/>\2' % c, x, flags=re.S)
        x = re.sub(r'(<a:dk1>).*?(</a:dk1>)', r'\1<a:srgbClr val="%s"/>\2' % ink, x, flags=re.S)
        for tag in ("majorFont", "minorFont"):
            m = re.search(r'<a:%s>.*?</a:%s>' % (tag, tag), x, re.S)
            if m:
                b = m.group(0)
                nb = re.sub(r'<a:latin typeface="[^"]*"', '<a:latin typeface="%s"' % FONT, b)
                nb = re.sub(r'<a:ea typeface="[^"]*"', '<a:ea typeface="%s"' % FONT, nb)
                x = x.replace(b, nb)
        return x

    tmp = tempfile.mktemp(suffix=".pptx")
    with zipfile.ZipFile(path) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
        for it in zin.infolist():
            d = zin.read(it.filename)
            if it.filename.startswith("ppt/theme/") and it.filename.endswith(".xml"):
                d = patch(d.decode("utf-8", "ignore")).encode("utf-8")
            zout.writestr(it, d)
    shutil.move(tmp, path)


def save_deck(prs, out, strict=True):
    """저장 + **스키마 검사까지** 한 번에. 빌드가 곧 검증이어야 한다.

    사람이 기억해서 따로 돌려야 하는 검사는 결국 안 돌린다 — 그래서 저장 경로에 붙인다.
    `check-xml-order.py` 가 잡는 위반은 Quick Look·LibreOffice·나머지 검사기 3종을
    **전부 통과하고도** PowerPoint 만 거부하는 종류다.
    """
    import importlib.util

    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    prs.save(out)
    _patch_theme_xml(out)      # 산출물이 자기 테마를 갖게 한다
    print("산출: %s" % out)
    # 파일명에 하이픈이 있어 일반 import 가 안 된다 — 경로로 직접 적재한다
    # 검증기는 SCAR 소유다(사본 금지). 설치 위치가 프로젝트마다 다르므로
    # **위로 올라가며 탐색**한다 — 개발 중 프로젝트 로컬 `.claude/`, 배포 후 글로벌 `~/.claude/`.
    src = _find_checker()
    # 검증기가 없으면 **조용히 통과시키지 않는다** — 사본을 만드는 것도 금지다(2원 구조).
    if not os.path.isfile(src):
        raise SystemExit("FAIL: 검증기 부재 — %s\n"
                         "  `ppt-check` 스킬이 SSOT 다. 사본을 만들지 말고 스킬을 복구한다." % src)
    spec = importlib.util.spec_from_file_location("check_xml_order", src)
    cxo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(cxo)
    if cxo.scan_file(out) and strict:
        raise SystemExit("FAIL: OOXML 스키마 위반 — 위 목록을 고친 뒤 다시 빌드한다")
    print("스키마 검사 ✓ 통과")
    return out


def layout_by_name(prs, name):
    """이름으로 레이아웃을 고른다 — 인덱스로 고르면 템플릿 개정 시 조용히 어긋난다."""
    for lay in prs.slide_master.slide_layouts:
        if lay.name == name:
            return lay
    raise SystemExit("레이아웃 '%s' 없음. 있는 것: %s" % (
        name, ", ".join(l.name for l in prs.slide_master.slide_layouts)))


def blank_slide(prs, layout_name=None):
    """레이아웃을 적용하되 placeholder 는 **실제로 제거한** 슬라이드.

    `layout_name=None` → 이름이 `Blank` 인 레이아웃, 없으면 **placeholder 가 가장 적은** 것.
    ⚠️ 예전엔 "마지막 레이아웃"을 골랐는데 그 가정이 틀렸다 — python-pptx 기본 템플릿의
    마지막은 `Blank`(인덱스 6) 가 아니라 `Vertical Title and Text` 라서, 빈 placeholder
    2개가 산출물에 그대로 딸려 나갔다(Issue357 실측: 도형 7개인데 9개로 셈).

    조직 템플릿을 쓸 때는 **반드시 이름을 준다** — 기본값에 기대면 템플릿 개정 시 조용히 어긋난다.
    """
    if layout_name:
        lay = layout_by_name(prs, layout_name)
    else:
        lays = list(prs.slide_master.slide_layouts)
        lay = next((l for l in lays if l.name == "Blank"), None) \
            or min(lays, key=lambda l: len(l.placeholders))
    slide = prs.slides.add_slide(lay)
    # 빈 placeholder 를 남기면 PowerPoint 편집 화면에 "제목을 입력하십시오" 가 뜬다.
    # lane B 는 네이티브 도형을 직접 얹으므로 placeholder 는 쓰지 않는다.
    for ph in list(slide.placeholders):
        ph._element.getparent().remove(ph._element)
    return slide


def new_deck(template=None, drop_existing=True, size_mm=None):
    """템플릿을 열고 **원래 들어 있던 슬라이드를 비운다**.

    ⚠️ `Presentation(템플릿)` 은 그 파일의 슬라이드를 그대로 안고 시작한다. 기준 파일을
    베이스로 쓰면 남의 페이지가 산출물에 섞여 나가고, 검증기가 그 페이지의 이미지를
    "본문 이미지화"로 잡는다(실발생). 마스터·레이아웃·테마는 그대로 유지된다.

    `template=None` — **조직 템플릿이 없는 경우**. python-pptx 기본 마스터로 빈 덱을 만들고
    캔버스만 `size_mm`(기본 16:9)로 맞춘다. 이때 "템플릿 준수" 는 검사 대상이 아니게 되므로
    `check-conform.py` 는 `--template` 없이(= 대상 자신 기준) 돌린다. 규격 SSOT 는
    여전히 서식 정의서(`spec.md`)이며, 없으면 lane B 를 시작하지 않는다.
    """
    if template is None:
        # ⚠️ 캔버스는 **theme 값**이 기본이다. 여기에 숫자를 박으면 판형 전환이 죽는다
        #    (실측: A4 세로 테마를 줬는데 16:9 로 산출됐다 — 하드코딩 기본 인자 탓).
        w, h = size_mm if size_mm else (CW, CH)
        prs = Presentation()
        prs.slide_width, prs.slide_height = Emu(int(Mm(w))), Emu(int(Mm(h)))
        return prs
    prs = Presentation(template)
    if drop_existing:
        lst = prs.slides._sldIdLst
        for sld in list(lst):
            prs.part.drop_rel(sld.get(
                "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"))
            lst.remove(sld)
    return prs


# ── smoke — 헬퍼가 실제로 도는지 확인 ─────────────────────────────────────
def _smoke(out, template=None, layout_name=None):
    """`card()`·`arrow()` 기본 호출을 포함한 최소 예제.

    골격을 손대지 않은 상태에서 **스키마 위반 0** 이어야 한다 — Issue355 이전에는
    `card()` 한 번(그림자 기본값)으로 `effectLst` 2개가 만들어져 여기서 이미 깨졌다.
    """
    prs = new_deck(template)
    s = blank_slide(prs, layout_name)
    y = 40.0
    head = rect(s, L, y, W, 9, fill=ACCENT)
    text(head, "섹션 헤더", size=SZ_HEAD, color=WHITE, bold=True, anchor=MSO_ANCHOR.MIDDLE)
    y += 9 + SEC_GAP
    cw = (W - ROW_GAP * 2) / 3
    for i in range(3):
        c = card(s, L + i * (cw + ROW_GAP), y, cw, 26, fill=BG)     # shadow=True 기본
        text(c, ["%02d. 카드 제목" % (i + 1), "설명 문장 한 줄"],
             color=STEP[i], bold=True, anchor=MSO_ANCHOR.MIDDLE)
    arrow(s, L + cw, y + 13, L + cw + ROW_GAP, y + 13)              # 실선
    arrow(s, L + cw * 2 + ROW_GAP, y + 13, L + cw * 2 + ROW_GAP * 2, y + 13, dashed=True)
    y += 26 + ROW_GAP
    b = card(s, L, y, W, 22)
    text(b, ["첫 번째 항목", "두 번째 항목"], bullet="•")
    save_deck(prs, out)      # 저장 + 스키마 검사 (FAIL 이면 여기서 멈춘다)
    print("→ 규격 검사: python3 check-conform.py %s%s"
          % (out, (" --template %s" % template) if template else ""))


if __name__ == "__main__":
    #   python3 ppt_kit.py smoke.pptx                       조직 템플릿 없이 (빈 16:9)
    #   python3 ppt_kit.py smoke.pptx 조직템플릿.pptx 레이아웃이름
    if len(sys.argv) not in (2, 4):
        sys.exit(__doc__)
    _smoke(sys.argv[1], *(sys.argv[2:4]))
