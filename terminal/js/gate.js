

let gateDuration  = 480;   
let gateTimeLeft  = 480;
let gateInterval  = null;

const GATE_ALERTS = [
  { at: 5*60, glitch: false, lines: [
    ['r', '  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
    ['r', '  [MNEMOSYNE-SEC] AUTO-LOCKOUT: 5 MINUTES REMAINING'],
    ['r', '  [MNEMOSYNE-SEC] EXTENDED SESSION FLAGGED FOR REVIEW'],
    ['r', '  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
  ]},
  { at: 3*60, glitch: false, lines: [
    ['r', '  !! [MNEMOSYNE-SEC] AUTO-LOCKOUT: 3 MINUTES !!'],
    ['r', '  !! SECURITY RESPONSE TEAM HAS BEEN DISPATCHED !!'],
  ]},
  { at: 90, glitch: true, lines: [
    ['r', '  !! LOCKOUT IN 90 SECONDS. PREPARE TO DISCONNECT. !!'],
    ['r', '  !! PHYSICAL LOCATION: TRIANGULATING...           !!'],
  ]},
  { at: 30, glitch: true, lines: [
    ['r', '  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'],
    ['r', '  !!  LOCKOUT IN 30 SECONDS. FINAL WARNING.       !!'],
    ['r', '  !!  ALL SESSION DATA FORWARDED TO SECURITY.     !!'],
    ['r', '  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'],
  ]},
];
const gateAlertsSent = new Set();

function initGate() {
  const now     = Date.now();
  const stored  = localStorage.getItem(GATE_KEY);
  let startTime = stored ? parseInt(stored) : null;

  
  const storedDur = localStorage.getItem(GATE_DUR_KEY);
  gateDuration = storedDur ? parseInt(storedDur) : rand(60, 300);
  if (!storedDur) localStorage.setItem(GATE_DUR_KEY, String(gateDuration));

  if (!startTime) {
    startTime = now;
    localStorage.setItem(GATE_KEY, String(startTime));
  }

  const elapsed = Math.floor((now - startTime) / 1000);
  gateTimeLeft  = Math.max(0, gateDuration - elapsed);

  if (gateTimeLeft <= 0) { triggerGateClose(); return; }

  
  for (const a of GATE_ALERTS) {
    if (elapsed >= (gateDuration - a.at)) gateAlertsSent.add(a.at);
  }

  updateGateUI();
  gateInterval = setInterval(gateTick, 1000);
}

function gateTick() {
  gateTimeLeft = Math.max(0, gateTimeLeft - 1);
  updateGateUI();

  
  if (gateTimeLeft === 1) {
    appendLnDirect('d', '  [Someone else is in this archive.]');
    bottom();
  }

  for (const alert of GATE_ALERTS) {
    if (gateTimeLeft === alert.at && !gateAlertsSent.has(alert.at)) {
      gateAlertsSent.add(alert.at);
      logEvent(`LOCKOUT IN ${Math.floor(alert.at/60) || alert.at}${alert.at >= 60 ? ' MIN' : 'S'}`, 'warn');
      showNotif(`AUTO-LOCKOUT: ${Math.floor(alert.at/60) || alert.at}${alert.at >= 60 ? ' MINUTES' : ' SECONDS'}`, 'warn');
      if (alert.glitch) {
        doGlitch(() => { for (const [t,s] of alert.lines) appendLnDirect(t, s); bottom(); });
      } else {
        for (const [t,s] of alert.lines) appendLnDirect(t, s);
        bottom();
      }
    }
  }

  if (gateTimeLeft <= 0) { clearInterval(gateInterval); triggerGateClose(); }
}

function updateGateUI() {
  const pct = (gateTimeLeft / gateDuration) * 100;
  const min = Math.floor(gateTimeLeft / 60);
  const sec = gateTimeLeft % 60;

  $gateFill.style.width = `${pct}%`;
  $gateTime.textContent = `${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;

  if (pct <= 12) {
    $gateBar.className = 'critical';
    $gateLabel.textContent = `!! AUTO-LOCKOUT IMMINENT  ${Math.round(pct)}%`;
  } else if (pct <= 30) {
    $gateBar.className = 'warning';
    $gateLabel.textContent = `AUTO-LOCKOUT  ${Math.round(pct)}% REMAINING`;
  } else {
    $gateBar.className = '';
    $gateLabel.textContent = `SESSION EXPIRES  ${Math.round(pct)}% REMAINING`;
  }
}

function triggerGateClose() {
  clearInterval(gateInterval);
  localStorage.removeItem(GATE_KEY);
  localStorage.removeItem(GATE_DUR_KEY);
  lockInput();

  doGlitch(() => {
    const closeLines = [
      ['', ''],
      ['r', '  !! GATE INTEGRITY: 0% !!'],
      ['r', '  !! CONNECTION SEVERED BY EXTERNAL PROTOCOL !!'],
      ['r', '  ARCHIVE ACCESS TERMINATED.'],
      ['', ''],
      ['a', '  Severing operator link...'],
      ['a', '  Flushing session buffers...'],
      ['a', '  Returning to surface...'],
      ['', ''],
      ['d', '  [NODE 7 RETURNING TO STANDBY]'],
    ];
    for (const [t,s] of closeLines) appendLnDirect(t, s);
    bottom();
    setTimeout(() => showGateOverlay(), 2000);
  });
}

function showGateOverlay() {
  $gateOver.classList.add('show');
  const $count = $gateOver.querySelector('.go-count');
  let n = 3;
  $count.textContent = `RETURNING TO SURFACE IN ${n}...`;
  const id = setInterval(() => {
    n--;
    if (n <= 0) { clearInterval(id); window.location.href = CFG.GATE_REDIRECT; }
    else $count.textContent = `RETURNING TO SURFACE IN ${n}...`;
  }, 1000);
}
