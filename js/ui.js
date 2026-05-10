/* ═══════════════════════════════════════════════════════════════
   ui.js — DOM refs, clock, badge, uptime, input lock, operator IP
   Depends on: data.js (TIERS, TIER_CLS, FILES, rand), state.js (S)
═══════════════════════════════════════════════════════════════ */

// ── DOM REFS ───────────────────────────────────────────────────
const $out      = document.getElementById('output');
const $in       = document.getElementById('cmd-in');
const $clock    = document.getElementById('sys-clock');
const $badge    = document.getElementById('badge');
const $tBody    = document.getElementById('terminal-body');
const $gBar     = document.getElementById('glitch-bar');
const $sweep    = document.getElementById('scan-sweep');
const $roll     = document.getElementById('roll-line');
const $warn     = document.getElementById('warn-overlay');
const $gateBar  = document.getElementById('gate-bar');
const $gateFill = document.getElementById('gate-fill');
const $gateTime = document.getElementById('gate-timer');
const $gateLabel= document.getElementById('gate-label');
const $gateOver = document.getElementById('gate-overlay');
const $pwr      = document.getElementById('pwr-indicator');
const $noise    = document.getElementById('noise-layer');
const $sbOp     = document.getElementById('sb-operator');
const $uptime   = document.getElementById('uptime-display');
const $diagUp   = document.getElementById('diag-uptime');
const $authTok  = document.getElementById('auth-token');
const $clrLevel = document.getElementById('clr-level');
const $clrFiles = document.getElementById('clr-files');
const $audioToggle = document.getElementById('audio-toggle');

// ── OPERATOR IP ────────────────────────────────────────────────
let operatorIP = '███.███.███.███';
(async () => {
  try {
    const r = await fetch('https://api.ipify.org?format=json');
    const d = await r.json();
    operatorIP = d.ip;
  } catch {
    operatorIP = `192.168.${rand(1,254)}.${rand(1,254)}`;
  }
  if ($sbOp) $sbOp.textContent = `OPERATOR: ${operatorIP}`;
})();

// ── SESSION START ──────────────────────────────────────────────
const sessionStart = Date.now();

// ── CLOCK ──────────────────────────────────────────────────────
function tickClock() {
  const n = new Date(), p = x => String(x).padStart(2,'0');
  const ms = String(n.getMilliseconds()).padStart(3,'0');
  $clock.textContent =
    `${n.getFullYear()}-${p(n.getMonth()+1)}-${p(n.getDate())} ${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())}.${ms}`;
}
setInterval(tickClock, 50);
tickClock();

// ── CURSOR TRACKING ────────────────────────────────────────────
const $cursor     = document.getElementById('cursor');
const $cursorSizer = document.getElementById('cursor-sizer');
const $promptStr  = document.getElementById('prompt-str');

function syncCursor() {
  if (!$cursor || !$cursorSizer || !$promptStr) return;
  const pos = $in.selectionStart ?? $in.value.length;
  $cursorSizer.textContent = $in.value.substring(0, pos);
  const left = $promptStr.offsetLeft + $promptStr.offsetWidth + $cursorSizer.offsetWidth;
  $cursor.style.left = left + 'px';
}

$in.addEventListener('input',   syncCursor);
$in.addEventListener('keyup',   syncCursor);
$in.addEventListener('click',   syncCursor);
$in.addEventListener('focus',   syncCursor);
syncCursor();

// ── UPTIME ─────────────────────────────────────────────────────
function updateUptime() {
  const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const fmt = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  if ($uptime) $uptime.textContent = `UP: ${fmt}`;
  if ($diagUp) $diagUp.textContent = fmt;
}
setInterval(updateUptime, 1000);
updateUptime();

// ── BADGE & CLEARANCE PANEL ────────────────────────────────────
function refreshBadge() {
  $badge.textContent = TIERS[S.clearance];
  $badge.className   = TIER_CLS[S.clearance];
  if ($sbOp) $sbOp.textContent = `OPERATOR: ${operatorIP}`;
  if ($clrLevel) $clrLevel.textContent = TIERS[S.clearance];
  if ($clrFiles) {
    const count = Object.values(FILES).filter(f => f.tier <= S.clearance).length;
    $clrFiles.textContent = String(count);
  }
}
refreshBadge();

// ── AUTH TOKEN ─────────────────────────────────────────────────
function genAuthToken() {
  return Array.from({length: 8}, () => rand(0, 15).toString(16).toUpperCase()).join('');
}
let authToken = genAuthToken();
if ($authTok) $authTok.textContent = authToken;

// ── OPTIONAL AUDIO ────────────────────────────────────────────
const AUDIO_KEY = 'dwp_audio_enabled';
let audioEnabled = localStorage.getItem(AUDIO_KEY) === '1';
let audioCtx = null;
let audioHum = null;
let audioHumGain = null;

