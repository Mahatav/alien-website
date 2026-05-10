# MNEMOSYNE SYSTEMS — ARCHIVE TERMINAL

A retro-futuristic terminal website simulating a forgotten Cold War government archive. Built with plain HTML, CSS, and JavaScript — no framework, no build step.

---

## Running It

### Option 1: Open directly in browser

Just open `index.html` in any modern browser:

```
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

### Option 2: Local dev server (recommended to avoid any CORS quirks)

Using Python (no install needed on most systems):

```bash
# Python 3
python3 -m http.server 8080

# Then visit: http://localhost:8080
```

Using Node.js (`npx` — no global install needed):

```bash
npx serve .

# Then visit the URL it prints (usually http://localhost:3000)
```

Using VS Code: install the **Live Server** extension, right-click `index.html` → *Open with Live Server*.

---

## File Structure

```
alien-website/
├── index.html       # Main page and DOM structure
├── terminal.css     # All visual styles (CRT effects, scanlines, phosphor glow)
├── terminal.js      # Terminal logic, commands, animations, storytelling
└── data/            # Lore assets referenced in the narrative
```

---

## Using the Terminal

Type commands at the `NODE7://>` prompt. A few to start with:

| Command | Description |
|---------|-------------|
| `HELP` | List available commands |
| `ARCHIVE` | Browse classified file tree |
| `SCAN` | Run a signal scan |
| `DECRYPT` | Attempt decryption on a target |
| `ACCESS <file>` | Open an archive entry |
| `AUTH` | Authentication module |
| `ELEVATE` | Request clearance escalation |
| `SIGNAL` | Monitor live transmissions |
| `TRACE` | Trace an origin point |
| `ANALYZE` | Run analysis on data |

Press `Tab` for autocomplete. Use `↑` / `↓` to scroll command history.

Some commands unlock others. Explore.

---

## Browser Compatibility

Works best on desktop Chrome or Firefox. The CRT canvas effects and CSS animations require a modern browser. Mobile layout is functional but the experience is designed for desktop.
