# MNEMOSYNE Terminal — Developer Documentation

> Fictional 1994-era classified archive terminal. Vanilla JS/CSS, no build step.

---

## File Structure

```
alien-website/
├── index.html          — Single page, all markup, ordered script/link tags
├── DOCS.md             — This file
├── terminal.js         — Stub (superseded, code in js/)
├── terminal.css        — Stub (superseded, code in css/)
│
├── js/                 — Load order is strict (see below)
│   ├── data.js         — All game data, constants, narrative content (744 lines)
│   ├── state.js        — Player state, persistence, caesar cipher (23 lines)
│   ├── ui.js           — DOM refs, clocks, badge, auth token, notifs (156 lines)
│   ├── typewriter.js   — Output engine, line rendering, animations (131 lines)
│   ├── effects.js      — Canvas, CRT effects, nav tree, float windows (507 lines)
│   ├── gate.js         — Gate timer, alerts, session close sequence (137 lines)
│   ├── commands.js     — All terminal commands, dispatch, file resolver (1038 lines)
│   └── main.js         — Boot sequence orchestration (99 lines)
│
└── css/                — Load order is strict (later files override earlier)
    ├── base.css        — CSS variables (color palette), reset, body (44 lines)
    ├── crt.css         — CRT screen, all animations, overlays, float windows (333 lines)
    ├── layout.css      — Three-panel workspace, status bar, gate bar (251 lines)
    └── components.css  — Output lines, panels, input row, radar, waveform (194 lines)
```

---

## JS Load Order (Critical)

No bundler. Each file runs in global scope. Every file can only use what was defined by a previously loaded file.

```
data.js → state.js → ui.js → typewriter.js → effects.js → gate.js → commands.js → main.js
```

**Why this order:**
- `data.js` — no dependencies; defines `CFG`, `ARCHIVE`, `FILES`, `CODES`, `BOOT_*`, `rand()`, etc.
- `state.js` — needs `SAVE_KEY` (data.js); defines `S`, `persist()`, `caesar()`
- `ui.js` — needs `S`, `TIERS` (data+state); defines `$out`, `$in`, `logEvent()`, `lockInput()`, etc.
- `typewriter.js` — needs `$out`, `rand` (ui+data); defines `queueLines()`, `appendLnDirect()`, etc.
- `effects.js` — needs everything above; defines `buildNavTree()`, `initRadar()`, `doGlitch()`, etc.
- `gate.js` — needs `GATE_KEY`, `appendLnDirect`, `lockInput` (data+ui+typewriter); defines `initGate()`
- `commands.js` — needs all modules; defines `dispatch()` and all `do*()` functions
- `main.js` — needs all modules; runs `runBoot()` as entry point

---

## Key Global Variables

| Variable | Defined in | Description |
|---|---|---|
| `S` | state.js | Player state `{clearance, decrypted[], attempts{}}` |
| `$out` | ui.js | `#output` DOM element |
| `$in` | ui.js | `#cmd-in` input element |
| `$badge` | ui.js | `#badge` DOM element |
| `operatorIP` | ui.js | Visitor's IP fetched from api.ipify.org |
| `sessionStart` | ui.js | `Date.now()` at page load |
| `inputLocked` | ui.js | Boolean; `true` while typewriter is running |
| `typeRunning` | typewriter.js | Boolean; `true` while queue is draining |
| `bootComplete` | main.js | Set `true` after boot finishes; gates ambient events |
| `authToken` | ui.js | Current 8-char auth token (rotates every 45s) |
| `WORLD_STATE` | commands.js | Session tracking: files opened, commands run, scan count |
| `cmdOverride` | commands.js | Function to intercept next input (for multi-step flows) |
| `hist` | commands.js | Command history array (up/down arrow navigation) |

---

## CSS Variables (base.css)

```css
--fg:       #7CFF7C   /* primary green */
--fg-hi:    #B8FFB8   /* bright highlight */
--fg-dim:   #4FAF4F   /* dimmed text */
--fg-dark:  #1E4A1E   /* very dim, borders */
--fg-faint: #0A1A0A   /* near-black tint */
--amber:    #FFB347   /* warning color */
--red-hi:   #FF4444   /* alert/error color */
--glow:     0 0 8px rgba(124,255,124,.55)     /* standard text shadow */
--glow-hi:  0 0 12px rgba(184,255,184,.7)     /* bright glow */
--glow-a:   0 0 8px rgba(255,179,71,.55)      /* amber glow */
--glow-r:   0 0 8px rgba(255,68,68,.55)       /* red glow */
--room:     #000000                            /* background behind CRT */
```

