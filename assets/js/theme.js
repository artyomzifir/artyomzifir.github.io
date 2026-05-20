// Mode (hard ↔ soft) and language (en ↔ ru) toggles.
// Both transitions are animated:
//   - mode: short class .mode-transitioning is added to <html>, which extends
//     CSS transitions across all elements (color, background, border, font…).
//   - lang: a fade-out → swap → fade-in sequence using .lang-switching on <html>.

const LANG_FADE_MS = 260;
const MODE_TRANS_MS = 600;

function toggleMode() {
  const next = STATE.mode === 'hard' ? 'soft' : 'hard';
  STATE.mode = next;
  localStorage.setItem('p-mode', next);

  document.documentElement.classList.add('mode-transitioning');
  document.documentElement.setAttribute('data-mode', next);
  STATE.cache = {};
  R.renderAll();

  setTimeout(() => {
    document.documentElement.classList.remove('mode-transitioning');
  }, MODE_TRANS_MS);
}

function toggleLang() {
  const next = STATE.lang === 'en' ? 'ru' : 'en';
  const root = document.documentElement;

  // start fade-out
  root.classList.add('lang-switching');

  setTimeout(() => {
    STATE.lang = next;
    root.setAttribute('data-lang', next);
    localStorage.setItem('p-lang', next);
    STATE.cache = {};

    // update button label
    const lb = document.querySelector('.lang-current');
    if (lb) lb.textContent = next.toUpperCase();

    // update nav labels
    const navLabels = {
      en: ['Skills', 'Education', 'Experience', 'Projects', 'Awards'],
      ru: ['Навыки', 'Образование', 'Опыт', 'Проекты', 'Достижения']
    };
    const ids = ['nav-skills', 'nav-edu', 'nav-exp', 'nav-proj', 'nav-awards'];
    (navLabels[next] || navLabels.en).forEach((t, i) => {
      const el = document.getElementById(ids[i]);
      if (el) el.textContent = t;
    });

    // update footer
    const ft = document.getElementById('footer-text');
    if (ft) ft.textContent = next === 'ru'
      ? 'Артём Тузов · Казань / Иннополис · открыт к удалённой работе · 2026'
      : 'Artyom Tuzov · Kazan / Innopolis · open to remote · 2026';

    // re-render content in new language, then fade back in
    Promise.resolve(R.renderAll()).then(() => {
      // small extra frame so newly inserted DOM is painted before opacity goes back to 1
      requestAnimationFrame(() => {
        root.classList.remove('lang-switching');
      });
    });
  }, LANG_FADE_MS);
}
