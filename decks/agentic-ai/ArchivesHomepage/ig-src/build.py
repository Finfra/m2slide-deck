#!/usr/bin/env python3
# ArchivesHomepage 인포그래픽 9장 — SVG 원본 생성기 (1800×1200, 흰 바탕)
# 화풍: MidShare ig(평면 라인 아이콘 · 굵은 선 · 연한 채움 · Noto Sans KR Bold)와 같은 결
# 실행: python3 build.py  → 같은 폴더에 ig-NN-*.svg 9장. PNG 는 render.sh 가 만든다
import math
import os

OUT = os.path.dirname(os.path.abspath(__file__))
W, H = 1800, 1200

BLUE, GREEN, RED, GRAY, INK, AMBER = '#2563EB', '#16A34A', '#DC2626', '#64748B', '#0F172A', '#D49B00'
FILL = {BLUE: '#EFF6FF', GREEN: '#ECFDF3', RED: '#FEF2F2', GRAY: '#F1F5F9', INK: '#F1F5F9', AMBER: '#FEF7E0'}
FONT = "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif"
SW = 12  # 기본 선 굵기


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def svg(body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">\n'
            f'<defs>\n'
            + ''.join(
                f'<marker id="ah-{c[1:]}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" '
                f'orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="{c}"/></marker>\n'
                for c in (BLUE, GREEN, RED, GRAY, INK, AMBER))
            + '</defs>\n'
            f'<rect width="{W}" height="{H}" fill="#FFFFFF"/>\n{body}\n</svg>\n')


def text(x, y, s, size=52, color=INK, weight=700, anchor='middle', family=FONT):
    return (f'<text x="{x}" y="{y}" font-family="{family}" font-size="{size}" font-weight="{weight}" '
            f'fill="{color}" text-anchor="{anchor}" dominant-baseline="middle">{esc(s)}</text>')


def rrect(x, y, w, h, r=28, stroke=BLUE, fill=None, sw=SW, dash=None):
    fill = fill if fill is not None else FILL.get(stroke, '#FFFFFF')
    d = f' stroke-dasharray="{dash}"' if dash else ''
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" ry="{r}" fill="{fill}" '
            f'stroke="{stroke}" stroke-width="{sw}"{d}/>')


def line(x1, y1, x2, y2, color=BLUE, sw=SW, arrow=False, dash=None, cap='round'):
    m = f' marker-end="url(#ah-{color[1:]})"' if arrow else ''
    d = f' stroke-dasharray="{dash}"' if dash else ''
    return (f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{sw}" '
            f'stroke-linecap="{cap}"{d}{m}/>')


def path(d, color=BLUE, sw=SW, fill='none', arrow=False, dash=None):
    m = f' marker-end="url(#ah-{color[1:]})"' if arrow else ''
    da = f' stroke-dasharray="{dash}"' if dash else ''
    return (f'<path d="{d}" fill="{fill}" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" '
            f'stroke-linejoin="round"{da}{m}/>')


def circle(cx, cy, r, stroke=BLUE, fill=None, sw=SW):
    fill = fill if fill is not None else FILL.get(stroke, '#FFFFFF')
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'


def pill(cx, cy, s, size=48, color=BLUE, fg='#FFFFFF', padx=44, h=None, outline=False, char_w=None):
    w = text_w(s, size) + padx * 2
    h = h or int(size * 1.9)
    if outline:
        body = rrect(cx - w / 2, cy - h / 2, w, h, r=h / 2, stroke=color, fill='#FFFFFF', sw=8)
        return body + text(cx, cy + 2, s, size, color)
    return (f'<rect x="{cx - w / 2}" y="{cy - h / 2}" width="{w}" height="{h}" rx="{h / 2}" fill="{color}"/>'
            + text(cx, cy + 2, s, size, fg))


def text_w(s, size):
    # 대략 폭 — 한글 1.0em · 라틴/숫자 0.58em · 공백 0.3em · 기호 0.5em
    w = 0
    for ch in s:
        if '\uac00' <= ch <= '\ud7a3':
            w += 1.0
        elif ch == ' ':
            w += 0.3
        elif ch.isalnum():
            w += 0.62
        elif ch in '—·…':
            w += 1.0
        else:
            w += 0.5
    return w * size


def arrow(x1, y1, x2, y2, color=BLUE, sw=16):
    return line(x1, y1, x2, y2, color, sw, arrow=True)


