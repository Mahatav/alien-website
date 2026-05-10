# MNEMOSYNE TERMINAL — Master Change List

**Target experience:** A forgotten classified machine inside an abandoned underground bunker that still behaves like real hardware, still contains secrets, and still feels slightly dangerous to use. Less themed website, more recovered machine interface.

---

## SECTION A — Critical Bugs (broken right now, fix first)

### A1. `decrypt` command always fails — `DECRYPTERS` map is never called
**File:** `terminal.js` · `doDecrypt()` (~line 1350)

`DECRYPTERS` is defined with handlers for `SUBJECT_B.TXT`, `VESSEL_PROTOCOL.TXT`, and `OMEGA_FINAL.DAT` but `doDecrypt()` ignores it entirely and always prints "DECRYPTION FAILED." The puzzle chain is completely unwinnable.

**Fix:** Check `DECRYPTERS[resolved.name]` before the generic failure path. If a handler exists and the user has the required clearance tier, run it. Otherwise fall through to the failure message.

---

### A2. `ls -a` flag breaks folder listing
**File:** `terminal.js` · `dispatch()` ~line 1183 and `doLs()` ~line 1240

`doLs` is called as `doLs(a[0]==='-a')`, passing boolean `true` when the flag is used. Inside `doLs`, that boolean is then used as a folder name — `ARCHIVE[true]` — which always returns `undefined`. Result: `ls -a` shows an error instead of a listing.

**Fix:** Change call to `doLs(a.includes('-a'), a.find(x => x !== '-a'))` and update the function signature to `doLs(showAll, folder)`.

---

### A3. Narrative `FILES` object is completely unreachable
**File:** `terminal.js` · `resolveFile()` (~line 1578)

`FILES` holds the entire story (`WELCOME.LOG`, `INCIDENT_7A.LOG`, `SUBJECT_B.TXT`, etc.) but `resolveFile()` only searches `ARCHIVE` and `ROOT_FILES`. Typing `open WELCOME.LOG` returns "File not found."

**Fix:** Add `FILES` lookup to `resolveFile()`. When a match is found, `doOpen()` renders the body lines inline in the terminal via `queueLines()` instead of opening a new tab.

---

### A4. Uptime display always shows `00:00:00`
**File:** `terminal.js` — no update code exists for `#uptime-display` or `#diag-uptime`

**Fix:** Record `sessionStart = Date.now()` on boot. On every `gateTick()` call (or a shared 1-second interval), compute elapsed time and write it to both `#uptime-display` and `#diag-uptime`.

---

### A5. Clearance panel never updates after access codes are entered
**File:** `terminal.js` · `refreshBadge()` (~line 766)

`#clr-level` and `#clr-files` always show `GUEST` and `--` regardless of clearance. `refreshBadge()` updates the badge and operator label but ignores these elements.

**Fix:** In `refreshBadge()`, also set `#clr-level` to `TIERS[S.clearance]` and `#clr-files` to the count of `FILES` entries accessible at the current tier.

---

## SECTION B — Visual & CRT Experience

**Goal:** The screen should feel physically aged, unstable, and isolated. It should feel like the only light source in a dark room.

### B1. Push CRT effects further — more imperfection, less polish
**Files:** `terminal.css`, `terminal.js`

Current effects (scanlines, vignette, flicker, noise, dust) are good but feel slightly designed. Push them toward a more battered, uneven look:
- Increase scanline contrast slightly and vary their density across the screen
- Add subtle screen-edge warping / barrel distortion via CSS `perspective` + `border-radius` on `#crt`
- Add a very faint horizontal rolling distortion (a 1–2px bar that scrolls top-to-bottom on a ~20s cycle, separate from the existing roll-line)
- Introduce occasional phosphor smear: when the terminal writes a line, briefly extend a faint horizontal glow trail behind it
- Make the vignette stronger and slightly asymmetric (darker at bottom corners, suggesting the CRT tube is slightly off-center)
- Add a subtle brightness drift across the screen surface (a slow, very low-opacity radial pulse that shifts the center of brightness slightly over ~30s)

### B2. Stronger sense that the screen is the only light source
**Files:** `terminal.css`

