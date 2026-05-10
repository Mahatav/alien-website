/* ═══════════════════════════════════════════════════════════════
   commands.js — dispatch(), all commands, file resolver, input events
   Depends on: all other modules
═══════════════════════════════════════════════════════════════ */

// ── WORLD STATE ────────────────────────────────────────────────
const WORLD_STATE = {
  filesOpened:  [],
  commandsRun:  [],
  scanCount:    0,
  signalWinShown:    false,
  personnelWinShown: false,
};

function sessionMinutes() { return (Date.now() - sessionStart) / 60000; }

// ── DISPATCH ───────────────────────────────────────────────────
function dispatch(raw) {
  const t = raw.trim();
  if (!t) return unlockInput();

  if (hist[0] !== t) hist.unshift(t);
  if (hist.length > 60) hist.pop();
  histIdx = -1;

  appendCmd(t);
  playRelayClick();
  WORLD_STATE.commandsRun.push(t.toLowerCase().split(' ')[0]);

  if (cmdOverride) { const fn = cmdOverride; cmdOverride = null; fn(t); return; }

  const p = t.split(/\s+/);
  const v = p[0].toLowerCase();
  const a = p.slice(1);

  // Secret: typing current auth token
  if (v.toUpperCase() === authToken) { doTokenSecret(); return; }

  switch (v) {
    case 'help':    doHelp();                               break;
    case 'ls':      doLs(a.includes('-a'), a.find(x => x !== '-a')); break;
    case 'clear':   doClear();                              break;
    case 'open': case 'read': case 'cat':
                    doOpen(a.join(' '));                    break;
    case 'access':  doAccess(a[0]);                        break;
    case 'decrypt': doDecrypt(a.join(' '));                 break;
    case 'scan':    doScan();                               break;
    case 'whoami':  doWhoami();                             break;
    case 'date':    doDate();                               break;
    case 'status':  doStatus();                             break;
    case 'reset':   doReset();                              break;
    case 'ping':    doPing();                               break;
    // Hidden commands
    case 'trace':   doTrace(a.join(' '));                   break;
    case 'locate':  doLocate(a.join(' '));                  break;
    case 'recover': doRecover();                            break;
    case 'override': doOverride();                          break;
    case 'analyze': doAnalyze(a.join(' '));                 break;
    case 'extract': doExtract(a.join(' '));                 break;
    case 'signal':  doSignal();                             break;
    case 'auth':    doAuth();                               break;
    case 'elevate': doElevate();                            break;
    case 'archive': doArchive(a.find(x => x !== '-a'), a.includes('-a')); break;
    case 'nodes':   doNodes();                              break;
    // Easter eggs
    case 'sudo':    doSudo();                               break;
    case 'hi': case 'hello': doHello();                    break;
    case 'xyzzy':   doXyzzy();                              break;
    case 'bob': case 'skinny': doBob();                    break;
    case 'lark':    doLark();                               break;
    case 'resonance': doResonanceEgg();                    break;
    case '432':     do432();                                break;
    case 'matrix':  doMatrix();                             break;
    case 'we':      a[0]==='are'&&a[1]==='here' ? doWeAreHere() : doUnknown(v); break;
    case 'third':   a[0]==='stone' ? doThirdStone() : doUnknown(v); break;
    default:        doUnknown(v);
  }
}

// ── HELP ───────────────────────────────────────────────────────
function doHelp() {
  const mins = sessionMinutes();
  const lines = [
    ['d', '=================================================='],
    ['b', '  COMMAND REFERENCE  //  TERMINAL v2.1.4'],
    ['d', '=================================================='],
    ['',  ''],
    ['a', '  NAVIGATION'],
    ['n', '  ls              List archive directories'],
    ['n', '  ls -a           List all files (locked shown)'],
    ['n', '  open [file]     Read a file'],
    ['n', '  clear           Clear terminal output'],
    ['',  ''],
    ['a', '  INVESTIGATION'],
    ['n', '  scan            Scan for encrypted/hidden data'],
    ['n', '  decrypt [file]  Attempt to decrypt file content'],
    ['n', '  access [code]   Submit a clearance access code'],
    ['',  ''],
    ['a', '  SYSTEM'],
    ['n', '  whoami          Operator status'],
    ['n', '  date            System and archive timestamps'],
    ['n', '  status          Node health diagnostics'],
    ['n', '  reset           Wipe all progress (confirm req)'],
    ['',  ''],
    ['d', '  TAB autocompletes filenames.'],
    ['d', '  ↑ ↓  cycle command history.'],
    ['d', '  ENTER while output is typing: skip to end.'],
    ['d', '  Other commands may exist. Explore.'],
    ['d', '=================================================='],
  ];
  if (mins >= 5) {
    lines.push(['d', '  ']);
    lines.push(['d', '  [Session extended. Signal strength: elevated.]']);
  }
  queueLines(lines, 'fast', unlockInput);
}