---

## Typewriter Engine (typewriter.js)

### `queueLines(arr, speed, done)`

Enqueues an array of `[type, text]` pairs for typed output. Calls `done()` when all lines finish.

- `speed`: `'fast'` (3ms/char), `'norm'` (18ms/char), `'slow'` (40ms/char)
- Type codes: `'n'` normal, `'b'` bright, `'d'` dim, `'a'` amber, `'r'` red, `''` blank line

```javascript
queueLines([
  ['b', '  SYSTEM ONLINE'],
  ['d', '  Initializing...'],
  ['', ''],
  ['n', '  Ready.'],
], 'fast', () => unlockInput());
```

### `appendLnDirect(type, text)`

Appends a line immediately without typewriter animation. Used for ambient messages and gate ticks.

### `appendCmd(str)`

Appends the user's command as a styled `.ln-cmd` line (echoes input before response).

### `flushTyping()`

Sets `typeSkip = true` — causes the current typewriter sequence to render instantly. Bound to spacebar during typing.

### Line type codes

| Code | Class | Color |
|---|---|---|
| `'n'` | `.ln-n` | Primary green |
| `'b'` | `.ln-b` | Bright green |
| `'d'` | `.ln-d` | Dim green (no bloom anim; 15% chance of corrupt glyph per char) |
| `'a'` | `.ln-a` | Amber |
| `'r'` | `.ln-r` | Red |
| `''` | `.ln-` | Empty/spacer line (half height) |

---

## Command System (commands.js)

### `dispatch(raw)`

Main entry point for all user input. Called by the keydown handler on Enter, and directly by nav tree click handlers.

Flow:
1. Trims input, echoes via `appendCmd()`
2. Checks `cmdOverride` (for multi-step prompts)
3. Checks if input matches current `authToken` (secret command)
4. Routes to the appropriate `do*()` function

### Adding a new command

1. Add a `case 'mycommand':` to the `switch` in `dispatch()`
2. Write `function doMyCommand() { ... }` in `commands.js`
3. Optionally add it to the `doHelp()` output

### `resolveFile(input)`

Looks up a filename string and returns one of:
- `{ inline: true, name, file }` — a narrative FILES entry the user can access
- `{ locked: true, name, tier }` — a narrative FILES entry the user cannot access
- `{ external: true, name, folder, f }` — a file in the ARCHIVE filesystem
- `null` — file not found

### `cmdOverride`

Set this to a function to intercept the *next* input before dispatch. Used for multi-step commands (e.g., the reset confirmation prompt).

```javascript
cmdOverride = (input) => {
  if (input.toLowerCase() === 'yes') { /* do the thing */ }
  else { appendLnDirect('d', '  Cancelled.'); }
  unlockInput();
};
```

### `WORLD_STATE`

Session tracking object reset on page reload (not persisted):

```javascript
{
  filesOpened:  [],          // file names opened this session
  commandsRun:  [],          // command verbs run this session
  scanCount:    0,           // number of `scan` commands run
  signalWinShown:    false,  // prevents signal monitor float window showing twice
  personnelWinShown: false,  // prevents personnel float window showing twice
}
```

---

## Commands Reference

### Standard commands (shown in `help`)

| Command | Description |
|---|---|
| `help` | List available commands |
| `ls [folder]` | List files in root or a folder; `ls -a` shows hidden |
| `open <file>` | Open/read a file (also `read`, `cat`) |
| `access <code>` | Enter an access code to elevate clearance |
| `decrypt <file>` | Attempt decryption on an encrypted file |
| `scan` | Run sector scan (reveals lore, triggers radar blips) |
| `whoami` | Display operator identity and clearance |
| `date` | Show current/archive system date |
| `status` | System health report |
| `reset` | Wipe saved state (with confirmation) |
| `ping` | Network diagnostic |
| `clear` | Clear terminal output |

### Hidden commands (not in `help`)

| Command | Description |
|---|---|
| `trace <target>` | Trace a signal/entity |
| `locate <name>` | Location query for entities/files |
| `recover` | Attempt data recovery |
| `override` | Override protocol (partial, gated) |
| `analyze <file>` | Deep analysis of a file |
| `extract <file>` | Data extraction attempt |
| `signal` | Check signal anomalies |
| `auth` | Display auth token info |
| `elevate` | Attempt unauthorized elevation |
| `archive [folder]` | Low-level archive access |
| `nodes` | List network nodes |

