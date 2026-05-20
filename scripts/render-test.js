// Simulate render pipeline end-to-end without browser.
// For each (lang, mode) combination, parse manifest, fetch all files,
// build text expectations and verify they contain real localized data.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let STATE = { lang: 'en', mode: 'hard' };

// ---- copied from render.js ----
function parseMd(text) {
  const out = {};
  let body = text.trim();
  const fm = body.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)/);
  if (fm) {
    const raw = fm[1];
    body = fm[2].trim();
    const lines = raw.split('\n');
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
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
      const strM = line.match(/^(\w+):\s*"((?:[^"\\]|\\.)*)"\s*$/);
      if (strM) { out[strM[1]] = strM[2].replace(/\\"/g, '"'); i++; continue; }
      const bareM = line.match(/^(\w+):\s+(.+)$/);
      if (bareM) {
        const v = bareM[2].trim();
        if (v.startsWith('[') && v.endsWith(']')) {
          out[bareM[1]] = (v.slice(1, -1).match(/("(?:[^"\\]|\\.)*"|[^,]+)/g) || [])
            .map(s => s.trim().replace(/^["']|["']$/g, '').replace(/\\"/g, '"'));
        } else { out[bareM[1]] = v; }
      }
      i++;
    }
  }
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
    if (!indices.length) langBlocks.en = parseLangSection(body);
  }
  out._langs = langBlocks;
  return out;
}
function parseLangSection(text) {
  const result = { summary: '', bullets: [] };
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
function L(obj, key) {
  if (!obj) return undefined;
  if (obj[`${key}_${STATE.lang}`] !== undefined) return obj[`${key}_${STATE.lang}`];
  if (obj[`${key}_en`] !== undefined) return obj[`${key}_en`];
  return obj[key];
}
function B(obj) {
  if (!obj || !obj._langs) return {};
  return obj._langs[STATE.lang] || obj._langs.en || {};
}
// ---- /copied ----

function loadFile(rel) {
  return parseMd(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
}

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json')));
const errors = [];

for (const lang of ['en', 'ru']) {
  for (const mode of ['hard', 'soft']) {
    STATE.lang = lang; STATE.mode = mode;
    const tag = `[${lang}/${mode}]`;

    // meta
    const meta = loadFile(manifest.meta[0]);
    const tagline = L(meta, `tagline_${mode}`);
    const pitch   = L(meta, `pitch_${mode}`);
    const stats   = L(meta, `stats_${mode}`);
    if (!tagline) errors.push(`${tag} missing tagline_${mode}`);
    if (!pitch)   errors.push(`${tag} missing pitch_${mode}`);
    if (!stats || !stats.length) errors.push(`${tag} missing stats_${mode}`);

    // RU should be Cyrillic
    if (lang === 'ru' && tagline && !/[А-Яа-я]/.test(tagline))
      errors.push(`${tag} tagline_${mode} not in Cyrillic: "${tagline}"`);
    if (lang === 'en' && tagline && /[А-Яа-я]/.test(tagline))
      errors.push(`${tag} tagline_${mode} unexpectedly has Cyrillic: "${tagline}"`);

    // experience
    const exp = manifest.experience[mode].map(loadFile);
    for (const e of exp) {
      if (!L(e, 'name')) errors.push(`${tag} experience: no name in ${e.id}`);
      if (!L(e, 'meta')) errors.push(`${tag} experience: no meta in ${e.id}`);
      const body = B(e);
      if (!body.summary && !body.bullets.length)
        errors.push(`${tag} experience: empty body for ${e.id}`);
      if (lang === 'ru' && L(e, 'name') && !/[А-Яа-я]/.test(L(e, 'name')) && !/^[A-Z][a-z]*(?:[A-Z][a-z]*)?( |$)/.test(L(e, 'name'))) {
        // OK for purely-proper-name like "InnTendo"
      }
    }
    // projects
    const proj = manifest.projects[mode].map(loadFile);
    for (const p of proj) {
      if (!L(p, 'name')) errors.push(`${tag} projects: no name in ${p.id}`);
      // problem/solution/result OR bullets — at least one should exist
      const hasStory = L(p, 'problem') || L(p, 'solution') || L(p, 'result');
      const hasBullets = B(p).bullets && B(p).bullets.length;
      if (!hasStory && !hasBullets && !B(p).summary)
        errors.push(`${tag} projects: ${p.id} has no body at all`);
    }
    // education
    const edu = manifest.education.map(loadFile);
    const uni = edu.find(e => e && (!e.mode || e.id === 'innopolis'));
    if (!uni) errors.push(`${tag} no innopolis edu`);
    if (uni) {
      const courses = L(uni, `courses_${mode}`);
      if (!courses || !courses.length)
        errors.push(`${tag} uni: no courses_${mode}`);
    }
    // awards
    const aw = manifest.awards[mode].map(loadFile);
    for (const a of aw) {
      if (!L(a, 'name')) errors.push(`${tag} awards: no name in ${a.id}`);
      if (!a.year)        errors.push(`${tag} awards: no year in ${a.id}`);
    }
  }
}

if (errors.length) {
  console.log(`✗ ${errors.length} integration errors:`);
  errors.forEach(e => console.log('  ' + e));
  process.exit(1);
} else {
  console.log(`✓ Integration: all 4 (lang, mode) combinations render-complete.`);
}