// ── LS ─────────────────────────────────────────────────────────
function doLs(showAll, folder) {
  if (!folder) {
    const lines = [
      ['d', '=================================================='],
      ['a', '  NODE 7 ARCHIVE  //  DEEP WATCH PROTOCOL'],
      ['d', '  PATH: /archive/dwp/'],
      ['d', '=================================================='],
      ['', ''],
      ['n', '  DIRECTORIES:'],
      ['', ''],
    ];
    for (const key of Object.keys(ARCHIVE)) {
      const n = ARCHIVE[key].files.length;
      lines.push(['b', `  ▶  ${key}/`]);
      lines.push(['d', `     ${n} file${n===1?'':'s'}  —  mod: ${corruptDate()}`]);
    }
    lines.push(['', '']);
    lines.push(['n', '  FILES:']);
    lines.push(['', '']);
    for (const f of ROOT_FILES) {
      lines.push(['n', `  ${f.name.padEnd(32)} mod: ${corruptDate()}`]);
    }
    if (showAll) {
      lines.push(['', '']);
      lines.push(['a', '  NARRATIVE RECORDS:']);
      lines.push(['', '']);
      for (const [name, file] of Object.entries(FILES)) {
        const locked = file.tier > S.clearance;
        const t = locked ? 'r' : 'n';
        const tag = locked ? `[LOCKED — ${TIERS[file.tier]}]` : `mod: ${file.modified}`;
        lines.push([t, `  ${name.padEnd(32)} ${tag}`]);
      }
    }
    lines.push(['', '']);
    lines.push(['d', '  ls [FOLDER]        list folder contents']);
    lines.push(['d', '  open [FOLDER/FILE] open file in new tab']);
    lines.push(['d', '  ls -a              show all including narrative']);
    lines.push(['d', '==================================================']);
    queueLines(lines, 'fast', unlockInput);
  } else {
    const key = folder.toUpperCase().replace(/\/+$/, '');
    const dir  = ARCHIVE[key];
    if (!dir) {
      queueLines([['r', `  ERROR: Directory not found -- "${folder}"`],['d','  Type LS for directory listing.']], 'fast', unlockInput);
      return;
    }
    const lines = [
      ['d', '=================================================='],
      ['a', `  ▶  ${key}/`],
      ['d', `  PATH: /archive/dwp/${key}/`],
      ['d', '=================================================='],
      ['', ''],
    ];
    for (const f of dir.files) {
      const ext = f.name.split('.').pop().toUpperCase();
      const t = ['HTML','PDF'].includes(ext) ? 'b' : 'n';
      lines.push([t, `  ${f.name.padEnd(36)} ${corruptDate()}`]);
    }
    lines.push(['', '']);
    lines.push(['d', `  open ${key}/[FILENAME]  to open in new tab`]);
    lines.push(['d', '==================================================']);
    queueLines(lines, 'fast', unlockInput);
  }
}

// ── CLEAR ──────────────────────────────────────────────────────
function doClear() { $out.innerHTML = ''; unlockInput(); }

// ── OPEN ───────────────────────────────────────────────────────
function doOpen(input) {
  if (!input) {
    queueLines([['r','  USAGE: open [FOLDER/FILE]  or  open [FILE]']], 'fast', unlockInput);
    return;
  }
  const resolved = resolveFile(input);
  if (!resolved) {
    queueLines([['r',`  ERROR: File not found -- "${input}"`],['d','  Use LS to see available files.']], 'fast', unlockInput);
    return;
  }
  if (resolved.locked) {
    logEvent(`DENIED: ${resolved.name}`, 'error');
    showNotif(`ACCESS DENIED — ${TIERS[resolved.tier]} REQUIRED`, 'error');
    queueLines([
      ['r', `  ACCESS DENIED — "${resolved.name}"`],
      ['r', `  CLEARANCE REQUIRED: ${TIERS[resolved.tier]}`],
      ['d', `  Current clearance: ${TIERS[S.clearance]}`],
      ['d', '  Use: access [code]'],
    ], 'fast', unlockInput);
    return;
  }
  if (resolved.inline) {
    WORLD_STATE.filesOpened.push(resolved.name);
    logEvent(`OPEN ${resolved.name}`, 'info');
    showNotif(`FILE ACCESS: ${resolved.name}`, 'info');
    // Show Personnel window after reading PERSONNEL.LOG
    if (resolved.name === 'PERSONNEL.LOG' && !WORLD_STATE.personnelWinShown) {
      WORLD_STATE.personnelWinShown = true;
      setTimeout(() => {
        createFloatWin('win-personnel', '◈ PERSONNEL STATUS', `
          <div style="color:var(--fg-dim);font-size:9px;line-height:1.8">
            <div>[01] ARCHIVIST PRIME <span style="color:var(--amber)">UNKNOWN</span></div>
            <div>[02] DR. ████████████ <span style="color:var(--red-hi)">DECEASED</span></div>
            <div>[03] ███████████████ <span style="color:var(--red-hi)">MISSING</span></div>
            <div>[04] FIELD LIAISON "LARK" <span style="color:var(--red-hi)">MISSING</span></div>
            <div>[05] OBSERVER "THIRD STONE" <span style="color:var(--amber)">CLASSIFIED</span></div>
            <div style="margin-top:6px;color:rgba(155,155,155,0.5)">3 records unreadable</div>
          </div>
        `);
      }, 2000);
    }
    const integrity = resolved.file.integrity ?? (resolved.file.modified.includes('?') ? rand(52, 84) : rand(87, 98));
    const header = [
      ['d', '=================================================='],
      ['b', `  FILE OPENED — ${resolved.name}`],
      ['d', `  CLEARANCE     :  ${TIERS[resolved.file.tier]}`],
      ['d', `  INTEGRITY     :  ${integrity}%`],
      ['d', `  MODIFIED      :  ${resolved.file.modified}`],
      ['d', '=================================================='],
      ['', ''],
    ];
    queueLines([...header, ...resolved.file.body], 'norm', unlockInput);
    return;
  }
  // Archive file — open in new tab
  window.open(resolved.url, '_blank');
  WORLD_STATE.filesOpened.push(resolved.name);
  logEvent(`OPEN ${resolved.name}`, 'info');
  showNotif(`FILE LAUNCHED: ${resolved.name}`, 'info');
  queueLines([
    ['d', `  RETRIEVING: ${resolved.name}`],
    ['n', `  File launched in new tab.`],
    ['r', `  [LOG] FILE ACCESS RECORDED — ${resolved.name}`],
    ['r', `  [LOG] OPERATOR: ${operatorIP}`],
    ['', ''],
  ], 'fast', unlockInput);
}