- Deepen the outer `#room` background to pure `#000` with no ambient light bleed
- Strengthen the green outer glow on `#crt` so it bleeds further into the dark surround (increase the 320px box-shadow spread and opacity)
- Add a faint green floor reflection below `#crt` via a mirrored, heavily blurred `::before` pseudo-element or `box-shadow` pointing downward

### B3. Chromatic aberration on glitch events
**Files:** `terminal.css`, `terminal.js`

Currently glitching only shifts the whole body. Add a brief RGB channel split on `#terminal-body` during `doGlitch()` calls — a `filter: url(#chromatic-split)` SVG filter or a CSS layered `text-shadow` with red/blue offsets that fires for ~120ms during the glitch animation.

### B4. Ghosting trails on fast-rendered lines
**Files:** `terminal.js`

When lines are appended via `appendLnDirect()` (system alerts, gate warnings), add a very faint duplicate element at 8% opacity that fades out over 600ms, simulating phosphor persistence.

### B5. Screen instability events (random, ambient)
**Files:** `terminal.js`

Beyond the existing flicker animation, add a rare (every 90–180s, randomised) ambient instability event:
- Brief sync loss: screen shifts 3–6px horizontally for 80ms then snaps back
- Rolling distortion: a wider (10px) bar moves across the screen at irregular speed
- Brightness collapse: entire CRT dims to 40% for 200ms then recovers
- These should feel unannounced and unsettling, not cartoonish

---

## SECTION C — Layout & Panel Architecture

**Goal:** The interface should feel like a modular console bolted together from hardware modules, not a static web page. Panels should feel physically separate.

### C1. Strengthen mechanical panel borders
**Files:** `terminal.css`

- Add inset shadow to each panel interior: `box-shadow: inset 0 0 12px rgba(0,0,0,0.6)` — makes panels feel recessed into the frame
- Add a thin bright-green top-edge highlight on each panel (1px, 15% opacity) to simulate a lit edge on hardware
- Give the left and right panel headers a slightly raised feel with a subtle background gradient from `rgba(40,52,40,0.5)` to transparent

### C2. Draggable diagnostic windows (floating panels)
**Files:** `terminal.js`, `terminal.css`

Add 2–3 small floating diagnostic windows that appear after specific events:
- **Signal Monitor window** — appears after first `scan` or `resonance` command. Shows live 432 Hz waveform + signal origin log. Draggable, closeable.
- **Corruption Alert window** — appears when archive corruption is triggered. Shows sector fault list and a fake hex dump of the damaged region. Auto-closes after 12s unless pinned.
- **Personnel Status window** — appears after reading `PERSONNEL.LOG`. Shows a roster with status indicators. Draggable.

Implementation: each is a `position: fixed` div with a drag handle, `z-index: 500`, and a close button. Drag via `mousedown` + `mousemove` on the handle.

### C3. Deepen the nav tree into a real filesystem
**Files:** `terminal.js`, `terminal.css`

Currently `#nav-tree` is empty. Populate it with:
- Expandable folder nodes from `ARCHIVE` (click to expand/collapse child file list)
- Clickable file names that run `open [FOLDER/FILE]` directly
- Tier-locked folders shown in dimmed red with a `[LOCKED]` label and padlock glyph
- A `[NARRATIVE]` section below archive folders showing accessible `FILES` entries
- When clearance changes, re-render the tree to reveal newly unlocked items with a brief highlight flash

### C4. Alert/notification strip for system events
**Files:** `terminal.js`, `terminal.css`

Add a thin notification area below the gate bar (or as an overlay strip) that shows:
- Access granted / denied events
- File access logs
- Corruption detections
- Gate threshold warnings
Each entry auto-expires after 8s and slides in from the right edge.

---

## SECTION D — Terminal System Depth

**Goal:** The terminal should feel like a real operator session on degraded hardware, not a clean web CLI.

### D1. Inline file rendering for narrative `FILES`
*(See also A3)* — when `FILES` entries are opened, render them with full typewriter animation and the existing line-type system (`b`, `d`, `a`, `r`, `n`). Add a file header showing name, tier, and integrity before the body.

### D2. Expand autocomplete to be contextual and tier-aware
**File:** `terminal.js` · keydown Tab handler (~line 1631)