function updateAudioToggle() {
  if (!$audioToggle) return;
  $audioToggle.textContent = audioEnabled ? '[AUDIO: ON]' : '[AUDIO: OFF]';
  $audioToggle.classList.toggle('on', audioEnabled);
}

function ensureAudio() {
  if (!audioEnabled) return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
    audioHumGain = audioCtx.createGain();
    audioHumGain.gain.value = 0.018;
    audioHumGain.connect(audioCtx.destination);

    audioHum = audioCtx.createOscillator();
    audioHum.type = 'sine';
    audioHum.frequency.value = 60;
    const overtone = audioCtx.createOscillator();
    overtone.type = 'triangle';
    overtone.frequency.value = 120;
    const overtoneGain = audioCtx.createGain();
    overtoneGain.gain.value = 0.008;
    overtone.connect(overtoneGain).connect(audioHumGain);
    audioHum.connect(audioHumGain);
    audioHum.start();
    overtone.start();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function setAudioEnabled(next) {
  audioEnabled = !!next;
  localStorage.setItem(AUDIO_KEY, audioEnabled ? '1' : '0');
  if (!audioEnabled && audioCtx) {
    audioCtx.suspend?.();
  } else if (audioEnabled) {
    ensureAudio();
  }
  updateAudioToggle();
}

function playRelayClick() {
  const ctx = ensureAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.03);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.025, ctx.currentTime + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}

function playStaticBurst() {
  const ctx = ensureAudio();
  if (!ctx) return;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.2;
  const src = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  filter.type = 'bandpass';
  filter.frequency.value = 1400;
  gain.gain.value = 0.015;
  src.buffer = buffer;
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start();
}

function playSonarPing() {
  const ctx = ensureAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(432, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.03, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.4);
}

updateAudioToggle();

if ($audioToggle) {
  $audioToggle.addEventListener('click', () => setAudioEnabled(!audioEnabled));
}

function rotateAuthToken() {
  const next = genAuthToken();
  let frame = 0;
  const GLYPHS = '0123456789ABCDEF';
  const id = setInterval(() => {
    frame++;
    const partial = Math.floor((frame / 10) * 8);
    let scrambled = next.slice(0, partial);
    for (let i = partial; i < 8; i++) scrambled += GLYPHS[rand(0, 15)];
    if ($authTok) $authTok.textContent = scrambled;
    if (frame >= 10) { clearInterval(id); authToken = next; if ($authTok) $authTok.textContent = authToken; }
  }, 60);
}
setInterval(rotateAuthToken, 45000);

// ── INPUT LOCK ─────────────────────────────────────────────────
let inputLocked = false;
let cmdOverride = null;

function lockInput()   { inputLocked = true;  $in.disabled = true; }
function unlockInput() { inputLocked = false; $in.disabled = false; $in.focus(); bottom(); }

// ── COMMAND HISTORY ────────────────────────────────────────────
const hist = []; let histIdx = -1;

// ── EVENT LOG ──────────────────────────────────────────────────
function logEvent(text, type) {
  const $log = document.getElementById('event-log');
  if (!$log) return;
  const now = new Date();
  const p = x => String(x).padStart(2,'0');
  const ts = `${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`;
  const entry = document.createElement('div');
  entry.className = 'event-entry';
  const color = type === 'warn' ? 'var(--amber)' : type === 'error' ? 'var(--red-hi)' : '';
  entry.innerHTML = `<span class="event-ts">${ts}</span> <span style="${color ? `color:${color}` : ''}">${esc(text)}</span>`;
  $log.insertBefore(entry, $log.firstChild);
  while ($log.children.length > 8) $log.removeChild($log.lastChild);
}

// ── NOTIFICATION STRIP ─────────────────────────────────────────
let $notifStrip = null;

function initNotifStrip() {
  $notifStrip = document.createElement('div');
  $notifStrip.id = 'notif-strip';
  document.body.appendChild($notifStrip);
}

function showNotif(text, type) {
  if (!$notifStrip) return;
  const entry = document.createElement('div');
  entry.className = `notif-entry notif-${type || 'info'}`;
  entry.textContent = text;
  $notifStrip.appendChild(entry);
  setTimeout(() => {
    entry.style.opacity = '0';
    entry.style.transition = 'opacity 0.3s';
    setTimeout(() => entry.remove(), 300);
  }, 8000);
}

// ── POWER VOLTAGE FLUCTUATION ──────────────────────────────────
setInterval(() => {
  const v = (12.0 + Math.random() * 0.9).toFixed(1);
  $pwr.textContent = `PWR: ${v}V`;
  $pwr.style.color = parseFloat(v) < 12.3 ? 'var(--red-hi)' : 'var(--amber)';
}, 3000);
