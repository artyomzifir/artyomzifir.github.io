// ─────────────────────────────────────────────
//  PORTFOLIO CONFIG — edit anything here
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
  cv_en:    "https://rxresu.me/artyomzifir/cv-en",   // update with real link
  cv_ru:    "https://rxresu.me/artyomzifir/cv-ru",   // update with real link
  photo:    "assets/media/photo.jpg",

  // ── Modes ─────────────────────────────────
  default_mode: "hard",
  default_lang: "en",

  // ── Hard mode palette — deep ocean → lime ──
  // Base palette: #071A52 (deep navy), #086972 (teal),
  //               #17B978 (emerald), #A7FF83 (lime).
  hard: {
    bg:          "#050E2E",            // even deeper than base for body
    bg2:         "#0A1E55",            // base navy
    bg3:         "#0E2D6B",            // mid step toward teal
    fg:          "#E7F4EA",            // warm white with green undertone
    fg2:         "#A8C8B5",            // softened mint
    muted:       "#5F8678",            // mid teal-grey
    faint:       "#1B3360",            // dark line accent
    line:        "#143063",            // subtle border
    accent:      "#17B978",            // emerald — primary accent
    accent2:     "#A7FF83",            // lime — hover / highlight
    card:        "rgba(8,21,64,0.55)",        // translucent for glass effect
    card_hover:  "rgba(14,45,107,0.70)",      // hovered glass card
  },

  // ── Soft mode palette — warm peach (unchanged) ──
  soft: {
    bg:          "#FAF3E1",
    bg2:         "#F2E6C8",
    bg3:         "#E8D5A8",
    fg:          "#1E1A14",
    fg2:         "#4A3828",
    muted:       "#7A5A3A",
    faint:       "#C4A878",
    line:        "#E0CDA8",
    accent:      "#E05A10",
    accent2:     "#C44A08",
    card:        "rgba(255,248,232,0.65)",
    card_hover:  "rgba(255,253,244,0.85)",
  },

  // ── Typography ────────────────────────────
  // All four faces support Cyrillic, so RU and EN render in the same fonts.
  fonts: {
    hard_heading:   "'JetBrains Mono', monospace",
    hard_body:      "'Inter', sans-serif",
    soft_heading:   "'Comfortaa', cursive",
    soft_body:      "'Inter', sans-serif",
    mono:           "'JetBrains Mono', monospace",
    google_fonts:   "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Comfortaa:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap",
  },

  // ── Type scale ────────────────────────────
  type: {
    hero_name_size:      "36px",
    hero_name_weight:    700,
    section_size:        "19px",
    section_weight:      700,
    card_name_size:      "14px",
    card_name_weight:    700,
    body_size:           "14px",
    body_weight:         400,
    meta_size:           "11px",
    tag_size:            "10px",
    stat_num_size:       "24px",
    stat_num_weight:     700,
    soft_heading_weight: 700,
    soft_body_weight:    400,
    soft_letter_spacing: "0.15px",
    soft_line_height:    "1.72",
  },

  // ── Spacing & shape ───────────────────────
  layout: {
    max_width:     "900px",
    border_radius: "14px",
    card_padding:  "14px 18px",
  },

  // ── Skills ────────────────────────────────
  skills: {
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
      { group: "Product thinking", items: ["Roadmapping", "Backlog", "Metrics", "User research", "Agile/Scrum"] },
      { group: "Tools",            items: ["Notion", "Jira", "Miro", "Confluence", "Figma (basic)", "Baserow"] },
      { group: "Writing & Docs",   items: ["Docs-as-code", "Sphinx", "Doxygen", "API refs", "DocOps", "CI/CD for docs"] }
    ]
  },

  // ── Section labels ────────────────────────
  section_labels: {
    en: {
      skills:      "Skills",
      education:   "Education",
      experience:  "Experience",
      activities:  "Activities & Community",
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
