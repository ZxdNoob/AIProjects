const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const oldDbPath = path.resolve(__dirname, 'dice_stats.db');
const newDbPath = path.resolve(__dirname, 'version_history.db');

const oldDb = new sqlite3.Database(oldDbPath);
const newDb = new sqlite3.Database(newDbPath);

console.log('开始迁移版本历史数据...');

// 初始化新数据库
newDb.serialize(() => {
  newDb.run(`CREATE TABLE IF NOT EXISTS version_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version TEXT NOT NULL UNIQUE,
    description TEXT,
    change_type TEXT NOT NULL,
    release_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);

  // 从旧数据库读取版本历史数据
  oldDb.all('SELECT id, version, description, change_type, release_date, created_at FROM version_history', [], (err, rows) => {
    if (err) {
      console.error('读取旧数据库失败:', err);
      oldDb.close();
      newDb.close();
      return;
    }

    if (!rows || rows.length === 0) {
      console.log('没有需要迁移的版本历史数据');
      oldDb.close();
      newDb.close();
      return;
    }

    console.log(`找到 ${rows.length} 条版本历史记录，开始迁移...`);

    let migrated = 0;
    let skipped = 0;

    // 逐条迁移数据
    rows.forEach((row, index) => {
      newDb.run(
        'INSERT OR IGNORE INTO version_history (id, version, description, change_type, release_date, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [row.id, row.version, row.description, row.change_type, row.release_date, row.created_at],
        function (insertErr) {
          if (insertErr) {
            console.error(`迁移记录 ${row.version} 失败:`, insertErr);
            skipped++;
          } else if (this.changes > 0) {
            migrated++;
            console.log(`✓ 已迁移: ${row.version}`);
          } else {
            skipped++;
            console.log(`- 已跳过（已存在）: ${row.version}`);
          }

          // 所有记录处理完成后关闭数据库
          if (index === rows.length - 1) {
            console.log(`\n迁移完成！`);
            console.log(`成功迁移: ${migrated} 条`);
            console.log(`跳过: ${skipped} 条`);
            oldDb.close();
            newDb.close();
          }
        }
      );
    });
  });
});