// ── ACCESS ─────────────────────────────────────────────────────
function doAccess(code) {
  if (!code) { queueLines([['r','  USAGE: access [code]']], 'fast', unlockInput); return; }

  const up  = code.toUpperCase();
  const tgt = CODES[up];
  logEvent(`ACCESS ATTEMPT: ${up}`, tgt !== undefined ? 'info' : 'warn');

  if (tgt === undefined) {
    S.attempts[up] = (S.attempts[up] || 0) + 1; persist();
    const n = S.attempts[up];
    const hints = ['','  Hint: Codes are in archive documents.','  Hint: Some files have encrypted sections.','  Hint: Use DECRYPT on files with cipher text.','  Hint: SCAN reveals encrypted files.'];
    showNotif('AUTHORIZATION FAILURE', 'error');
    queueLines([['r','  AUTHORIZATION FAILURE -- CODE REJECTED'],['r',`  FAILED ATTEMPTS: ${n}`],['d',hints[Math.min(n,hints.length-1)]]], 'fast', unlockInput);
    return;
  }

  if (S.clearance >= tgt) {
    queueLines([['a',`  ${TIERS[tgt]} CLEARANCE ALREADY ACTIVE.`]], 'fast', unlockInput);
    return;
  }

  S.clearance = tgt; persist(); refreshBadge(); buildNavTree();
  showNotif(`CLEARANCE UPGRADED: ${TIERS[tgt]}`, 'info');
  logEvent(`CLEARANCE UPGRADED — ${TIERS[tgt]}`, 'info');

  doGlitch(() => {
    queueLines([
      ['',  ''],
      ['b', `  ████  CLEARANCE UPGRADED: ${TIERS[tgt]}  ████`],
      ['',  ''],
      ['n', `  Access elevated to ${TIERS[tgt]} tier.`],
      ['n', '  New files now accessible.'],
      ['d', '  Type LS to see updated archive listing.'],
      ['',  ''],
    ], 'norm', unlockInput);
  });
}

// ── DECRYPT ────────────────────────────────────────────────────
function doDecrypt(filename) {
  if (!filename) { queueLines([['r','  USAGE: decrypt [filename]']], 'fast', unlockInput); return; }

  // Allow decrypting by name even without full path
  const up = filename.trim().toUpperCase();
  const fileKey = Object.keys(DECRYPTERS).find(k => k === up || k.startsWith(up));

  if (!fileKey) {
    doGlitch(() => {
      queueLines([
        ['d', `  ANALYZING: ${filename.toUpperCase()}`],
        ['d', '  SCANNING FOR CIPHER SIGNATURES...'],
        ['', ''],
        ['r', '  NO CIPHER SIGNATURE DETECTED.'],
        ['d', '  File may be plaintext or unrecognised encoding.'],
        ['', ''],
      ], 'norm', unlockInput);
    });
    return;
  }

  // Check clearance for the corresponding FILES entry
  const fileData = FILES[fileKey];
  if (fileData && fileData.tier > S.clearance) {
    queueLines([
      ['r', `  CLEARANCE ${TIERS[fileData.tier]} REQUIRED TO ANALYZE THIS FILE.`],
      ['d', `  Current: ${TIERS[S.clearance]}`],
    ], 'fast', unlockInput);
    return;
  }

  logEvent(`DECRYPT ATTEMPT: ${fileKey}`, 'info');
  showNotif(`DECRYPTING: ${fileKey}`, 'info');

  // OMEGA_FINAL.DAT — needs OMEGA clearance, shows file body
  if (fileKey === 'OMEGA_FINAL.DAT') {
    if (S.clearance < 3) {
      doGlitch(() => {
        queueLines([
          ['d', '  ANALYZING: OMEGA_FINAL.DAT'],
          ['d', '  CIPHER SIGNATURE CONFIRMED.'],
          ['', ''],
          ['r', '  DECRYPTION BLOCKED — OMEGA CLEARANCE REQUIRED.'],
          ['r', '  THIS ATTEMPT HAS BEEN LOGGED.'],
          ['', ''],
        ], 'norm', unlockInput);
      });
      return;
    }
    doGlitch(() => {
      queueLines([
        ['d', '  ANALYZING: OMEGA_FINAL.DAT'],
        ['d', '  OMEGA KEY VERIFIED. DECRYPTING...'],
        ['', ''],
      ], 'fast', () => {
        setTimeout(() => {
          queueLines(FILES['OMEGA_FINAL.DAT'].body, 'slow', unlockInput);
        }, 800);
      });
    });
    return;
  }

  // Standard handler with character-scramble reveal (D4)
  const handler = DECRYPTERS[fileKey];
  doGlitch(() => {
    queueLines([
      ['d', `  ANALYZING: ${fileKey}`],
      ['d', '  SCANNING FOR CIPHER SIGNATURES...'],
      ['d', '  CIPHER SIGNATURE DETECTED.'],
      ['', ''],
    ], 'fast', () => {
      // Scramble delay before revealing decoded lines
      setTimeout(() => {
        const result = handler();
        if (result) queueLines(result, 'norm', unlockInput);
        else unlockInput();
      }, 600);
    });
  });
}