- Complete `open [partial]` against both `ARCHIVE` and `FILES` keys
- Complete `decrypt [partial]` only against files that have cipher content
- Show a brief inline hint when Tab finds multiple matches: `  [TAB] 3 matches — type more`
- For locked files, complete the name but then show `  [LOCKED] Clearance DELTA required`

### D3. More stateful command responses
**File:** `terminal.js`

- `scan` should check which files have been opened and reference them: "Residual access signature detected in [LAST_OPENED_FILE]"
- `status` should show different text at different clearance levels and reference how many narrative files remain unopened
- `whoami` should evolve: after 4+ minutes uptime, append a line noting the unusually long session and flagging it

### D4. Richer command feedback pacing
**File:** `terminal.js`

- `scan` currently resolves instantly. Change it to simulate a multi-stage process: emit "Probing sector 0x00FF..." lines at 300ms intervals (3–4 of them) before showing results
- `decrypt` (successful) should show character-scrambling animation before revealing plaintext — print garbled chars that resolve to the correct string over 1.5s
- `access` (success) should use the full glitch + sweep sequence with a longer pause before clearance lines appear

### D5. Hidden command chains and secret paths
**File:** `terminal.js`

Add commands that are not listed in `help` but respond meaningfully:
- `trace [signal]` — echoes back a fake triangulation sequence ending in `[LOCATION MASKED]`
- `locate lark` — outputs the last known grid coordinates with `[CORRUPTED]` on the third line
- `recover` — shows a list of "partially recoverable" sectors with % estimates and suggests running `scan` first
- `override` — triggers the warning overlay (same as `sudo` but with different lore text)
- `analyze [file]` — shows fake spectral/metadata output for any file, even locked ones (shows the existence of the file without revealing content)
- `extract [file]` — tier-gated command that produces a raw hex dump (fake) of a file body with some readable ASCII fragments embedded
- `signal` — shows current 432 Hz detection status and carrier origin node count
- `auth` — shows current auth token and rotates it (see D6)
- `elevate` — attempts to self-elevate clearance, gets rejected with a logged incident (flavorful)

### D6. Rotating authentication tokens
**File:** `terminal.js` · `#auth-token` in diagnostics panel

`#auth-token` shows `--------` forever. Replace with a token that:
- Generates a random 8-char hex string on boot
- Rotates every 45 seconds with a brief scramble animation
- Is referenced in the `auth` command output
- If the user types the current token as a command, they get a secret response

---

## SECTION E — Immersive Live Systems

**Goal:** The interface should feel alive with ambient processes — not a static display.

### E1. Radar canvas animation
**File:** `terminal.js` · `#radar-canvas`

The canvas is blank. Add:
- Dark green circle background with concentric range rings (low opacity)
- A rotating sweep arm (line from center, rotating at ~6 RPM) with a trailing phosphor fade
- 3–5 blip dots that appear where the sweep crosses them, fade over ~4 seconds
- Blip positions shift slightly each rotation (simulating real signal detection)
- On `scan` command, briefly increase sweep speed and add 2 extra blips

### E2. Waveform canvas animation
**File:** `terminal.js` · `#wave-canvas`

Add a scrolling oscilloscope-style display:
- A slow 432 Hz sine wave as the baseline
- Slight noise jitter on each amplitude sample
- Amplitude pulses when certain commands are run (`resonance`, `432`, `open RESONANCE_ANALYSIS.TXT`)
- Brief flatline + recovery if a system instability event fires (see B5)

### E3. Signal integrity live fluctuation
**File:** `terminal.js` · `#sig-fill`, `#sig-pct`

Replace the static 78% CSS value with a JavaScript-driven value:
- Baseline 78%, drifts ±5% on a slow sine curve (~60s period)
- Brief drops of 15–25% during instability events (see B5) then recovers over 3s
- Color shifts from green → amber when below 60%, red when below 40%

### E4. Memory display and temperature drift
**File:** `terminal.js` · `#mem-val`, `#diag-temp`

- `#mem-val`: set to `187/256K` on boot and slowly increase to `211/256K` over the session (1 unit per minute)
- `#diag-temp`: start at 61°C on boot and slowly climb to ~71°C over 8 minutes. Exceeds 70°C after 7 min and changes color to amber.

### E5. Event log population
**File:** `terminal.js` · `#event-log`