# ── 아이콘 ─────────────────────────────────────────────────────────────────

def ic_globe(cx, cy, r, c=BLUE, sw=SW):
    f = FILL[c]
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{f}" stroke="{c}" stroke-width="{sw}"/>'
            f'<ellipse cx="{cx}" cy="{cy}" rx="{r * 0.45}" ry="{r}" fill="none" stroke="{c}" stroke-width="{sw * 0.75}"/>'
            + line(cx - r, cy, cx + r, cy, c, sw * 0.75)
            + path(f'M{cx - r * 0.87},{cy - r * 0.5} Q{cx},{cy - r * 0.32} {cx + r * 0.87},{cy - r * 0.5}', c, sw * 0.75)
            + path(f'M{cx - r * 0.87},{cy + r * 0.5} Q{cx},{cy + r * 0.68} {cx + r * 0.87},{cy + r * 0.5}', c, sw * 0.75))


def ic_cylinder(cx, cy, w, h, c=GREEN, sw=SW, rows=2):
    rx, ry = w / 2, w * 0.16
    top, bot = cy - h / 2 + ry, cy + h / 2 - ry
    f = FILL[c]
    s = (f'<path d="M{cx - rx},{top} L{cx - rx},{bot} A{rx},{ry} 0 0 0 {cx + rx},{bot} L{cx + rx},{top}" '
         f'fill="{f}" stroke="{c}" stroke-width="{sw}" stroke-linejoin="round"/>')
    for i in range(1, rows + 1):
        yy = top + (bot - top) * i / (rows + 1)
        s += path(f'M{cx - rx},{yy} A{rx},{ry} 0 0 0 {cx + rx},{yy}', c, sw * 0.75)
    s += f'<ellipse cx="{cx}" cy="{top}" rx="{rx}" ry="{ry}" fill="#FFFFFF" stroke="{c}" stroke-width="{sw}"/>'
    return s


def ic_window(x, y, w, h, c=BLUE, sw=SW, bar=56, dots=True, fill=None):
    s = rrect(x, y, w, h, r=24, stroke=c, sw=sw, fill=fill)
    s += line(x, y + bar, x + w, y + bar, c, sw)
    if dots:
        for i in range(3):
            s += f'<circle cx="{x + 34 + i * 30}" cy="{y + bar / 2}" r="8" fill="{c}"/>'
    return s


def ic_person(cx, cy, s=1.0, c=BLUE, sw=SW):
    # 머리 원 + 어깨 둥근 몸 (cy = 머리 중심)
    hr = 46 * s
    body = (f'<path d="M{cx - 82 * s},{cy + 170 * s} L{cx - 82 * s},{cy + 128 * s} '
            f'Q{cx - 82 * s},{cy + 72 * s} {cx - 30 * s},{cy + 72 * s} L{cx + 30 * s},{cy + 72 * s} '
            f'Q{cx + 82 * s},{cy + 72 * s} {cx + 82 * s},{cy + 128 * s} L{cx + 82 * s},{cy + 170 * s} Z" '
            f'fill="{FILL[c]}" stroke="{c}" stroke-width="{sw}" stroke-linejoin="round"/>')
    return f'<circle cx="{cx}" cy="{cy}" r="{hr}" fill="{FILL[c]}" stroke="{c}" stroke-width="{sw}"/>' + body


def ic_phone(cx, cy, w=84, h=150, c=BLUE, sw=10, screen=None):
    s = rrect(cx - w / 2, cy - h / 2, w, h, r=16, stroke=c, sw=sw)
    if screen:
        s += f'<rect x="{cx - w / 2 + 16}" y="{cy - h / 2 + 22}" width="{w - 32}" height="{h - 54}" rx="6" fill="{screen}"/>'
    s += f'<circle cx="{cx}" cy="{cy + h / 2 - 16}" r="5" fill="{c}"/>'
    return s


def ic_monitor(cx, cy, w, h, c=BLUE, sw=SW, page=True):
    x, y = cx - w / 2, cy - h / 2
    s = rrect(x, y, w, h, r=20, stroke=c, sw=sw)
    s += line(cx, y + h, cx, y + h + 46, c, sw)
    s += line(cx - w * 0.22, y + h + 50, cx + w * 0.22, y + h + 50, c, sw)
    if page:
        s += line(x + w * 0.18, y + h * 0.3, x + w * 0.82, y + h * 0.3, c, sw * 0.8)
        s += line(x + w * 0.18, y + h * 0.52, x + w * 0.62, y + h * 0.52, c, sw * 0.8)
        s += line(x + w * 0.18, y + h * 0.72, x + w * 0.70, y + h * 0.72, c, sw * 0.8)
    return s


