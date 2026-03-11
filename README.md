# Resolve MUN Website (2026 Edition)

Multi-page conference website for Resolve MUN with a sci-fi diplomatic visual identity.
Currently live at: https://25sh0363-code.github.io/Resolve-MUN/

## Pages

- `index.html` - flagship landing page and high-level conference overview
- `about.html` - conference mission, details, and experience
- `committees.html` - all 8 committees and topic placeholders
- `secretariat.html` - leadership structure placeholders
- `venue.html` - venue reveal content and preview visuals
- `register.html` - delegate and organising committee registration flow

## Delegate Registration System (Google Sheets + Apps Script)

The website now includes a live delegate registration form in `register.html`.

It also includes an Organising Committee application form for evaluation and consideration (no payment required).

- Frontend form posts to an Apps Script Web App URL.
- Apps Script writes each submission to a Google Sheet tab named `Delegate Registrations`.
- Registration also requires proof of payment upload, saved in Google Drive.
- Backend template is provided in `apps-script/Code.gs`.
- Deployment guide is in `apps-script/README.md`.

Quick connect step:

1. Deploy Apps Script as a Web App.
2. Copy the deployment URL.
3. Paste it in `register.html` at `data-appscript-url` on `#delegate-registration-form`.

## Design and Motion Features

- Animated ambient background, glows, and moving gradient orbs
- Custom cursor glow on pointer devices
- Scroll reveal animations and interactive tilt cards
- Shared responsive navigation with mobile menu toggle
- Live countdown (conference opening timer)

## Assets

- `assets/images/venue-preview-1.png`
- `assets/images/venue-preview-2.png`

## Built With

- HTML
- CSS
- JavaScript

#Creater
-Om Suraj -silveraoaks international
