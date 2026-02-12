# Kinetic Styles — Reflective Coach

A guided conversational tool that helps people explore their thinking, managing, and leading styles through the Kinetic framework (Dimov & Pistrui, 2023). Built as a multi-turn chat interface with embedded style visualisations.

## What it does

- Guides users through structured assessments (4–8 questions per framework)
- Embeds metacognitive reflection prompts throughout
- Renders style matrices live in the conversation when a style is assessed
- Explores cross-style tensions when multiple frameworks are assessed
- Maintains conversational history across the session

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure API key
```bash
cp .env.local.example .env.local
```
Edit `.env.local` and add your Anthropic API key.

### 3. Run locally
```bash
npm run dev
```
Open http://localhost:3000

## Deploy to Vercel

1. Push to GitHub
2. Import in Vercel
3. Add `ANTHROPIC_API_KEY` as an environment variable
4. Deploy

## Architecture

- `app/page.js` — Main chat interface, system prompt, style matrix visualisation
- `app/api/chat/route.js` — Server-side API proxy (keeps key secure)
- System prompt instructs Claude to embed `<!--STYLE:{...}-->` markers when scoring
- Frontend parses these markers, strips them from display, and renders visualisations

## Cost

Each message exchange uses Claude Sonnet (~$0.003–0.01 depending on conversation length). A full session (3 frameworks) typically costs $0.05–0.15.

## Project structure

```
kts-coach/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.js
│   ├── layout.js
│   └── page.js
├── .env.local.example
├── .gitignore
├── next.config.js
├── package.json
└── README.md
```