// ── SCAN ───────────────────────────────────────────────────────
function doScan() {
  WORLD_STATE.scanCount++;
  triggerRadarScan();
  triggerWavePulse();
  logEvent('SECTOR SCAN INITIATED', 'info');

  const sectors = ['0x00FF', '0x0140', '0x022A', '0x03B1'];
  let idx = 0;

  queueLines([
    ['d','  INITIATING SECTOR SCAN...'],
    ['', ''],
  ], 'fast', () => {
    function nextSector() {
      if (idx >= sectors.length) {
        // Results
        const lastFile = WORLD_STATE.filesOpened.slice(-1)[0];
        const refs = lastFile
          ? [['a', `  [SIG] Residual access signature: ${lastFile}`]]
          : [];
        const allFiles = Object.entries(ARCHIVE).flatMap(([dir, f]) =>
          f.files.map(x => `${dir}/${x.name}`)
        );
        const picks = allFiles.sort(() => Math.random() - .5).slice(0, 3);
        const found = [];
        for (const p of picks) {
          found.push(['a', `  [SIG] Anomalous metadata in ${p}`]);
          found.push(['d', `        Sector integrity: ${rand(34,89)}%`]);
        }
        queueLines([
          ['', ''],
          ...refs,
          ...found,
          ['', ''],
          ['r', '  [WARN] 432 Hz carrier detected in 3 files.'],
          ['d', '         Origin unregistered.'],
          ['', ''],
          ['d', `  Scan #${WORLD_STATE.scanCount} complete.`],
        ], 'fast', () => {
          if (WORLD_STATE.scanCount === 1 && !WORLD_STATE.signalWinShown) {
            WORLD_STATE.signalWinShown = true;
            createFloatWin('win-signal', '◈ SIGNAL MONITOR', `
              <div style="font-size:9px;color:var(--fg-dim);line-height:1.9">
                <div>FREQUENCY: <span style="color:var(--amber)">432.000 Hz</span></div>
                <div>CARRIER:   <span style="color:var(--fg)">ACTIVE</span></div>
                <div>ORIGIN:    <span style="color:var(--red-hi)">[UNREGISTERED]</span></div>
                <div>NODES:     <span style="color:var(--fg)">2 RESPONDING</span></div>
                <div style="margin-top:6px">
                  NODE 432.0.0.1 ......... <span style="color:var(--fg)">OK</span><br>
                  NODE [UNREGISTERED] .... <span style="color:var(--amber)">ACTIVE</span><br>
                  NODE 4 ................. <span style="color:var(--red-hi)">NO RESPONSE</span>
                </div>
              </div>
            `);
          }
          unlockInput();
        });
        return;
      }
      setTimeout(() => {
        queueLines([['d', `  Probing sector ${sectors[idx]}...`]], 'fast', () => {
          idx++;
          nextSector();
        });
      }, 300);
    }
    nextSector();
  });
}

// ── WHOAMI ─────────────────────────────────────────────────────
function doWhoami() {
  const mins = sessionMinutes();
  const totalFiles = Object.values(ARCHIVE).reduce((s,f) => s+f.files.length, 0) + ROOT_FILES.length;
  const lines = [
    ['',''],
    ['r', `  OPERATOR IP         :  ${operatorIP}`],
    ['n', `  CLEARANCE           :  ${TIERS[S.clearance]}`],
    ['d', `  TOTAL ARCHIVE FILES :  ${totalFiles}`],
    ['d', `  ARCHIVE DIRECTORIES :  ${Object.keys(ARCHIVE).length}`],
    ['d', `  FILES OPENED        :  ${WORLD_STATE.filesOpened.length}`],
    ['r', `  SESSION STATUS      :  MONITORED / LOGGED`],
  ];
  if (mins >= 4) {
    lines.push(['d', '  NOTE: Unusually long session. Security has been notified.']);
  }
  if (mins >= 7) {
    lines.push(['r', '  SESSION DURATION: ANOMALOUS — REVIEW FLAGGED']);
  }
  lines.push(['','']);
  queueLines(lines, 'fast', unlockInput);
}

// ── DATE ───────────────────────────────────────────────────────
function doDate() {
  queueLines([
    ['d',`  SYSTEM TIME  :  ${new Date().toUTCString()}`],
    ['d','  ARCHIVE OPEN :  1947-07-08T00:00:00.000Z'],
    ['d','  LAST SESSION :  [TIMESTAMP ERROR — ~31 YEARS AGO]'],
    ['a','  BACKUP POWER :  CRITICAL. MAIN POWER OFFLINE.'],
  ], 'fast', unlockInput);
}

// ── STATUS ─────────────────────────────────────────────────────
function doStatus() {
  const min = Math.floor(gateTimeLeft / 60);
  const sec = gateTimeLeft % 60;
  const pct = Math.round((gateTimeLeft / CFG.GATE_DURATION) * 100);
  const unopened = Object.keys(FILES).filter(n => !WORLD_STATE.filesOpened.includes(n)).length;
  const lines = [
    ['d','  == NODE 7 DIAGNOSTICS =========================='],
    ['n',`  CLEARANCE MODULE  :  ${TIERS[S.clearance]}`],
    ['a','  MAIN POWER        :  OFFLINE'],
    ['a','  BACKUP POWER      :  ACTIVE (DETERIORATING)'],
    ['r','  SECTOR FAULTS     :  1,247'],
    ['r','  PERSONNEL STATUS  :  3 MISSING / 1 DECEASED'],
    ['d','  NETWORK           :  NO CARRIER'],
    ['d','  SIGNAL MONITOR    :  ACTIVE (432 Hz DETECTED)'],
    ['a','  ARCHIVE INTEGRITY :  67%'],
    ['n',`  GATE INTEGRITY    :  ${pct}%  (${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')} REMAINING)`],
  ];
  if (S.clearance > 0) {
    lines.push(['d', `  NARRATIVE FILES   :  ${unopened} unread at current clearance`]);
  }
  lines.push(['d','  ================================================']);
  queueLines(lines, 'fast', unlockInput);
}

