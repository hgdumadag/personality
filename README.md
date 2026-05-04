# Personality Assessment

Source-first Vite/React app for an integrated personality self-assessment.

The app includes:

- Big Five scoring
- Four Temperaments mapping
- MBTI-style mapping
- Optional AI synthesis through a Vercel serverless API

## Vercel environment

Set `OPENAI_API_KEY` in Vercel Project Settings to enable AI synthesis.

Optional overrides:

```txt
AI_PROVIDER=openai
OPENAI_MODEL=gpt-5.4-mini
OPENAI_REASONING_EFFORT=low
```

Anthropic is also supported by setting `AI_PROVIDER=anthropic` and `ANTHROPIC_API_KEY`.

## Commands

```bash
npm install
npm run dev
npm run build
```
