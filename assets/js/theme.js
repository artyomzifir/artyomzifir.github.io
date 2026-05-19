function toggleMode() {
  const next = STATE.mode === 'hard' ? 'soft' : 'hard';
  STATE.mode = next;
  document.documentElement.setAttribute('data-mode', next);
  document.documentElement.classList.add('transitioning');
  localStorage.setItem('p-mode', next);
  R.renderAll();
  setTimeout(() => document.documentElement.classList.remove('transitioning'), 500);
}

function toggleLang() {
  const next = STATE.lang === 'en' ? 'ru' : 'en';
  STATE.lang = next;
  document.documentElement.setAttribute('data-lang', next);
  localStorage.setItem('p-lang', next);
  // clear cache so files reload with correct language
  STATE.cache = {};
  R.renderAll();
}
