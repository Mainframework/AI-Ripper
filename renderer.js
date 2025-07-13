// renderer.js
document.addEventListener('DOMContentLoaded', () => {
  // --- Element refs ---
  const inputText            = document.getElementById('inputText');
  const outputText           = document.getElementById('outputText');
  const cleanBtn             = document.getElementById('cleanButton');
  const cleanAllHiddenBtn    = document.getElementById('cleanAllHiddenButton');
  const refactorTextBtn      = document.getElementById('refactorTextButton');
  const refactorCodeBtn      = document.getElementById('refactorCodeButton');
  const clearBtn             = document.getElementById('clearTextButton');
  const copyBtn              = document.getElementById('copyButton');
  const toggleHiddenBtn      = document.getElementById('showHiddenCharsButton');
  const charList             = document.querySelector('.char-list');
  const totalHiddenEl        = document.getElementById('totalHiddenChars');
  const categoryStats        = document.getElementById('categoryStats');
  const copyNotification     = document.getElementById('copyNotification');

  // --- Hidden/control character definitions ---
  const HIDDEN_DEFS = [
    { cp: 0x0020,   regex: / /g,         name: 'SPACE',                  display: ' ',    color: '#800080' },
    { cp: 0x00A0,   regex: /\u00A0/g,    name: 'NO-BREAK SPACE',         display: '\u00A0', color: '#FFA500' },
    { cp: 0x0009,   regex: /\t/g,        name: 'TAB',                    display: '\t',   color: '#00FF00' },
    { cp: 0x000A,   regex: /\n/g,        name: 'LINE FEED',              display: '\n',   color: '#0000FF' },
    { cp: 0x000D,   regex: /\r/g,        name: 'CARRIAGE RETURN',        display: '\r',   color: '#008080' },
    { cp: 0x200B,   regex: /\u200B/g,    name: 'ZERO WIDTH SPACE',       display: '\u200B', color: '#FFFF00' },
    { cp: 0x200C,   regex: /\u200C/g,    name: 'ZERO WIDTH NON-JOINER',  display: '\u200C', color: '#00FFFF' },
    { cp: 0x200D,   regex: /\u200D/g,    name: 'ZERO WIDTH JOINER',      display: '\u200D', color: '#FF00FF' },
    { cp: 0xFEFF,   regex: /\uFEFF/g,    name: 'BYTE ORDER MARK',         display: '\uFEFF', color: '#FF0000' }
  ];

  // state
  let hiddenVisible = false;
  let pristineText  = '';

  // --- init ---
  function init() {
    inputText.setAttribute('contenteditable', 'true');
    // wire buttons
    cleanBtn.addEventListener('click', cleanText);
    cleanAllHiddenBtn.addEventListener('click', cleanAllHidden);
    refactorTextBtn.addEventListener('click', refactorText);
    refactorCodeBtn.addEventListener('click', refactorCode);
    clearBtn.addEventListener('click', clearAll);
    copyBtn.addEventListener('click', copyOutput);
    toggleHiddenBtn.addEventListener('click', toggleHidden);
    clearStats();
  }

  // --- toggle hidden chars view ---
  function toggleHidden() {
    hiddenVisible = !hiddenVisible;
    toggleHiddenBtn.innerHTML = hiddenVisible
      ? '<i class="fas fa-eye-slash"></i> Hide Hidden Characters'
      : '<i class="fas fa-search"></i> Detect Hidden Characters';
    if (hiddenVisible) showHiddenInEditor();
    else             hideHiddenInEditor();
  }

  function showHiddenInEditor() {
    // use innerText so that '\n' characters are preserved
    pristineText = inputText.innerText;
    // escape HTML
    let html = pristineText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // convert actual newlines to <br> for display
      .replace(/\n/g, '<br>');
    // wrap each def (skip LF/CR for in-text wraps)
    HIDDEN_DEFS.forEach(def => {
      if (def.name === 'LINE FEED' || def.name === 'CARRIAGE RETURN') return;
      const label = def.display === ' ' ? '&nbsp;' : def.display;
      const span = `<span class="hidden-char" style="background:${def.color};" title="${def.name}">${label}</span>`;
      html = html.replace(new RegExp(def.regex.source, 'g'), span);
    });
    inputText.innerHTML = html;
    updateStats(pristineText);
  }

  function hideHiddenInEditor() {
    // restore using innerText to keep newlines
    inputText.innerText = pristineText;
    clearStats();
  }

  // --- cleaning functions ---
  function cleanText() {
    // read with innerText to get all newlines
    let txt = inputText.innerText;
    // remove all hidden/control except SPACE
    HIDDEN_DEFS
      .filter(def => def.name !== 'SPACE')
      .forEach(def => { txt = txt.replace(def.regex, ''); });
    // normalize whitespace
    txt = txt.replace(/\s+/g, ' ').trim();
    outputText.value = txt;
    updateStats(txt);
  }

  function cleanAllHidden() {
    let txt = inputText.innerText;
    // remove every hidden/control char (including spaces)
    HIDDEN_DEFS.forEach(def => { txt = txt.replace(def.regex, ''); });
    outputText.value = txt;
    updateStats(txt);
  }

  function refactorText() {
    let txt = inputText.innerText;
    // strip hidden/control except keep single spaces
    HIDDEN_DEFS
      .filter(def => def.name !== 'SPACE')
      .forEach(def => { txt = txt.replace(def.regex, ''); });
    // collapse whitespace
    txt = txt.replace(/\s+/g, ' ').trim();
    outputText.value = txt;
    updateStats(txt);
  }

function refactorCode() {
  let txt = inputText.innerText;

  // First, remove all LINE FEED characters (U+000A)
  txt = txt.replace(/\n/g, ' ');

  // Then normalize all remaining whitespace
  txt = txt
    // Convert multiple spaces to single space
    .replace(/\s+/g, ' ')
    // Preserve indentation (convert leading spaces to single space)
    .replace(/^ +/gm, ' ')
    // Preserve paragraph structure (keep exactly two spaces for separation)
    .replace(/ {2,}/g, '  ')
    // Clean up any remaining multiple spaces between words
    .replace(/ +(?=[^\s])/g, ' ')
    // Clean up spaces at end of lines
    .replace(/ +$/gm, '')
    .trim();

  // Final formatting for better readability
  txt = txt
    // Add line breaks after semicolons and commas
    .replace(/([;,]) /g, '$1\n')
    // Add line breaks after opening braces
    .replace(/\s*\{/g, '\n{')
    // Clean up any resulting multiple spaces
    .replace(/\s+/g, ' ')
    .trim();

  outputText.value = txt;
  updateStats(txt);
}


  // --- clear & copy ---
  function clearAll() {
    hiddenVisible = false;
    toggleHiddenBtn.innerHTML = '<i class="fas fa-search"></i> Detect Hidden Characters';
    inputText.innerText = '';
    outputText.value     = '';
    clearStats();
  }

  function copyOutput() {
    const txt = outputText.value;
    if (!txt) return;
    navigator.clipboard.writeText(txt);
    copyNotification.style.display = 'block';
    setTimeout(() => { copyNotification.style.display = 'none'; }, 2000);
  }

  // --- stats & UI updates ---
  function updateStats(text) {
    const counts = {};
    HIDDEN_DEFS.forEach(def => {
      const matches = text.match(def.regex);
      if (matches) counts[def.name] = matches.length;
    });
    const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
    totalHiddenEl.textContent = total;
    renderCharList(counts);
    renderCategoryStats(counts);
  }

  function clearStats() {
    totalHiddenEl.textContent = '0';
    charList.innerHTML = '<div class="char-item">No hidden characters detected</div>';
    categoryStats.innerHTML = '';
  }

  function renderCharList(counts) {
    charList.innerHTML = '';
    const names = Object.keys(counts);
    if (names.length === 0) {
      charList.innerHTML = '<div class="char-item">No hidden characters detected</div>';
      return;
    }
    names.forEach(name => {
      const count = counts[name];
      const def   = HIDDEN_DEFS.find(d => d.name === name);
      const code  = def.cp.toString(16).toUpperCase().padStart(4, '0');
      const div   = document.createElement('div');
      div.className = 'char-item';
      div.innerHTML = `
        <span class="char-icon" style="background:${def.color};"></span>
        <span class="char-highlight">${count}×</span>
        U+${code}
        <span class="char-name">${name}</span>
      `;
      charList.appendChild(div);
    });
  }

  function renderCategoryStats(counts) {
    categoryStats.innerHTML = '';
    Object.entries(counts).forEach(([name, count]) => {
      const def  = HIDDEN_DEFS.find(d => d.name === name);
      const code = def.cp.toString(16).toUpperCase().padStart(4,'0');
      const li   = document.createElement('li');
      li.innerHTML = `
        <span class="char-highlight">${count}×</span>
        U+${code}
        <span class="char-name">${name}</span>
      `;
      categoryStats.appendChild(li);
    });
  }

  init();
});
