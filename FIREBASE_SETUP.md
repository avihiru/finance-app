# Firebase Setup Guide

## Step 1 — Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click **Add project**
3. Name it `finance-tracker` (or anything you like)
4. Disable Google Analytics (not needed) → **Create project**

---

## Step 2 — Add a Web App

1. Inside your project, click the **</>** (Web) icon
2. Register app name: `finance-tracker`
3. **Copy the firebaseConfig object** that appears — you'll need it next

---

## Step 3 — Paste Config into db.js

Open `db.js` and replace the `FIREBASE_CONFIG` at the top:

```js
var FIREBASE_CONFIG = {
  apiKey:            "AIzaSy...",          // ← paste your values
  authDomain:        "your-app.firebaseapp.com",
  projectId:         "your-app-id",
  storageBucket:     "your-app-id.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123"
};
```

---

## Step 4 — Create Firestore Database

1. In Firebase Console → **Firestore Database** → **Create database**
2. Choose **Start in test mode** (allows read/write for 30 days)
3. Select a region close to you → **Enable**

---

## Step 5 — Create Firestore Index

The transactions query filters by `month` and sorts by `date`.
Firestore needs a composite index for this:

1. Go to **Firestore → Indexes → Composite → Add index**
2. Collection: `transactions`
3. Fields:
   - `month` — Ascending
   - `date` — Descending
4. Click **Create**

> **Shortcut:** When you first load the app and open the browser console,
> Firestore will print an error with a direct link to create the index.
> Just click that link!

---

## Step 6 — Update Security Rules (after testing)

After 30 days test mode expires. Go to **Firestore → Rules** and set:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // keep simple since app has its own login
    }
  }
}
```

---

## Step 7 — Push to GitHub

Push all 4 files to your GitHub Pages repo:
- `db.js` (with your config)
- `index.html`
- `saving.html`
- `login.html`

Your app now saves all transactions to Firebase — visible from any device! 🎉
