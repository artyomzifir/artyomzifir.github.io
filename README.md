# Curriculum Vitae

My CV in two languages, written as YAML and rendered to PDF by [RenderCV](https://docs.rendercv.com).

**https://artyomzifir.github.io/**

The two files are independent sources, not translations of each other. Edit both by hand.

## Files

| Path | What |
|---|---|
| `Artyom_Tuzov_CV_EN.yaml` | English CV |
| `Artyom_Tuzov_CV_RU.yaml` | Russian CV |
| `zifir/` | Custom Typst theme |
| `fonts/` | Montserrat and Nunito, picked up automatically |
| `docs/` | GitHub Pages: language switcher, the two latest PDFs, and a `.webp` preview image of each |
| `archive/` | Every previous render, kept as `Artyom_Tuzov_CV_<lang>_<date>_<sha>.pdf` |

## How it works

`.github/workflows/render.yml` runs on every push to `main` that touches a `.yaml` file. It renders only the languages that changed, moves the old PDF into `archive/`, writes the new one into `docs/` alongside a `.webp` preview (via `pdftoppm` + `cwebp`), and commits both back. GitHub Pages serves `docs/` directly, so there is no deploy step.

A manual `workflow_dispatch` run re-renders both languages.

## Local render

```bash
pip install "rendercv[full]==2.8.*"
rendercv render Artyom_Tuzov_CV_RU.yaml
```

Run it from the repo root: the theme is resolved by folder name, and the fonts are read from `fonts/` next to the YAML.

## Notes

- Pin RenderCV to 2.8. The theme templates target that API and `zifir/Preamble.j2.typ` imports `@preview/rendercv:0.3.0`.
- The theme carries two hand edits that `rendercv create-theme` will not regenerate: a page fill in `Preamble.j2.typ` and an italic headline in `Header.j2.typ`.
- Section titles come straight from the YAML keys, so the Russian file uses Russian keys. Keep them capitalised as written.

## Setup on a fresh repo

1. Settings → Actions → General → Workflow permissions → **Read and write permissions**, otherwise the bot's push gets a 403.
2. Settings → Pages → Source: **Deploy from a branch**, branch `main`, folder `/docs`.
