# Capture

Personal dictation notes app: tap to record, Deepgram transcribes, notes are saved on-device (localStorage) and can be edited by keyboard or extended by further dictation.

Lives at **capture.bridging21.com** (CNAME at SiteGround → the project's `pages.dev` domain).

## Stack

- **Cloudflare Pages** (advanced mode) — `public/_worker.js` serves the static app and proxies `POST /api/transcribe` to Deepgram (streams the audio body, never buffers). Pages rather than a plain Worker because bridging21.com's DNS lives at SiteGround, and external CNAMEs only work with Pages custom domains, not `*.workers.dev`.
- **Static PWA** (`public/`) — single-page app, installable on a phone home screen. No framework, no build step.
- **Deepgram** `nova-3`, English, `smart_format` for punctuation.

## Setup

1. `npm install`
2. Store the Deepgram API key (get one at console.deepgram.com → API Keys):
   ```
   npx wrangler pages secret put DEEPGRAM_API_KEY
   ```
3. Deploy: `npm run deploy` (always via the npm script — it includes `--branch production`; without it the deploy goes to Preview only)

Until the secret is set, the app deploys fine but transcription returns a clear "not set up yet" message.

## Notes storage

Notes live in the browser's localStorage (`capture-v1`) — no accounts, no server-side storage. Clearing site data deletes the notes.
