// ─────────────────────────────────────────────
//  PORTFOLIO CONFIG — edit anything here
//  Changes apply instantly on reload
// ─────────────────────────────────────────────

const CONFIG = {

  // ── Identity ──────────────────────────────
  name:     "Artyom Tuzov",
  initials: "AT",
  email:    "a.tuzov.work@mail.ru",
  telegram: "artyomzifir",
  github:   "artyomzifir",
  vk:       "artyomzifir",
  bluesky:  "artyomzifir.bsky.social",
  cv_path:  "assets/cv/cv.pdf",
  photo:    "assets/media/photo.jpg",  // set to "" to show initials

  // ── Modes ─────────────────────────────────
  default_mode: "hard",   // "hard" | "soft"
  default_lang: "en",     // "en" | "ru"

  // ── Hard mode palette ─────────────────────
  hard: {
    bg:          "#0B0D0B",
    bg2:         "#111411",
    bg3:         "#181C18",
    fg:          "#E8F0E8",
    fg2:         "#A8BEA8",
    muted:       "#5A7A5A",
    faint:       "#2E402E",
    line:        "#1E2A1E",
    accent:      "#40ba21",
    accent2:     "#5cd43e",
    card:        "rgba(17,20,17,0.92)",
    card_hover:  "rgba(22,28,22,0.98)",
  },

  // ── Soft mode palette ─────────────────────
  soft: {
    bg:          "#FAF3E1",
    bg2:         "#F5E7C6",
    bg3:         "#EDD9A8",
    fg:          "#222222",
    fg2:         "#4A3828",
    muted:       "#7A5A3A",
    faint:       "#C4A878",
    line:        "#E8D5B0",
    accent:      "#FF6D1F",
    accent2:     "#E55A0A",
    card:        "rgba(255,248,235,0.9)",
    card_hover:  "rgba(255,252,242,0.98)",
  },

  // ── Typography ────────────────────────────
  fonts: {
    hard_heading:   "'Azeret Mono', monospace",
    hard_body:      "'Inter', sans-serif",
    soft_heading:   "'Comfortaa', cursive",
    soft_body:      "'Inter', sans-serif",
    mono:           "'Azeret Mono', monospace",

    // Google Fonts import URLs (auto-applied)
    google_fonts: "https://fonts.googleapis.com/css2?family=Azeret+Mono:wght@400;500;600;700&family=Comfortaa:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap",
  },

  // ── Type scale ────────────────────────────
  type: {
    hero_name_size:    "38px",
    hero_name_weight:  700,
    section_size:      "20px",
    section_weight:    700,
    card_name_size:    "14px",
    card_name_weight:  700,
    body_size:         "14px",
    body_weight:       400,
    meta_size:         "11px",
    tag_size:          "10px",
    stat_num_size:     "26px",
    stat_num_weight:   700,

    // soft overrides
    soft_heading_weight: 700,
    soft_body_weight:    400,
    soft_letter_spacing: "0.2px",
    soft_line_height:    "1.75",
  },

  // ── Spacing & shape ───────────────────────
  layout: {
    max_width:     "900px",
    border_radius: "12px",
    card_padding:  "14px 18px",
  },

  // ── Section labels (translated in meta.md) ─
  // fallback if meta.md missing
  section_labels: {
    en: {
      skills:      "Skills",
      education:   "Education",
      experience:  "Experience",
      activities:  "Activities & Community",  // soft mode
      projects:    "Projects",
      awards:      "Awards & Achievements",
    },
    ru: {
      skills:      "Навыки",
      education:   "Образование",
      experience:  "Опыт работы",
      activities:  "Активности и сообщество",
      projects:    "Проекты",
      awards:      "Достижения",
    }
  }
}

// ── Skills (rendered from CONFIG, not md files) ───
CONFIG.skills = {
  hard: [
    { group: "ML / CV",    items: ["PyTorch", "OpenCV", "YOLO11", "Deep Learning", "ONNX Runtime", "Roboflow"] },
    { group: "Robotics",   items: ["ROS2", "Nav2", "BehaviorTree", "MAPF", "C++", "Gazebo"] },
    { group: "LLM / NLP",  items: ["LLM API", "VLM", "Structured outputs", "Tool calling", "Prompting", "BM25"] },
    { group: "Infra",      items: ["Docker", "Git", "GitHub Actions", "CI/CD", "Linux", "Bash"] },
    { group: "Data",       items: ["Python", "NumPy", "Pandas", "Matplotlib", "Jupyter", "Embeddings"] },
    { group: "Docs",       items: ["Sphinx", "Doxygen", "Markdown", "RST", "GitHub Pages"] }
  ],
  soft: [
    { group: "Leadership",       items: ["Team building", "1:1 mentoring", "Task delegation", "Facilitation", "Conflict resolution"] },
    { group: "Communication",    items: ["Technical writing", "RU/EN content", "Public speaking", "Presentations", "Peer review"] },
    { group: "Community",        items: ["Event org", "Hackathons", "Workshops", "Club management", "Volunteer coordination"] },
    { group: "Product thinking", items: ["Roadmapping", "Backlog", "Metrics", "User research", "Agile"] },
    { group: "Tools",            items: ["Notion", "Jira", "Miro", "Baserow", "Confluence", "Figma (basic)"] },
    { group: "Tech (supporting)",items: ["Python", "Git", "Docker", "ROS2", "Markdown", "Sphinx"] }
  ]
}