### Easter eggs

| Command | Description |
|---|---|
| `sudo` | Classic sudo joke |
| `hi` / `hello` | Greeting response |
| `xyzzy` | ZORK reference |
| `bob` / `skinny` | In-universe easter egg |
| `lark` | References the missing field liaison |
| `resonance` | 432 Hz lore |
| `432` | Frequency easter egg |
| `matrix` | Film reference |
| `we are here` | Lore phrase |
| `third stone` | Lore phrase |
| `<auth token>` | Typing the current auth token triggers a secret |

---

## Clearance System (state.js + data.js)

Four tiers, unlocked via `access <code>`:

| Level | Tier | Label | Unlocks |
|---|---|---|---|
| 0 | GUEST | `clr-0` | Basic files only |
| 1 | DELTA | `clr-1` | DELTA-tier files |
| 2 | SIGMA | `clr-2` | SIGMA-tier files |
| 3 | OMEGA | `clr-3` | OMEGA_FINAL.DAT |

State is persisted to `localStorage` under the key in `CFG.saveKey`. Clear with the `reset` command or `localStorage.clear()`.

**Codes** are defined in `CODES` (data.js). Entering the correct code calls `doAccess()` which increments `S.clearance` and calls `persist()`.

---

## Data Structures (data.js)

### `ARCHIVE`

Filesystem object for archive folders:

```javascript
ARCHIVE = {
  'SIGNALS': {
    files: [
      { name: 'BROADCAST_01.DAT', tier: 0, modified: '1994-02-14', size: '2.3 KB' },
      // ...
    ]
  },
  // ...
}
```

### `FILES`

Narrative inline files (the lore documents):

```javascript
FILES = {
  'WELCOME.LOG': {
    tier: 0,
    modified: '1994-03-09',  // intentionally dated AFTER ARCHIVIST_FINAL.LOG
    body: [
      ['b', '  MNEMOSYNE SYSTEMS — WELCOME'],
      ['n', '  ...'],
    ]
  },
  // ...
}
```

`body` is an array of `[type, text]` pairs — same format as `queueLines()`.

### `DECRYPTERS`

Map of encrypted filenames to handler functions:

```javascript
DECRYPTERS = {
  'SUBJECT_B.TXT':      () => [ /* decoded lines */ ],
  'VESSEL_PROTOCOL.TXT': () => [ /* decoded lines */ ],
  'OMEGA_FINAL.DAT':    null,  // handled separately with clearance gate
}
```

### Boot sequences

Split into phases for staged cinematic boot:

- `BOOT_PHASE1` — BIOS splash, hardware check
- `BOOT_PHASE2_HEADER` / `BOOT_PHASE2_RESULT` — sector scan wrapper
- `BOOT_PHASE4` — security alert (visitor IP injected at runtime)
- `BOOT_PHASE5` — final boot messages, access granted

---

## Effects System (effects.js)

### Radar (`initRadar()`)

Canvas-based rotating sweep at 12 RPM. Phosphor trail (80-step fade). 5 static blips with individual fade timers.

- `triggerRadarScan()` — add extra blips, speed up to 18 RPM for 4s

### Waveform (`initWaveform()`)

Scrolling 432 Hz sine wave with noise jitter.

- `triggerWavePulse()` — spike amplitude for 1.5s
- `triggerWaveFlatline(ms)` — flatline for `ms` milliseconds

### Signal Integrity (`updateSignal()`)

Sine-wave drift between 60–95%. Color shifts amber below 60%, red below 40%.

- `dropSignal(amount, recoverMs)` — instantly drop by `amount`%, recover after `recoverMs`

### Memory / Temperature (`updateMemTemp()`)

Simulates memory usage 187→211/256K and temperature 61→75°C over 8 minutes. Temperature turns amber above 70°C.

### CRT Instability (`schedInstability()`)

Fires every 90–180s after boot. Three random effects:
1. Horizontal sync shift (`translateX`)
2. Brightness collapse to 40%
3. Wide rolling bar

### Ambient Output (`schedAmbient()`)

Fires every 90–120s when not typing. Appends a dim message referencing background processes, resonance events, denied queries, or Lark's expired session token.

### Floating Windows (`createFloatWin(id, title, bodyHTML, autoCloseMs)`)

Creates a draggable overlay panel. Pass `autoCloseMs` to auto-dismiss. Used for Signal Monitor and Personnel Status windows.

