// Sanity-check parser: copy parseMd from render.js (without browser deps),
// then load every file from manifest.json and verify shape.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const STATE = { lang: 'en' };

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
        } else {
          out[bareM[1]] = v;
        }
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

function L(obj, key, lang = 'en') {
  if (!obj) return undefined;
  if (obj[`${key}_${lang}`] !== undefined) return obj[`${key}_${lang}`];
  if (obj[`${key}_en`] !== undefined) return obj[`${key}_en`];
  return obj[key];
}

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json')));
const allFiles = [
  ...manifest.meta,
  ...manifest.experience.hard, ...manifest.experience.soft,
  ...manifest.projects.hard, ...manifest.projects.soft,
  ...manifest.education,
  ...manifest.awards.hard, ...manifest.awards.soft,
];

let warnings = 0;
let errors = 0;
const orderConflicts = {};
const idsSeen = {};

for (const rel of allFiles) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) { console.log(`✗ MISSING: ${rel}`); errors++; continue; }
  const txt = fs.readFileSync(full, 'utf8');
  let p;
  try { p = parseMd(txt); } catch (e) { console.log(`✗ PARSE: ${rel}: ${e.message}`); errors++; continue; }

  // Check meta has both languages where expected (skip education extras which can be hard-only or soft-only)
  if (!rel.includes('education/')) {
    if (!p._langs || (!p._langs.en && !p._langs.ru)) {
      // meta.md is OK with empty langs (everything in frontmatter)
      if (!rel.endsWith('meta.md')) {
        console.log(`⚠ NO LANG: ${rel}`);
        warnings++;
      }
    }
  }

  // id duplicates
  if (p.id) {
    if (idsSeen[p.id]) {
      console.log(`⚠ DUP id "${p.id}": ${idsSeen[p.id]} ↔ ${rel}`);
      warnings++;
    } else idsSeen[p.id] = rel;
  }

  // Localized name
  if (!rel.endsWith('meta.md') && !rel.includes('awards/') && !L(p, 'name')) {
    console.log(`⚠ NO NAME: ${rel}`);
    warnings++;
  }
}

// Order conflict check per section/mode
function checkOrders(files, label) {
  const seen = {};
  for (const rel of files) {
    const p = parseMd(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
    const o = p.order;
    if (o === undefined) continue;
    if (seen[o]) { console.log(`⚠ ORDER ${label}: ${o} → ${seen[o]} ↔ ${rel}`); warnings++; }
    else seen[o] = rel;
  }
}
checkOrders(manifest.experience.hard, 'experience/hard');
checkOrders(manifest.experience.soft, 'experience/soft');
checkOrders(manifest.projects.hard, 'projects/hard');
checkOrders(manifest.projects.soft, 'projects/soft');
checkOrders(manifest.awards.hard, 'awards/hard');
checkOrders(manifest.awards.soft, 'awards/soft');
// education has its own ordering (only one entry shows as primary)
checkOrders(manifest.education, 'education');

console.log(`\nDone. ${errors} errors, ${warnings} warnings, ${allFiles.length} files parsed.`);
process.exit(errors ? 1 : 0);
