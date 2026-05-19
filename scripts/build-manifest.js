#!/usr/bin/env node
// Scans content/ directory and generates manifest.json
// Run: node scripts/build-manifest.js
// Called automatically by GitHub Actions on every push

const fs   = require('fs');
const path = require('path');

const CONTENT_ROOT = path.join(__dirname, '..', 'content');
const OUT          = path.join(__dirname, '..', 'manifest.json');

function scanDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .map(f => path.join(dir, f).replace(path.join(__dirname, '..') + '/', ''));
}

function buildManifest() {
  const langs = ['en', 'ru'];
  const manifest = { generated: new Date().toISOString(), langs: {} };

  for (const lang of langs) {
    const base = path.join(CONTENT_ROOT, lang);
    manifest.langs[lang] = {
      meta:       scanDir(base).filter(f => f.endsWith('/meta.md') || f === `content/${lang}/meta.md`),
      experience: {
        hard: scanDir(path.join(base, 'experience', 'hard')),
        soft: scanDir(path.join(base, 'experience', 'soft')),
      },
      projects: {
        hard: scanDir(path.join(base, 'projects', 'hard')),
        soft: scanDir(path.join(base, 'projects', 'soft')),
      },
      education: scanDir(path.join(base, 'education')),
      awards: {
        hard: scanDir(path.join(base, 'awards', 'hard')),
        soft: scanDir(path.join(base, 'awards', 'soft')),
      },
    };
  }

  fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2));
  console.log(`✓ manifest.json written (${Object.keys(manifest.langs).join(', ')})`);

  // Count files
  let total = 0;
  for (const lang of langs) {
    const l = manifest.langs[lang];
    const n = l.meta.length
      + l.experience.hard.length + l.experience.soft.length
      + l.projects.hard.length   + l.projects.soft.length
      + l.education.length
      + l.awards.hard.length     + l.awards.soft.length;
    console.log(`  ${lang}: ${n} files`);
    total += n;
  }
  console.log(`  total: ${total} content files`);
}

buildManifest();
