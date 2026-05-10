import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1/10 Redirect Script
script_injection = """<head>
  <script>
    // 1/10 chance to redirect to the Deep Watch Protocol Terminal
    if (Math.random() < 0.1) {
      window.location.href = '../index.html';
    }
  </script>"""
content = content.replace("<head>", script_injection)

# Exact text replacements
replacements = {
    "<title>2025 McLaren Formula 1 Driver — Lando Norris</title>": "<title>Is Skinny Bob Real? | The Truth Behind ivan0135</title>",
    '<h1 class="screen-reader">Lando Norris</h1>': '<h1 class="screen-reader">Skinny Bob</h1>',
    '<h2 class="screen-reader">2025 Mclaren Formula 1 Driver</h2>': '<h2 class="screen-reader">The Visitor Who Never Went Home</h2>',
    "Load Norris": "Load Evidence",
    "2025 Mclaren Formula 1 Driver": "The Visitor Who Never Went Home",
    "Message from lando": "Message from ivan0135",
    ">mclaren f1 since 2019<": ">classified since 1947<",
    "mclaren f1since 2019": "classified since 1947",
    ">Redefining<": ">Questioning<",
    " limits, fighting for ": " reality, searching for ",
    ">legacy<": ">truth<",
    ">On Track<": ">The Footage<",
    ">Off Track<": ">The Theories<",
    ">Partnerships<": ">Cover-ups<",
    ">Calendar<": ">Encounters<",
    ">Store<": ">Archive<",
    ">Helmets<br>": ">Sightings<br>",
    ">Helmets<": ">Sightings<",
    "From vibrant, hand-painted blobs to innovative one-off designs, Lando has always been passionate about designing innovative and memorable helmets.": "From unverified footage to declassified government documents, investigators have always been passionate about analyzing the few remaining pieces of evidence.",
    "Lando is redefining what it means to be a modern racing driver. His passion, speed, and approachability have quickly made him one of the most popular and exciting figures in the sport today.": "Skinny Bob is redefining what it means to question our place in the universe. His silence, mystery, and brief appearances have quickly made him one of the most enigmatic figures in modern ufology.",
    ">Lando<": ">Skinny Bob<",
    ">lando<": ">ivan0135<",
    ">LANDO<": ">SKINNY BOB<",
    "Follow Lando on social media": "Follow the investigation",
    "business enquiries": "submit evidence",
    "© 2026 Lando Norris.": "© 2026 MNEMOSYNE INVESTIGATIONS."
}

for old_str, new_str in replacements.items():
    content = content.replace(old_str, new_str)

# Special regex replacements to avoid breaking URLs (like images or JS paths)
# We only want to replace Lando Norris in text nodes. A naive approach:
# content = re.sub(r'>([^<]*)Lando Norris([^<]*)<', r'>\1Skinny Bob\2<', content, flags=re.IGNORECASE)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Reskin complete.")