Add a `logEvent(text, type)` helper that prepends timestamped entries to `#event-log`:
- Timestamp format: `HH:MM:SS` in dim color
- Text in standard green
- Max 8 visible entries, oldest removed silently
- Log on: every `open`, every `access` attempt, every `decrypt`, every gate alert threshold, every instability event

---

## SECTION F — Narrative & Storytelling

**Goal:** The archive should feel like a real organization's internal wreckage — fragmented, inconsistent, haunted by the people who left. The user should be building a picture, not reading a story.

### F1. Strengthen environmental inconsistencies across files
**File:** `terminal.js` · `FILES` entries

- Add a timestamp discrepancy between `WELCOME.LOG` (1994-03-08) and `ARCHIVIST_FINAL.LOG` (1994-03-07) that implies the welcome file was written *after* the archivist disappeared — never explain this
- In `PERSONNEL.LOG`, the count of "3 additional records unreadable" should not match the actual number of named missing personnel when the user counts them
- Add a `SYSTEM_NOTES.DAT` file (GUEST tier) that is just system log fragments — mostly corrupted, but contains one line that directly contradicts something stated in `WELCOME.LOG`

### F2. Add a `SYSTEM_NOTES.DAT` file
**File:** `terminal.js` · `FILES` object

New GUEST-tier file. Body:
- Mostly hex-like garbage with occasional readable ASCII fragments
- One legible line: a maintenance timestamp from 1971, predating the stated archive open date of 1947-07-08 (another contradiction)
- One legible line: "SUBJECT B — SEE ALSO: ████████████" (refers to something never filed)
- No resolution. No explanation.

### F3. Let the archive respond differently based on session length
**File:** `terminal.js`

- After 5+ minutes: `help` output adds a dim footnote: `  [Session extended. Signal strength: elevated.]`
- After 7+ minutes: `whoami` adds `  SESSION DURATION: ANOMALOUS — REVIEW FLAGGED`
- After full 8 minutes: before the gate closes, a single unqueued line appears in the output: `  [Someone else is in this archive.]`

### F4. Occasional ambient output from the terminal itself
**File:** `terminal.js`

Every 90–120 seconds (random), the terminal emits a one-line unannounced message without a prompt:
- `  [PROCESS: bg-monitor-07 — still active]`
- `  [RESONANCE EVENT LOGGED — 432.000 Hz — DURATION: 0.004s]`
- `  [QUERY FROM NODE 4 — DENIED — NO ACTIVE NODE 4]`
- `  [LARK: SESSION TOKEN DETECTED — EXPIRED 1994-03-07]`

These appear between commands, never interrupt input, and are never explained.

---

## SECTION G — Boot & Loading Sequences

**Goal:** Boot should feel like a real machine struggling back online after 31 years in standby, not a styled text crawl.

### G1. Multi-stage boot with subsystem initialization
**File:** `terminal.js` · `BOOT` array and `runBoot()`

Restructure the boot sequence into distinct phases with pauses between them:
- **Phase 1 — Hardware init** (fast): BIOS check, chip revision, power test → current content is mostly fine here
- **Phase 2 — Storage scan** (medium, 600ms pause before): sector scan with a progress bar that fills character by character, then reports bad sector count
- **Phase 3 — Archive index** (medium): loads archive directory, shows count of files found, flags corrupted entries
- **Phase 4 — Security** (slow, dramatic): identity verification FAILED, IP flagged, session monitored, legal notice → current content is fine
- **Phase 5 — Ready state** (slow): current final lines

Add a 400–800ms `setTimeout` pause between each phase to simulate subsystem handoff.

### G2. Cinematic warning-to-terminal transition
**File:** `terminal.js` · `showStartupWarning()` and `runBoot()`

Currently: dismiss warning → boot text immediately appears.

Improve: after dismiss, do a full scan sweep, then a 300ms blank screen, then a CRT power-on simulation (screen goes from 0% brightness to 100% over 400ms via a fading overlay), then boot text begins.

### G3. Scan and decrypt sequences feel slower and heavier
*(See also D4)* — scan should take 3–5 seconds of progressive output before results. Decrypt success should show character-scramble → resolve. Both should feel like the machine is doing real work.

---

## SECTION H — Animation & Audio

