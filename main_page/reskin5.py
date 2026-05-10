#!/usr/bin/env python3
"""reskin5.py — DOM modifications: nav logo, nav menu, next race, marquee, sightings, delete sections, helmet dates."""
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

changes = []

def r(old, new, label=''):
    global html
    count = html.count(old)
    if count == 0:
        print(f'WARN no match: {label or repr(old[:80])}')
        return
    html = html.replace(old, new)
    changes.append(f'{count}x [{label or old[:50]}]')

def rsub(pattern, new, flags, label=''):
    global html
    result, n = re.subn(pattern, new, html, flags=flags)
    if n == 0:
        print(f'WARN no regex match: {label}')
    else:
        html = result
        changes.append(f'{n}x [{label}]')

# ── 1. Nav brand SVG → alien head img
rsub(
    r'<div class="nav-brand w-embed"><svg.*?</svg></div>',
    '<div class="nav-brand w-embed"><img src="images/alien-head-logo.svg" alt="MNEMOSYNE" style="height:44px;width:auto;color:var(--color--grey-1)"></div>',
    re.DOTALL,
    'nav brand SVG → alien head img'
)

# ── 2. Remove hamburger button
rsub(
    r'<button data-nav-ham="".*?</button>',
    '',
    re.DOTALL,
    'remove hamburger button'
)

# ── 3. Remove entire nav menu (data-nav-m div + nav-menu-bg)
rsub(
    r'<div data-nav-m="" class="nav-menu-w">.*?<div class="nav-menu-bg"></div>\s*</div>',
    '',
    re.DOTALL,
    'remove nav menu'
)

# ── 4. Remove Next Race panel (stop before tablet hero text div)
rsub(
    r'<div class="home-hero-next-race-w">.*?(?=<div class="home-hero-tablet-hero-text">)',
    '',
    re.DOTALL,
    'remove next race panel'
)

# ── 5. Replace signature images with classified stamp
r(
    'src="fonts/67cecea4e9d311047dcb51e5_ln4-hw-signature2.svg"',
    'src="images/classified-stamp.svg"',
    'sig img 1 src'
)
r(
    'src="fonts/67f517cdc5bb460c3c3b8e5b_ln4-LN-logo-svg.svg"',
    'src="images/classified-stamp.svg"',
    'sig img 2 src'
)

# ── 6. Replace entire marquee section with CSS animated text strip
MARQUEE_NEW = '''<section class="s home-marquee">
              <div class="c is-marquee">
                <div class="marqee-adv-layout">
                  <div class="marquee-adv-top-w">
                    <div class="marquee-adv-top-layout">
                      <div class="marquee-signature-w">
                        <div data-wf--c-home-hero-icon--variant="ln4" class="home-hero-logo-wrap">
                          <img src="images/classified-stamp.svg" loading="eager" data-hero-anim="img"
                            alt="CLASSIFIED &#x2014; MNEMOSYNE SYSTEMS INC."
                            class="image is-home-marquee-sig-img is-1"
                            style="max-width:260px;opacity:0.85">
                        </div>
                      </div>
                      <div class="eyebrow-w">
                        <div split-text="chars" data-hero-anim="msg" class="text-eyebrow">Transmission received &#x2014; DWP-NODE-007</div>
                      </div>
                    </div>
                  </div>
                  <div class="marquee-gl-target-w">
                    <div data-sticky-hero="target" class="marquee-gl-target">
                      <div class="mnemosyne-text-marquee">
                        <div class="mnemosyne-text-track">
                          <span class="mnemosyne-marquee-text">WHO IS HE?&nbsp;&mdash;&nbsp;WHY ARE THEY HERE?&nbsp;&mdash;&nbsp;WHY ARE THEY HIDING THEM?&nbsp;&mdash;&nbsp;</span>
                          <span class="mnemosyne-marquee-text">WHO IS HE?&nbsp;&mdash;&nbsp;WHY ARE THEY HERE?&nbsp;&mdash;&nbsp;WHY ARE THEY HIDING THEM?&nbsp;&mdash;&nbsp;</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>'''

rsub(
    r'<section class="s home-marquee">.*?</section>',
    MARQUEE_NEW,
    re.DOTALL,
    'replace marquee section'
)

