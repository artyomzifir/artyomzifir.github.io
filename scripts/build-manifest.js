#!/usr/bin/env node
// Scans content/ directory and generates manifest.json
// Run: node scripts/build-manifest.js
// Called automatically by GitHub Actions on every push.
//
// New format: bilingual content. One file per entity contains both EN and RU
// (frontmatter keys: name_en/name_ru/..., body sections: ## en / ## ru).
// Manifest is therefore language-independent — a flat list of paths per section.

const fs   = require('fs');
const path = require('path');

const ROOT         = path.join(__dirname, '..');
const CONTENT_ROOT = path.join(ROOT, 'content');
const OUT          = path.join(ROOT, 'manifest.json');

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function scanDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .map(f => toPosix(path.relative(ROOT, path.join(dir, f))));
}

function buildManifest() {
  const manifest = {
    generated: new Date().toISOString(),
    meta:       fs.existsSync(path.join(CONTENT_ROOT, 'meta.md'))
      ? [toPosix(path.relative(ROOT, path.join(CONTENT_ROOT, 'meta.md')))]
      : [],
    experience: {
      hard: scanDir(path.join(CONTENT_ROOT, 'experience', 'hard')),
      soft: scanDir(path.join(CONTENT_ROOT, 'experience', 'soft')),
    },
    projects: {
      hard: scanDir(path.join(CONTENT_ROOT, 'projects', 'hard')),
      soft: scanDir(path.join(CONTENT_ROOT, 'projects', 'soft')),
    },
    education: scanDir(path.join(CONTENT_ROOT, 'education')),
    awards: {
      hard: scanDir(path.join(CONTENT_ROOT, 'awards', 'hard')),
      soft: scanDir(path.join(CONTENT_ROOT, 'awards', 'soft')),
    },
  };

  fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2));

  const total =
    manifest.meta.length +
    manifest.experience.hard.length + manifest.experience.soft.length +
    manifest.projects.hard.length   + manifest.projects.soft.length +
    manifest.education.length +
    manifest.awards.hard.length     + manifest.awards.soft.length;

  console.log(`✓ manifest.json written`);
  console.log(`  meta:       ${manifest.meta.length}`);
  console.log(`  experience: ${manifest.experience.hard.length} hard / ${manifest.experience.soft.length} soft`);
  console.log(`  projects:   ${manifest.projects.hard.length} hard / ${manifest.projects.soft.length} soft`);
  console.log(`  education:  ${manifest.education.length}`);
  console.log(`  awards:     ${manifest.awards.hard.length} hard / ${manifest.awards.soft.length} soft`);
  console.log(`  total:      ${total} files`);
}

buildManifest();