**Goal:** Every motion should feel like it has a mechanical reason. Nothing smooth or modern.

### H1. Animation audit — remove modern-feeling easing
**File:** `terminal.css`

- Replace any `ease` or `ease-in-out` on transitions with `linear` or `step-end` where appropriate
- The gate fill transition is currently `0.9s linear` — good, keep it
- The `sig-fill` transition is `1s ease` — change to `linear`
- Badge transition is `color .4s, border-color .4s` with implicit ease — change to `linear`

### H2. Radar sweep motion
*(See also E1)* — use `requestAnimationFrame` for the sweep rotation rather than CSS animation so it can respond to game state (speed up during `scan`, pause during instability events).

### H3. Optional ambient audio layer
**File:** new `audio.js` or inline in `terminal.js`

- A low, continuous CRT hum (generated via Web Audio API OscillatorNode at 60 Hz + harmonics, no audio file needed)
- Brief relay click sound (short noise burst via AudioContext) on command submit
- Static burst (band-limited noise, 80ms) on glitch events
- Sonar ping (sine wave with exponential decay) when radar blips appear

All audio: off by default. A small `[AUDIO: OFF]` toggle in the status bar enables it. Volume starts at 20% maximum. Never autoplay.

---

## SECTION I — New Commands

**Goal:** Reward exploration. Every unlisted command that works feels like finding a secret.

| Command | Behaviour |
|---------|-----------|
| `trace [target]` | Fake triangulation sequence, ends in `[LOCATION MASKED]` |
| `locate [name]` | `locate lark` returns last known grid coords with corrupted third line |
| `recover` | Lists "partially recoverable" sectors, suggests `scan` first |
| `override` | Warning overlay (different lore text than `sudo`) |
| `analyze [file]` | Metadata output for any file (locked files show existence but not content) |
| `extract [file]` | Tier-gated; fake hex dump with readable ASCII fragments embedded |
| `signal` | 432 Hz detection status, carrier origin node count |
| `auth` | Shows current auth token, rotates it |
| `elevate` | Self-elevation attempt → rejected with logged incident |
| `archive` | Alias for `ls` with slightly different lore framing |
| `nodes` | Lists fake network nodes — most offline, one responding with no registered address |

---

## SECTION J — Typography

**Goal:** Stronger contrast between operational text, system labels, warnings, and metadata. Headers should feel stamped, not typeset.

### J1. Panel header identity
**File:** `terminal.css` · `.panel-hdr`

- Increase letter-spacing to `0.22em`
- Add `text-transform: uppercase` (already uppercase in HTML but make it enforced)
- Add a 1px left border in bright green at 40% opacity to give headers a military tab feel
- Slightly increase font size to 14px for the VT323 headers

### J2. Metadata text contrast
**File:** `terminal.css`

- Small metadata (`8px` stat labels) should use `letter-spacing: 0.12em` and color `rgba(79,175,79,0.5)` — dimmer than current to feel more like faded documentation
- Stat values should stay at current green but add `font-variant-numeric: tabular-nums` to all of them for alignment

### J3. Corrupted glyph support in typewriter
**File:** `terminal.js` · `typeChar()`

When typing lines of type `d` (dim / corrupted), occasionally (15% chance per character) show a wrong character for one tick before correcting it. Implement as: at each tick, with 15% probability, display a random `CORRUPT_CHARS` glyph for one frame before advancing to the correct character. This makes corrupted-tier text feel genuinely unstable.

---

## SECTION K — Technical & Code Structure

### K1. Separate concerns into modules
Currently everything is in one 1,675-line file. Suggested split (can be done incrementally):
- `terminal-data.js` — `FILES`, `ARCHIVE`, `BOOT`, `DECRYPTERS`, `CODES`, `CFG`
- `terminal-ui.js` — DOM refs, clock, badge, clearance display, nav tree
- `terminal-effects.js` — noise, radar, waveform, dust, instability events
- `terminal-commands.js` — all `do*` functions and `dispatch()`
- `terminal.js` — entry point, boot, gate timer

### K2. Archive can evolve per session
Add a `WORLD_STATE` object alongside `S` that tracks:
- `filesOpened: []` — array of file names the user has opened
- `commandsRun: []` — array of commands used
- `scanCount: 0`

