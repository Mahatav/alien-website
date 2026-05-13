

let typeQueue   = [];
let typeRunning = false;
let typeSkip    = false;

function queueLines(arr, speed, done) {
  typeQueue.push({ arr, speed, done });
  if (!typeRunning) drainQueue();
}

function drainQueue() {
  if (!typeQueue.length) { typeRunning = false; return; }
  typeRunning = true;
  typeSkip    = false;
  const { arr, speed, done } = typeQueue.shift();
  typeLineSeq(arr, speed, () => {
    if (done) done();
    drainQueue();
  });
}

function typeLineSeq(arr, speed, done) {
  let i = 0;
  function next() {
    if (i >= arr.length) { bottom(); if (done) done(); return; }
    const [t, s] = arr[i++];

    if (t === '' || s === '' || s == null) {
      appendLnDirect(t, s ?? '');
      bottom();
      setTimeout(next, typeSkip ? 0 : 25);
      return;
    }

    if (isDecorLine(s)) {
      appendLnDirect(t, s);
      bottom();
      setTimeout(next, typeSkip ? 0 : 8);
      return;
    }

    const ms = typeSkip ? 0 : charSpeed(t, speed);
    typeChar(t, s, ms, next);
  }
  next();
}

function isDecorLine(s) {
  const core = s.trim();
  return !core || /^[═=─\-█▓░▒\|\s\/\\]+$/.test(core);
}

function charSpeed(lineType, speedName) {
  const base = speedName === 'fast' ? CFG.SPEED_FAST
             : speedName === 'slow' ? CFG.SPEED_SLOW
             : CFG.SPEED_NORM;
  if (lineType === 'd') return Math.max(2, Math.round(base * 0.38));
  if (lineType === 'b') return Math.round(base * 1.45);
  if (lineType === 'r') return Math.round(base * 0.85);
  if (lineType === 'a') return Math.round(base * 1.1);
  return base;
}

function typeChar(t, s, msPerChar, done) {
  const el = document.createElement('div');
  el.className = lnClass(t);
  $out.appendChild(el);

  if (!msPerChar) {
    el.textContent = s; bottom();
    if (done) setTimeout(done, 0);
    return;
  }

  let i = 0;
  const tick = () => {
    if (typeSkip) {
      el.textContent = s; bottom();
      if (done) done();
      return;
    }
    i++;
    
    let display = s.slice(0, i);
    if (t === 'd' && i < s.length && Math.random() < 0.15) {
      display += CORRUPT_CHARS[rand(0, CORRUPT_CHARS.length - 1)];
    } else {
      display += (i < s.length ? '▌' : '');
    }
    el.textContent = display;
    bottom();
    if (i >= s.length) {
      el.textContent = s;
      if (done) done();
    } else {
      setTimeout(tick, msPerChar);
    }
  };
  setTimeout(tick, msPerChar);
}

function flushTyping() { typeSkip = true; }

function lnClass(t) {
  return { b:'ln ln-b', d:'ln ln-d', a:'ln ln-a', r:'ln ln-r', '':'ln ln-' }[t] ?? 'ln ln-n';
}

function appendLnDirect(t, s) {
  const el = document.createElement('div');
  el.className = lnClass(t) + ' no-bloom';
  el.textContent = s ?? '';
  $out.appendChild(el);

  
  const ghost = document.createElement('div');
  ghost.className = lnClass(t) + ' no-bloom';
  ghost.textContent = s ?? '';
  ghost.style.cssText = 'min-height:0;height:0;overflow:visible;margin-top:-1.68em;opacity:0.08;pointer-events:none;user-select:none;';
  $out.appendChild(ghost);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    ghost.style.transition = 'opacity 0.6s linear';
    ghost.style.opacity = '0';
    setTimeout(() => ghost.remove(), 620);
  }));

  return el;
}

function appendCmd(str) {
  const el = document.createElement('div');
  el.className = 'ln ln-cmd';
  el.innerHTML = `NODE7://&gt; <span class="cmd-txt">${esc(str)}</span>`;
  $out.appendChild(el);
}

function bottom() { $out.scrollTop = $out.scrollHeight; }
function esc(s)   { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