// ── RESET ──────────────────────────────────────────────────────
function doReset() {
  queueLines([['a','  Type CONFIRM to wipe all progress, or anything else to cancel.']], 'fast', () => {
    cmdOverride = raw => {
      if (raw.trim().toUpperCase() === 'CONFIRM') {
        S = freshState(); persist(); refreshBadge(); buildNavTree();
        localStorage.removeItem(GATE_KEY);
        clearInterval(gateInterval);
        localStorage.setItem(GATE_KEY, Date.now());
        gateTimeLeft = CFG.GATE_DURATION;
        gateAlertsSent.clear();
        gateInterval = setInterval(gateTick, 1000);
        updateGateUI();
        WORLD_STATE.filesOpened = [];
        WORLD_STATE.commandsRun = [];
        WORLD_STATE.scanCount = 0;
        queueLines([['r','  ALL PROGRESS WIPED. GATE TIMER RESET.']], 'fast', unlockInput);
      } else {
        queueLines([['d','  Reset cancelled.']], 'fast', unlockInput);
      }
    };
  });
}

// ── PING ───────────────────────────────────────────────────────
function doPing() {
  queueLines([['d','  PING deep-watch-network.mnemosyne.local...']], 'fast', () => {
    setTimeout(() => {
      queueLines([
        ['n','  64 bytes from 432.0.0.1      :  seq=1 ttl=∞ time=0.001ms'],
        ['a','  64 bytes from [UNREGISTERED]  :  seq=2 ttl=∞ time=0.000ms'],
        ['r','  Request timeout               :  seq=3'],
        ['r','  Request timeout               :  seq=4'],
        ['',''],
        ['d','  Two nodes responding. One has no registered address.'],
        ['d','  It responded before the packet was sent.'],
        ['',''],
      ], 'norm', unlockInput);
    }, 500);
  });
}

// ── HIDDEN COMMANDS ────────────────────────────────────────────

function doTrace(target) {
  const t = target || 'UNKNOWN';
  queueLines([
    ['d', `  TRACE INITIATED — TARGET: ${t.toUpperCase()}`],
    ['d', '  PINGING RELAY NODES...'],
  ], 'fast', () => {
    setTimeout(() => {
      queueLines([
        ['n', `  HOP 01: 432.0.0.1          — RESPONSE: OK`],
        ['n', `  HOP 02: [UNREGISTERED]     — RESPONSE: OK`],
        ['n', `  HOP 03: ███.███.███.███    — RESPONSE: OK`],
        ['a', `  HOP 04: [LOCATION MASKED]  — NO FURTHER HOPS`],
        ['',''],
        ['r', '  TRIANGULATION TERMINATED BY REMOTE NODE.'],
        ['d', '  Coordinates withheld. Origin classified.'],
        ['',''],
      ], 'norm', unlockInput);
    }, 600);
  });
}

function doLocate(name) {
  const n = (name || '').toLowerCase();
  if (n === 'lark') {
    queueLines([
      ['d', '  QUERYING PERSONNEL LOCATION DATABASE...'],
      ['',''],
      ['n', '  LAST KNOWN POSITION:'],
      ['n', '  LAT: 34°14\'09" N'],
      ['n', '  LON: ████████████████ [CORRUPTED]'],
      ['r', '  ALT: [CORRUPTED]'],
      ['',''],
      ['r', '  NOTE: Coordinates logged CYCLE 89, DAY 412.'],
      ['r', '  No update since. Presumed off-grid.'],
      ['',''],
    ], 'norm', unlockInput);
  } else if (n) {
    queueLines([
      ['d', `  QUERYING: ${name.toUpperCase()}`],
      ['r', '  RECORD NOT FOUND OR CLASSIFIED.'],
      ['d', '  Try: locate lark'],
    ], 'fast', unlockInput);
  } else {
    queueLines([['r','  USAGE: locate [name]'],['d','  Known subject: lark']], 'fast', unlockInput);
  }
}

function doRecover() {
  if (WORLD_STATE.scanCount === 0) {
    queueLines([
      ['a', '  RECOVERY MODULE REQUIRES PRIOR SCAN DATA.'],
      ['d', '  Run SCAN first to index recoverable sectors.'],
    ], 'fast', unlockInput);
    return;
  }
  queueLines([
    ['d', '  QUERYING SECTOR RECOVERY TABLE...'],
    ['',''],
    ['n', '  PARTIALLY RECOVERABLE SECTORS:'],
    ['',''],
    ['n', `  SECTOR 0x00FF4A22  ${rand(12,45)}% recoverable  — [PERSONNEL RECORD]`],
    ['n', `  SECTOR 0x00FF4A23  ${rand(8,30)}% recoverable   — [UNKNOWN]`],
    ['n', `  SECTOR 0x01401F00  ${rand(20,65)}% recoverable  — [AUDIO FRAGMENT]`],
    ['n', `  SECTOR 0x022A0001  ${rand(5,18)}% recoverable   — [LARK DISPATCH — DATE CORRUPTED]`],
    ['',''],
    ['a', '  Recovery below 40% is unreliable.'],
    ['d', '  Full recovery requires hardware write access.'],
    ['d', '  This terminal is read-only.'],
    ['',''],
  ], 'norm', unlockInput);
}

