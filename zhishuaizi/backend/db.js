const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'dice_stats.db');
const db = new sqlite3.Database(dbPath);

// 初始化表
function initDB() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS dice_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      point INTEGER UNIQUE NOT NULL,
      count INTEGER NOT NULL DEFAULT 0
    )`);
    // 初始化点数 1-6
    for (let i = 1; i <= 6; i++) {
      db.run(
        `INSERT OR IGNORE INTO dice_stats (point, count) VALUES (?, 0)`,
        [i]
      );
    }
    // 创建历史记录表
    db.run(`CREATE TABLE IF NOT EXISTS dice_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      point INTEGER NOT NULL,
      timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    // 创建产品路线图表
    db.run(`CREATE TABLE IF NOT EXISTS roadmap (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'planned',
      priority TEXT NOT NULL DEFAULT 'medium',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      target_date DATETIME,
      sort_order INTEGER DEFAULT 0
    )`);
  });
}

function getStats(callback) {
  db.all('SELECT point, count FROM dice_stats ORDER BY point', [], (err, rows) => {
    if (err) {
      callback(err);
    } else {
      callback(null, rows);
    }
  });
}

function incrementPoint(point, callback) {
  db.run(
    'UPDATE dice_stats SET count = count + 1 WHERE point = ?',
    [point],
    function (err) {
      callback(err, this.changes);
    }
  );
}

// 保存历史记录
function addHistory(point, callback) {
  // 使用东八区时间（UTC+8）
  // datetime("now", "+8 hours") 将当前UTC时间加8小时得到东八区时间
  db.run(
    "INSERT INTO dice_history (point, timestamp) VALUES (?, datetime('now', '+8 hours'))",
    [point],
    function (err) {
      callback(err, this.lastID);
    }
  );
}

// 获取历史记录
function getHistory(callback) {
  db.all(
    'SELECT point, timestamp FROM dice_history ORDER BY timestamp ASC',
    [],
    (err, rows) => {
      callback(err, rows);
    }
  );
}

// 添加路线图需求
function addRoadmapItem(title, description, status, priority, targetDate, sortOrder, callback) {
  // 使用东八区时间（UTC+8）
  const now = "datetime('now', '+8 hours')";
  db.run(
    `INSERT INTO roadmap (title, description, status, priority, target_date, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ${now}, ${now})`,
    [title, description || '', status || 'planned', priority || 'medium', targetDate || null, sortOrder || 0],
    function (err) {
      callback(err, this.lastID);
    }
  );
}

// 更新路线图需求
function updateRoadmapItem(id, title, description, status, priority, targetDate, sortOrder, callback) {
  db.run(
    "UPDATE roadmap SET title = ?, description = ?, status = ?, priority = ?, target_date = ?, sort_order = ?, updated_at = datetime('now', '+8 hours') WHERE id = ?",
    [title, description || '', status, priority, targetDate || null, sortOrder || 0, id],
    function (err) {
      callback(err, this.changes);
    }
  );
}

// 删除路线图需求
function deleteRoadmapItem(id, callback) {
  db.run(
    'DELETE FROM roadmap WHERE id = ?',
    [id],
    function (err) {
      callback(err, this.changes);
    }
  );
}

// 获取路线图需求列表
function getRoadmapItems(callback) {
  db.all(
    'SELECT id, title, description, status, priority, created_at, updated_at, target_date, sort_order FROM roadmap ORDER BY sort_order ASC, created_at DESC',
    [],
    (err, rows) => {
      callback(err, rows || []);
    }
  );
}

// 获取指定状态的路线图需求
function getRoadmapItemsByStatus(status, callback) {
  db.all(
    'SELECT id, title, description, status, priority, created_at, updated_at, target_date, sort_order FROM roadmap WHERE status = ? ORDER BY sort_order ASC, created_at DESC',
    [status],
    (err, rows) => {
      callback(err, rows || []);
    }
  );
}

module.exports = {
  initDB,
  getStats,
  incrementPoint,
  addHistory,
  getHistory,
  addRoadmapItem,
  updateRoadmapItem,
  deleteRoadmapItem,
  getRoadmapItems,
  getRoadmapItemsByStatus,
}; 