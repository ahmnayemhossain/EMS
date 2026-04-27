# Worker Report Box (QR / public link)

This is a lightweight, backend-free worker reporting flow.

## Worker URL (factory-wise)

Use:

- `/rb/hfl`
- `/rb/qfl`
- `/rb/fgl`
- `/rb/afl`
- `/rb/kadl`
- `/rb/rsbl`
- `/rb/sarah`
- `/rb/dtr` (Site G)

The factory is taken from the URL (no factory selection on the worker page).

## Worker UX (WhatsApp-like)

On the worker page:

- Type text and press send → report is submitted
- Hold the mic button → recording starts
- Release the mic button → voice is sent automatically
- Photo button allows attaching an image
- Each conversation shows a **Report Number** (same number is shown in the EMS app inbox)
- Each conversation allows up to **10 worker messages** (text / voice / photo)
  - Counter shows `0/10 … 10/10`
  - When `10/10` is reached, input is disabled and worker must tap **“নতুন অভিযোগ”** to start a new conversation

## Where reports show in the app

Open:

- `Incidents` → `Report box` tab

Reports created from the worker page are written into the file-backed inbox (dev middleware) so phone → desktop works without backend.

## Dev-only submit API (recommended for phone → desktop)

When the worker uses a phone, the phone and desktop are different devices, so browser localStorage cannot sync.

For now we ship a **dev-only Vite middleware** that writes incoming worker reports into the file-backed inbox:

- Endpoint: `POST /api/report-box/submit`
- Writes into: `public/report-box/inbox/`
- Updates: `public/report-box/inbox/index.json`

So the desktop app can load them via the existing “Refresh” button.

## File-backed inbox (temporary “real data”)

Until backend integration, you can host “real” inbox items as static files:

- Folder: `public/report-box/inbox/`
- Index: `public/report-box/inbox/index.json`

The app reads `index.json` and pulls referenced `.txt` / audio / image files.
This is useful if a separate “worker” process drops files into the repo (or a static host).

See schema and examples in:

- `public/report-box/inbox/README.md`

## Microphone permission on phone

Most mobile browsers require **HTTPS** for microphone prompts.

Run dev server with HTTPS:

- Git Bash: `VITE_HTTPS=1 npm run dev`
- PowerShell: `$env:VITE_HTTPS='1'; npm run dev`

Then open on phone using the **Network** URL (shown by Vite), e.g.:

- `https://<your-ip>:5173/rb/hfl`
