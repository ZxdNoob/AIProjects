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
    // 创建版本历史表
    db.run(`CREATE TABLE IF NOT EXISTS version_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version TEXT NOT NULL UNIQUE,
      description TEXT,
      change_type TEXT NOT NULL,
      release_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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

// 添加版本历史记录
function addVersionHistory(version, description, changeType, callback) {
  // changeType: 'major', 'minor', 'patch'
  // 先检查版本是否已存在
  db.get('SELECT id FROM version_history WHERE version = ?', [version], (err, row) => {
    if (err) {
      callback(err);
      return;
    }
    
    if (row) {
      // 版本已存在，只更新描述和变更类型，不更新发布日期
      db.run(
        'UPDATE version_history SET description = ?, change_type = ? WHERE version = ?',
        [description, changeType, version],
        function (updateErr) {
          callback(updateErr, row.id);
        }
      );
    } else {
      // 版本不存在，插入新记录
      db.run(
        "INSERT INTO version_history (version, description, change_type, release_date) VALUES (?, ?, ?, datetime('now', '+8 hours'))",
        [version, description, changeType],
        function (insertErr) {
          callback(insertErr, this.lastID);
        }
      );
    }
  });
}

// 解析版本号字符串为数字数组 [major, minor, patch]
// 例如: "1.7.0" -> [1, 7, 0]
function parseVersion(version) {
  if (!version || typeof version !== 'string') {
    return [0, 0, 0];
  }
  const parts = version.split('.').map(part => {
    const num = parseInt(part, 10);
    return isNaN(num) ? 0 : num;
  });
  // 确保至少有 3 个部分（major, minor, patch）
  while (parts.length < 3) {
    parts.push(0);
  }
  return parts.slice(0, 3);
}

// 比较两个版本号
// 返回值: 负数表示 v1 < v2, 0 表示相等, 正数表示 v1 > v2
function compareVersions(v1, v2) {
  const parts1 = parseVersion(v1);
  const parts2 = parseVersion(v2);
  
  for (let i = 0; i < 3; i++) {
    if (parts1[i] !== parts2[i]) {
      return parts1[i] - parts2[i];
    }
  }
  return 0;
}

// 获取版本历史记录
function getVersionHistory(callback) {
  db.all(
    'SELECT id, version, description, change_type, release_date, created_at FROM version_history',
    [],
    (err, rows) => {
      if (err) {
        callback(err);
        return;
      }
      
      // 按版本号降序排序（最新版本在前）
      const sortedRows = (rows || []).sort((a, b) => {
        const comparison = compareVersions(b.version, a.version);
        // 如果版本号相同，按发布日期降序排序
        if (comparison === 0) {
          return new Date(b.release_date) - new Date(a.release_date);
        }
        return comparison;
      });
      
      callback(null, sortedRows);
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
  addVersionHistory,
  getVersionHistory,
  addRoadmapItem,
  updateRoadmapItem,
  deleteRoadmapItem,
  getRoadmapItems,
  getRoadmapItemsByStatus,
}; 