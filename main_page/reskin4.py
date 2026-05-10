#!/usr/bin/env python3
"""reskin4.py — Final content pass: replace all remaining Lando/F1 content with Skinny Bob investigator narrative."""

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

orig = html
changes = []

def r(old, new, label='', n=0):
    global html
    count = html.count(old)
    if count == 0:
        print(f'WARN no match: {label or repr(old[:70])}')
        return
    html = html.replace(old, new, n) if n else html.replace(old, new)
    replaced = min(count, n) if n else count
    changes.append(f'{replaced}x [{label or old[:50]}]')

# ── Impact statement (lines ~1663-1665)
r(
    '<strong>Questioning</strong> reality, searching for <strong>wins</strong>, bringing it all in all ways.\n                Defining a <strong>truth</strong> in Formula 1 on and off the track.',
    '<strong>Something</strong> is out there, watching from the dark, waiting to be <strong>found</strong>.\n                Searching for <strong>truth</strong> in the signals and the silence.',
    'impact statement'
)

# ── Horizontal scroll: location captions
r('>Qatar, 2024<', '>Tunguska, 2011<', 'horiz 1')
r('>FIA Prize Giving, 2024<', '>Roswell, 1947<', 'horiz 2')
r('>Miami GP, 2024<', '>Kyshtym, 1979<', 'horiz 3')
r('>Monaco, 2023<', '>Rendlesham, 1980<', 'horiz 4')
r('>Britain, 2025<', '>Socorro, 1964<', 'horiz 5')
r('>Battersea, 2024<', '>Levelland, 1957<', 'horiz 6')
r('>High Performance Gala, 2024<', '>Tehran, 1976<', 'horiz 7')
r('>Barcelona, 2024<', '>Voronezh, 1989<', 'horiz 8')
r('>austria, 2020<', '>Hudson Valley, 1983<', 'horiz 9')
r('>US, 2024<', '>Phoenix, 1997<', 'horiz 10')

# ── Quote callout 1
r(
    'It doesn\'t matter <span\n                                class="span-green-off-white-1">where</span> you start, it\'s <span\n                                class="span-green-off-white-1">how</span> you progress from there.',
    'Something looked back at me through the static. I don\'t know <span\n                                class="span-green-off-white-1">what</span> it was. I know what it <span\n                                class="span-green-off-white-1">wasn\'t</span>.',
    'quote 1'
)

# ── Signature alt text
r('alt="Lando\'s signature in lime color"', 'alt="Researcher\'s mark"', 'sig alt')

# ── Quote callout 2
r(
    'Since I was 7 years\n                              old and had my first experience with kart racing, I\'ve worked tirelessly to make that\n                              dream come true.',
    'I found the footage in 2011. Three minutes of film changed everything I thought I knew about being alone in the universe.',
    'quote 2'
)

# ── ON TRACK section → THE SIGNAL
r(
    'data-anim-high="right, dark-green-tint-1" split-text="lines" class="text-impact-reg-brier">\n                          ON<br></h2>',
    'data-anim-high="right, dark-green-tint-1" split-text="lines" class="text-impact-reg-brier">\n                          THE<br></h2>',
    'ON→THE', 1
)
r(
    'data-anim-high="right, dark-green-tint-1" split-text="lines"\n                          class="text-impact-reg-mona line-increase">TRACK</h2>\n                        <div class="otot-home-text-rive',
    'data-anim-high="right, dark-green-tint-1" split-text="lines"\n                          class="text-impact-reg-mona line-increase">SIGNAL</h2>\n                        <div class="otot-home-text-rive',
    'TRACK→SIGNAL'
)

# ── OFF TRACK section → THE CONTACT
r(
    'data-anim-high="left, dark-green-tint-1" split-text="lines" class="text-impact-reg-brier">\n                          OFF<br></h2>',
    'data-anim-high="left, dark-green-tint-1" split-text="lines" class="text-impact-reg-brier">\n                          THE<br></h2>',
    'OFF→THE'
)
r(
    'data-anim-high="left, dark-green-tint-1" split-text="lines"\n                          class="text-impact-reg-mona line-increase">TRACK</h2>\n                      </div>',
    'data-anim-high="left, dark-green-tint-1" split-text="lines"\n                          class="text-impact-reg-mona line-increase">CONTACT</h2>\n                      </div>',
    'TRACK→CONTACT'
)

# ── OTOT section descriptions
r(
    'Most recent <strong>results</strong>, career stats and photos from trackside.',
    'Most recent <strong>sightings</strong>, decoded transmissions and anomalous signal logs.',
    'otot desc 1'
)
r(
    '<strong>Campaigns</strong>, shoots and other such promotional materials for fans',
    '<strong>Evidence logs</strong>, decoded messages and anomalous communications from the entity.',
    'otot desc 2'
)

