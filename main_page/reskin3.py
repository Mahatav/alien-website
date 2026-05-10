import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'2025 McLaren Formula 1 Driver — Lando Norris', 'Skinny Bob: The Lost Years', content)
content = re.sub(r'Official hub for British racing star Lando Norris[^"]*', 'Investigating the ivan0135 footage, the Mnemosyne archive, and the existence of Skinny Bob.', content)
content = re.sub(r'LandoNorris[^"]*', 'SkinnyBob', content)
content = re.sub(r'Lando Norris', 'Skinny Bob', content)
content = re.sub(r'lando norris', 'skinny bob', content, flags=re.IGNORECASE)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
