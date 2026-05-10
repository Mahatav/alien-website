import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix LANDO
content = content.replace("LANDO\n", "SKINNY BOB\n")

# Fix multiline "Lando is redefining"
content = re.sub(r'Lando is\s*\n\s*redefining what it means to be a modern racing driver. His passion, speed, and approachability have quickly made him one of the most popular and exciting figures in the sport today.', 
                 r'Skinny Bob is redefining what it means to question our place in the universe. His silence, mystery, and brief appearances have quickly made him one of the most enigmatic figures in modern ufology.', 
                 content, flags=re.MULTILINE)

# Fix multiline copyright
content = re.sub(r'© 2026 Lando\s*\n\s*Norris.', '© 2026 MNEMOSYNE INVESTIGATIONS.', content, flags=re.MULTILINE)

# Fix any remaining standalone Lando in text nodes
content = re.sub(r'>([^<]*)Lando([^<]*)<', r'>\1Skinny Bob\2<', content, flags=re.IGNORECASE)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Reskin 2 complete.")
