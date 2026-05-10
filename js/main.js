/* ═══════════════════════════════════════════════════════════════
   main.js — Boot sequence, system init. Load last.
   Depends on: all other modules
═══════════════════════════════════════════════════════════════ */

function animateSectorScan(done) {
  const el = document.createElement('div');
  el.className = 'ln ln-d no-bloom';
  $out.appendChild(el);
  let pct = 0;
  const id = setInterval(() => {
    pct = Math.min(100, pct + rand(8, 18));
    const bars = Math.floor(pct / 100 * 20);
    el.textContent = `  SECTOR SCAN: [${'▓'.repeat(bars)}${'░'.repeat(20 - bars)}] ${pct}%`;
    bottom();
    if (pct >= 100) { clearInterval(id); setTimeout(done, 200); }
  }, 100);
}

// ── BOOT PHASES ────────────────────────────────────────────────
function runBootPhase1() {
  queueLines(BOOT_PHASE1, 'fast', () => {
    setTimeout(runBootPhase2, rand(400, 700));
  });
}

function runBootPhase2() {
  const totalFiles = Object.values(ARCHIVE).reduce((s,f) => s + f.files.length, 0) + ROOT_FILES.length;
  queueLines(BOOT_PHASE2_HEADER, 'fast', () => {
    animateSectorScan(() => {
      queueLines(BOOT_PHASE2_RESULT, 'fast', () => {
        queueLines([
          ['d', '  ARCHIVE INDEX LOADING...'],
          ['d', `  DIRECTORIES FOUND      :  ${Object.keys(ARCHIVE).length}`],
          ['d', `  ACCESSIBLE FILES       :  ${totalFiles}`],
          ['d', `  NARRATIVE RECORDS      :  ${Object.keys(FILES).length}`],
          ['a', '  CORRUPTED ENTRIES      :  3 FLAGGED'],
          ['r', '  ENCRYPTED ENTRIES      :  1 [OMEGA CLEARANCE REQUIRED]'],
          ['', ''],
        ], 'fast', () => {
          setTimeout(runBootPhase4, rand(600, 1000));
        });
      });
    });
  });
}

function runBootPhase4() {
  // Inject live IP into boot text
  const phase = [...BOOT_PHASE4];
  const ipIdx = phase.findIndex(([,s]) => s.includes('ALERT') && s.includes('SESSION ID'));
  if (ipIdx >= 0) {
    phase.splice(ipIdx + 1, 0, ['r', `  [ALERT] IP ADDRESS: ${operatorIP}  — FLAGGED`]);
  }
  queueLines(phase, 'fast', () => {
    setTimeout(runBootPhase5, rand(400, 700));
  });
}

function runBootPhase5() {
  queueLines(BOOT_PHASE5, 'fast', () => {
    initGate();
    bootComplete = true;
    unlockInput();
    buildNavTree();
    initNotifStrip();
    logEvent('TERMINAL READY — SESSION ACTIVE', 'info');
    showNotif('TERMINAL ONLINE — GUEST ACCESS', 'info');
    schedInstability();
    schedAmbient();
  });
}

// ── CINEMATIC BOOT ENTRY ───────────────────────────────────────
function runBoot() {
  lockInput();
  showStartupWarning(() => {
    // G2: scan sweep → brief blank → CRT power-on overlay → boot text
    doSweep();
    setTimeout(() => {
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:#000;z-index:1000;pointer-events:none;opacity:1;transition:opacity 0.4s linear';
      document.body.appendChild(overlay);
      setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.remove();
          runBootPhase1();
        }, 400);
      }, 300);
    }, 200);
  });
}

// ── INIT ───────────────────────────────────────────────────────
initDust();
initRadar();
initWaveform();
runBoot();