# ── 7. Inject marquee CSS + keyframe before </style> in <head>
MARQUEE_CSS = '''    @keyframes mnemo-scroll {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }
    .mnemosyne-text-marquee {
      overflow: hidden;
      padding: 2rem 0;
      border-top: 1px solid rgba(200,200,64,0.2);
      border-bottom: 1px solid rgba(200,200,64,0.2);
    }
    .mnemosyne-text-track {
      display: flex;
      white-space: nowrap;
      animation: mnemo-scroll 22s linear infinite;
    }
    .mnemosyne-marquee-text {
      font-family: 'Courier New', monospace;
      font-size: clamp(1rem, 2vw, 1.4rem);
      letter-spacing: 0.25em;
      color: #c8c840;
      padding-right: 2em;
    }
  </style>'''

r(
    '  </style>\n</head>',
    MARQUEE_CSS + '\n</head>',
    'inject marquee CSS into head'
)

# ── 8. Sightings Hall of Fame → Known Incidents
r(
    '<h2 data-anim-high="" split-text="lines" class="text-title-lg-mona">Sightings<br></h2>',
    '<h2 data-anim-high="" split-text="lines" class="text-title-lg-mona">Known<br></h2>',
    'sightings h2 → known'
)
r(
    '<h2 data-anim-high="" split-text="lines" class="text-title-lg-mona"><span\n                      class="text-title-lg-brier c-lime-off">Hall of Fame</span></h2>',
    '<h2 data-anim-high="" split-text="lines" class="text-title-lg-mona"><span\n                      class="text-title-lg-brier c-lime-off">Incidents</span></h2>',
    'hall of fame → incidents'
)

# ── 9. Update Sightings section description
r(
    'From the original 2011 upload to recovered field recordings — every piece of evidence catalogued, every frame analysed.',
    'Roswell 1947. Ariel School 1994. Tunguska 1908. Every incident documented, every witness on record.',
    'sightings desc → incident list'
)

# ── 10. Remove is-lando-exe section
rsub(
    r'<section data-exe-section=""[^>]*class="s is-lando-exe">.*?</section>',
    '',
    re.DOTALL,
    'remove is-lando-exe section'
)

# ── 11. Remove is-home-collabs section
rsub(
    r'<section[^>]*class="s is-home-collabs">.*?</section>',
    '',
    re.DOTALL,
    'remove is-home-collabs section'
)

# ── 12. Helmet dates → incident years
date_map = [
    ('The Upload',    '2025', '2011'),
    ('Signal 432',    '2025', '1977'),
    ('Night 47',      '2025', '1947'),
    ('The Eyes',      '2024', '2011'),
    ('Soviet Files',  '2024', '1979'),
    ('Signal Source', '2024', '1983'),
    ('The Reply',     '2024', '1997'),
    ('MNEMOSYNE',     '2024', '1952'),
    ('First Contact', '2023', '1947'),
    ('The Tape',      '2023', '2011'),
    ('Chrome',        '2023', '1994'),
    ('Beachball',     '2023', '1980'),
    ('Basketball',    '2022', '1964'),
    ('Season',        '2021', '1957'),
    ('Silverstone',   '2020', '1976'),
    ('Static',        '2019', '1908'),
]

indent = '                        '
date_indent = '                          '
for name, old_year, new_year in date_map:
    old = (f'<h3 class="text-title-small-label text">{name}</h3>\n'
           f'{indent}<div class="helmet-grid-item-date-w">\n'
           f'{date_indent}<div class="text-title-small-label date">{old_year}</div>')
    new = (f'<h3 class="text-title-small-label text">{name}</h3>\n'
           f'{indent}<div class="helmet-grid-item-date-w">\n'
           f'{date_indent}<div class="text-title-small-label date">{new_year}</div>')
    count = html.count(old)
    if count == 0:
        print(f'WARN no match: date {name} {old_year}→{new_year}')
    else:
        html = html.replace(old, new, 1)
        changes.append(f'1x [date {name} {old_year}→{new_year}]')

# ── Write output
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print(f'Done. {len(changes)} change groups:')
for c in changes:
    print(f'  {c}')