# ── Sightings section description
r(
    'From his iconic\n                    blobs to innovative one-off designs, Skinny Bob has always been passionate about designing innovative and\n                    memorable helmets.',
    'From the original 2011 upload to recovered field recordings — every piece of evidence catalogued, every frame analysed.',
    'sightings desc'
)

# ── Callout: helmets section CTA
r(
    'See more\n                    helmets and highlights from Skinny Bob on the track',
    'Every sighting logged.\n                    Every signal decoded. Every frame of the footage examined.',
    'callout CTA text'
)
r('>view on track<', '>view the evidence<', 'callout btn')

# ── Store / Exe section
r(
    'class="text-eyebrow large">SKINNY BOB\n                      STORE</div>',
    'class="text-eyebrow large">SIGNAL\n                      ARCHIVE</div>',
    'store eyebrow'
)
r(
    'World Drivers\' <span class="span-font-brier otot">Champion</span>',
    'Evidence <span class="span-font-brier otot">Vault</span>',
    'store heading'
)
r(
    'Celebrate this incredible moment with a collection designed for the fans who never stopped\n                      believing. Wear it, frame it, treasure it forever.',
    'Every recovered transmission, every anomalous photograph, every decoded frequency — logged and preserved. The truth is in here somewhere.',
    'store desc'
)
r('>Visit the store<', '>Access archive<', 'store btn')
r('href="https://landonorris.store/"', 'href="#"', 'store href')

# ── Partners section
r(
    '>partners\n                </h2>',
    '>signals\n                </h2>',
    'partners h2'
)
r(
    'class="text-title-lg-brier">&amp;campaigns</span>',
    'class="text-title-lg-brier">&amp;contact</span>',
    'partners h2 2'
)
r(
    'Skinny Bob is\n                    proud to collaborate with a range of partners, who share his passion for performance across a range\n                    of industries.',
    'Every anomaly documented, every report filed. The investigation has spanned continents and frequencies — these are the breadcrumbs.',
    'partners desc'
)

# ── Socials section
r(
    '<span>what\'s\n                    up</span><span class="span-font-brier">On Socials</span>',
    '<span>what\'s</span><span class="span-font-brier">Out There</span>',
    'socials heading'
)

# ── Social/footer hrefs (replace all instances)
r('href="https://www.tiktok.com/@landonorris"', 'href="#"', 'tiktok href')
r('href="https://www.instagram.com/lando"', 'href="#"', 'instagram href')
r('href="https://www.twitch.tv/landonorris"', 'href="#"', 'twitch href')

# ── Social link text labels (callout section — lowercase)
r('>tiktok\n                      </div>', '>the signal\n                      </div>', 'tiktok label')
r('>instagram\n                      </div>', '>the footage\n                      </div>', 'instagram label')
r('>Youtube\n                      </div>', '>432 Hz\n                      </div>', 'youtube label')
# callout Twitch label
r(
    'split-text="lines,chars" class="btn-text">Twitch\n                      </div>',
    'split-text="lines,chars" class="btn-text">the tape\n                      </div>',
    'twitch label callout'
)

# ── Footer: On Track → The Signal, Off Track → The Contact
r(
    'class="btn-text is-footer">On\n                              Track</div>',
    'class="btn-text is-footer">The\n                              Signal</div>',
    'footer on track'
)
r(
    'class="btn-text is-footer">Off\n                              Track</div>',
    'class="btn-text is-footer">The\n                              Contact</div>',
    'footer off track'
)
r(
    'class="btn-text is-footer">\n                              Calendar</div>',
    'class="btn-text is-footer">\n                              Log</div>',
    'footer calendar'
)

# ── Footer social labels (capital T for Tiktok/Instagram etc)
r(
    'class="btn-text is-footer">Tiktok\n                            </div>',
    'class="btn-text is-footer">Signal\n                            </div>',
    'footer tiktok'
)
r(
    'class="btn-text is-footer">\n                              Instagram</div>',
    'class="btn-text is-footer">\n                              Footage</div>',
    'footer instagram'
)
r(
    'class="btn-text is-footer">\n                              Youtube</div>',
    'class="btn-text is-footer">\n                              432 Hz</div>',
    'footer youtube'
)
r(
    'class="btn-text is-footer">Twitch\n                            </div>',
    'class="btn-text is-footer">Archive\n                            </div>',
    'footer twitch'
)

# ── Footer statement
r(
    '>Always\n                        <span class="text-impact-sm-brier c-lime-off">bringing</span> the <span\n                          class="text-impact-sm-brier c-lime-off">fight</span>.\n                      </h2>',
    '>Still here.\n                        <span class="text-impact-sm-brier c-lime-off">Still watching.</span> Still <span\n                          class="text-impact-sm-brier c-lime-off">transmitting</span>.\n                      </h2>',
    'footer statement'
)

# ── Footer store link
r('href="https://store.landonorris.com/"', 'href="#"', 'footer store href')

