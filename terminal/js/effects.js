

(function initNoise() {
  const ctx = $noise.getContext('2d');
  function draw() {
    $noise.width = window.innerWidth; $noise.height = window.innerHeight;
    const img = ctx.createImageData($noise.width, $noise.height);
    const d   = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() > .5 ? 255 : 0;
      d[i] = d[i+1] = d[i+2] = v; d[i+3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }
  draw();
  setInterval(draw, 80);
  window.addEventListener('resize', draw);
})();

function initDust() {
  const layer = document.getElementById('dust-layer');
  if (!layer) return;
  for (let i = 0; i < 14; i++) {
    const d = document.createElement('div');
    d.className = 'dust';
    d.style.left = `${Math.random() * 100}vw`;
    d.style.top  = `${Math.random() * 100}vh`;
    d.style.setProperty('--dx', `${(Math.random() - 0.5) * 40}px`);
    d.style.setProperty('--dy', `${(Math.random() - 0.5) * 40}px`);
    d.style.animationDuration = `${10 + Math.random() * 25}s`;
    d.style.animationDelay   = `${-Math.random() * 25}s`;
    layer.appendChild(d);
  }
}

(function schedRoll() {
  function fire() {
    $roll.classList.remove('rolling'); void $roll.offsetWidth; $roll.classList.add('rolling');
    setTimeout(schedRoll, 7200);
  }
  setTimeout(fire, 9000 + Math.random() * 25000);
})();

(function schedBurst() {
  function fire() {
    $tBody.style.filter = 'brightness(1.3) contrast(1.1)';
    setTimeout(() => { $tBody.style.filter = ''; }, 40);
    setTimeout(schedBurst, 18000 + Math.random() * 40000);
  }
  setTimeout(fire, 22000 + Math.random() * 30000);
})();

let bootComplete = false;

function schedInstability() {
  const delay = (90 + Math.random() * 90) * 1000;
  setTimeout(() => {
    if (bootComplete && !typeRunning) {
      const type = rand(0, 2);
      const crt = document.getElementById('crt');
      if (type === 0) {
        
        crt.style.transform = `translateX(${rand(3,6)}px)`;
        setTimeout(() => { crt.style.transform = ''; }, 80);
      } else if (type === 1) {
        
        crt.style.filter = 'brightness(0.4)';
        setTimeout(() => { crt.style.filter = ''; }, 200);
        triggerWaveFlatline(500);
      } else {
        
        const bar = document.getElementById('roll-line');
        bar.style.height = '10px';
        bar.classList.remove('rolling'); void bar.offsetWidth; bar.classList.add('rolling');
        setTimeout(() => { bar.style.height = ''; }, 7100);
      }
      logEvent('SYSTEM INSTABILITY DETECTED', 'warn');
      dropSignal(rand(15, 25), 3000);
    }
    schedInstability();
  }, delay);
}

const AMBIENT_MSGS = [
  '  [PROCESS: bg-monitor-07 — still active]',
  '  [RESONANCE EVENT LOGGED — 432.000 Hz — DURATION: 0.004s]',
  '  [QUERY FROM NODE 4 — DENIED — NO ACTIVE NODE 4]',
  '  [LARK: SESSION TOKEN DETECTED — EXPIRED 1994-03-07]',
];

function schedAmbient() {
  const delay = (90 + Math.random() * 30) * 1000;
  setTimeout(() => {
    if (bootComplete && !typeRunning && !inputLocked) {
      appendLnDirect('d', AMBIENT_MSGS[rand(0, AMBIENT_MSGS.length - 1)]);
      bottom();
    }
    schedAmbient();
  }, delay);
}

function doGlitch(cb) {
  $tBody.classList.add('glitching');
  $gBar.classList.add('active');
  playStaticBurst();
  setTimeout(() => {
    $tBody.classList.remove('glitching');
    $gBar.classList.remove('active');
    if (cb) cb();
  }, 580);
}

function doSweep() {
  $sweep.classList.remove('active'); void $sweep.offsetWidth; $sweep.classList.add('active');
}

function showWarning() {
  $warn.classList.add('show');
  const dismiss = () => {
    $warn.classList.remove('show');
    document.removeEventListener('keydown', dismiss);
    $warn.removeEventListener('click', dismiss);
  };
  setTimeout(() => {
    document.addEventListener('keydown', dismiss);
    $warn.addEventListener('click', dismiss);
  }, 300);
}

function showStartupWarning(onDismiss) {
  $warn.innerHTML = `
    <div class="w-title">!! UNAUTHORISED ACCESS DETECTED !!</div>
    <div class="w-line">THIS SYSTEM IS THE EXCLUSIVE PROPERTY OF</div>
    <div class="w-line" style="color:var(--fg-hi); letter-spacing:3px; font-size:13px; margin:4px 0;">
      MNEMOSYNE SYSTEMS INC.
    </div>
    <div class="w-line">DEEP WATCH PROTOCOL — CLASSIFIED MAINFRAME</div>
    <div class="w-line" style="color:var(--red-hi); margin-top:14px;">
      UNAUTHORISED ACCESS IS A VIOLATION OF 18 USC §1030
    </div>
    <div class="w-line">AND APPLICABLE FEDERAL AND INTERNATIONAL STATUTES.</div>
    <div class="w-line" style="margin-top:10px;">ORIGIN ADDRESS: <span style="color:var(--red-hi)">${operatorIP}</span></div>
    <div class="w-line">DEVICE ID AND SESSION DATA CAPTURED AND TRANSMITTED.</div>
    <div class="w-line" style="margin-top:10px; color:var(--amber-hi);">BIOMETRIC CAPTURE: <span style="color:var(--red-hi)">ACTIVE</span></div>
    <div class="w-line" style="color:var(--amber-hi);">SECURITY RESPONSE TEAM: <span style="color:var(--red-hi)">NOTIFIED</span></div>
    <div class="w-line" style="margin-top:14px; color:var(--fg-dim); font-size:11px;">
      IF YOU ARE AN AUTHORISED OPERATOR, PROCEED.<br/>
      ALL ACTIVITY IN THIS SESSION WILL BE MONITORED AND RECORDED.
    </div>
    <div class="w-dismiss" style="margin-top:22px;">[ PRESS ANY KEY TO ACKNOWLEDGE AND ENTER ]</div>
  `;
  $warn.classList.add('show');
  const proceed = () => {
    $warn.classList.remove('show');
    document.removeEventListener('keydown', proceed);
    $warn.removeEventListener('click', proceed);
    if (onDismiss) onDismiss();
  };
  setTimeout(() => {
    document.addEventListener('keydown', proceed);
    $warn.addEventListener('click', proceed);
  }, 800);
}

let radarAngle    = 0;
let radarBlips    = [];
let radarScanMode = false;
let radarScanEnd  = 0;

function initRadar() {
  const canvas = document.getElementById('radar-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  const maxR = Math.min(W, H) / 2 - 4;

  
  radarBlips = [
    { a: 0.3,  r: 0.45, fade: 0 },
    { a: 1.1,  r: 0.70, fade: 0 },
    { a: 2.4,  r: 0.30, fade: 0 },
    { a: 3.8,  r: 0.60, fade: 0 },
    { a: 5.2,  r: 0.80, fade: 0 },
  ];

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#060608';
    ctx.fillRect(0, 0, W, H);

    
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * (i / 5), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(200,200,200,${0.03 + i * 0.01})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    
    ctx.strokeStyle = 'rgba(170,170,170,0.06)';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(cx, 0);  ctx.lineTo(cx, H);  ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, cy);  ctx.lineTo(W, cy);  ctx.stroke();

    
    for (let t = 0; t < 80; t++) {
      const trailA = radarAngle - (t / 80) * (Math.PI * 0.6);
      const opacity = (1 - t / 80) * 0.10;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(trailA) * maxR, cy + Math.sin(trailA) * maxR);
      ctx.strokeStyle = `rgba(88,166,255,${opacity})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(radarAngle) * maxR, cy + Math.sin(radarAngle) * maxR);
    ctx.strokeStyle = 'rgba(88,166,255,0.9)';
    ctx.lineWidth = 1;
    ctx.stroke();

    
    for (const blip of radarBlips) {
      if (blip.fade <= 0) continue;
      const bx = cx + Math.cos(blip.a) * blip.r * maxR;
      const by = cy + Math.sin(blip.a) * blip.r * maxR;
      ctx.beginPath();
      ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(88,166,255,${blip.fade * 0.9})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bx, by, 5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,92,92,${blip.fade * 0.14})`;
      ctx.fill();
    }

    
    const rpm = (radarScanMode && Date.now() < radarScanEnd) ? 18 : 6;
    radarAngle += (rpm / 60) * (Math.PI * 2) / 60;
    if (radarAngle > Math.PI * 2) radarAngle -= Math.PI * 2;

    
    for (const blip of radarBlips) {
      const diff = Math.abs(((blip.a - radarAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (diff < 0.12) {
        blip.fade = 1.0;
        blip.a += (Math.random() - 0.5) * 0.04;
        blip.r = Math.max(0.1, Math.min(0.95, blip.r + (Math.random() - 0.5) * 0.03));
        if (radarScanMode) playSonarPing();
      } else {
        blip.fade = Math.max(0, blip.fade - 0.003);
      }
    }

    requestAnimationFrame(drawFrame);
  }

  drawFrame();
}

function triggerRadarScan() {
  radarScanMode = true;
  radarScanEnd  = Date.now() + 5000;
  radarBlips.push(
    { a: Math.random() * Math.PI * 2, r: 0.3 + Math.random() * 0.6, fade: 0.9 },
    { a: Math.random() * Math.PI * 2, r: 0.3 + Math.random() * 0.6, fade: 0.9 },
  );
  if (radarBlips.length > 9) radarBlips = radarBlips.slice(-9);
}

let waveOffset         = 0;
let waveAmplitude      = 1;
let waveTargetAmp      = 1;
let waveFlatlineUntil  = 0;

function initWaveform() {
  const canvas = document.getElementById('wave-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const midY = H / 2;

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#060608';
    ctx.fillRect(0, 0, W, H);

    const flatline = Date.now() < waveFlatlineUntil;
    waveAmplitude += (waveTargetAmp - waveAmplitude) * 0.05;

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(232,232,232,0.85)';
    ctx.lineWidth   = 1;
    ctx.shadowBlur  = 4;
    ctx.shadowColor = 'rgba(88,166,255,0.30)';

    for (let x = 0; x < W; x++) {
      const t = (x + waveOffset) / W;
      let y;
      if (flatline) {
        y = midY + (Math.random() - 0.5) * 2;
      } else {
        y = midY
          + Math.sin(t * Math.PI * 2 * 4) * (H * 0.30) * waveAmplitude
          + (Math.random() - 0.5) * 2;
      }
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    waveOffset += 1.5;
    if (waveOffset > W) waveOffset -= W;

    requestAnimationFrame(drawFrame);
  }
  drawFrame();
}

function triggerWavePulse() {
  waveTargetAmp = 2.2;
  setTimeout(() => { waveTargetAmp = 1; }, 1200);
}

function triggerWaveFlatline(ms) {
  waveFlatlineUntil = Date.now() + ms;
  waveTargetAmp = 0.05;
  setTimeout(() => { waveTargetAmp = 1; }, ms + 300);
}

let sigBase    = 78;
let sigPhase   = 0;

function updateSignal() {
  sigPhase += 0.017;
  const current = Math.max(0, Math.min(100, sigBase + Math.sin(sigPhase) * 5));
  const $fill = document.getElementById('sig-fill');
  const $pct  = document.getElementById('sig-pct');
  if ($fill) {
    $fill.style.width = `${current}%`;
    if (current < 40) {
      $fill.style.background = 'var(--red)';
      $fill.style.boxShadow  = '0 0 5px var(--red)';
    } else if (current < 60) {
      $fill.style.background = 'var(--amber)';
      $fill.style.boxShadow  = '0 0 5px var(--amber)';
    } else {
      $fill.style.background = 'var(--fg)';
      $fill.style.boxShadow  = '0 0 5px var(--fg)';
    }
  }
  if ($pct) $pct.textContent = `${Math.round(current)}%`;
}
setInterval(updateSignal, 1000);

function dropSignal(amount, recoverMs) {
  sigBase = Math.max(30, sigBase - amount);
  setTimeout(() => { sigBase = Math.min(78, sigBase + amount); }, recoverMs);
}

function updateMemTemp() {
  const mins = (Date.now() - sessionStart) / 60000;
  const mem  = Math.min(211, Math.floor(187 + mins));
  const temp = Math.min(75, 61 + (mins / 8) * 10);

  const $mem  = document.getElementById('mem-val');
  const $temp = document.getElementById('diag-temp');
  if ($mem)  $mem.textContent  = `${mem}/256K`;
  if ($temp) {
    $temp.textContent = `${temp.toFixed(0)}°C`;
    $temp.style.color      = temp > 70 ? 'var(--amber)' : '';
    $temp.style.textShadow = temp > 70 ? 'var(--glow-a)' : '';
  }
}
setInterval(updateMemTemp, 10000);
updateMemTemp();

function buildNavTree() {
  const $nav = document.getElementById('nav-tree');
  if (!$nav) return;
  $nav.innerHTML = '';

  
  for (const [key, folder] of Object.entries(ARCHIVE)) {
    const section  = document.createElement('div');
    section.className = 'nav-section';

    const hdr = document.createElement('div');
    hdr.className = 'nav-item nav-folder';
    hdr.textContent = `▶ ${key}/`;

    const children = document.createElement('div');
    children.className = 'nav-children';
    children.style.display = 'none';
    let expanded = false;

    hdr.addEventListener('click', () => {
      expanded = !expanded;
      hdr.textContent = `${expanded ? '▼' : '▶'} ${key}/`;
      children.style.display = expanded ? 'block' : 'none';
    });

    for (const f of folder.files) {
      const item = document.createElement('div');
      item.className = 'nav-item nav-file';
      item.textContent = `  ${f.name}`;
      item.title = `open ${key}/${f.name}`;
      item.addEventListener('click', () => {
        if (inputLocked || typeRunning) return;
        lockInput();
        dispatch(`open ${key}/${f.name}`);
      });
      children.appendChild(item);
    }

    section.appendChild(hdr);
    section.appendChild(children);
    $nav.appendChild(section);
  }

  
  const narHdr = document.createElement('div');
  narHdr.className = 'nav-tier-hdr';
  narHdr.textContent = '[NARRATIVE]';
  $nav.appendChild(narHdr);

  for (const [name, file] of Object.entries(FILES)) {
    const accessible = file.tier <= S.clearance;
    const item = document.createElement('div');

    if (accessible) {
      item.className = 'nav-item nav-file';
      item.textContent = `  ${name}`;
      item.title = `open ${name}`;
      item.addEventListener('click', () => {
        if (inputLocked || typeRunning) return;
        lockInput();
        dispatch(`open ${name}`);
      });
    } else {
      item.className = 'nav-item nav-locked';
      item.textContent = `  \u{1F512} ${name}`;
      item.title = `Requires ${TIERS[file.tier]} clearance`;
    }
    $nav.appendChild(item);
  }
}

function createFloatWin(id, title, bodyHTML, autoCloseMs) {
  const existing = document.getElementById(id);
  if (existing) { existing.remove(); }

  const win = document.createElement('div');
  win.id = id;
  win.className = 'float-win';
  win.innerHTML = `
    <div class="float-win-hdr">
      <span>${title}</span>
      <button class="float-close" title="close">×</button>
    </div>
    <div class="float-win-body">${bodyHTML}</div>
  `;

  
  win.style.left = `${300 + Math.random() * 250}px`;
  win.style.top  = `${120 + Math.random() * 150}px`;

  document.body.appendChild(win);

  
  const hdr = win.querySelector('.float-win-hdr');
  let dragging = false, ox, oy, ol, ot;
  hdr.addEventListener('mousedown', e => {
    dragging = true; ox = e.clientX; oy = e.clientY;
    ol = parseInt(win.style.left) || 0; ot = parseInt(win.style.top) || 0;
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    win.style.left = `${ol + e.clientX - ox}px`;
    win.style.top  = `${ot + e.clientY - oy}px`;
  });
  document.addEventListener('mouseup', () => { dragging = false; });
  win.querySelector('.float-close').addEventListener('click', () => win.remove());

  if (autoCloseMs) setTimeout(() => { if (win.parentNode) win.remove(); }, autoCloseMs);
  return win;
}
