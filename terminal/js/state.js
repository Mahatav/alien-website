

function freshState() {
  return { clearance: 0, decrypted: [], attempts: {} };
}

let S = (() => {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || freshState(); }
  catch { return freshState(); }
})();

function persist() { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); }

function caesar(str, n) {
  return str.split('').map(c => {
    if (c >= 'A' && c <= 'Z') return String.fromCharCode(((c.charCodeAt(0) - 65 + n + 26) % 26) + 65);
    if (c >= 'a' && c <= 'z') return String.fromCharCode(((c.charCodeAt(0) - 97 + n + 26) % 26) + 97);
    return c;
  }).join('');
}
