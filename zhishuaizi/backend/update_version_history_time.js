#!/usr/bin/env node

/**
 * 从模板数据库同步版本历史时间数据
 * 使用方法: node update_version_history_time.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const currentDbPath = path.resolve(__dirname, 'version_history.db');
const templateDbPath = path.resolve('/Users/zxdgoing/AIProjects/TemplateByCursor/zhishuaizi/backend/dice_stats.db');

const currentDb = new sqlite3.Database(currentDbPath);
const templateDb = new sqlite3.Database(templateDbPath);

console.log('开始同步版本历史时间数据...\n');

// 从模板数据库读取时间数据
templateDb.all(
  'SELECT version, release_date, created_at FROM version_history',
  [],
  (err, templateRows) => {
    if (err) {
      console.error('读取模板数据库失败:', err);
      templateDb.close();
      currentDb.close();
      process.exit(1);
    }

    if (!templateRows || templateRows.length === 0) {
      console.log('模板数据库中没有版本历史数据');
      templateDb.close();
      currentDb.close();
      process.exit(0);
    }

    console.log(`从模板数据库读取到 ${templateRows.length} 条记录\n`);

    // 创建版本到时间数据的映射
    const timeMap = {};
    templateRows.forEach(row => {
      timeMap[row.version] = {
        release_date: row.release_date,
        created_at: row.created_at
      };
    });

    // 更新当前数据库
    let updated = 0;
    let notFound = 0;
    let errors = 0;

    const versions = Object.keys(timeMap);
    let index = 0;

    function updateNext() {
      if (index >= versions.length) {
        // 所有记录处理完成
        console.log(`\n同步完成！`);
        console.log(`成功更新: ${updated} 条`);
        if (notFound > 0) {
          console.log(`未找到: ${notFound} 条`);
        }
        if (errors > 0) {
          console.log(`错误: ${errors} 条`);
        }

        // 验证数据
        currentDb.all(
          'SELECT version, release_date, created_at FROM version_history ORDER BY version DESC',
          [],
          (err, rows) => {
            if (err) {
              console.error('查询数据失败:', err);
            } else {
              console.log(`\n当前数据库中的版本历史时间 (共 ${rows.length} 条):`);
              rows.forEach((v) => {
                console.log(`  - v${v.version}: release_date=${v.release_date}, created_at=${v.created_at}`);
              });
            }

            templateDb.close();
            currentDb.close();
            process.exit(0);
          }
        );
        return;
      }

      const version = versions[index];
      index++;
      const timeData = timeMap[version];

      // 更新当前数据库中的时间数据
      currentDb.run(
        'UPDATE version_history SET release_date = ?, created_at = ? WHERE version = ?',
        [timeData.release_date, timeData.created_at, version],
        function (updateErr) {
          if (updateErr) {
            console.error(`✗ 更新版本 ${version} 时间失败:`, updateErr);
            errors++;
          } else if (this.changes === 0) {
            console.log(`- 未找到版本: ${version}`);
            notFound++;
          } else {
            console.log(`✓ 更新: v${version} (release_date=${timeData.release_date}, created_at=${timeData.created_at})`);
            updated++;
          }

          updateNext();
        }
      );
    }

    // 开始更新
    updateNext();
  }
);

