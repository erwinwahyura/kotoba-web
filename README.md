# Kotoba Web

**Daily Japanese vocabulary and grammar learning** — 毎日の日本語

A clean, minimalist web app for the Kotoba API. Designed with Japanese aesthetics (ma/間, negative space, simplicity).

## Features

- **Daily Vocabulary** — JLPT N5→N1 words with furigana tap-to-reveal
- **Grammar Patterns** — Full pedagogy: conjugation rules, examples, nuance, common mistakes, related patterns
- **Conjugation Drill** — Practice verb/adjective forms (て形, ない形, た形, 丁寧形, 可能形, 受身形, etc.)
- **SRS Review** — Spaced repetition with SM-2 algorithm (Again/Hard/Good/Easy ratings)
- **Pattern Comparison** — Side-by-side grammar pattern comparison
- **JLPT Mock Tests** — Timed practice exams with scoring
- **TTS Audio** — Tap words/examples to hear pronunciation
- **Progress Tracking** — Streaks, level progress, mastered content (vocab + grammar)
- **Responsive** — Works on mobile, tablet, desktop
- **PWA Ready** — Install to homescreen for app-like experience

## Design System

- White background (`#ffffff`)
- Deep blue accent (`#2c5aa0`)
- Level badges: N5 blue, N4 green, N3 orange, N2 red, N1 purple
- Generous spacing (ma/間 concept)
- Noto Sans JP for Japanese typography
- Inter for Latin text

## Usage

Open `index.html` in a browser (or serve via any static server):
```bash
npx serve .
# or
python3 -m http.server 8080
```

The app connects to `https://kotoba.erwarx.com/api`.

## Deployment

Deploy to any static host:
- GitHub Pages
- Cloudflare Pages
- Netlify
- Vercel

For GitHub Pages:
```bash
git add -A
git commit -m "feat: add Kotoba web app"
git push origin main
```

Then enable Pages in repo settings.

## File Structure

```
kotoba-web/
├── index.html      # Main app shell
├── style.css       # Japanese minimalist design
├── app.js          # App logic & API calls
├── manifest.json   # PWA manifest
├── sw.js           # Service worker (offline support)
└── README.md       # This file
```

## Credits

Built by Messenja 🎋 for Hiru
- API: https://kotoba.erwarx.com
- Backend: Go/Gin/SQLite
- Frontend: Vanilla HTML/CSS/JS (designer-approved simplicity)