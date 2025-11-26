const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'version_history.db');
const db = new sqlite3.Database(dbPath);

// 初始化版本历史表
function initVersionHistoryDB() {
  db.serialize(() => {
    // 创建版本历史表
    db.run(`CREATE TABLE IF NOT EXISTS version_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version TEXT NOT NULL UNIQUE,
      description TEXT,
      change_type TEXT NOT NULL,
      release_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
  });
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

module.exports = {
  initVersionHistoryDB,
  addVersionHistory,
  getVersionHistory,
};

