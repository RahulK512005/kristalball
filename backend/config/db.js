const fs = require('fs');
const path = require('path');

const dbFilePath = path.join(__dirname, '../kristallball_db.json');

let inMemoryData = {
  bases: [],
  users: [],
  equipment_types: [],
  purchases: [],
  transfers: [],
  assignments: [],
  expenditures: [],
  audit_logs: []
};

let transactionSnapshot = null;
let isTransactionActive = false;

function loadDb() {
  if (fs.existsSync(dbFilePath)) {
    try {
      const content = fs.readFileSync(dbFilePath, 'utf8');
      inMemoryData = JSON.parse(content);
    } catch (e) {
      console.error('Failed to load database file, resetting:', e.message);
      saveDb();
    }
  } else {
    saveDb();
  }
}

function saveDb() {
  fs.writeFileSync(dbFilePath, JSON.stringify(inMemoryData, null, 2), 'utf8');
}

loadDb();

const query = {
  get: async (table, predicate) => {
    loadDb();
    if (!inMemoryData[table]) return null;
    if (typeof predicate === 'function') {
      return inMemoryData[table].find(predicate) || null;
    }
    if (typeof predicate === 'object') {
      return inMemoryData[table].find(item => {
        return Object.keys(predicate).every(k => item[k] === predicate[k]);
      }) || null;
    }
    return null;
  },

  all: async (table, predicate) => {
    loadDb();
    if (!inMemoryData[table]) return [];
    if (!predicate) return [...inMemoryData[table]];
    if (typeof predicate === 'function') {
      return inMemoryData[table].filter(predicate);
    }
    if (typeof predicate === 'object') {
      return inMemoryData[table].filter(item => {
        return Object.keys(predicate).every(k => item[k] === predicate[k]);
      });
    }
    return [];
  },

  insert: async (table, item) => {
    loadDb();
    if (!inMemoryData[table]) inMemoryData[table] = [];
    const id = inMemoryData[table].length > 0
      ? Math.max(...inMemoryData[table].map(i => i.id || 0)) + 1
      : 1;
    const newItem = { id, ...item, created_at: item.created_at || new Date().toISOString() };
    inMemoryData[table].push(newItem);
    if (!isTransactionActive) {
      saveDb();
    }
    return newItem;
  },

  update: async (table, predicate, updateFn) => {
    loadDb();
    if (!inMemoryData[table]) return false;
    let count = 0;
    inMemoryData[table] = inMemoryData[table].map(item => {
      let matches = false;
      if (typeof predicate === 'function') matches = predicate(item);
      else if (typeof predicate === 'object') {
        matches = Object.keys(predicate).every(k => item[k] === predicate[k]);
      }
      if (matches) {
        count++;
        return typeof updateFn === 'function' ? updateFn(item) : { ...item, ...updateFn };
      }
      return item;
    });
    if (!isTransactionActive) {
      saveDb();
    }
    return count;
  },

  delete: async (table, predicate) => {
    loadDb();
    if (!inMemoryData[table]) return 0;
    const initialLen = inMemoryData[table].length;
    inMemoryData[table] = inMemoryData[table].filter(item => {
      if (typeof predicate === 'function') return !predicate(item);
      if (typeof predicate === 'object') {
        return !Object.keys(predicate).every(k => item[k] === predicate[k]);
      }
      return true;
    });
    const deletedCount = initialLen - inMemoryData[table].length;
    if (!isTransactionActive) {
      saveDb();
    }
    return deletedCount;
  },

  beginTransaction: async () => {
    loadDb();
    transactionSnapshot = JSON.parse(JSON.stringify(inMemoryData));
    isTransactionActive = true;
  },

  commit: async () => {
    isTransactionActive = false;
    transactionSnapshot = null;
    saveDb();
  },

  rollback: async () => {
    if (transactionSnapshot) {
      inMemoryData = JSON.parse(JSON.stringify(transactionSnapshot));
      transactionSnapshot = null;
    }
    isTransactionActive = false;
    saveDb();
  },

  rawState: () => {
    loadDb();
    return inMemoryData;
  },

  resetState: (newState) => {
    inMemoryData = newState;
    saveDb();
  }
};

module.exports = { db: query, query };
