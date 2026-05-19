function toggleMode() {
  const next = STATE.mode === 'hard' ? 'soft' : 'hard';
  STATE.mode = next;
  document.documentElement.setAttribute('data-mode', next);
  document.documentElement.classList.add('transitioning');
  localStorage.setItem('p-mode', next);
  STATE.cache = {};
  R.renderAll();
  setTimeout(() => document.documentElement.classList.remove('transitioning'), 500);
}

function toggleLang() {
  const next = STATE.lang === 'en' ? 'ru' : 'en';
  STATE.lang = next;
  document.documentElement.setAttribute('data-lang', next);
  localStorage.setItem('p-lang', next);
  STATE.cache = {};
  // update button label
  const lb = document.querySelector('.lang-current');
  if (lb) lb.textContent = next.toUpperCase();
  // update nav + footer
  const navLabels = {
    en: ['Skills','Education','Experience','Projects','Awards'],
    ru: ['Навыки','Образование','Опыт','Проекты','Достижения']
  };
  const ids = ['nav-skills','nav-edu','nav-exp','nav-proj','nav-awards'];
  (navLabels[next]||navLabels.en).forEach((t,i) => {
    const el = document.getElementById(ids[i]);
    if (el) el.textContent = t;
  });
  const ft = document.getElementById('footer-text');
  if (ft) ft.textContent = next === 'ru'
    ? 'Артём Тузов · Казань / Иннополис · открыт к удалённой работе · 2026'
    : 'Artyom Tuzov · Kazan / Innopolis · open to remote · 2026';
  R.renderAll();
}
