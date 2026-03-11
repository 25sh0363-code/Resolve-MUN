# Google Apps Script Backend Setup

## 1. Prepare Google Sheet

1. Create a new Google Sheet.
2. Name it something like `Resolve-MUN-Registrations`.
3. Open `Extensions -> Apps Script`.

## 2. Add Backend Code

1. Replace the default `Code.gs` with `apps-script/Code.gs` from this repository.
2. Create a folder in Google Drive for payment proofs.
3. Copy the folder ID from its URL.
4. In `Code.gs`, set:

```javascript
const DRIVE_FOLDER_ID = "PASTE_GOOGLE_DRIVE_FOLDER_ID_HERE";
```

5. Paste your folder ID there, then click `Save`.

## 3. Deploy as Web App

1. Click `Deploy -> New deployment`.
2. Type: `Web app`.
3. Execute as: `Me`.
4. Who has access: `Anyone`.
5. Click `Deploy` and copy the `Web app URL`.

## 4. Connect Website Form

1. Open `register.html`.
2. Find the form attribute:

```html
<form id="delegate-registration-form" ... data-appscript-url="PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE">
```

3. Replace `PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE` with your deployed URL.

## 5. Test End-to-End

1. Open `register.html` in browser.
2. Submit a delegate registration.
3. Check the `Delegate Registrations` sheet tab in Google Sheets.

## Notes

- Re-deploy a new version in Apps Script after any backend code change.
- Keep Apps Script deployment URL private to your team.
- Add an email trigger in Apps Script later if you want auto-confirmation emails.
- Payment proof files are uploaded to the Drive folder configured by `DRIVE_FOLDER_ID`.
- Mobile users can upload screenshots/photos directly from camera or gallery.
