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
//  MD parser
// ─────────────────────────────────────────────
function parseMd(text) {
  const out = {};
  let body = text.trim();
  const fm = body.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)/);
  if (fm) {
    fm[1].split('\n').forEach(line => {
      const str = line.match(/^(\w+):\s*"([^"]*)"/);
      if (str) { out[str[1]] = str[2]; return; }
      const bare = line.match(/^(\w+):\s+(.+)$/);
      if (bare) {
        const v = bare[2].trim();
        if (v.startsWith('[')) {
          out[bare[1]] = v.slice(1,-1).split(',').map(s => s.trim().replace(/^["']|["']$/g,''));
        } else { out[bare[1]] = v; }
      }
    });
    body = fm[2].trim();
  }
  // bullets
  const bMatch = body.match(/## bullets\n([\s\S]*?)(?=\n##|$)/);
  out.bullets = bMatch ? bMatch[1].trim().split('\n').filter(l=>l.startsWith('- ')).map(l=>l.slice(2).trim()) : [];
  // course_data
  ['course_data_hard','course_data_soft'].forEach(key => {
    const m = body.match(new RegExp(`## ${key}\\n([\\s\\S]*?)(?=\\n##|$)`));
    if (m) {
      const obj = {};
      m[1].trim().split('\n').forEach(line => {
        const sep = line.indexOf(' :: ');
        if (sep > -1) obj[line.slice(0,sep).trim()] = line.slice(sep+4).trim();
      });
      out[key] = obj;
    }
  });
  out.summary = body.split(/\n## /)[0].trim();
  // parse stats YAML blocks
  if (fm) {
    const raw = fm[1];
    ['stats_hard','stats_soft'].forEach(key => {
      const block = raw.match(new RegExp(key+':\\n([\\s\\S]*?)(?=\\n\\w|$)'));
      if (block) {
        const items = [];
        const entries = block[1].matchAll(/- num:\s*"([^"]*)"\s*\n\s*label:\s*"([^"]*)"/g);
        for (const e of entries) items.push({num:e[1],label:e[2]});
        if (items.length) out[key] = items;
      }
      // also try inline array fallback for courses
      const inline = raw.match(new RegExp(key+':\\s*\\[([^\\]]+)\\]'));
      if (inline && !out[key]) {
        out[key] = inline[1].split(',').map(s=>s.trim().replace(/^["']|["']$/g,''));
      }
    });
    ['courses_hard','courses_soft'].forEach(key => {
      const inline = raw.match(new RegExp(key+':\\s*\\[([^\\]]+)\\]'));
      if (inline) out[key] = inline[1].split(',').map(s=>s.trim().replace(/^["']|["']$/g,''));
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
async function fetchAll(paths) { return Promise.all((paths||[]).map(p=>fetchMd(p))); }

// ─────────────────────────────────────────────
//  Apply CONFIG to CSS vars
// ─────────────────────────────────────────────
function applyConfig() {
  const R = document.documentElement.style;
  const m = STATE.mode, p = CONFIG[m], t = CONFIG.type, l = CONFIG.layout;
  R.setProperty('--bg',p.bg); R.setProperty('--bg2',p.bg2); R.setProperty('--bg3',p.bg3);
  R.setProperty('--fg',p.fg); R.setProperty('--fg2',p.fg2); R.setProperty('--muted',p.muted);
  R.setProperty('--faint',p.faint); R.setProperty('--line',p.line);
  R.setProperty('--accent',p.accent); R.setProperty('--a2',p.accent2);
  R.setProperty('--as',`${p.accent}14`); R.setProperty('--am',`${p.accent}2a`);
  R.setProperty('--card',p.card); R.setProperty('--ch',p.card_hover);
  // Comfortaa has no Cyrillic — use Nunito for RU soft
  const softFont = STATE.lang === 'ru' ? "'Nunito', sans-serif" : CONFIG.fonts.soft_heading;
  R.setProperty('--fh', m==='hard' ? CONFIG.fonts.hard_heading : softFont);
  R.setProperty('--fb', m==='hard' ? CONFIG.fonts.hard_body : CONFIG.fonts.soft_body);
  R.setProperty('--hero-name-size',t.hero_name_size);
  R.setProperty('--hero-name-weight',t.hero_name_weight);
  R.setProperty('--section-size',t.section_size);
  R.setProperty('--section-weight',t.section_weight);
  R.setProperty('--card-name-size',t.card_name_size);
  R.setProperty('--body-size',t.body_size);
  R.setProperty('--stat-num-size',t.stat_num_size);
  R.setProperty('--stat-num-weight',t.stat_num_weight);
  if (m==='soft') {
    R.setProperty('--fw-heading',t.soft_heading_weight);
    R.setProperty('--fw-body',t.soft_body_weight);
    R.setProperty('--ls-body',t.soft_letter_spacing);
    R.setProperty('--lh-body',t.soft_line_height);
  } else {
    R.setProperty('--fw-heading',t.hero_name_weight);
    R.setProperty('--fw-body',t.body_weight);
    R.setProperty('--ls-body','0px');
    R.setProperty('--lh-body','1.65');
  }
  R.setProperty('--max',l.max_width);
  R.setProperty('--r',l.border_radius);
}

// ─────────────────────────────────────────────
//  Section labels + dynamic numbering
// ─────────────────────────────────────────────
function label(key) {
  const m = STATE.mode, l = STATE.lang;
  const labels = CONFIG.section_labels[l] || CONFIG.section_labels.en;
  if (key==='experience' && m==='soft') return labels.activities || labels.experience;
  return labels[key] || key;
}

function renumberSections() {
  let n = 1;
  document.querySelectorAll('section[data-section]').forEach(sec => {
    if (sec.style.display === 'none') return;
    const numEl = sec.querySelector('.section-num');
    if (numEl) numEl.textContent = String(n).padStart(2,'0');
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
function tags(arr) { return (arr||[]).map(t=>`<span class="tag tag-accent">${t}</span>`).join(''); }
function bullets(arr) {
  if (!arr||!arr.length) return '';
  return `<ul class="bullet-list">${arr.map(b=>`<li>${b}</li>`).join('')}</ul>`;
}

// ─────────────────────────────────────────────
//  Hero + contacts strip
// ─────────────────────────────────────────────
async function renderHero() {
  const m = STATE.mode, l = STATE.lang, C = CONFIG;
  const meta = await fetchMd(`content/${l}/meta.md`);
  const eyebrows = {
    en:{hard:'ML · CV · Robotics · ROS2', soft:'Community · Leadership · Mentorship'},
    ru:{hard:'ML · CV · Робототехника · ROS2', soft:'Сообщество · Лидерство · Наставничество'}
  };
  document.getElementById('hero-eyebrow').textContent = (eyebrows[l]||eyebrows.en)[m];
  document.getElementById('hero-tagline').textContent = meta ? meta[`tagline_${m}`]||'' : '';
  document.getElementById('hero-pitch').textContent   = meta ? meta[`pitch_${m}`]||''   : '';

  // avatar
  const avEl = document.getElementById('hero-av');
  avEl.innerHTML = C.photo
    ? `<img src="${C.photo}" alt="${C.name}" onerror="this.parentNode.innerHTML='<div class=av-placeholder>${C.initials}</div>'"/>`
    : `<div class="av-placeholder">${C.initials}</div>`;

  // lang labels
  const langLabels = l==='ru'
    ? ['🇷🇺 Русский — родной','🇬🇧 Английский — B2']
    : ['🇷🇺 Russian — Native','🇬🇧 English — B2'];
  document.getElementById('langs-row').innerHTML = langLabels.map(t=>`<span class="lang-pill">${t}</span>`).join('');
}

// Contacts strip (after hero)
function renderContactsStrip() {
  const l = STATE.lang, C = CONFIG;
  const cvUrl  = l==='ru' ? C.cv_ru : C.cv_en;
  const cvLabel = l==='ru' ? '↓ Скачать CV (RU)' : '↓ Download CV (EN)';
  const el = document.getElementById('contacts-strip');
  if (!el) return;
  el.innerHTML = `
    <div class="strip-left">
      <a class="btn-primary" href="${cvUrl}" target="_blank" rel="noreferrer">${cvLabel}</a>
    </div>
    <div class="strip-links">
      <a class="contact-pill" href="mailto:${C.email}" title="Email">✉ ${C.email}</a>
      <a class="contact-pill" href="https://t.me/${C.telegram}" target="_blank" rel="noreferrer">✈ @${C.telegram}</a>
      <a class="contact-pill" href="https://vk.ru/${C.vk}" target="_blank" rel="noreferrer">VK</a>
      <a class="contact-pill" href="https://${C.bluesky}" target="_blank" rel="noreferrer">Bluesky</a>
      <a class="contact-pill" href="https://github.com/${C.github}" target="_blank" rel="noreferrer">⌂ GitHub</a>
    </div>
  `;
}

// ─────────────────────────────────────────────
//  Stats
// ─────────────────────────────────────────────
async function renderStats() {
  const m = STATE.mode, l = STATE.lang;
  const meta = await fetchMd(`content/${l}/meta.md`);
  const items = (meta && meta[`stats_${m}`]) || [];
  document.getElementById('stats').innerHTML = items.map((h,i)=>`
    <div class="stat fi d${i+1}">
      <div class="stat-num">${h.num}</div>
      <div class="stat-label">${h.label}</div>
    </div>`).join('');
}

// ─────────────────────────────────────────────
//  Skills
// ─────────────────────────────────────────────
function renderSkills() {
  document.getElementById('skills-grid').innerHTML = (CONFIG.skills[STATE.mode]||[]).map(g=>`
    <div class="skill-group">
      <div class="skill-group-title">${g.group}</div>
      <div class="skill-group-items">${g.items.map(i=>`<span class="skill-tag">${i}</span>`).join('')}</div>
    </div>`).join('');
}

// ─────────────────────────────────────────────
//  Education
// ─────────────────────────────────────────────
async function renderEducation() {
  const m = STATE.mode, l = STATE.lang;
  const manifest = STATE.manifest.langs[l];
  const allEdu = await fetchAll(manifest.education);
  const uni = allEdu.find(e => e && (!e.mode || e.id==='innopolis'));
  const extras = allEdu.filter(e => e && e.mode===m);
  const courses = (uni && uni[`courses_${m}`]) || [];
  const courseData = (uni && uni[`course_data_${m}`]) || {};

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
        <div><div class="edu-title">${uni.name||''}</div><div class="edu-sub">${uni.sub||''}</div></div>
        <span class="sum-chevron">▾</span>
      </summary>
      <div class="edu-body">
        ${uni.summary ? `<div class="edu-desc">${uni.summary}</div>` : ''}
        ${courses.length ? `<div class="courses-grid" style="margin-top:12px">${courseCards(courses,courseData)}</div>` : ''}
      </div>
    </details>` : '';

  const extrasHtml = extras.map(e=>`
    <details class="edu-card">
      <summary class="edu-summary">
        <div><div class="edu-title">${e.name||''}</div><div class="edu-sub">${e.sub||''}</div></div>
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
  const sorted = items.filter(Boolean).sort((a,b)=>(+(a.order||99))-(+(b.order||99)));
  const html = sorted.map(e=>`
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
        ${e.bullets&&e.bullets.length ? `<div class="body-title">${l==='ru'?'Что делал':'What I did'}</div>${bullets(e.bullets)}` : ''}
        ${e.github ? `<div class="card-link"><a href="${e.github}" target="_blank">↗ GitHub</a></div>` : ''}
        ${e.link   ? `<div class="card-link"><a href="${e.link}"   target="_blank">↗ Link</a></div>`   : ''}
      </div>
    </details>`).join('');
  document.getElementById('exp-list').innerHTML = html;
  hideSection('experience', sorted.length===0);
  renumberSections();
}

// ─────────────────────────────────────────────
//  Projects
// ─────────────────────────────────────────────
async function renderProjects() {
  const m = STATE.mode, l = STATE.lang;
  const items = await fetchAll(STATE.manifest.langs[l].projects[m]);
  const sorted = items.filter(Boolean).sort((a,b)=>(+(a.order||99))-(+(b.order||99)));
  const html = sorted.map(p=>`
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
        ${p.bullets&&p.bullets.length ? `<div class="body-title">${l==='ru'?'Моя работа':'My work'}</div>${bullets(p.bullets)}` : ''}
        ${p.stack  ? `<div class="kv-row"><span class="kv-key">Stack</span><span class="kv-val">${p.stack}</span></div>` : ''}
        ${p.github ? `<div class="card-link"><a href="${p.github}" target="_blank">↗ GitHub</a></div>` : ''}
        ${p.link   ? `<div class="card-link"><a href="${p.link}"   target="_blank">↗ Link</a></div>`   : ''}
      </div>
    </details>`).join('');
  document.getElementById('proj-list').innerHTML = html;
  hideSection('projects', sorted.length===0);
  renumberSections();
}

// ─────────────────────────────────────────────
//  Awards
// ─────────────────────────────────────────────
async function renderAwards() {
  const m = STATE.mode, l = STATE.lang;
  const items = await fetchAll(STATE.manifest.langs[l].awards[m]);
  const sorted = items.filter(Boolean).sort((a,b)=>(+(a.order||99))-(+(b.order||99)));
  document.getElementById('awards-list').innerHTML = sorted.map(a=>`
    <div class="award-item">
      <div class="award-top">
        <span class="award-year">${a.year||''}</span>
        <div class="award-body">
          <div class="award-name">${a.name||''}</div>
          <div class="award-desc">${a.summary||''}</div>
          ${a.meta ? `<div class="award-meta">${a.meta}</div>` : ''}
          ${a.link ? `<div class="card-link" style="margin-top:6px"><a href="${a.link}" target="_blank">↗ Source</a></div>` : ''}
        </div>
      </div>
    </div>`).join('');
  hideSection('awards', sorted.length===0);
  renumberSections();
}

// ─────────────────────────────────────────────
//  Update section titles
// ─────────────────────────────────────────────
function updateSectionTitles() {
  const map = {
    'exp-title':'experience','skills-title':'skills',
    'edu-title':'education','proj-title':'projects','awards-title':'awards'
  };
  Object.entries(map).forEach(([id,key]) => {
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
    (async()=>{ renderSkills(); })(),
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
async function init() {
  STATE.mode = localStorage.getItem('p-mode') || CONFIG.default_mode;
  STATE.lang = localStorage.getItem('p-lang') || CONFIG.default_lang;
  document.documentElement.setAttribute('data-mode', STATE.mode);
  document.documentElement.setAttribute('data-lang', STATE.lang);
  // update lang button
  const lb = document.querySelector('.lang-current');
  if (lb) lb.textContent = STATE.lang.toUpperCase();
  const res = await fetch('manifest.json');
  STATE.manifest = await res.json();
  await renderAll();
}

document.addEventListener('DOMContentLoaded', init);
const R = { renderAll, renderHero, renderStats, renderSkills, renderEducation, renderExperience, renderProjects, renderAwards, applyConfig };
