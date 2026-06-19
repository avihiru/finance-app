/**
 * FinanceDB — Firebase Firestore backend
 * Drop-in replacement for the IndexedDB version.
 * Same public API: init, seedIfEmpty, getTransactions, addTransaction,
 * deleteTransaction, getSavingData, addSavingExpense, deleteSaving.
 *
 * ── HOW TO SET UP ────────────────────────────────────────────────
 * 1. Go to https://console.firebase.google.com
 * 2. Create a project (e.g. "finance-tracker")
 * 3. Add a Web app  →  copy the firebaseConfig values below
 * 4. Firestore Database → Create database → Start in test mode
 * 5. Replace the placeholder values in FIREBASE_CONFIG below
 * ────────────────────────────────────────────────────────────────
 */

var FIREBASE_CONFIG = {
  apiKey: "AIzaSyAp2pAPQ8ZGXC0Aog4aZUqdbr7u4Uy0_AA",
  authDomain: "income-tracker-32de2.firebaseapp.com",
  projectId: "income-tracker-32de2",
  storageBucket: "income-tracker-32de2.firebasestorage.app",
  messagingSenderId: "747655853517",
  appId: "1:747655853517:web:9af82662e82d605db80084"
};

var FinanceDB = (function () {
  'use strict';

  // Firebase SDK (loaded via CDN in each HTML file — see note below)
  // Globals available after SDK scripts load: firebase, firebase.firestore()
  var _db = null;   // Firestore instance

  var MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];

  function monthNameFromYM(ym) {
    var parts = ym.split('-');
    return MONTH_NAMES[parseInt(parts[1], 10) - 1];
  }

  function currentYM() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  }

  function nowISO() { return new Date().toISOString(); }

  // ── Init ─────────────────────────────────────────────────────────
  function init() {
    return new Promise(function (resolve, reject) {
      if (_db) { resolve(_db); return; }
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(FIREBASE_CONFIG);
        }
        _db = firebase.firestore();
        // Enable offline persistence (works in WebView / Chrome)
        _db.enablePersistence({ synchronizeTabs: false })
          .catch(function (err) {
            // Persistence may fail in some environments — that's ok,
            // online mode still works fine
            console.warn('Firestore persistence unavailable:', err.code);
          });
        resolve(_db);
      } catch (e) {
        reject(e);
      }
    });
  }

  // ── Seed ─────────────────────────────────────────────────────────
  /**
   * Seeds initial data on first launch (only if both collections are empty).
   */
  function seedIfEmpty() {
    return init().then(function () {
      return Promise.all([
        _db.collection('transactions').limit(1).get(),
        _db.collection('saving').limit(1).get()
      ]);
    }).then(function (snaps) {
      if (!snaps[0].empty || !snaps[1].empty) return; // already has data

      var txSeed = [
        {type:'income',  category:'salary',        amount:86800,   description:'March salary',           date:'2026-04-13T16:41:51.000Z', month:'April'},
        {type:'expense', category:'groceries',      amount:993,     description:'Groceries',              date:'2026-04-14T00:36:40.000Z', month:'April'},
        {type:'expense', category:'groceries',      amount:608.67,  description:'cat food',               date:'2026-04-14T01:26:54.000Z', month:'April'},
        {type:'expense', category:'other',          amount:1515,    description:'other',                  date:'2026-04-14T01:28:03.000Z', month:'April'},
        {type:'expense', category:'communication',  amount:150,     description:'reload',                 date:'2026-04-14T01:28:24.000Z', month:'April'},
        {type:'expense', category:'other',          amount:5005,    description:'other',                  date:'2026-04-14T01:30:24.000Z', month:'April'},
        {type:'expense', category:'other',          amount:4060,    description:'other',                  date:'2026-04-14T01:30:45.000Z', month:'April'},
        {type:'expense', category:'other',          amount:35005,   description:'for buy refrigerator',   date:'2026-04-14T01:32:50.000Z', month:'April'},
        {type:'expense', category:'communication',  amount:100,     description:'reload',                 date:'2026-04-14T01:44:51.000Z', month:'April'},
        {type:'expense', category:'communication',  amount:3186.04, description:'slt bill',               date:'2026-04-14T01:45:14.000Z', month:'April'},
        {type:'expense', category:'communication',  amount:50,      description:'reload',                 date:'2026-04-14T01:45:37.000Z', month:'April'},
        {type:'expense', category:'groceries',      amount:2472,    description:'food',                   date:'2026-04-14T01:46:24.000Z', month:'April'},
        {type:'expense', category:'groceries',      amount:660,     description:'food and accesories',    date:'2026-04-14T01:46:47.000Z', month:'April'},
        {type:'expense', category:'communication',  amount:100,     description:'reload',                 date:'2026-04-14T01:47:00.000Z', month:'April'},
        {type:'expense', category:'communication',  amount:699,     description:'dialog router',          date:'2026-04-14T01:48:11.000Z', month:'April'},
        {type:'expense', category:'other',          amount:9005,    description:'other',                  date:'2026-04-14T01:48:34.000Z', month:'April'},
        {type:'expense', category:'other',          amount:5030,    description:'other',                  date:'2026-04-14T01:49:08.000Z', month:'April'},
        {type:'expense', category:'communication',  amount:200,     description:'reload',                 date:'2026-04-14T01:50:03.000Z', month:'April'},
        {type:'expense', category:'other',          amount:17005,   description:'new year',               date:'2026-04-14T01:51:34.000Z', month:'April'},
        {type:'expense', category:'communication',  amount:100,     description:'Reload',                 date:'2026-04-17T01:56:58.000Z', month:'April'},
        {type:'expense', category:'other',          amount:125,     description:'Qua charge',             date:'2026-04-17T03:07:45.000Z', month:'April'},
        {type:'income',  category:'other',          amount:1492.27, description:'Balance',                date:'2026-04-17T05:59:43.000Z', month:'April'},
        {type:'expense', category:'communication',  amount:50,      description:'Reload',                 date:'2026-04-18T13:45:43.000Z', month:'April'},
        {type:'expense', category:'communication',  amount:307,     description:'Reload for office',      date:'2026-04-20T13:08:51.000Z', month:'April'},
        {type:'expense', category:'communication',  amount:50,      description:'Reload',                 date:'2026-04-21T11:19:16.000Z', month:'April'},
        {type:'income',  category:'other',          amount:41.98,   description:'Interest',               date:'2026-04-22T10:53:00.000Z', month:'April'},
        {type:'expense', category:'communication',  amount:150,     description:'Reload',                 date:'2026-04-22T10:55:19.000Z', month:'April'},
        {type:'expense', category:'other',          amount:735.94,  description:'Other',                  date:'2026-04-25T14:13:10.000Z', month:'April'},
        {type:'income',  category:'investment',     amount:972.60,  description:'Previous balance',       date:'2026-04-25T14:16:10.000Z', month:'May'},
        {type:'income',  category:'salary',         amount:86800,   description:'Salary',                 date:'2026-04-25T14:16:40.000Z', month:'May'},
        {type:'expense', category:'other',          amount:15000,   description:'Fridge loan',            date:'2026-04-25T14:19:42.000Z', month:'May'},
        {type:'expense', category:'transport',      amount:5005,    description:'Bus fee',                date:'2026-04-25T14:21:30.000Z', month:'May'},
        {type:'expense', category:'groceries',      amount:627.50,  description:'Foods',                  date:'2026-04-25T14:22:33.000Z', month:'May'},
        {type:'income',  category:'other',          amount:3000,    description:'Party balance donation', date:'2026-04-25T15:58:21.000Z', month:'May'},
        {type:'expense', category:'other',          amount:608.67,  description:'Koko payment',           date:'2026-04-25T16:03:45.000Z', month:'May'},
        {type:'income',  category:'other',          amount:1000,    description:'Party balance',          date:'2026-04-26T01:38:02.000Z', month:'May'},
        {type:'expense', category:'communication',  amount:699,     description:'Reload',                 date:'2026-04-26T02:41:05.000Z', month:'May'},
        {type:'expense', category:'communication',  amount:50,      description:'Reload',                 date:'2026-04-28T00:26:13.000Z', month:'May'},
        {type:'income',  category:'other',          amount:1000,    description:'Party balance',          date:'2026-04-28T12:15:35.000Z', month:'May'},
        {type:'income',  category:'other',          amount:1000,    description:'Party balance',          date:'2026-04-28T12:34:54.000Z', month:'May'},
        {type:'expense', category:'other',          amount:5030,    description:'Party balance due',      date:'2026-04-28T13:17:19.000Z', month:'May'},
        {type:'expense', category:'communication',  amount:4030,    description:'Wedding',                date:'2026-04-29T02:56:30.000Z', month:'May'},
        {type:'expense', category:'Saving',         amount:10000,   description:'May saving',             date:'2026-04-29T03:48:34.000Z', month:'May'},
        {type:'expense', category:'other',          amount:50,      description:'Balance',                date:'2026-04-29T08:04:56.000Z', month:'May'},
        {type:'expense', category:'groceries',      amount:2330,    description:'Foods',                  date:'2026-04-29T08:05:45.000Z', month:'May'},
        {type:'expense', category:'other',          amount:3060,    description:'Wedding',                date:'2026-04-30T03:36:13.000Z', month:'May'},
        {type:'expense', category:'communication',  amount:3186.04, description:'Slt bill',               date:'2026-05-02T03:29:59.000Z', month:'May'},
        {type:'expense', category:'communication',  amount:10000,   description:'Classfees',              date:'2026-05-02T05:54:33.000Z', month:'May'},
        {type:'expense', category:'other',          amount:2005,    description:'Other payments',         date:'2026-05-02T05:55:16.000Z', month:'May'},
        {type:'expense', category:'communication',  amount:200,     description:'Reload',                 date:'2026-05-06T06:25:49.000Z', month:'May'},
        {type:'expense', category:'communication',  amount:1061,    description:'Reload',                 date:'2026-05-06T06:33:07.000Z', month:'May'},
        {type:'expense', category:'other',          amount:1030,    description:'Birthdays',              date:'2026-05-13T09:18:09.000Z', month:'May'},
        {type:'expense', category:'communication',  amount:150,     description:'Reload',                 date:'2026-05-13T09:19:04.000Z', month:'May'},
        {type:'expense', category:'other',          amount:3005,    description:'Others',                 date:'2026-05-13T09:19:39.000Z', month:'May'},
        {type:'expense', category:'communication',  amount:50,      description:'Reload',                 date:'2026-05-13T12:27:47.000Z', month:'May'}
      ];

      var savingSeed = [
        {description:'past saving',             amount:100000,  state:'saving',  month:'April', date:'2026-04-14', time:'01:39:26'},
        {description:'for buy refrigerator',    amount:40005,   state:'expense', month:'April', date:'2026-04-14', time:'01:41:49'},
        {description:'New year party',          amount:5005,    state:'expense', month:'April', date:'2026-04-15', time:'03:49:39'},
        {description:'For medicine and others', amount:2661.10, state:'expense', month:'April', date:'2026-04-17', time:'02:04:05'},
        {description:'Interest',                amount:116.20,  state:'saving',  month:'April', date:'2026-04-22', time:'06:54:13'},
        {description:'Emergency',               amount:3405,    state:'expense', month:'April', date:'2026-04-25', time:'10:11:15'},
        {description:'May saving',              amount:10000,   state:'saving',  month:'April', date:'2026-04-28', time:'23:48:34'}
      ];

      var batch = _db.batch();
      txSeed.forEach(function (r) {
        batch.set(_db.collection('transactions').doc(), r);
      });
      savingSeed.forEach(function (r) {
        batch.set(_db.collection('saving').doc(), r);
      });
      return batch.commit();
    });
  }

  // ── TRANSACTIONS API ─────────────────────────────────────────────

  function getTransactions(ym) {
    var monthName = monthNameFromYM(ym || currentYM());
    return init().then(function () {
      return _db.collection('transactions')
        .where('month', '==', monthName)
        .orderBy('date', 'desc')
        .get();
    }).then(function (snap) {
      var rows = [];
      snap.forEach(function (doc) {
        rows.push(Object.assign({ id: doc.id }, doc.data()));
      });

      var totalIncome = 0, totalExpenses = 0;
      rows.forEach(function (r) {
        if (r.type === 'income') totalIncome   += parseFloat(r.amount);
        else                     totalExpenses  += parseFloat(r.amount);
      });

      return {
        success:        true,
        month:          monthName,
        transactions:   rows.map(function (r) {
          return {
            id:          r.id,
            type:        r.type,
            category:    r.category,
            amount:      r.amount,
            description: r.description,
            date:        r.date ? r.date.slice(0, 10) : '',
            month:       r.month
          };
        }),
        total_income:   totalIncome,
        total_expenses: totalExpenses,
        net_balance:    totalIncome - totalExpenses
      };
    });
  }

  function addTransaction(type, category, amount, description, ym) {
    var monthName = monthNameFromYM(ym || currentYM());
    var record = {
      type:        type,
      category:    category,
      amount:      parseFloat(amount),
      description: description,
      date:        nowISO(),
      month:       monthName
    };

    return init().then(function () {
      return _db.collection('transactions').add(record);
    }).then(function () {
      if (category === 'Saving') {
        return _db.collection('saving').add({
          description: description,
          amount:      parseFloat(amount),
          state:       'saving',
          month:       MONTH_NAMES[new Date().getMonth()],
          date:        nowISO().slice(0, 10),
          time:        new Date().toTimeString().slice(0, 8)
        });
      }
    }).then(function () {
      return { success: true, message: 'Transaction added.' };
    });
  }

  function deleteTransaction(id) {
    return init().then(function () {
      return _db.collection('transactions').doc(String(id)).delete();
    }).then(function () {
      return { success: true };
    });
  }

  // ── SAVING API ───────────────────────────────────────────────────

  function getSavingData() {
    return init().then(function () {
      return _db.collection('saving').get();
    }).then(function (snap) {
      var rows = [];
      snap.forEach(function (doc) {
        rows.push(Object.assign({ id: doc.id }, doc.data()));
      });

      var totalSavings = 0, totalExpenses = 0;
      var monthly = {};

      rows.forEach(function (r) {
        var amt = parseFloat(r.amount);
        if (r.state === 'saving') totalSavings  += amt;
        else                      totalExpenses  += amt;

        var mKey = r.month ? r.month.slice(0, 3) : '?';
        if (!monthly[mKey]) monthly[mKey] = { saving: 0, expense: 0 };
        monthly[mKey][r.state] = (monthly[mKey][r.state] || 0) + amt;
      });

      var ordered = {};
      var abbrevs = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      abbrevs.forEach(function (a) { if (monthly[a]) ordered[a] = monthly[a]; });
      Object.keys(monthly).forEach(function (k) { if (!ordered[k]) ordered[k] = monthly[k]; });

      var sorted = rows.slice().sort(function (a, b) {
        var da = (a.date || '') + (a.time || '');
        var db = (b.date || '') + (b.time || '');
        return db > da ? 1 : -1;
      });

      return {
        success:        true,
        total_savings:  totalSavings,
        total_expenses: totalExpenses,
        net_balance:    totalSavings - totalExpenses,
        transactions:   sorted.map(function (r) {
          return { id: r.id, description: r.description, amount: r.amount, state: r.state, date: r.date };
        }),
        monthly: ordered
      };
    });
  }

  function addSavingExpense(description, amount) {
    var record = {
      description: description,
      amount:      parseFloat(amount),
      state:       'expense',
      month:       MONTH_NAMES[new Date().getMonth()],
      date:        nowISO().slice(0, 10),
      time:        new Date().toTimeString().slice(0, 8)
    };
    return init().then(function () {
      return _db.collection('saving').add(record);
    }).then(function () {
      return { success: true, message: 'Transaction added.' };
    });
  }

  function deleteSaving(id) {
    return init().then(function () {
      return _db.collection('saving').doc(String(id)).delete();
    }).then(function () {
      return { success: true };
    });
  }

  // ── Public API ───────────────────────────────────────────────────
  return {
    init:              init,
    seedIfEmpty:       seedIfEmpty,
    getTransactions:   getTransactions,
    addTransaction:    addTransaction,
    deleteTransaction: deleteTransaction,
    getSavingData:     getSavingData,
    addSavingExpense:  addSavingExpense,
    deleteSaving:      deleteSaving
  };
})();