def ic_sparkle(cx, cy, r, c=AMBER, sw=10):
    # 네 갈래 반짝이 + 작은 반짝이
    def star(x, y, rr):
        k = rr * 0.28
        return (f'<path d="M{x},{y - rr} Q{x + k * 0.2},{y - k * 0.2} {x + rr},{y} Q{x + k * 0.2},{y + k * 0.2} '
                f'{x},{y + rr} Q{x - k * 0.2},{y + k * 0.2} {x - rr},{y} Q{x - k * 0.2},{y - k * 0.2} {x},{y - rr} Z" '
                f'fill="{FILL[c]}" stroke="{c}" stroke-width="{sw}" stroke-linejoin="round"/>')
    return star(cx, cy, r) + star(cx + r * 0.95, cy - r * 0.8, r * 0.36)


def ic_check(cx, cy, r, c=GREEN):
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{c}"/>'
            + path(f'M{cx - r * 0.45},{cy + r * 0.02} L{cx - r * 0.1},{cy + r * 0.36} L{cx + r * 0.5},{cy - r * 0.34}',
                   '#FFFFFF', r * 0.22))


def ic_cross(cx, cy, r, c=RED):
    k = r * 0.38
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{c}"/>'
            + line(cx - k, cy - k, cx + k, cy + k, '#FFFFFF', r * 0.22)
            + line(cx - k, cy + k, cx + k, cy - k, '#FFFFFF', r * 0.22))


def ic_key(cx, cy, s=1.0, c=BLUE, sw=SW, angle=0):
    # 고리 + 자루 + 이빨 (cx,cy = 고리 중심, 오른쪽으로 뻗음)
    R = 70 * s
    g = f'<g transform="rotate({angle} {cx} {cy})">'
    g += (f'<path d="M{cx + R * 0.86},{cy - 22 * s} L{cx + 300 * s},{cy - 22 * s} L{cx + 300 * s},{cy + 22 * s} '
          f'L{cx + 268 * s},{cy + 22 * s} L{cx + 268 * s},{cy + 74 * s} L{cx + 222 * s},{cy + 74 * s} '
          f'L{cx + 222 * s},{cy + 22 * s} L{cx + 190 * s},{cy + 22 * s} L{cx + 190 * s},{cy + 58 * s} '
          f'L{cx + 150 * s},{cy + 58 * s} L{cx + 150 * s},{cy + 22 * s} L{cx + R * 0.86},{cy + 22 * s} Z" '
          f'fill="{FILL[c]}" stroke="{c}" stroke-width="{sw}" stroke-linejoin="round"/>')
    g += f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="{FILL[c]}" stroke="{c}" stroke-width="{sw}"/>'
    g += f'<circle cx="{cx - R * 0.25}" cy="{cy}" r="{R * 0.3}" fill="#FFFFFF" stroke="{c}" stroke-width="{sw * 0.8}"/>'
    return g + '</g>'


def ic_lock(cx, cy, s=1.0, c=GREEN, sw=10):
    w, h = 64 * s, 52 * s
    return (path(f'M{cx - w * 0.3},{cy - h * 0.5} L{cx - w * 0.3},{cy - h * 0.95} '
                 f'A{w * 0.3},{w * 0.3} 0 0 1 {cx + w * 0.3},{cy - h * 0.95} L{cx + w * 0.3},{cy - h * 0.5}', c, sw)
            + rrect(cx - w / 2, cy - h / 2, w, h, r=8 * s, stroke=c, sw=sw, fill=c))


def ic_folder(cx, cy, w, h, c=AMBER, sw=SW):
    x, y = cx - w / 2, cy - h / 2
    return (f'<path d="M{x},{y + 28} Q{x},{y} {x + 28},{y} L{x + w * 0.36},{y} L{x + w * 0.46},{y + h * 0.16} '
            f'L{x + w - 28},{y + h * 0.16} Q{x + w},{y + h * 0.16} {x + w},{y + h * 0.16 + 28} '
            f'L{x + w},{y + h - 28} Q{x + w},{y + h} {x + w - 28},{y + h} L{x + 28},{y + h} Q{x},{y + h} {x},{y + h - 28} Z" '
            f'fill="{FILL[c]}" stroke="{c}" stroke-width="{sw}" stroke-linejoin="round"/>'
            + line(x, y + h * 0.32, x + w, y + h * 0.32, c, sw * 0.8))


