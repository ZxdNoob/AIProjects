#!/usr/bin/env node

/**
 * 添加单个版本历史记录的脚本
 * 使用方法: node add-version.js <version> <changeType> <description>
 * 
 * 示例:
 *   node add-version.js 1.8.0 minor "新功能描述"
 *   node add-version.js 1.7.1 patch "修复bug描述"
 *   node add-version.js 2.0.0 major "重大更新描述"
 */

const { addVersionHistory, getVersionHistory } = require('./version_history_db');

// 初始化版本历史数据库
const { initVersionHistoryDB } = require('./version_history_db');
initVersionHistoryDB();

const args = process.argv.slice(2);

if (args.length < 3) {
  console.error('错误: 参数不足');
  console.log('\n使用方法:');
  console.log('  node add-version.js <version> <changeType> <description>');
  console.log('\n参数说明:');
  console.log('  version      - 版本号，例如: 1.8.0');
  console.log('  changeType   - 变更类型: major | minor | patch');
  console.log('  description  - 更新说明（用引号包裹）');
  console.log('\n示例:');
  console.log('  node add-version.js 1.8.0 minor "新功能描述"');
  console.log('  node add-version.js 1.7.1 patch "修复bug描述"');
  console.log('  node add-version.js 2.0.0 major "重大更新描述"');
  process.exit(1);
}

const [version, changeType, ...descriptionParts] = args;
const description = descriptionParts.join(' ');

// 验证变更类型
if (!['major', 'minor', 'patch'].includes(changeType)) {
  console.error(`错误: 变更类型必须是 major、minor 或 patch，当前为: ${changeType}`);
  process.exit(1);
}

// 验证版本号格式（简单验证）
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`错误: 版本号格式不正确，应为 x.y.z 格式，当前为: ${version}`);
  process.exit(1);
}

console.log(`正在添加版本历史记录...`);
console.log(`版本号: ${version}`);
console.log(`变更类型: ${changeType}`);
console.log(`更新说明: ${description}`);
console.log('');

addVersionHistory(version, description, changeType, (err, lastID) => {
  if (err) {
    console.error('添加版本历史失败:', err);
    process.exit(1);
  }
  
  console.log(`✓ 版本 ${version} 添加成功 (ID: ${lastID})`);
  console.log('');
  
  // 显示所有版本历史
  getVersionHistory((err, history) => {
    if (err) {
      console.error('获取版本历史失败:', err);
      process.exit(1);
    }
    
    console.log(`当前数据库中的版本历史 (共 ${history.length} 条):`);
    history.slice(0, 5).forEach((v) => {
      console.log(`  - v${v.version} (${v.change_type}) - ${v.release_date}`);
    });
    if (history.length > 5) {
      console.log(`  ... 还有 ${history.length - 5} 条记录`);
    }
    
    process.exit(0);
  });
});