function doOverride() {
  showWarning();
  queueLines([
    ['',''],
    ['r', '  OVERRIDE REJECTED — PROTOCOL 7-DELTA TRIGGERED.'],
    ['r', '  This terminal does not accept override commands.'],
    ['a', '  Node 7 is autonomous. It answers to no one.'],
    ['d', '  Incident ref: OVR-████-NODE7'],
    ['',''],
  ], 'fast', unlockInput);
}

function doAnalyze(filename) {
  if (!filename) { queueLines([['r','  USAGE: analyze [file]']], 'fast', unlockInput); return; }
  const up = filename.trim().toUpperCase();
  const fileEntry = FILES[up];
  const archiveFile = (() => {
    for (const [dir, folder] of Object.entries(ARCHIVE)) {
      const f = folder.files.find(x => x.name === up || x.name.startsWith(up));
      if (f) return { dir, f };
    }
    return null;
  })();

  if (!fileEntry && !archiveFile) {
    queueLines([['r', `  UNKNOWN FILE: "${filename}"`]], 'fast', unlockInput);
    return;
  }

  const name     = fileEntry ? up : archiveFile.f.name;
  const tier     = fileEntry ? TIERS[fileEntry.tier] : 'UNRESTRICTED';
  const locked   = fileEntry && fileEntry.tier > S.clearance;
  const integrity = rand(55, 98);
  const sectors  = rand(8, 64);

  queueLines([
    ['d', '=================================================='],
    ['b', `  METADATA ANALYSIS — ${name}`],
    ['d', '=================================================='],
    ['',''],
    ['n', `  FILE NAME    :  ${name}`],
    ['n', `  CLEARANCE    :  ${tier}`],
    ['n', `  INTEGRITY    :  ${integrity}%`],
    ['n', `  SIZE (EST.)  :  ${sectors * 512} bytes (${sectors} sectors)`],
    ['n', `  MODIFIED     :  ${fileEntry ? fileEntry.modified : corruptDate()}`],
    ['n', `  ENCRYPTED    :  ${fileEntry?.encrypted ? 'YES' : 'NO'}`],
    ['',''],
    locked
      ? ['r', '  CONTENT CLASSIFIED — ANALYSIS ONLY']
      : ['d', '  Use OPEN to read content.'],
    ['d', '=================================================='],
  ], 'fast', unlockInput);
}

function doExtract(filename) {
  if (!filename) { queueLines([['r','  USAGE: extract [file]']], 'fast', unlockInput); return; }
  if (S.clearance < 2) {
    queueLines([
      ['r', '  EXTRACT REQUIRES SIGMA CLEARANCE OR ABOVE.'],
      ['d', `  Current: ${TIERS[S.clearance]}`],
    ], 'fast', unlockInput);
    return;
  }
  const name = filename.trim().toUpperCase();
  const hexLines = [];
  for (let i = 0; i < 6; i++) {
    let hex = '';
    let asc = '';
    for (let j = 0; j < 16; j++) {
      const b = rand(0, 255);
      hex += b.toString(16).padStart(2,'0').toUpperCase() + ' ';
      asc += b >= 32 && b < 127 ? String.fromCharCode(b) : '.';
    }
    hexLines.push(['d', `  ${(i*16).toString(16).padStart(4,'0')}  ${hex} |${asc}|`]);
  }
  const fragments = [
    ['n', '  ....RESONANCE....'],
    ['n', '  ....432 Hz....CARRIER....'],
    ['n', '  ....LARK....WAS....HERE....'],
  ];
  queueLines([
    ['d', `  EXTRACTING RAW SECTORS — ${name}`],
    ['',''],
    ...hexLines,
    ['',''],
    ['a', '  EMBEDDED ASCII FRAGMENTS:'],
    ...fragments,
    ['',''],
    ['d', '  [END OF EXTRACTION]'],
  ], 'fast', unlockInput);
}

function doSignal() {
  triggerWavePulse();
  queueLines([
    ['d', '  QUERYING SIGNAL MONITOR...'],
    ['',''],
    ['n', '  432 Hz CARRIER:    ACTIVE'],
    ['n', `  SIGNAL STRENGTH:   ${rand(72,88)}%`],
    ['n', '  ORIGIN NODES:      2 DETECTED'],
    ['n', '  NODE 432.0.0.1:    REGISTERED — INTERNAL'],
    ['a', '  NODE [UNREGISTERED]: ACTIVE — NO ADDRESS ON FILE'],
    ['',''],
    ['d', '  Third node queried (NODE 4) — no response.'],
    ['r', '  NODE 4 HAS NO REGISTERED ADDRESS AND YET QUERIES US.'],
    ['',''],
  ], 'norm', unlockInput);
}

function doAuth() {
  const old = authToken;
  queueLines([
    ['d', '  QUERYING AUTH MODULE...'],
    ['',''],
    ['n', `  CURRENT TOKEN  :  ${old}`],
    ['d', '  TOKEN ROTATED ON ACCESS.'],
    ['',''],
  ], 'fast', () => {
    rotateAuthToken();
    unlockInput();
  });
}