def ic_cloud(cx, cy, w, c=BLUE, sw=SW):
    s = w / 300
    d = (f'M{cx - 120 * s},{cy + 70 * s} Q{cx - 160 * s},{cy + 70 * s} {cx - 160 * s},{cy + 25 * s} '
         f'Q{cx - 160 * s},{cy - 25 * s} {cx - 110 * s},{cy - 30 * s} Q{cx - 100 * s},{cy - 95 * s} {cx - 30 * s},{cy - 95 * s} '
         f'Q{cx + 30 * s},{cy - 95 * s} {cx + 50 * s},{cy - 45 * s} Q{cx + 70 * s},{cy - 65 * s} {cx + 100 * s},{cy - 55 * s} '
         f'Q{cx + 140 * s},{cy - 40 * s} {cx + 130 * s},{cy - 5 * s} Q{cx + 165 * s},{cy + 5 * s} {cx + 160 * s},{cy + 40 * s} '
         f'Q{cx + 155 * s},{cy + 70 * s} {cx + 120 * s},{cy + 70 * s} Z')
    return f'<path d="{d}" fill="{FILL[c]}" stroke="{c}" stroke-width="{sw}" stroke-linejoin="round"/>'


def ic_doc(x, y, w, h, c=BLUE, sw=SW, fold=60):
    return (f'<path d="M{x},{y} L{x + w - fold},{y} L{x + w},{y + fold} L{x + w},{y + h} L{x},{y + h} Z" '
            f'fill="{FILL[c]}" stroke="{c}" stroke-width="{sw}" stroke-linejoin="round"/>'
            + path(f'M{x + w - fold},{y} L{x + w - fold},{y + fold} L{x + w},{y + fold}', c, sw))


def ic_bubble(cx, cy, w, h, c=AMBER, sw=SW):
    x, y = cx - w / 2, cy - h / 2
    return (f'<path d="M{x + 30},{y} L{x + w - 30},{y} Q{x + w},{y} {x + w},{y + 30} L{x + w},{y + h - 30} '
            f'Q{x + w},{y + h} {x + w - 30},{y + h} L{x + w * 0.42},{y + h} L{x + w * 0.22},{y + h + h * 0.32} '
            f'L{x + w * 0.26},{y + h} L{x + 30},{y + h} Q{x},{y + h} {x},{y + h - 30} L{x},{y + 30} Q{x},{y} {x + 30},{y} Z" '
            f'fill="{FILL[c]}" stroke="{c}" stroke-width="{sw}" stroke-linejoin="round"/>')


def ic_pencil(x1, y1, x2, y2, c=AMBER, sw=SW):
    # 굵은 자루 + 뾰족한 끝 (x1,y1 → 끝 x2,y2)
    ang = math.atan2(y2 - y1, x2 - x1)
    L = math.hypot(x2 - x1, y2 - y1)
    deg = math.degrees(ang)
    t = 26
    return (f'<g transform="translate({x1},{y1}) rotate({deg})">'
            f'<path d="M0,{-t} L{L - 50},{-t} L{L},0 L{L - 50},{t} L0,{t} Z" fill="#FFFFFF" stroke="{c}" '
            f'stroke-width="{sw}" stroke-linejoin="round"/>'
            + line(L - 50, -t, L - 50, t, c, sw * 0.8) + '</g>')


def ic_refresh(cx, cy, r, c=RED, sw=SW):
    a0, a1 = math.radians(-60), math.radians(240)
    x0, y0 = cx + r * math.cos(a0), cy + r * math.sin(a0)
    x1, y1 = cx + r * math.cos(a1), cy + r * math.sin(a1)
    return path(f'M{x1},{y1} A{r},{r} 0 1 0 {x0},{y0}', c, sw, arrow=True)


