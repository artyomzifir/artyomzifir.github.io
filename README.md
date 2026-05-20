# [Portfolio — Artyom Tuzov](https://artyomzifir.github.io/)

Personal portfolio site with **Hard** (ML/CV/Robotics) and **Soft** (Community/Leadership) modes, EN/RU language switch, and a content system based on plain Markdown files — one file per entity, bilingual.

## Stack

| Layer | What |
|---|---|
| Content | Bilingual Markdown files in `content/` |
| Config | `config.js` — palette, fonts, type scale, layout |
| Render | Vanilla JS — fetches `manifest.json`, parses md, builds DOM |
| Deploy | GitHub Actions → GitHub Pages |

No build step, no framework, no npm. Just files.

## Adding content

Drop a new `.md` file in the right folder → push → GitHub Actions rebuilds `manifest.json` → it appears on the site automatically.

```
content/
├── meta.md                        ← hero pitch, tagline, stats (bilingual)
├── experience/
│   ├── hard/                      ← ML/CV/Robotics jobs
│   └── soft/                      ← clubs, community, volunteering
├── projects/
│   ├── hard/
│   └── soft/
├── education/                     ← university + extra courses
└── awards/
    ├── hard/
    └── soft/
```

There is no longer an `en/` and `ru/` split — every file holds both languages.

### File format

Frontmatter has **shared** keys (`id`, `order`, `mode`, `tags`, `github`, `link`, `year`, `proof`) and **localized** keys with `_en` / `_ru` suffixes (`name_en`, `name_ru`, `meta_en`, `meta_ru`, `stack_*`, `problem_*`, `solution_*`, `result_*`, …). The body is split into `## en` and `## ru` sections; inside each section, `### bullets` is supported.

```markdown
---
id: my-project
order: 1
mode: hard
tags: ["Tag1", "Tag2"]
github: "https://github.com/..."   # optional
link: "https://..."                 # optional
name_en: "Project Name"
name_ru: "Название проекта"
meta_en: "Jan 2026 – present · Role"
meta_ru: "Янв 2026 – н.в. · Роль"
stack_en: "Python · Docker"
stack_ru: "Python · Docker"
problem_en: "What was the problem."
problem_ru: "В чём заключалась задача."
solution_en: "What was built."
solution_ru: "Что было построено."
result_en: "What was achieved."
result_ru: "Чего достигли."
---

## en

One-line summary shown in collapsed card.

### bullets
- First bullet
- Second bullet

## ru

Одна строка саммари в свёрнутой карточке.

### bullets
- Первый пункт
- Второй пункт
```

**Notes**

- `order` controls sort order within a section (lower = first). Must be unique inside each (section, mode).
- `mode` controls which toggle (`hard` / `soft`) shows the entry. Education entries can also be marked `mode` to only appear on one side.
- `link` is for external URLs (project page, news, video). `proof` is for asset paths (screenshots/scans of awards) and rendered as "Proof" instead of "Source".
- If a language section is missing from the body, the renderer falls back to `en` automatically. Same for localized frontmatter fields.

### Education with course details

`content/education/innopolis.md` accepts `courses_hard_en`, `courses_hard_ru`, `courses_soft_en`, `courses_soft_ru` as inline arrays. Bodies can include `### course_data_hard` and `### course_data_soft` subsections with `Course Name :: long description` lines — these become expandable cards.

## Config

Edit `config.js` to change anything visual — no CSS knowledge needed:

```js
CONFIG.hard.accent = "#3AAD1E"          // neon green
CONFIG.soft.accent = "#E05A10"          // orange
CONFIG.fonts.soft_heading = "'Comfortaa', cursive"
CONFIG.type.hero_name_size = "36px"
CONFIG.layout.border_radius = "12px"
```

Changes apply on reload.

## Local dev

Requires a local server (browser blocks `fetch()` on `file://` — the page will show a friendly hint if you forget):

```bash
# Python (no install needed)
python3 -m http.server 8080
# open http://localhost:8080

# OR Node
npx serve .
```

To regenerate `manifest.json` after adding files locally:

```bash
node scripts/build-manifest.js
```

To sanity-check content (no missing names, no duplicate `id`s, no `order` conflicts):

```bash
node scripts/check.js
```

To smoke-test the full render in headless DOM (requires `jsdom`):

```bash
npm install --no-save jsdom
node scripts/dom-test.js
```

GitHub Actions runs `build-manifest.js` on every push to `main` and deploys the result to GitHub Pages.

## Project structure

```
portfolio/
├── index.html
├── config.js               ← ALL visual settings here
├── manifest.json           ← auto-generated, do not edit manually
├── content/                ← bilingual markdown
│   ├── meta.md
│   ├── experience/{hard,soft}/
│   ├── projects/{hard,soft}/
│   ├── education/
│   └── awards/{hard,soft}/
├── assets/
│   ├── css/style.css
│   ├── js/
│   │   ├── render.js       ← fetches manifest + md, builds DOM
│   │   └── theme.js        ← mode + lang toggle handlers
│   ├── media/              ← put photo.jpg here
│   └── cv/                 ← put cv.pdf here
└── scripts/
    ├── build-manifest.js   ← scans content/, writes manifest.json
    ├── check.js            ← sanity-check content
    └── dom-test.js         ← jsdom render smoke test
```