Use `WORLD_STATE` to make command responses contextual (see D3) and to drive ambient terminal messages (see F4).

### K3. Favicon and meta tags
**File:** `index.html`

- Add inline SVG favicon using a `data:` URI (phosphor green `◈` on black)
- Add `<meta name="description" content="MNEMOSYNE SYSTEMS — Deep Watch Protocol Archive Terminal. Restricted access.">`
- Add Open Graph tags for title and description

---

## Priority Order

Work in this sequence to get the most impact earliest:

1. **A1–A5** — Fix the bugs. Decrypt must work. Files must open. Uptime must tick. Clearance must update.
2. **E1, E2** — Draw the radar and waveform. They're blank canvases that immediately read as broken.
3. **C3** — Populate the nav tree. It's the most visible empty element on screen.
4. **B1, B2** — Deepen CRT effects. More age, more isolation, stronger glow.
5. **G1, G2** — Expand boot into a multi-stage sequence. First impression matters most.
6. **D5, I** — Add hidden commands. Rewards curiosity immediately.
7. **F3, F4** — Session-length responses and ambient terminal output. Makes the machine feel alive.
8. **C2** — Draggable floating windows. Escalates the console feel dramatically.
9. **H3** — Audio layer (optional, off by default).
10. **K1** — Code split (do last, purely structural, doesn't change experience).

---

## Summary Table

| ID | Category | Severity | Description |
|----|----------|----------|-------------|
| A1 | Bug | Critical | `decrypt` ignores `DECRYPTERS` — puzzle broken |
| A2 | Bug | Critical | `ls -a` passes boolean to folder lookup |
| A3 | Bug | Critical | Narrative `FILES` unreachable via `open` |
| A4 | Bug | Medium | Uptime always `00:00:00` |
| A5 | Bug | Medium | Clearance panel never updates |
| B1 | Visual | High | Push CRT effects — more age, more imperfection |
| B2 | Visual | High | Strengthen "only light source" feel |
| B3 | Visual | Medium | Chromatic aberration on glitch events |
| B4 | Visual | Low | Phosphor ghosting trails |
| B5 | Visual | High | Ambient screen instability events |
| C1 | Layout | Medium | Mechanical panel borders and inset depth |
| C2 | Layout | High | Draggable floating diagnostic windows |
| C3 | Layout | High | Deep nav tree with expandable folders |
| C4 | Layout | Medium | System event notification strip |
| D1 | Terminal | High | Inline rendering for narrative FILES |
| D2 | Terminal | Medium | Contextual tier-aware autocomplete |
| D3 | Terminal | Medium | Stateful command responses |
| D4 | Terminal | High | Heavier feedback pacing (scan, decrypt) |
| D5 | Terminal | High | Hidden command chains |
| D6 | Terminal | Medium | Rotating authentication tokens |
| E1 | Systems | High | Radar canvas animation |
| E2 | Systems | High | Waveform oscilloscope animation |
| E3 | Systems | Medium | Signal integrity live fluctuation |
| E4 | Systems | Medium | Memory and temperature drift |
| E5 | Systems | Medium | Event log population |
| F1 | Narrative | High | Environmental inconsistencies across files |
| F2 | Narrative | Medium | `SYSTEM_NOTES.DAT` — new contradictory file |
| F3 | Narrative | High | Session-length-aware terminal responses |
| F4 | Narrative | High | Ambient unannounced terminal output |
| G1 | Boot | High | Multi-stage subsystem boot sequence |
| G2 | Boot | Medium | Cinematic warning-to-terminal transition |
| G3 | Boot | Medium | Heavier scan/decrypt sequences |
| H1 | Animation | Low | Animation audit — remove modern easing |
| H2 | Animation | Medium | Radar sweep via `requestAnimationFrame` |
| H3 | Audio | Low | Optional Web Audio ambient layer |
| I  | Commands | High | 11 new hidden/unlisted commands |
| J1 | Typography | Low | Panel header industrial identity |
| J2 | Typography | Low | Metadata text contrast |
| J3 | Typography | Medium | Corrupted glyph jitter in typewriter |
| K1 | Technical | Low | Separate into module files |
| K2 | Technical | Medium | `WORLD_STATE` for contextual responses |
| K3 | Technical | Low | Favicon and meta tags |
