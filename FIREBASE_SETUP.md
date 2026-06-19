# Firebase Setup Guide

## Step 1 — Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click **Add project** → name it (e.g. `finance-tracker`) → disable Analytics → Create

## Step 2 — Add a Web App
1. Click the **</>** (Web) icon
2. Register app → **copy the firebaseConfig object**

## Step 3 — Paste Config into db.js
Open `db.js`, replace the placeholder values in `FIREBASE_CONFIG` at the top with your copied values.

## Step 4 — Create Firestore Database
1. Firebase Console → **Firestore Database** → **Create database**
2. Choose **Start in test mode** → pick a region → Enable

## Step 5 — Make Rules Permanent (so it never expires)
Firestore → Rules → replace with:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
Click **Publish**. This removes the 30-day test mode expiry — it now works forever for free.

## Step 6 — Push to GitHub
Push `db.js`, `index.html`, `saving.html`, `login.html` to your GitHub Pages repo.

---

## Fixed in this version
- **Delete button bug**: Firestore uses string IDs (e.g. `"aB3xQ9..."`), but the delete buttons
  were wrapping the ID with `Number()`, turning it into `NaN`. This made delete silently fail —
  it looked like it worked (toast said "Deleted") but the record stayed in Firestore and reappeared
  on refresh. Fixed in both `index.html` (transactions) and `saving.html` (saving records) to pass
  the ID as a proper string.
- **login.html**: removed the leftover IndexedDB stub; now loads the real `db.js` (Firebase) like
  the other two pages, so login pre-init uses the same database.