def ic_eye_slash(cx, cy, w, c=RED, sw=SW):
    h = w * 0.55
    return (path(f'M{cx - w / 2},{cy} Q{cx},{cy - h} {cx + w / 2},{cy} Q{cx},{cy + h} {cx - w / 2},{cy} Z', c, sw,
                 fill=FILL[c])
            + circle(cx, cy, w * 0.14, c, '#FFFFFF', sw)
            + line(cx - w * 0.42, cy + w * 0.36, cx + w * 0.42, cy - w * 0.36, c, sw))


# ── 1. 네 조각 ─────────────────────────────────────────────────────────────

def ig01():
    b = ''
    nodes = [  # cx, cy, color, name, role, icon
        (300, 260, AMBER, 'Claude', '만드는 손'),
        (1500, 260, GREEN, 'Supabase', '기억하는 장부'),
        (300, 820, BLUE, 'Cloudflare', '인터넷 진열대'),
        (1500, 820, GRAY, 'VS Code + ego', '작업 도구'),
    ]
    # 연결선 (뒤에)
    for cx, cy, c, *_ in nodes:
        tx = 640 if cx < 900 else 1160
        ty = 470 if cy < 600 else 740
        b += line(cx, cy, tx, ty, c, 10, dash='4 26')
    # 가운데 브라우저 카드
    b += ic_window(620, 380, 560, 440, BLUE, SW, bar=70)
    b += text(900, 580, '한빛기록관', 72, INK, 800)
    b += text(900, 680, '홈페이지', 64, INK, 800)
    R = 120
    for cx, cy, c, name, role in nodes:
        b += circle(cx, cy, R, c)
        if name == 'Claude':
            b += ic_bubble(cx - 30, cy - 38, 116, 72, c, 10)
            b += ic_pencil(cx + 78, cy - 4, cx + 6, cy + 74, c, 9)
        elif name == 'Supabase':
            b += ic_cylinder(cx, cy, 120, 140, c, 10)
        elif name == 'Cloudflare':
            b += ic_globe(cx, cy, 70, c, 10)
        else:
            b += ic_window(cx - 74, cy - 58, 148, 116, c, 10, bar=30, dots=False, fill='#FFFFFF')
            b += line(cx - 20, cy - 28, cx - 20, cy + 58, c, 8)
        b += text(cx, cy + R + 58, name, 56, c if c != GRAY else INK, 800)
        b += text(cx, cy + R + 124, role, 48, GRAY, 700)
    return svg(b)


# ── 2. 내 PC 안 vs 인터넷 주소 ─────────────────────────────────────────────

def ig02():
    b = ''
    # 왼쪽 — 유리 상자 안 PC + 사람 1명
    b += rrect(110, 150, 680, 560, r=40, stroke=GRAY, fill='#F8FAFC', sw=8, dash='26 18')
    b += ic_monitor(390, 380, 340, 230, GRAY, SW)
    b += ic_person(650, 360, 0.95, GRAY, 10)
    b += rrect(110, 770, 680, 96, r=48, stroke=GRAY, fill='#FFFFFF', sw=6)
    b += text(450, 820, 'file:///C:/…/index.html', 44, GRAY, 700)
    b += ic_cross(300, 1000, 40, RED)
    b += text(470, 1002, '나만 봄', 64, RED, 800)
    # 가운데 화살표
    b += arrow(825, 450, 990, 450, BLUE, 22)
    # 오른쪽 — 지구본 + 휴대폰 3대
    gx, gy = 1350, 330
    for px in (1130, 1350, 1570):
        b += line(gx, gy + 120, px, 560, BLUE, 8, dash='2 20')
    b += ic_globe(gx, gy, 160, BLUE, SW)
    for px in (1130, 1350, 1570):
        b += ic_phone(px, 620, 92, 150, GREEN, 10, screen='#DCFCE7')
    b += rrect(1030, 770, 640, 96, r=48, stroke=BLUE, fill='#FFFFFF', sw=6)
    b += text(1350, 820, 'https://이름.pages.dev', 46, BLUE, 800)
    b += ic_check(1190, 1000, 40, GREEN)
    b += text(1370, 1002, '누구나 봄', 64, GREEN, 800)
    return svg(b)


# ── 3. 필요한 두 가지 ──────────────────────────────────────────────────────