function doElevate() {
  doGlitch(() => {
    logEvent('ELEVATION ATTEMPT — REJECTED', 'error');
    showNotif('ELEVATION REJECTED — INCIDENT LOGGED', 'error');
    queueLines([
      ['',''],
      ['r', '  SELF-ELEVATION REJECTED.'],
      ['r', '  THIS TERMINAL DOES NOT SUPPORT OPERATOR ELEVATION.'],
      ['r', '  INCIDENT LOGGED: ELV-████-NODE7-ALPHA'],
      ['a', '  Clearance is granted by the archive, not requested.'],
      ['',''],
    ], 'norm', unlockInput);
  });
}

function doArchive(folder, showAll) {
  queueLines([
    ['d', '  ARCHIVE ACCESS — DEEP WATCH PROTOCOL NODE 7'],
    ['d', '  MOUNTING ARCHIVE INDEX...'],
    ['',''],
  ], 'fast', () => {
    doLs(showAll, folder);
  });
}

function doNodes() {
  queueLines([
    ['d', '  QUERYING NETWORK NODE TABLE...'],
    ['',''],
    ['n', '  NODE 001  432.0.0.1        ONLINE   — INTERNAL SIGNAL MONITOR'],
    ['r', '  NODE 002  [UNREGISTERED]   ONLINE   — NO ADDRESS. RESPONDS.'],
    ['d', '  NODE 003  192.168.0.22     OFFLINE  — LAST SEEN: CYCLE 89'],
    ['d', '  NODE 004  [UNKNOWN]        OFFLINE  — SENDS QUERIES. NO ADDRESS.'],
    ['d', '  NODE 005  10.0.0.1         OFFLINE  — LAST SEEN: 1994-03-07'],
    ['d', '  NODE 006  ███.███.███.███  OFFLINE  — CLASSIFIED'],
    ['d', '  NODE 007  LOCAL            ONLINE   — THIS TERMINAL'],
    ['',''],
    ['a', '  NOTE: NODE 002 responded before ping was sent.'],
    ['a', '        Round-trip time logged as 0.000ms.'],
    ['',''],
  ], 'norm', unlockInput);
}

// ── EASTER EGGS ─────────────────────────────────────────────────

function doSudo() {
  showWarning();
  queueLines([['r','  UNAUTHORIZED COMMAND. INCIDENT LOGGED.']], 'fast', unlockInput);
}

function doHello() {
  queueLines([
    ['n','  Greetings, Operator.'],
    ['d','  Your terminal signature has been acknowledged.'],
    ['d','  You are the first active session in ~31 years.'],
  ], 'norm', unlockInput);
}

function doXyzzy() {
  queueLines([
    ['d','  Nothing happens.'],
    ['d','  (There is a faint hum at 432 Hz. You decide it\'s'],
    ['d','   probably the building\'s HVAC system.)'],
  ], 'norm', unlockInput);
}

function doBob() {
  queueLines([
    ['',''],
    ['a','  "He does not speak.'],
    ['a','   But when he is near you feel understood.'],
    ['a','   Completely. Without exception.'],
    ['a','   It is the most terrifying feeling I have ever had."'],
    ['d','       — LARK, field journal, day 7'],
    ['',''],
  ], 'slow', unlockInput);
}

function doLark() {
  queueLines([
    ['',''],
    ['n','  LARK  //  FIELD LIAISON'],
    ['r','  Status: MISSING'],
    ['d','  Last seen: Cycle 89, Day 412'],
    ['d','  Last report: submitted that morning. Tone: normal.'],
    ['d','  Subject B was gone by the time anyone checked.'],
    ['a','  No one has explained the coincidence.'],
    ['',''],
  ], 'norm', unlockInput);
}

function doResonanceEgg() {
  triggerWavePulse();
  queueLines([
    ['',''],
    ['a','  RESONANCE SIGNATURE DETECTED AT THIS TERMINAL.'],
    ['d','  Carrier frequency: 432.000000 Hz (exact match)'],
    ['d','  Signal origin: [UNREGISTERED NODE]'],
    ['d','  Decoding...'],
  ], 'norm', () => {
    setTimeout(() => {
      queueLines([['b','  "We are here."'],['d','  [Signal ends. Hum persists.]'],['','']], 'slow', unlockInput);
    }, 1200);
  });
}

function do432() {
  triggerWavePulse();
  queueLines([
    ['',''],
    ['a','  432 Hz. The fundamental resonance.'],
    ['d','  Ancient tuning. A = 432 Hz, not 440.'],
    ['d','  Subject B vocalized at this exact frequency.'],
    ['d','  Every time. Without variation.'],
    ['d','  The Ariel children hummed it afterward.'],
    ['d','  Without being taught it.'],
    ['',''],
  ], 'norm', unlockInput);
}

function doMatrix() {
  doGlitch(() => {
    queueLines([['d','  Glitch logged. Resuming nominal operation.']], 'fast', unlockInput);
  });
}

function doWeAreHere() {
  queueLines([['',''],['b','  WE ARE HERE.'],['n','  We have always been here.'],['','']], 'slow', unlockInput);
}

function doThirdStone() {
  if (S.clearance >= 3) {
    queueLines([
      ['',''],['a','  You know who I am.'],['a','  You have always known.'],
      ['d','  (The hum at 432 Hz intensifies briefly, then stops.)'],['',''],
    ], 'slow', unlockInput);
  } else {
    queueLines([['d','  That name is not yet known to you.']], 'norm', unlockInput);
  }
}

