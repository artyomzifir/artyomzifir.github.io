// End-to-end render test using jsdom.
// Loads index.html + config.js + render.js, patches fetch to read from disk,
// triggers DOMContentLoaded, and asserts the resulting DOM has real content.

const fs = require('fs');
const path = require('path');
const { JSDOM, ResourceLoader } = require('/tmp/node_modules/jsdom');

const ROOT = path.join(__dirname, '..');

async function runOnce(lang, mode) {
  const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

  const dom = new JSDOM(indexHtml, {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
  });
  const { window } = dom;

  // mock fetch to read from disk
  window.fetch = (url) => {
    const rel = url.replace(/^https?:\/\/[^/]+\//, '').replace(/^\//, '');
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) {
      return Promise.resolve({ ok: false, status: 404, text: () => Promise.resolve('') });
    }
    const body = fs.readFileSync(full, 'utf8');
    return Promise.resolve({
      ok: true, status: 200,
      text: () => Promise.resolve(body),
      json: () => Promise.resolve(JSON.parse(body)),
    });
  };
  // preset state
  window.localStorage.setItem('p-lang', lang);
  window.localStorage.setItem('p-mode', mode);

  const configJs = fs.readFileSync(path.join(ROOT, 'config.js'), 'utf8');
  const renderJs = fs.readFileSync(path.join(ROOT, 'assets/js/render.js'), 'utf8');
  // Inject as script tags so `const`s become script-scope visible to siblings
  const s1 = window.document.createElement('script');
  s1.textContent = configJs;
  window.document.head.appendChild(s1);
  const s2 = window.document.createElement('script');
  s2.textContent = renderJs;
  window.document.head.appendChild(s2);

  // dispatch
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

  // give it a moment to resolve all fetches
  await new Promise(r => setTimeout(r, 500));

  const errors = [];
  const $ = (sel) => window.document.querySelector(sel);

  const tagline = $('#hero-tagline').textContent.trim();
  const pitch   = $('#hero-pitch').textContent.trim();
  const stats   = $('#stats').children.length;
  const exp     = $('#exp-list').querySelectorAll('details').length;
  const proj    = $('#proj-list').querySelectorAll('details').length;
  const edu     = $('#edu-content').querySelectorAll('details').length;
  const aw      = $('#awards-list').querySelectorAll('.award-item').length;

  if (!tagline) errors.push('empty hero-tagline');
  if (!pitch)   errors.push('empty hero-pitch');
  if (!stats)   errors.push('empty stats');
  if (!exp)     errors.push('empty exp list');
  if (mode === 'hard' && !proj) errors.push('empty hard projects list');
  if (!edu)     errors.push('empty education list');
  if (!aw)      errors.push('empty awards list');

  // Language sanity
  if (lang === 'ru' && !/[А-Яа-я]/.test(tagline))
    errors.push(`ru tagline not in Cyrillic: ${tagline}`);
  if (lang === 'en' && /[А-Яа-я]/.test(tagline))
    errors.push(`en tagline has Cyrillic: ${tagline}`);

  return { lang, mode, errors, counts: { tagline: tagline.slice(0, 50), stats, exp, proj, edu, aw } };
}

(async () => {
  const results = [];
  for (const lang of ['en', 'ru']) {
    for (const mode of ['hard', 'soft']) {
      results.push(await runOnce(lang, mode));
    }
  }
  let any = false;
  for (const r of results) {
    const tag = `[${r.lang}/${r.mode}]`;
    if (r.errors.length) {
      any = true;
      console.log(`✗ ${tag}`);
      r.errors.forEach(e => console.log('   ' + e));
    } else {
      console.log(`✓ ${tag}  tagline="${r.counts.tagline}..." stats=${r.counts.stats} exp=${r.counts.exp} proj=${r.counts.proj} edu=${r.counts.edu} aw=${r.counts.aw}`);
    }
  }
  process.exit(any ? 1 : 0);
})();