def ig03():
    b = ''
    cards = [(150, '남이 볼 수 없음', 'eye'), (950, '새로고침하면 사라짐', 'refresh')]
    for x, s, ic in cards:
        b += rrect(x, 90, 700, 330, r=32, stroke=RED, fill=FILL[RED], sw=10)
        cx = x + 350
        if ic == 'eye':
            b += ic_eye_slash(cx, 195, 150, RED, 10)
        else:
            b += ic_refresh(cx, 195, 62, RED, 12)
        b += text(cx, 340, s, 58, RED, 800)
    for cx in (500, 1300):
        b += arrow(cx, 455, cx, 575, INK, 18)
    sols = [(150, BLUE, '공개', 'Cloudflare', 'globe'), (950, GREEN, '저장', 'Supabase', 'cyl')]
    for x, c, k, name, ic in sols:
        b += rrect(x, 620, 700, 470, r=32, stroke=c, sw=SW)
        cx = x + 350
        if ic == 'globe':
            b += ic_globe(cx, 790, 110, c, SW)
        else:
            b += ic_cylinder(cx, 790, 190, 220, c, SW)
        b += text(cx, 990, f'{k} — {name}', 64, c, 800)
    return svg(b)


# ── 4. ego — 사람이 열고 Claude 가 이어서 ─────────────────────────────────

def ig04():
    b = ''
    b += ic_window(80, 110, 1640, 980, BLUE, SW, bar=110)
    b += rrect(250, 132, 220, 66, r=33, stroke=BLUE, fill='#FFFFFF', sw=6)
    b += text(360, 166, 'ego', 44, BLUE, 800)
    # 왼쪽 사람
    b += circle(450, 500, 150, BLUE, '#FFFFFF', SW)
    b += ic_person(450, 410, 0.95, BLUE, 10)
    b += text(450, 720, '사람', 64, INK, 800)
    b += text(450, 810, '가입 · 로그인 · 인증 메일', 48, GRAY, 700)
    # 오른쪽 Claude
    b += circle(1350, 500, 150, AMBER, FILL[AMBER], SW)
    b += ic_sparkle(1335, 515, 85, AMBER, 10)
    b += text(1350, 720, 'Claude', 64, INK, 800)
    b += text(1350, 810, '메뉴 찾기 · 클릭 · 확인', 48, GRAY, 700)
    # 가운데 바통 + 배지
    b += arrow(690, 500, 1110, 500, BLUE, 22)
    b += pill(900, 960, '로그인 상태가 남음', 50, GREEN)
    b += line(900, 520, 900, 900, GREEN, 8, dash='2 22')
    return svg(b)


# ── 5. 요구사항 네 칸 ─────────────────────────────────────────────────────

def ig05():
    b = ''
    b += ic_doc(280, 50, 1240, 1100, BLUE, SW, fold=90)
    b += text(360, 160, '요구사항.md', 60, INK, 800, anchor='start')
    b += line(360, 222, 1400, 222, BLUE, 6)
    rows = [(AMBER, '무엇을', '한빛기록관 소개 + 방명록'),
            (BLUE, '어디에', 'site/index.html'),
            (GREEN, '어떤 모양', '휴대폰 · 차분한 남색'),
            (INK, '끝난 기준', '휴대폰에서 글이 남음')]
    for i, (c, k, v) in enumerate(rows):
        y = 290 + i * 210
        b += f'<rect x="360" y="{y}" width="300" height="150" rx="28" fill="{c}"/>'
        b += text(510, y + 77, k, 54, '#FFFFFF', 800)
        b += text(710, y + 77, v, 54, INK, 700, anchor='start')
        if i < 3:
            b += line(360, y + 180, 1440, y + 180, '#CBD5E1', 4)
    return svg(b)


# ── 6. 방명록이 저장되는 길 ───────────────────────────────────────────────

