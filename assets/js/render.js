// ─────────────────────────────────────────────
//  State
// ─────────────────────────────────────────────
let STATE = {
  mode: CONFIG.default_mode,
  lang: CONFIG.default_lang,
  manifest: null,
  cache: {}
};

// ─────────────────────────────────────────────
//  Bilingual MD parser
//
//  Frontmatter: shared keys (id, order, mode, tags, github, link, year, proof,
//  courses_*_en, courses_*_ru, stats_*_en, stats_*_ru, ...)
//                + localized keys (name_en, name_ru, meta_en, meta_ru,
//                                  sub_en, sub_ru, stack_*, problem_*,
//                                  solution_*, result_*, tagline_*_en, ...).
//  Body: split into "## en" / "## ru" sections. Inside a section,
//        first paragraph(s) before any "###" are the summary; subsections like
//        "### bullets" and "### course_data_hard|soft" follow.
// ─────────────────────────────────────────────
function parseMd(text) {
  const out = {};
  let body = text.trim();
  const fm = body.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)/);

  // ----- frontmatter -----
  if (fm) {
    const raw = fm[1];
    body = fm[2].trim();
    const lines = raw.split('\n');
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      // YAML list (e.g. stats_hard_en:\n  - num: "X"\n    label: "Y")
      const listHead = line.match(/^(\w+):\s*$/);
      if (listHead) {
        const key = listHead[1];
        const items = [];
        i++;
        while (i < lines.length && /^\s+-/.test(lines[i])) {
          const numM = lines[i].match(/-\s*num:\s*"([^"]*)"/);
          if (numM && lines[i + 1]) {
            const labM = lines[i + 1].match(/label:\s*"([^"]*)"/);
            if (labM) { items.push({ num: numM[1], label: labM[1] }); i += 2; continue; }
          }
          i++;
        }
        if (items.length) out[key] = items;
        continue;
      }
      // Quoted string
      const strM = line.match(/^(\w+):\s*"((?:[^"\\]|\\.)*)"\s*$/);
      if (strM) { out[strM[1]] = strM[2].replace(/\\"/g, '"'); i++; continue; }
      // Bare or inline-array value
      const bareM = line.match(/^(\w+):\s+(.+)$/);
      if (bareM) {
        const v = bareM[2].trim();
        if (v.startsWith('[') && v.endsWith(']')) {
          out[bareM[1]] = v.slice(1, -1)
            .match(/("(?:[^"\\]|\\.)*"|[^,]+)/g)
            ?.map(s => s.trim().replace(/^["']|["']$/g, '').replace(/\\"/g, '"'))
            ?? [];
        } else {
          out[bareM[1]] = v;
        }
      }
      i++;
    }
  }

  // ----- body: split into language blocks -----
  // Each "## en" / "## ru" block becomes its own mini-parse
  const langBlocks = {};
  if (body) {
    const re = /^##\s+(\w+)\s*$/gm;
    const indices = [];
    let m;
    while ((m = re.exec(body)) !== null) {
      indices.push({ lang: m[1], start: m.index, headerLen: m[0].length });
    }
    for (let k = 0; k < indices.length; k++) {
      const cur = indices[k];
      const next = indices[k + 1];
      const sectionBody = body.slice(cur.start + cur.headerLen, next ? next.start : undefined).trim();
      langBlocks[cur.lang] = parseLangSection(sectionBody);
    }
    // If no "## lang" headers, treat whole body as legacy single-language content
    if (!indices.length) {
      langBlocks.en = parseLangSection(body);
    }
  }

  out._langs = langBlocks;
  return out;
}

// Parse a single-language body: summary (text before any ###), bullets, course_data_*
function parseLangSection(text) {
  const result = { summary: '', bullets: [] };
  // Split on ### subsections
  const parts = text.split(/^###\s+/m);
  result.summary = (parts[0] || '').trim();
  for (let i = 1; i < parts.length; i++) {
    const block = parts[i];
    const nl = block.indexOf('\n');
    const head = nl === -1 ? block.trim() : block.slice(0, nl).trim();
    const rest = nl === -1 ? '' : block.slice(nl + 1).trim();
    if (head === 'bullets') {
      result.bullets = rest.split('\n').filter(l => l.startsWith('- ')).map(l => l.slice(2).trim());
    } else if (head === 'course_data_hard' || head === 'course_data_soft') {
      const obj = {};
      rest.split('\n').forEach(line => {
        const sep = line.indexOf(' :: ');
        if (sep > -1) obj[line.slice(0, sep).trim()] = line.slice(sep + 4).trim();
      });
      result[head] = obj;
    }
  }
  return result;
}

// Localize-aware accessor. Returns frontmatter[key_<lang>] || frontmatter[key_en] || frontmatter[key].
function L(obj, key) {
  if (!obj) return undefined;
  const l = STATE.lang;
  if (obj[`${key}_${l}`] !== undefined) return obj[`${key}_${l}`];
  if (obj[`${key}_en`] !== undefined)   return obj[`${key}_en`];
  return obj[key];
}

// Body section for current language with fallback to en.
function B(obj) {
  if (!obj || !obj._langs) return {};
  return obj._langs[STATE.lang] || obj._langs.en || {};
}

async function fetchMd(path) {
  if (STATE.cache[path]) return STATE.cache[path];
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    const parsed = parseMd(await res.text());
    STATE.cache[path] = parsed;
    return parsed;
  } catch { return null; }
}
async function fetchAll(paths) { return Promise.all((paths || []).map(p => fetchMd(p))); }

// ─────────────────────────────────────────────
//  Apply CONFIG to CSS vars
// ─────────────────────────────────────────────
function applyConfig() {
  const R = document.documentElement.style;
  const m = STATE.mode, p = CONFIG[m], t = CONFIG.type, l = CONFIG.layout;
  R.setProperty('--bg', p.bg); R.setProperty('--bg2', p.bg2); R.setProperty('--bg3', p.bg3);
  R.setProperty('--fg', p.fg); R.setProperty('--fg2', p.fg2); R.setProperty('--muted', p.muted);
  R.setProperty('--faint', p.faint); R.setProperty('--line', p.line);
  R.setProperty('--accent', p.accent); R.setProperty('--a2', p.accent2);
  R.setProperty('--as', `${p.accent}14`); R.setProperty('--am', `${p.accent}2a`);
  R.setProperty('--card', p.card); R.setProperty('--ch', p.card_hover);
  // Comfortaa has no Cyrillic — use Nunito for RU soft
  const softFont = STATE.lang === 'ru' ? "'Nunito', sans-serif" : CONFIG.fonts.soft_heading;
  R.setProperty('--fh', m === 'hard' ? CONFIG.fonts.hard_heading : softFont);
  R.setProperty('--fb', m === 'hard' ? CONFIG.fonts.hard_body : CONFIG.fonts.soft_body);
  R.setProperty('--hero-name-size', t.hero_name_size);
  R.setProperty('--hero-name-weight', t.hero_name_weight);
  R.setProperty('--section-size', t.section_size);
  R.setProperty('--section-weight', t.section_weight);
  R.setProperty('--card-name-size', t.card_name_size);
  R.setProperty('--body-size', t.body_size);
  R.setProperty('--stat-num-size', t.stat_num_size);
  R.setProperty('--stat-num-weight', t.stat_num_weight);
  if (m === 'soft') {
    R.setProperty('--fw-heading', t.soft_heading_weight);
    R.setProperty('--fw-body', t.soft_body_weight);
    R.setProperty('--ls-body', t.soft_letter_spacing);
    R.setProperty('--lh-body', t.soft_line_height);
  } else {
    R.setProperty('--fw-heading', t.hero_name_weight);
    R.setProperty('--fw-body', t.body_weight);
    R.setProperty('--ls-body', '0px');
    R.setProperty('--lh-body', '1.65');
  }
  R.setProperty('--max', l.max_width);
  R.setProperty('--r', l.border_radius);
}

// ─────────────────────────────────────────────
//  Section labels + dynamic numbering
// ─────────────────────────────────────────────
function label(key) {
  const m = STATE.mode, l = STATE.lang;
  const labels = CONFIG.section_labels[l] || CONFIG.section_labels.en;
  if (key === 'experience' && m === 'soft') return labels.activities || labels.experience;
  return labels[key] || key;
}

function renumberSections() {
  let n = 1;
  document.querySelectorAll('section[data-section]').forEach(sec => {
    if (sec.style.display === 'none') return;
    const numEl = sec.querySelector('.section-num');
    if (numEl) numEl.textContent = String(n).padStart(2, '0');
    n++;
  });
}

function hideSection(id, hide) {
  const sec = document.querySelector(`section[data-section="${id}"]`);
  if (sec) sec.style.display = hide ? 'none' : '';
}

// ─────────────────────────────────────────────
//  Render helpers
// ─────────────────────────────────────────────
function tags(arr) { return (arr || []).map(t => `<span class="tag tag-accent">${t}</span>`).join(''); }
function bullets(arr) {
  if (!arr || !arr.length) return '';
  return `<ul class="bullet-list">${arr.map(b => `<li>${b}</li>`).join('')}</ul>`;
}

// ─────────────────────────────────────────────
//  Hero + contacts strip
// ─────────────────────────────────────────────
async function renderHero() {
  const m = STATE.mode, l = STATE.lang, C = CONFIG;
  const meta = STATE.manifest.meta[0] ? await fetchMd(STATE.manifest.meta[0]) : null;
  const eyebrows = {
    en: { hard: 'ML · CV · Robotics · ROS2', soft: 'Community · Leadership · Mentorship' },
    ru: { hard: 'ML · CV · Робототехника · ROS2', soft: 'Сообщество · Лидерство · Наставничество' }
  };
  document.getElementById('hero-eyebrow').textContent = (eyebrows[l] || eyebrows.en)[m];
  document.getElementById('hero-tagline').textContent = meta ? (L(meta, `tagline_${m}`) || '') : '';
  document.getElementById('hero-pitch').textContent   = meta ? (L(meta, `pitch_${m}`)   || '') : '';

  // avatar
  const avEl = document.getElementById('hero-av');
  avEl.innerHTML = C.photo
    ? `<img src="${C.photo}" alt="${C.name}" onerror="this.parentNode.innerHTML='<div class=av-placeholder>${C.initials}</div>'"/>`
    : `<div class="av-placeholder">${C.initials}</div>`;

  // lang labels
  const langLabels = l === 'ru'
    ? ['🇷🇺 Русский — родной', '🇬🇧 Английский — B2']
    : ['🇷🇺 Russian — Native', '🇬🇧 English — B2'];
  document.getElementById('langs-row').innerHTML = langLabels.map(t => `<span class="lang-pill">${t}</span>`).join('');
}

// Contacts strip (after hero)
function renderContactsStrip() {
  const l = STATE.lang, C = CONFIG;
  const cvUrl   = l === 'ru' ? C.cv_ru : C.cv_en;
  const cvLabel = l === 'ru' ? '↓ Скачать CV (RU)' : '↓ Download CV (EN)';
  const el = document.getElementById('contacts-strip');
  if (!el) return;
  el.innerHTML = `
    <div class="strip-left">
      <a class="btn-primary" href="${cvUrl}" target="_blank" rel="noreferrer">${cvLabel}</a>
    </div>
    <div class="strip-links">
      <a class="contact-pill" href="mailto:${C.email}" title="Email">${C.email}</a>
      <a class="contact-pill" href="https://t.me/${C.telegram}" target="_blank" rel="noreferrer">@${C.telegram}</a>
      <a class="contact-pill" href="https://vk.ru/${C.vk}" target="_blank" rel="noreferrer">VK</a>
      <a class="contact-pill" href="https://${C.bluesky}" target="_blank" rel="noreferrer">Bluesky</a>
      <a class="contact-pill" href="https://github.com/${C.github}" target="_blank" rel="noreferrer">GitHub</a>
    </div>
  `;
}

// ─────────────────────────────────────────────
//  Stats
// ─────────────────────────────────────────────
async function renderStats() {
  const m = STATE.mode;
  const meta = STATE.manifest.meta[0] ? await fetchMd(STATE.manifest.meta[0]) : null;
  const items = (meta && L(meta, `stats_${m}`)) || [];
  document.getElementById('stats').innerHTML = items.map((h, i) => `
    <div class="stat fi d${i + 1}">
      <div class="stat-num">${h.num}</div>
      <div class="stat-label">${h.label}</div>
    </div>`).join('');
}

// ─────────────────────────────────────────────
//  Skills
// ─────────────────────────────────────────────
function renderSkills() {
  document.getElementById('skills-grid').innerHTML = (CONFIG.skills[STATE.mode] || []).map(g => `
    <div class="skill-group">
      <div class="skill-group-title">${g.group}</div>
      <div class="skill-group-items">${g.items.map(i => `<span class="skill-tag">${i}</span>`).join('')}</div>
    </div>`).join('');
}

// ─────────────────────────────────────────────
//  Education
// ─────────────────────────────────────────────
async function renderEducation() {
  const m = STATE.mode, l = STATE.lang;
  const allEdu = await fetchAll(STATE.manifest.education);
  const uni = allEdu.find(e => e && (!e.mode || e.id === 'innopolis'));
  const extras = allEdu.filter(e => e && e.mode === m).sort((a, b) => (+(a.order || 99)) - (+(b.order || 99)));
  const courses = (uni && L(uni, `courses_${m}`)) || [];
  const courseData = (uni && B(uni)[`course_data_${m}`]) || {};

  function courseCards(courses, courseData) {
    return courses.map(c => {
      const info = courseData[c];
      if (info) return `
        <details class="course-card">
          <summary class="course-card-summary">
            <span class="course-card-name">${c}</span>
            <span class="course-chevron">▾</span>
          </summary>
          <div class="course-card-body">${info}</div>
        </details>`;
      return `<span class="course-chip">${c}</span>`;
    }).join('');
  }

  const uniHtml = uni ? `
    <details class="edu-card" open>
      <summary class="edu-summary">
        <div><div class="edu-title">${L(uni, 'name') || ''}</div><div class="edu-sub">${L(uni, 'sub') || ''}</div></div>
        <span class="sum-chevron">▾</span>
      </summary>
      <div class="edu-body">
        ${B(uni).summary ? `<div class="edu-desc">${B(uni).summary}</div>` : ''}
        ${courses.length ? `<div class="courses-grid" style="margin-top:12px">${courseCards(courses, courseData)}</div>` : ''}
      </div>
    </details>` : '';

  const extrasHtml = extras.map(e => `
    <details class="edu-card">
      <summary class="edu-summary">
        <div><div class="edu-title">${L(e, 'name') || ''}</div><div class="edu-sub">${L(e, 'sub') || ''}</div></div>
        <span class="sum-chevron">▾</span>
      </summary>
      <div class="edu-body">
        ${B(e).summary ? `<div class="edu-desc">${B(e).summary}</div>` : ''}
      </div>
    </details>`).join('');

  document.getElementById('edu-content').innerHTML = uniHtml + extrasHtml;
}

// ─────────────────────────────────────────────
//  Experience
// ─────────────────────────────────────────────
async function renderExperience() {
  const m = STATE.mode, l = STATE.lang;
  document.getElementById('exp-title').textContent = label('experience');
  const items = await fetchAll(STATE.manifest.experience[m]);
  const sorted = items.filter(Boolean).sort((a, b) => (+(a.order || 99)) - (+(b.order || 99)));
  const html = sorted.map(e => {
    const body = B(e);
    return `
    <details class="exp-card">
      <summary class="card-summary">
        <div class="sum-left">
          <div class="sum-top"><span class="sum-name">${L(e, 'name') || ''}</span><span class="sum-meta">${L(e, 'meta') || ''}</span></div>
          <div class="sum-tags">${tags(e.tags)}</div>
        </div>
        <span class="sum-chevron">▾</span>
      </summary>
      <div class="card-body">
        ${body.summary ? `<p class="card-sum-text">${body.summary}</p>` : ''}
        ${body.bullets && body.bullets.length ? `<div class="body-title">${l === 'ru' ? 'Что делал' : 'What I did'}</div>${bullets(body.bullets)}` : ''}
        ${e.github ? `<div class="card-link"><a href="${e.github}" target="_blank">↗ GitHub</a></div>` : ''}
        ${e.link   ? `<div class="card-link"><a href="${e.link}"   target="_blank">↗ Link</a></div>`   : ''}
      </div>
    </details>`;
  }).join('');
  document.getElementById('exp-list').innerHTML = html;
  hideSection('experience', sorted.length === 0);
  renumberSections();
}

// ─────────────────────────────────────────────
//  Projects
// ─────────────────────────────────────────────
async function renderProjects() {
  const m = STATE.mode, l = STATE.lang;
  const items = await fetchAll(STATE.manifest.projects[m]);
  const sorted = items.filter(Boolean).sort((a, b) => (+(a.order || 99)) - (+(b.order || 99)));
  const html = sorted.map(p => {
    const body = B(p);
    const problem  = L(p, 'problem');
    const solution = L(p, 'solution');
    const result   = L(p, 'result');
    const stack    = L(p, 'stack');
    return `
    <details class="proj-card">
      <summary class="card-summary">
        <div class="sum-left">
          <div class="sum-top"><span class="sum-name">${L(p, 'name') || ''}</span><span class="sum-meta">${L(p, 'meta') || ''}</span></div>
          <div class="sum-tags">${tags(p.tags)}</div>
        </div>
        <span class="sum-chevron">▾</span>
      </summary>
      <div class="card-body">
        ${(problem || solution || result) ? `
        <div class="story-grid">
          ${problem  ? `<div class="story-block"><div class="story-label">${l === 'ru' ? 'Задача'    : 'Problem'}</div><div class="story-text">${problem}</div></div>`  : ''}
          ${solution ? `<div class="story-block"><div class="story-label">${l === 'ru' ? 'Решение'   : 'Solution'}</div><div class="story-text">${solution}</div></div>` : ''}
          ${result   ? `<div class="story-block"><div class="story-label">${l === 'ru' ? 'Результат' : 'Result'}</div><div class="story-text">${result}</div></div>`     : ''}
        </div>` : ''}
        ${body.bullets && body.bullets.length ? `<div class="body-title">${l === 'ru' ? 'Моя работа' : 'My work'}</div>${bullets(body.bullets)}` : ''}
        ${stack    ? `<div class="kv-row"><span class="kv-key">Stack</span><span class="kv-val">${stack}</span></div>` : ''}
        ${p.github ? `<div class="card-link"><a href="${p.github}" target="_blank">↗ GitHub</a></div>` : ''}
        ${p.link   ? `<div class="card-link"><a href="${p.link}"   target="_blank">↗ Link</a></div>`   : ''}
      </div>
    </details>`;
  }).join('');
  document.getElementById('proj-list').innerHTML = html;
  hideSection('projects', sorted.length === 0);
  renumberSections();
}

// ─────────────────────────────────────────────
//  Awards
// ─────────────────────────────────────────────
async function renderAwards() {
  const m = STATE.mode, l = STATE.lang;
  const items = await fetchAll(STATE.manifest.awards[m]);
  const sorted = items.filter(Boolean).sort((a, b) => (+(a.order || 99)) - (+(b.order || 99)));
  document.getElementById('awards-list').innerHTML = sorted.map(a => {
    const body = B(a);
    const proofUrl = a.link || a.proof;
    const proofLabel = a.link
      ? (l === 'ru' ? '↗ Источник' : '↗ Source')
      : (l === 'ru' ? '↗ Подтверждение' : '↗ Proof');
    return `
    <div class="award-item">
      <div class="award-top">
        <span class="award-year">${a.year || ''}</span>
        <div class="award-body">
          <div class="award-name">${L(a, 'name') || ''}</div>
          <div class="award-desc">${body.summary || ''}</div>
          ${L(a, 'meta') ? `<div class="award-meta">${L(a, 'meta')}</div>` : ''}
          ${proofUrl ? `<div class="card-link" style="margin-top:6px"><a href="${proofUrl}" target="_blank">${proofLabel}</a></div>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');
  hideSection('awards', sorted.length === 0);
  renumberSections();
}

// ─────────────────────────────────────────────
//  Update section titles
// ─────────────────────────────────────────────
function updateSectionTitles() {
  const map = {
    'exp-title': 'experience', 'skills-title': 'skills',
    'edu-title': 'education', 'proj-title': 'projects', 'awards-title': 'awards'
  };
  Object.entries(map).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = label(key);
  });
}

// ─────────────────────────────────────────────
//  Full render
// ─────────────────────────────────────────────
async function renderAll() {
  applyConfig();
  updateSectionTitles();
  renderContactsStrip();
  await Promise.all([
    renderHero(),
    renderStats(),
    (async () => { renderSkills(); })(),
    renderEducation(),
    renderExperience(),
    renderProjects(),
    renderAwards(),
  ]);
  renumberSections();
}

// ─────────────────────────────────────────────
//  Init
// ─────────────────────────────────────────────
function showFatal(message, hint) {
  const w = document.querySelector('.wrap');
  if (!w) return;
  w.innerHTML = `
    <div style="padding:40px 0;font-family:monospace;color:var(--fg2);max-width:640px">
      <div style="color:var(--accent);font-size:14px;margin-bottom:14px;letter-spacing:1px">PORTFOLIO LOAD FAILED</div>
      <div style="font-size:13px;margin-bottom:18px;line-height:1.6">${message}</div>
      ${hint ? `<div style="font-size:12px;color:var(--muted);line-height:1.7;border-left:2px solid var(--accent);padding-left:14px">${hint}</div>` : ''}
    </div>`;
}

async function init() {
  STATE.mode = localStorage.getItem('p-mode') || CONFIG.default_mode;
  STATE.lang = localStorage.getItem('p-lang') || CONFIG.default_lang;
  document.documentElement.setAttribute('data-mode', STATE.mode);
  document.documentElement.setAttribute('data-lang', STATE.lang);
  // update lang button
  const lb = document.querySelector('.lang-current');
  if (lb) lb.textContent = STATE.lang.toUpperCase();
  // Detect file:// — browser blocks fetch on it, give a friendly hint instead of cryptic error
  if (location.protocol === 'file:') {
    showFatal(
      'The site is being opened directly from disk (file://). Browsers block fetch() in that mode, so manifest.json and the markdown files cannot be loaded.',
      'Start a local server in the project root, then open http://localhost:8080<br><br>' +
      '<b>Python:</b>&nbsp;&nbsp;<code>python3 -m http.server 8080</code><br>' +
      '<b>Node:</b>&nbsp;&nbsp;&nbsp;&nbsp;<code>npx serve .</code>'
    );
    return;
  }
  try {
    const res = await fetch('manifest.json');
    if (!res.ok) throw new Error('manifest.json ' + res.status);
    STATE.manifest = await res.json();
    await renderAll();
  } catch (err) {
    console.error('Portfolio init failed:', err);
    showFatal(
      'Could not load <code>manifest.json</code>: ' + err.message,
      'If you just added or renamed files locally, regenerate the manifest:<br><br>' +
      '<code>node scripts/build-manifest.js</code><br><br>' +
      'GitHub Actions runs this automatically on every push to main.'
    );
  }
}

document.addEventListener('DOMContentLoaded', init);
const R = { renderAll, renderHero, renderStats, renderSkills, renderEducation, renderExperience, renderProjects, renderAwards, applyConfig };
