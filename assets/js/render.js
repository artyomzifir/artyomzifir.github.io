// ─────────────────────────────────────────────
//  State
// ─────────────────────────────────────────────
let STATE = {
  mode: CONFIG.default_mode,
  lang: CONFIG.default_lang,
  manifest: null,
  cache: {}   // path → parsed md object
};

// ─────────────────────────────────────────────
//  MD parser (frontmatter + body)
// ─────────────────────────────────────────────
function parseMd(text) {
  const out = {};
  let body = text.trim();

  const fm = body.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)/);
  if (fm) {
    // parse frontmatter line by line
    fm[1].split('\n').forEach(line => {
      // string field: key: "value" or key: value
      const str = line.match(/^(\w+):\s*"([^"]*)"/);
      if (str) { out[str[1]] = str[2]; return; }

      const bare = line.match(/^(\w+):\s+(.+)$/);
      if (bare) {
        const v = bare[2].trim();
        // inline array: ["a", "b"]
        if (v.startsWith('[')) {
          out[bare[1]] = v.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
        } else {
          out[bare[1]] = v;
        }
        return;
      }

      // YAML block arrays for stats: parse later via body stats section
    });
    body = fm[2].trim();
  }

  // bullets section
  const bMatch = body.match(/## bullets\n([\s\S]*?)(?=\n##|$)/);
  out.bullets = bMatch
    ? bMatch[1].trim().split('\n').filter(l => l.startsWith('- ')).map(l => l.slice(2).trim())
    : [];

  // summary = everything before first ##
  out.summary = body.split(/\n## /)[0].trim();

  // Parse YAML block arrays (stats_hard / stats_soft etc.) from raw frontmatter
  if (fm) {
    const raw = fm[1];
    ['stats_hard', 'stats_soft', 'courses_hard', 'courses_soft'].forEach(key => {
      const block = raw.match(new RegExp(key + ':\\n([\\s\\S]*?)(?=\\n\\w|$)'));
      if (!block) return;
      if (key.startsWith('courses')) {
        // inline array fallback
        const inline = raw.match(new RegExp(key + ':\\s*\\[([^\\]]+)\\]'));
        if (inline) {
          out[key] = inline[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
        }
      } else {
        // parse list of {num, label} objects
        const items = [];
        const entries = block[1].matchAll(/- num:\s*"([^"]*)"\s*\n\s*label:\s*"([^"]*)"/g);
        for (const e of entries) items.push({ num: e[1], label: e[2] });
        if (items.length) out[key] = items;
      }
    });
  }

  return out;
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

async function fetchAll(paths) {
  return Promise.all((paths || []).map(p => fetchMd(p)));
}

// ─────────────────────────────────────────────
//  Apply CONFIG to CSS variables
// ─────────────────────────────────────────────
function applyConfig() {
  const R = document.documentElement.style;
  const m = STATE.mode;
  const p = CONFIG[m];
  const t = CONFIG.type;
  const l = CONFIG.layout;

  // palette
  R.setProperty('--bg',         p.bg);
  R.setProperty('--bg2',        p.bg2);
  R.setProperty('--bg3',        p.bg3);
  R.setProperty('--fg',         p.fg);
  R.setProperty('--fg2',        p.fg2);
  R.setProperty('--muted',      p.muted);
  R.setProperty('--faint',      p.faint);
  R.setProperty('--line',       p.line);
  R.setProperty('--accent',     p.accent);
  R.setProperty('--a2',         p.accent2);
  R.setProperty('--as',         `${p.accent}14`);
  R.setProperty('--am',         `${p.accent}30`);
  R.setProperty('--card',       p.card);
  R.setProperty('--ch',         p.card_hover);

  // fonts
  const fh = m === 'hard' ? CONFIG.fonts.hard_heading : CONFIG.fonts.soft_heading;
  const fb = m === 'hard' ? CONFIG.fonts.hard_body    : CONFIG.fonts.soft_body;
  R.setProperty('--fh', fh);
  R.setProperty('--fb', fb);

  // type scale
  R.setProperty('--hero-name-size',   t.hero_name_size);
  R.setProperty('--hero-name-weight', t.hero_name_weight);
  R.setProperty('--section-size',     t.section_size);
  R.setProperty('--section-weight',   t.section_weight);
  R.setProperty('--card-name-size',   t.card_name_size);
  R.setProperty('--body-size',        t.body_size);
  R.setProperty('--stat-num-size',    t.stat_num_size);
  R.setProperty('--stat-num-weight',  t.stat_num_weight);

  if (m === 'soft') {
    R.setProperty('--fw-heading', t.soft_heading_weight);
    R.setProperty('--fw-body',    t.soft_body_weight);
    R.setProperty('--ls-body',    t.soft_letter_spacing);
    R.setProperty('--lh-body',    t.soft_line_height);
  } else {
    R.setProperty('--fw-heading', t.hero_name_weight);
    R.setProperty('--fw-body',    t.body_weight);
    R.setProperty('--ls-body',    '0');
    R.setProperty('--lh-body',    '1.65');
  }

  // layout
  R.setProperty('--max',  l.max_width);
  R.setProperty('--r',    l.border_radius);
}

// ─────────────────────────────────────────────
//  Section labels
// ─────────────────────────────────────────────
function label(key) {
  const m = STATE.mode;
  const l = STATE.lang;
  const labels = CONFIG.section_labels[l] || CONFIG.section_labels.en;
  if (key === 'experience' && m === 'soft') return labels.activities || labels.experience;
  return labels[key] || key;
}

// ─────────────────────────────────────────────
//  Render helpers
// ─────────────────────────────────────────────
function tags(arr) {
  return (arr || []).map(t => `<span class="tag tag-accent">${t}</span>`).join('');
}
function bullets(arr) {
  if (!arr || !arr.length) return '';
  return `<ul class="bullet-list">${arr.map(b => `<li>${b}</li>`).join('')}</ul>`;
}

// ─────────────────────────────────────────────
//  Hero
// ─────────────────────────────────────────────
async function renderHero() {
  const m = STATE.mode, l = STATE.lang;
  const metaPath = `content/${l}/meta.md`;
  const meta = await fetchMd(metaPath);
  const C = CONFIG;

  const eyebrows = {
    en: { hard: 'ML · CV · Robotics · ROS2', soft: 'Community · Leadership · Mentorship' },
    ru: { hard: 'ML · CV · Робототехника · ROS2', soft: 'Сообщество · Лидерство · Наставничество' }
  };

  document.getElementById('hero-eyebrow').textContent = (eyebrows[l] || eyebrows.en)[m];
  document.getElementById('hero-tagline').textContent = meta ? meta[`tagline_${m}`] || '' : '';
  document.getElementById('hero-pitch').textContent   = meta ? meta[`pitch_${m}`]   || '' : '';

  // contacts
  document.getElementById('hero-contacts').innerHTML = `
    <a class="contact-link" href="mailto:${C.email}">✉ ${C.email}</a>
    <a class="contact-link" href="https://t.me/${C.telegram}" target="_blank">✈ @${C.telegram}</a>
    <a class="contact-link" href="https://github.com/${C.github}" target="_blank">⌂ ${C.github}</a>
    <a class="contact-link" href="https://vk.ru/${C.vk}" target="_blank">VK</a>
  `;

  const cvLabel = l === 'ru' ? '↓ Скачать CV' : '↓ Download CV';
  document.getElementById('hero-cta').innerHTML = `
    <a class="btn-primary" href="${C.cv_path}" target="_blank">${cvLabel}</a>
    <a class="btn-secondary" href="https://${C.bluesky}" target="_blank">Bluesky</a>
  `;

  const photo = C.photo;
  const avEl = document.getElementById('hero-av');
  if (photo) {
    avEl.innerHTML = `<img src="${photo}" alt="${C.name}" onerror="this.parentNode.innerHTML='<div class=av-placeholder>${C.initials}</div>'"/>`;
  } else {
    avEl.innerHTML = `<div class="av-placeholder">${C.initials}</div>`;
  }

  const langLabels = l === 'ru'
    ? ['🇷🇺 Русский — родной', '🇬🇧 Английский — B2']
    : ['🇷🇺 Russian — Native', '🇬🇧 English — B2'];
  document.getElementById('langs-row').innerHTML = langLabels.map(t => `<span class="lang-pill">${t}</span>`).join('');
}

// ─────────────────────────────────────────────
//  Stats
// ─────────────────────────────────────────────
async function renderStats() {
  const m = STATE.mode, l = STATE.lang;
  const meta = await fetchMd(`content/${l}/meta.md`);
  const key = `stats_${m}`;
  const items = (meta && meta[key]) || [];
  document.getElementById('stats').innerHTML = items.map((h, i) => `
    <div class="stat fi d${i + 1}">
      <div class="stat-num">${h.num}</div>
      <div class="stat-label">${h.label}</div>
    </div>`).join('');
}

// ─────────────────────────────────────────────
//  Skills (from CONFIG — no md needed)
// ─────────────────────────────────────────────
function renderSkills() {
  const groups = CONFIG.skills[STATE.mode];
  document.getElementById('skills-grid').innerHTML = (groups || []).map(g => `
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
  const manifest = STATE.manifest.langs[l];
  const allEdu = await fetchAll(manifest.education);

  // university = first file with no mode field (or id: innopolis)
  const uni = allEdu.find(e => e && (!e.mode || e.id === 'innopolis'));
  // extra = files matching current mode
  const extras = allEdu.filter(e => e && e.mode === m);

  const coursesKey = `courses_${m}`;
  const courses = (uni && uni[coursesKey]) || [];
  const coursesLabel = l === 'ru' ? 'Профильные курсы' : 'Relevant coursework';

  const uniHtml = uni ? `
    <details class="edu-card" open>
      <summary class="edu-summary">
        <div><div class="edu-title">${uni.name || ''}</div><div class="edu-sub">${uni.sub || ''}</div></div>
        <span class="sum-chevron">▾</span>
      </summary>
      <div class="edu-body">
        ${uni.summary ? `<div class="edu-desc">${uni.summary}</div>` : ''}
        ${courses.length ? `
          <div class="courses-label">${coursesLabel}</div>
          <div class="courses-grid">${courses.map(c => `<span class="course-chip">${c}</span>`).join('')}</div>` : ''}
      </div>
    </details>` : '';

  const extrasHtml = extras.map(e => `
    <details class="edu-card">
      <summary class="edu-summary">
        <div><div class="edu-title">${e.name || ''}</div><div class="edu-sub">${e.sub || ''}</div></div>
        <span class="sum-chevron">▾</span>
      </summary>
      <div class="edu-body">
        ${e.summary ? `<div class="edu-desc">${e.summary}</div>` : ''}
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
  const items = await fetchAll(STATE.manifest.langs[l].experience[m]);
  const sorted = items.filter(Boolean).sort((a, b) => (+(a.order||99)) - (+(b.order||99)));

  document.getElementById('exp-list').innerHTML = sorted.map(e => `
    <details class="exp-card">
      <summary class="card-summary">
        <div class="sum-left">
          <div class="sum-top"><span class="sum-name">${e.name||''}</span><span class="sum-meta">${e.meta||''}</span></div>
          <div class="sum-tags">${tags(e.tags)}</div>
        </div>
        <span class="sum-chevron">▾</span>
      </summary>
      <div class="card-body">
        ${e.summary ? `<p class="card-sum-text">${e.summary}</p>` : ''}
        ${e.bullets && e.bullets.length ? `<div class="body-title">${l==='ru'?'Что делал':'What I did'}</div>${bullets(e.bullets)}` : ''}
        ${e.github ? `<div class="card-link"><a href="${e.github}" target="_blank">↗ GitHub</a></div>` : ''}
        ${e.link   ? `<div class="card-link"><a href="${e.link}"   target="_blank">↗ Link</a></div>`   : ''}
      </div>
    </details>`).join('');
}

// ─────────────────────────────────────────────
//  Projects
// ─────────────────────────────────────────────
async function renderProjects() {
  const m = STATE.mode, l = STATE.lang;
  const items = await fetchAll(STATE.manifest.langs[l].projects[m]);
  const sorted = items.filter(Boolean).sort((a, b) => (+(a.order||99)) - (+(b.order||99)));

  document.getElementById('proj-list').innerHTML = sorted.map(p => `
    <details class="proj-card">
      <summary class="card-summary">
        <div class="sum-left">
          <div class="sum-top"><span class="sum-name">${p.name||''}</span><span class="sum-meta">${p.meta||''}</span></div>
          <div class="sum-tags">${tags(p.tags)}</div>
        </div>
        <span class="sum-chevron">▾</span>
      </summary>
      <div class="card-body">
        ${(p.problem||p.solution||p.result) ? `
        <div class="story-grid">
          ${p.problem  ? `<div class="story-block"><div class="story-label">${l==='ru'?'Задача':'Problem'}</div><div class="story-text">${p.problem}</div></div>` : ''}
          ${p.solution ? `<div class="story-block"><div class="story-label">${l==='ru'?'Решение':'Solution'}</div><div class="story-text">${p.solution}</div></div>` : ''}
          ${p.result   ? `<div class="story-block"><div class="story-label">${l==='ru'?'Результат':'Result'}</div><div class="story-text">${p.result}</div></div>` : ''}
        </div>` : ''}
        ${p.bullets && p.bullets.length ? `<div class="body-title">${l==='ru'?'Моя работа':'My work'}</div>${bullets(p.bullets)}` : ''}
        ${p.stack  ? `<div class="kv-row"><span class="kv-key">Stack</span><span class="kv-val">${p.stack}</span></div>` : ''}
        ${p.github ? `<div class="card-link"><a href="${p.github}" target="_blank">↗ GitHub</a></div>` : ''}
        ${p.link   ? `<div class="card-link"><a href="${p.link}"   target="_blank">↗ Link</a></div>`   : ''}
      </div>
    </details>`).join('');
}

// ─────────────────────────────────────────────
//  Awards
// ─────────────────────────────────────────────
async function renderAwards() {
  const m = STATE.mode, l = STATE.lang;
  const items = await fetchAll(STATE.manifest.langs[l].awards[m]);
  const sorted = items.filter(Boolean).sort((a, b) => (+(a.order||99)) - (+(b.order||99)));

  document.getElementById('awards-list').innerHTML = sorted.map(a => `
    <div class="award-item">
      <div class="award-top">
        <span class="award-year">${a.year||''}</span>
        <div>
          <div class="award-name">${a.name||''}</div>
          <div class="award-desc">${a.summary||''}</div>
          ${a.meta ? `<div class="award-meta">${a.meta}</div>` : ''}
          ${a.link ? `<div class="card-link" style="margin-top:6px"><a href="${a.link}" target="_blank">↗ Source</a></div>` : ''}
        </div>
      </div>
    </div>`).join('');
}

// ─────────────────────────────────────────────
//  Section title sync
// ─────────────────────────────────────────────
function updateSectionTitles() {
  document.getElementById('exp-title').textContent = label('experience');
  const sectionMap = {
    'skills-title':   'skills',
    'edu-title':      'education',
    'proj-title':     'projects',
    'awards-title':   'awards',
  };
  Object.entries(sectionMap).forEach(([id, key]) => {
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
  await Promise.all([
    renderHero(),
    renderStats(),
    (async () => { renderSkills(); })(),
    renderEducation(),
    renderExperience(),
    renderProjects(),
    renderAwards(),
  ]);
}

// ─────────────────────────────────────────────
//  Init
// ─────────────────────────────────────────────
async function init() {
  // restore saved prefs
  STATE.mode = localStorage.getItem('p-mode') || CONFIG.default_mode;
  STATE.lang = localStorage.getItem('p-lang') || CONFIG.default_lang;
  document.documentElement.setAttribute('data-mode', STATE.mode);
  document.documentElement.setAttribute('data-lang', STATE.lang);

  // fetch manifest
  const res = await fetch('manifest.json');
  STATE.manifest = await res.json();

  await renderAll();
}

document.addEventListener('DOMContentLoaded', init);

// ─────────────────────────────────────────────
//  Public API (for theme.js)
// ─────────────────────────────────────────────
const R = { renderAll, renderHero, renderStats, renderSkills, renderEducation, renderExperience, renderProjects, renderAwards, applyConfig };