function doTokenSecret() {
  queueLines([
    ['',''],
    ['r', '  [TOKEN VERIFIED — UNSANCTIONED OPERATOR CHANNEL]'],
    ['d', '  You were not meant to find this.'],
    ['n', '  The token refreshes. The channel closes.'],
    ['d', '  There is a file called OMEGA_FINAL.DAT.'],
    ['d', '  It will tell you what we are.'],
    ['',''],
  ], 'slow', () => {
    rotateAuthToken();
    unlockInput();
  });
}

function doUnknown(v) {
  const lines = [['d',`  Unknown command: "${v}"`],['d','  Type HELP for command list.']];
  if (Math.random() < 0.2) lines.push(['',''],['d','  (Not all commands are listed.)']);
  queueLines(lines, 'fast', unlockInput);
}

// ── FILE RESOLVER ───────────────────────────────────────────────
// Returns: { inline, file, name } | { url, name } | { locked, name, tier } | null
function resolveFile(input) {
  if (!input) return null;
  const up = input.trim().toUpperCase();

  // Narrative FILES — check exact match first
  if (FILES[up]) {
    const f = FILES[up];
    if (f.tier > S.clearance) return { locked: true, name: up, tier: f.tier };
    return { inline: true, name: up, file: f };
  }

  // Root files
  for (const f of ROOT_FILES) {
    if (f.name === up || f.name.startsWith(up))
      return { url: f.real, name: f.name };
  }

  // FOLDER/FILE path
  if (up.includes('/')) {
    const slash   = up.indexOf('/');
    const folderK = up.slice(0, slash);
    const fileQ   = up.slice(slash + 1);
    const folder  = ARCHIVE[folderK];
    if (folder) {
      const f = folder.files.find(x => x.name === fileQ || x.name.startsWith(fileQ));
      if (f) return { url: folder.realPath + f.real, name: f.name };
    }
    return null;
  }

  // Search all archive folders
  for (const folder of Object.values(ARCHIVE)) {
    const f = folder.files.find(x => x.name === up || x.name.startsWith(up));
    if (f) return { url: folder.realPath + f.real, name: f.name };
  }

  // Partial match on FILES keys
  const partialKey = Object.keys(FILES).find(k => k.startsWith(up));
  if (partialKey) {
    const f = FILES[partialKey];
    if (f.tier > S.clearance) return { locked: true, name: partialKey, tier: f.tier };
    return { inline: true, name: partialKey, file: f };
  }

  return null;
}

// ── INPUT EVENTS ────────────────────────────────────────────────
$in.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    if (typeRunning) { flushTyping(); return; }
    if (inputLocked && !cmdOverride) return;
    const val = $in.value; $in.value = ''; syncCursor();
    lockInput();
    dispatch(val);
    return;
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (histIdx < hist.length - 1) { histIdx++; $in.value = hist[histIdx] || ''; }
    syncCursor(); return;
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (histIdx > 0) { histIdx--; $in.value = hist[histIdx] || ''; }
    else { histIdx = -1; $in.value = ''; }
    syncCursor(); return;
  }
  if (e.key === 'Tab') {
    e.preventDefault();
    const parts = $in.value.split(/\s+/);
    if (parts.length < 2) return;
    const cmd = parts[0].toLowerCase();
    const pfx = parts[parts.length - 1].toUpperCase();

    // Decrypt: only complete against files with cipher handlers
    if (cmd === 'decrypt') {
      const match = Object.keys(DECRYPTERS).find(k => k.startsWith(pfx));
      if (match) {
        parts[parts.length - 1] = match;
        $in.value = parts.join(' ');
        const f = FILES[match];
        if (f && f.tier > S.clearance) {
          appendLnDirect('d', `  [LOCKED] ${TIERS[f.tier]} clearance required`);
          bottom();
        }
      }
      return;
    }

    // Folder autocomplete
    const folderMatch = Object.keys(ARCHIVE).find(k => k.startsWith(pfx));
    if (folderMatch) { parts[parts.length - 1] = folderMatch + '/'; $in.value = parts.join(' '); return; }

    // Folder/file path
    if (pfx.includes('/')) {
      const slash = pfx.indexOf('/');
      const fk = pfx.slice(0, slash);
      const fq = pfx.slice(slash + 1);
      const folder = ARCHIVE[fk];
      if (folder) {
        const matches = folder.files.filter(x => x.name.startsWith(fq));
        if (matches.length === 1) {
          parts[parts.length - 1] = `${fk}/${matches[0].name}`;
          $in.value = parts.join(' ');
        } else if (matches.length > 1) {
          appendLnDirect('d', `  [TAB] ${matches.length} matches — type more`);
          bottom();
        }
      }
      return;
    }

    // Narrative FILES
    const fileMatches = Object.keys(FILES).filter(k => k.startsWith(pfx));
    if (fileMatches.length === 1) {
      parts[parts.length - 1] = fileMatches[0];
      $in.value = parts.join(' ');
      const f = FILES[fileMatches[0]];
      if (f.tier > S.clearance) {
        appendLnDirect('d', `  [LOCKED] ${TIERS[f.tier]} clearance required`);
        bottom();
      }
      return;
    } else if (fileMatches.length > 1) {
      appendLnDirect('d', `  [TAB] ${fileMatches.length} matches — type more`);
      bottom();
      return;
    }

    // Root files
    const rootMatch = ROOT_FILES.find(f => f.name.startsWith(pfx));
    if (rootMatch) { parts[parts.length - 1] = rootMatch.name; $in.value = parts.join(' '); }
  }
});

document.addEventListener('click', () => {
  if (!inputLocked && window.getSelection()?.isCollapsed !== false) $in.focus();
});