# ── Email
r('href="mailto:business@landonorris.com"', 'href="mailto:mahatavarora2@gmail.com"', 'email')

# ── Nav href cleanup
r('href="/on-track"', 'href="#"', 'nav on-track href')
r('href="/off-track"', 'href="#"', 'nav off-track href')
r('href="/calendar"', 'href="#"', 'nav calendar href')
r('href="/partnerships"', 'href="#"', 'nav partnerships href')

# ── Alt texts
r('alt="Lando in casual clothes walking through paddock"', 'alt="Incident document, Tunguska region 2011"', 'alt 1')
r('alt="Lando lifting trophy in tux"', 'alt="Declassified photograph, recovered 1948"', 'alt 2')
r('alt="Lando lifting tophy"', 'alt="Signal spike documentation, 1979"', 'alt 3')
r('alt="Lando playing golf"', 'alt="Anomalous figure photographed at incident site"', 'alt 4')
r('alt="Lando in f1 car"', 'alt="Unexplained aerial phenomenon, declassified"', 'alt 5')
r('alt="Lando holding dog smiling"', 'alt="Field investigator at site B, 1957"', 'alt 6')
r('alt="Lando in tux"', 'alt="Recovered evidence log, 1976"', 'alt 7')
r('alt="Lando taking photo out of a plane"', 'alt="Voronezh incident scene photograph"', 'alt 8')
r('alt="Lando lifting helmet up"', 'alt="Close-up of recovered footage frame"', 'alt 9')
r('alt="Skinny Bob wearing a lime helmet, side profile"', 'alt="Subject in dim lighting, film frame 1"', 'alt 10')
r('alt="Skinny Bob wearing a fleece side profile"', 'alt="Subject in dim lighting, film frame 2"', 'alt 11')
r('alt="Lando celebrating a win"', 'alt="Witness photograph, Phoenix lights 1997"', 'alt 12')
r('alt="Lando lifting trophy"', 'alt="Retrieved file, Kirtland archive"', 'alt 13')

# ── Helmet grid labels — disambiguate by year context
# Season (2025) → The Upload
html = html.replace(
    '<h3 class="text-title-small-label text">Season</h3>\n                        <div class="helmet-grid-item-date-w">\n                          <div class="text-title-small-label date">2025</div>',
    '<h3 class="text-title-small-label text">The Upload</h3>\n                        <div class="helmet-grid-item-date-w">\n                          <div class="text-title-small-label date">2025</div>',
    1
)
changes.append('1x [helmet Season 2025→The Upload]')

# Season (2024) → The Eyes
html = html.replace(
    '<h3 class="text-title-small-label text">Season</h3>\n                        <div class="helmet-grid-item-date-w">\n                          <div class="text-title-small-label date">2024</div>',
    '<h3 class="text-title-small-label text">The Eyes</h3>\n                        <div class="helmet-grid-item-date-w">\n                          <div class="text-title-small-label date">2024</div>',
    1
)
changes.append('1x [helmet Season 2024→The Eyes]')

# Season (2019) → Static
html = html.replace(
    '<h3 class="text-title-small-label text">Season</h3>\n                        <div class="helmet-grid-item-date-w">\n                          <div class="text-title-small-label date">2019</div>',
    '<h3 class="text-title-small-label text">Static</h3>\n                        <div class="helmet-grid-item-date-w">\n                          <div class="text-title-small-label date">2019</div>',
    1
)
changes.append('1x [helmet Season 2019→Static]')

r('<h3 class="text-title-small-label text">Discoball</h3>', '<h3 class="text-title-small-label text">Signal 432</h3>', 'helmet Discoball')
r('<h3 class="text-title-small-label text">Dark Glitter</h3>', '<h3 class="text-title-small-label text">Night 47</h3>', 'helmet Dark Glitter')
r('<h3 class="text-title-small-label text">Porcelain</h3>', '<h3 class="text-title-small-label text">Soviet Files</h3>', 'helmet Porcelain')
r('<h3 class="text-title-small-label text">Japan</h3>', '<h3 class="text-title-small-label text">Signal Source</h3>', 'helmet Japan')
r('<h3 class="text-title-small-label text">GIF</h3>', '<h3 class="text-title-small-label text">The Reply</h3>', 'helmet GIF')
r('<h3 class="text-title-small-label text">Dark Mode</h3>', '<h3 class="text-title-small-label text">MNEMOSYNE</h3>', 'helmet Dark Mode')
r('<h3 class="text-title-small-label text">Race</h3>', '<h3 class="text-title-small-label text">First Contact</h3>', 'helmet Race')
r('<h3 class="text-title-small-label text">Las Vegas</h3>', '<h3 class="text-title-small-label text">The Tape</h3>', 'helmet Las Vegas')

# ── Write output
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print(f'Done. {len(changes)} change groups:')
for c in changes:
    print(f'  {c}')