def ig06():
    b = ''
    X1, X2, X3 = 300, 900, 1500
    # 노드 1 — 화면
    b += ic_monitor(X1, 310, 330, 230, BLUE, SW)
    b += text(X1, 560, 'index.html', 54, INK, 800)
    # 노드 2 — config.js
    b += ic_doc(X2 - 110, 170, 220, 290, AMBER, SW, fold=56)
    b += ic_key(X2 - 50, 330, 0.42, AMBER, 9)
    b += text(X2, 560, 'config.js', 54, INK, 800)
    b += text(X2, 630, '주소 + 공개 키', 46, GRAY, 700)
    # 노드 3 — Supabase 표
    b += ic_cylinder(X3, 315, 280, 300, GREEN, SW, rows=3)
    b += text(X3, 560, 'Supabase', 54, INK, 800)
    b += text(X3, 630, 'guestbook 표', 46, GRAY, 700)
    # RLS 배지
    lab = 'RLS — 읽기 · 쓰기만'
    w = 520
    bx = 1490 - w / 2
    b += rrect(bx, 690, w, 90, r=45, stroke=GREEN, fill='#FFFFFF', sw=7)
    b += ic_lock(bx + 58, 748, 0.62, GREEN, 7)
    b += text(bx + 98, 736, lab, 44, GREEN, 800, anchor='start')
    # 위쪽 화살표
    b += arrow(495, 310, 700, 310, BLUE, 18)
    b += text(598, 235, '남기기', 48, BLUE, 800)
    b += arrow(1060, 310, 1290, 310, BLUE, 18)
    # 아래 되돌아오는 곡선
    b += path(f'M{X3},800 C{X3},1130 {X1},1130 {X1},690', GREEN, 16, arrow=True)
    w2 = text_w('최신 20개', 52) + 90
    b += f'<rect x="{900 - w2 / 2}" y="995" width="{w2}" height="100" rx="50" fill="#FFFFFF" stroke="{GREEN}" stroke-width="7"/>'
    b += text(900, 1047, '최신 20개', 52, GREEN, 800)
    return svg(b)


# ── 7. 열쇠 두 개 ─────────────────────────────────────────────────────────

def ig07():
    b = '<g transform="translate(0,10)">'
    b += line(900, 120, 900, 1080, '#CBD5E1', 6, dash='4 22')
    # 왼쪽 — 공개 키
    b += ic_key(330, 360, 1.25, BLUE, SW)
    b += text(450, 665, 'Publishable', 68, BLUE, 800)
    b += text(450, 757, '공개 키', 56, INK, 800)
    b += ic_check(220, 920, 44, GREEN)
    b += text(285, 922, '홈페이지에 넣어도 됨', 50, GREEN, 800, anchor='start')
    # 오른쪽 — 금고 안 만능 키
    b += rrect(1150, 170, 500, 380, r=34, stroke=RED, fill=FILL[RED], sw=SW)
    b += rrect(1190, 210, 420, 300, r=22, stroke=RED, fill='#FFFFFF', sw=8)
    b += ic_key(1260, 360, 0.82, RED, 10)
    b += circle(1565, 260, 26, RED, '#FFFFFF', 7)
    b += line(1180, 550, 1180, 590, RED, SW)
    b += line(1620, 550, 1620, 590, RED, SW)
    b += text(1400, 665, 'Secret', 68, RED, 800)
    b += text(1400, 757, '만능 키', 56, INK, 800)
    b += ic_cross(1010, 920, 44, RED)
    b += text(1075, 922, '홈페이지 · GitHub · 채팅 금지', 50, RED, 800, anchor='start')
    return svg(b + '</g>')


# ── 8. 공개되는 길 ────────────────────────────────────────────────────────

