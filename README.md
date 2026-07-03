# Voice Notes

Personal dictation notes app: tap to record, Deepgram transcribes, notes are saved on-device (localStorage) and can be edited by keyboard or extended by further dictation.

## Stack

- **Cloudflare Worker** (`worker/index.js`) — serves the static app and proxies `POST /api/transcribe` to Deepgram (streams the audio body, never buffers).
- **Static PWA** (`public/`) — single-page app, installable on a phone home screen. No framework, no build step.
- **Deepgram** `nova-3`, English, `smart_format` for punctuation.

## Setup

1. `npm install`
2. Store the Deepgram API key (get one at console.deepgram.com → API Keys):
   ```
   npx wrangler secret put DEEPGRAM_API_KEY
   ```
3. Deploy: `npm run deploy`

Until the secret is set, the app deploys fine but transcription returns a clear "not set up yet" message.

## Notes storage

Notes live in the browser's localStorage (`voice-notes-v1`) — no accounts, no server-side storage. Clearing site data deletes the notes.
