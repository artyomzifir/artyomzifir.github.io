# [Portfolio — Artyom Tuzov](https://artyomzifir.github.io/)

Personal portfolio site with **Hard** (ML/CV/Robotics) and **Soft** (Community/Leadership) modes, EN/RU language switch, and a content system based on plain Markdown files.

## Stack

| Layer | What |
|---|---|
| Content | Markdown files in `content/` |
| Config | `config.js` — palette, fonts, type scale, layout |
| Render | Vanilla JS — fetches `manifest.json`, parses md, builds DOM |
| Deploy | GitHub Actions → Cloudflare Pages |

No build step, no framework, no npm. Just files.

## Adding content

Drop a new `.md` file in the right folder → push → GitHub Actions rebuilds `manifest.json` → it appears on the site automatically.

```
content/
├── en/
│   ├── meta.md                    ← hero pitch, tagline, stats
│   ├── experience/
│   │   ├── hard/                  ← ML/CV/Robotics jobs
│   │   └── soft/                  ← clubs, community, volunteering
│   ├── projects/
│   │   ├── hard/
│   │   └── soft/
│   ├── education/                 ← university + extra courses
│   └── awards/
│       ├── hard/
│       └── soft/
└── ru/                            ← mirror structure in Russian
```

### File format

```markdown
---
id: my-project
name: "Project Name"
meta: "Jan 2026 – present · Role"
tags: ["Tag1", "Tag2"]
order: 1
mode: hard
github: "https://github.com/..."   # optional
link: "https://..."                 # optional
stack: "Python · Docker"           # optional (projects only)
problem: "What was the problem."   # optional (projects only)
solution: "What was built."        # optional
result: "What was achieved."       # optional
---

One-line summary shown in collapsed card.

## bullets
- First bullet point
- Second bullet point
```

**`order`** controls sort order within a section (lower = first).  
**`mode`** controls which toggle shows this entry (`hard` / `soft`).  
Education files also support `courses_hard` and `courses_soft` inline arrays:

```markdown
courses_hard: ["Applied ML", "Computer Vision", "ROS2"]
courses_soft: ["Product Engineering", "Technical Communication"]
```

## Config

Edit `config.js` to change anything visual — no CSS knowledge needed:

```js
CONFIG.hard.accent = "#40BA21"          // neon green
CONFIG.soft.accent = "#FF6D1F"          // orange
CONFIG.fonts.soft_heading = "'Comfortaa', cursive"
CONFIG.type.hero_name_size = "38px"
CONFIG.layout.border_radius = "12px"
```

Changes apply on reload.

## Local dev

Requires a local server (browser blocks `fetch()` on `file://`):

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

## Project structure

```
portfolio/
├── index.html
├── config.js               ← ALL visual settings here
├── manifest.json           ← auto-generated, do not edit manually
├── content/
│   ├── en/
│   └── ru/
├── assets/
│   ├── css/style.css
│   ├── js/
│   │   ├── render.js       ← fetches manifest + md, builds DOM
│   │   └── theme.js        ← mode + lang toggle handlers
│   ├── media/              ← put photo.jpg here
│   └── cv/                 ← put cv.pdf here
└── scripts/
    └── build-manifest.js   ← scans content/, writes manifest.json
```