def ig08():
    # 가로 배치 — 요소 폭과 간격을 먼저 정하고 왼쪽부터 쌓는다(화살촉은 끝점보다 약 22px 앞으로 나감)
    b = ''
    cy = 400
    W_F, W_C, W_W, W_D = 200, 290, 280, 266     # 폴더 · 구름(외곽) · 창 · 기기 묶음
    G1, G = 250, 185                            # 폴더↔구름(«끌어 놓기» 자리) · 나머지 간격
    x = (1800 - (W_F + W_C + W_W + W_D + G1 + 2 * G)) / 2
    f_l = x;              f_r = f_l + W_F
    c_l = f_r + G1;       c_r = c_l + W_C
    w_l = c_r + G;        w_r = w_l + W_W
    d_l = w_r + G;        d_r = d_l + W_D
    fx, cx_, wx, dx = (f_l + f_r) / 2, (c_l + c_r) / 2, (w_l + w_r) / 2, (d_l + d_r) / 2
    b += ic_folder(fx, cy, W_F, 180, AMBER, SW)
    b += ic_cloud(cx_, cy + 10, 260, BLUE, SW)
    b += ic_window(w_l, cy - 105, W_W, 210, GREEN, SW, bar=48)
    b += rrect(wx - 105, cy - 22, 210, 48, r=24, stroke=GREEN, fill='#FFFFFF', sw=6)
    # 기기 묶음 — 휴대폰(왼쪽) + 노트북
    b += ic_phone(d_l + 40, cy + 20, 80, 150, INK, 10, screen='#E2E8F0')
    b += rrect(d_l + 100, cy - 62, 140, 112, r=12, stroke=INK, fill='#F1F5F9', sw=10)
    b += line(d_l + 82, cy + 64, d_r, cy + 64, INK, 12)
    # 화살표 — 출발 +20 · 도착 −45
    b += arrow(f_r + 20, cy, c_l - 45, cy, BLUE, 18)
    b += text((f_r + c_l) / 2, cy - 75, '끌어 놓기', 44, BLUE, 800)
    b += arrow(c_r + 20, cy, w_l - 45, cy, BLUE, 18)
    b += arrow(w_r + 20, cy, d_l - 45, cy, BLUE, 18)
    # 라벨
    ly = 640
    b += text(fx, ly, 'site 폴더', 54, INK, 800)
    b += text(cx_, ly, 'Cloudflare', 54, INK, 800)
    b += text(cx_, ly + 70, 'Pages', 54, INK, 800)
    b += text(wx, ly, 'https://', 46, GREEN, 800)
    b += text(wx, ly + 70, '이름.pages.dev', 50, GREEN, 800)
    b += text(dx, ly, '휴대폰 · PC', 54, INK, 800)
    b += text(dx, ly + 70, '누구나', 54, GREEN, 800)
    # 아래 한 줄 띠
    b += pill(900, 930, '폴더 하나를 올리면 — 주소가 생김', 52, BLUE)
    return svg(b)


# ── 9. 순환 ───────────────────────────────────────────────────────────────

def ig09():
    b = ''
    cx, cy, R = 900, 600, 390
    nodes = [(-90, AMBER, '말하기', 'bubble'), (0, BLUE, '확인', 'eye'),
             (90, GREEN, '저장', 'cyl'), (180, GRAY, '공개', 'globe')]
    rn = 140
    # 고리 위 화살표 (노드 사이)
    for i in range(4):
        a0 = math.radians(nodes[i][0]) + rn / R * 1.18
        a1 = math.radians(nodes[(i + 1) % 4][0] if i < 3 else nodes[0][0] + 360) - rn / R * 1.35
        x0, y0 = cx + R * math.cos(a0), cy + R * math.sin(a0)
        x1, y1 = cx + R * math.cos(a1), cy + R * math.sin(a1)
        b += path(f'M{x0:.1f},{y0:.1f} A{R},{R} 0 0 1 {x1:.1f},{y1:.1f}', INK, 14, arrow=True)
    for ang, c, s, ic in nodes:
        a = math.radians(ang)
        x, y = cx + R * math.cos(a), cy + R * math.sin(a)
        b += circle(x, y, rn, c)
        if ic == 'bubble':
            b += ic_bubble(x, y - 50, 96, 58, c, 8)
        elif ic == 'eye':
            b += (path(f'M{x - 60},{y - 46} Q{x},{y - 100} {x + 60},{y - 46} Q{x},{y + 8} {x - 60},{y - 46} Z', c, 8,
                       fill='#FFFFFF') + circle(x, y - 46, 14, c, c, 4))
        elif ic == 'cyl':
            b += ic_cylinder(x, y - 46, 84, 84, c, 8, rows=1)
        else:
            b += ic_globe(x, y - 46, 40, c, 7)
        b += text(x, y + 52, s, 58, c if c != GRAY else INK, 800)
    b += text(cx, cy - 46, '한 번에', 72, INK, 800)
    b += text(cx, cy + 50, '하나씩', 72, INK, 800)
    return svg(b)


FILES = {
    'ig-01-four-parts': ig01, 'ig-02-local-vs-web': ig02, 'ig-03-two-needs': ig03,
    'ig-04-ego-handoff': ig04, 'ig-05-request-4': ig05, 'ig-06-guestbook-flow': ig06,
    'ig-07-two-keys': ig07, 'ig-08-deploy-path': ig08, 'ig-09-cycle': ig09,
}

if __name__ == '__main__':
    for name, fn in FILES.items():
        with open(os.path.join(OUT, name + '.svg'), 'w', encoding='utf-8') as f:
            f.write(fn())
        print('wrote', name + '.svg')