### Nav Tree (`buildNavTree()`)

Renders `#nav-tree` with expandable archive folders and a `[NARRATIVE]` section. Click handlers call `dispatch()` directly.

---

## Gate System (gate.js)

8-minute countdown. Start time stored in `localStorage` under `CFG.gateKey` so it persists across page reloads (same session).

- `initGate()` — reads/sets start time, starts `gateTick()` interval
- `gateTick()` — fires every second, updates UI, fires events at specific remaining times
- `triggerGateClose()` — initiates close sequence (disables input, fades terminal)
- `showGateOverlay()` — shows the "ACCESS REVOKED" overlay with 3s countdown

**Special events in `gateTick()`:**
- At 5 min remaining: notification warning
- At 2 min remaining: amber alert in output
- At 1 min remaining: red warning + signal drop
- At 1 sec remaining: appends `[Someone else is in this archive.]`

---

## Boot Sequence (main.js)

```
runBoot()
  └─ showStartupWarning()     — security violation overlay, wait for keypress
       └─ doSweep()           — scan line sweep
            └─ black overlay → fade in
                 └─ runBootPhase1()   — BIOS / hardware check lines
                      └─ runBootPhase2()  — sector scan animation + archive index
                           └─ runBootPhase4()  — security alert (injects visitor IP)
                                └─ runBootPhase5()  — final boot, unlock input
```

`bootComplete = true` is set in Phase 5. Ambient events (`schedInstability`, `schedAmbient`) only fire after this.

---

## Adding New Content

### New narrative file

1. Add entry to `FILES` in `data.js`:
```javascript
'MY_FILE.LOG': {
  tier: 1,               // 0=GUEST, 1=DELTA, 2=SIGMA, 3=OMEGA
  modified: '1993-11-12',
  body: [
    ['b', '  MY_FILE.LOG'],
    ['d', '  MODIFIED: 1993-11-12'],
    ['', ''],
    ['n', '  Content here...'],
  ]
}
```
2. The file automatically appears in `ls`, `open`, nav tree, and autocomplete.

### New archive folder file

Add to the appropriate folder in `ARCHIVE[folderName].files`:
```javascript
{ name: 'NEW_DATA.DAT', tier: 0, modified: '1994-01-01', size: '1.1 KB' }
```

### New command

```javascript
// In dispatch() switch:
case 'mycommand': doMyCommand(a.join(' ')); break;

// New function:
function doMyCommand(arg) {
  queueLines([
    ['b', '  MY COMMAND'],
    ['n', `  Arg: ${esc(arg)}`],
  ], 'fast', unlockInput);
}
```

### New boot phase message

Add lines to the appropriate `BOOT_PHASE*` array in `data.js`. Format: `['type', 'text']`.

---

## Lore / Narrative Reference

- **MNEMOSYNE SYSTEMS INC.** — the organization running the archive
- **Deep Watch Protocol (DWP)** — classification level for this archive
- **NODE 7 / DWP-NODE-007-ALPHA** — this terminal's identity
- **LARK** — field liaison, missing; last token expired 1994-03-07
- **SUBJECT B** — classified entity; referenced in SYSTEM_NOTES.DAT
- **432 Hz** — recurring resonance frequency; appears in waveform, FREQ display, ambient logs
- **THIRDSTONE** — referenced in burn-in text; significance unspecified
- **ARCHIVIST PRIME** — last log: 1994-03-07 03:42:19; no further logs
- **Archive open date: 1947-07-08** — but SYSTEM_NOTES.DAT is dated 1971 (24-year gap, unexplained)
- **"I AM STILL HERE / WE ARE HERE"** — burn-in text; implies entity presence

**Environmental inconsistencies (intentional narrative devices):**
- `WELCOME.LOG` is dated after `ARCHIVIST_FINAL.LOG`
- `PERSONNEL.LOG` headcount is off
- 24-year gap in archive maintenance records

---

## Development Notes

- No bundler, no framework, no build step. Open `index.html` directly in a browser.
- All JS is global scope. Variable naming conflicts between files will silently break things.
- `inputLocked` and `typeRunning` are both checked before accepting input. Always call `unlockInput()` at the end of every command flow (including the `done` callback of `queueLines()`).
- Nav tree click handlers call `dispatch()` directly — do not use fake keyboard events.
- The `caesar()` function in state.js is used for the access code cipher chain. Codes in `CODES` are pre-shifted; `doAccess()` applies the shift before comparison.
