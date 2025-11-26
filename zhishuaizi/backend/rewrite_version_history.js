#!/usr/bin/env node

/**
 * 根据模板数据库重写版本历史数据
 * 使用方法: node rewrite_version_history.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'version_history.db');
const db = new sqlite3.Database(dbPath);

// 从模板数据库获取的版本历史数据（更简洁的描述）
const versionHistoryData = [
  {
    version: '1.8.1',
    changeType: 'patch',
    description: '首页轮播图功能优化 - 将功能模块从网格布局改为轮播图展示，始终在一行显示。优化轮播图高度和间距，调整卡片尺寸和样式，固定 slick-list 高度为 316px。优化轮播点指示器位置，减小与轮播图的间隙。',
    releaseDate: '2025-11-22'
  },
  {
    version: '1.8.0',
    changeType: 'minor',
    description: '新增产品路线图功能，支持看板式需求管理；创建 EllipsisTooltip 全局组件，支持文本溢出省略和 Tooltip 展示；优化日期选择器中文配置；优化表单弹框重置时机和头部设计；修复创建时间时区问题；所有时间字段显示完整日期时间格式。',
    releaseDate: '2025-11-22'
  },
  {
    version: '1.7.2',
    changeType: 'patch',
    description: '掷骰子页面重新设计和图标优化。',
    releaseDate: '2025-11-22'
  },
  {
    version: '1.7.1',
    changeType: 'patch',
    description: '导航和布局优化 - 创建统一的返回首页按钮组件，在所有页面添加返回首页入口。重新设计掷骰子页面头部布局，使用灵活的 Flexbox 布局解决按钮挤压标题的问题。添加完整的响应式设计，移动端优化按钮显示和间距。同步提交规范配置，移除 commit 消息长度限制，提升开发体验。',
    releaseDate: '2025-11-22'
  },
  {
    version: '1.7.0',
    changeType: 'minor',
    description: '版本历史管理和首页优化 - 新增版本历史页面，数据库管理的版本更新记录。风琴（Accordion）方式展示版本信息，支持单个/多个展开模式切换。支持分页浏览，可自定义每页显示数量。固定头部和底部，流畅滚动体验。全新现代化首页设计，渐变背景和浮动装饰。卡片式功能展示，主功能突出显示。全局移除按钮焦点边框，统一视觉体验。',
    releaseDate: '2025-11-22'
  },
  {
    version: '1.6.0',
    changeType: 'minor',
    description: 'Logo 和品牌设计升级 - 创建 DiceLogo 组件，采用 3D CSS 立体效果，实现紫蓝渐变配色，支持动画模式（首页自动旋转）和悬停光晕效果。统一所有页面标题为「一起掷骰子」，添加 SVG favicon，所有标题采用渐变文字效果。',
    releaseDate: '2025-11-22'
  },
  {
    version: '1.5.0',
    changeType: 'minor',
    description: '加权随机算法优化 - 实现基于累积分布函数（CDF）的加权随机算法，1、2、5、6 点概率降低至各 10%，3、4 点概率提升至各 30%。采用业界标准的算法实现，高效且准确。',
    releaseDate: '2025-11-22'
  },
  {
    version: '1.4.0',
    changeType: 'minor',
    description: '散点图统计功能 - 统计页面添加时间分布散点图，X轴显示时间（年月日时分秒），Y轴显示点数（1-6）。新增 dice_history 表存储每次掷骰子的记录，新增 /api/history 接口获取历史记录。统计页面改为左右布局，响应式设计。',
    releaseDate: '2025-11-22'
  },
  {
    version: '1.3.0',
    changeType: 'minor',
    description: 'UI/UX 大幅优化 - 按钮设计全面升级，主按钮采用紫蓝渐变背景，立体阴影效果，光泽扫过动画。次要按钮无边框透明设计，悬浮时渐变填充效果。修复标题与按钮的垂直居中对齐问题，表格样式美化。',
    releaseDate: '2025-11-22'
  },
  {
    version: '1.2.0',
    changeType: 'patch',
    description: '数据库优化 - 修复重复数据问题，清理数据库中的重复点数记录，添加唯一约束防止未来重复，合并历史统计数据。',
    releaseDate: '2025-11-22'
  },
  {
    version: '1.1.0',
    changeType: 'patch',
    description: '骰子显示修复 - 修复骰子 3D 显示与实际点数不匹配的问题，优化骰子旋转映射逻辑，确保视觉显示与数值完全一致。调整点数显示的延迟时间，确保骰子动画完全停止后再显示结果。',
    releaseDate: '2025-11-22'
  },
  {
    version: '1.0.0',
    changeType: 'major',
    description: '项目初始版本 - 核心功能实现：3D 骰子组件开发，掷骰子随机数生成，统计数据记录和显示。基础架构搭建：React + TypeScript 前端框架，Node.js + Express 后端服务，SQLite 数据库集成。页面设计：掷骰子主页面，统计数据页面，响应式布局设计。',
    releaseDate: '2025-11-22'
  }
];

console.log('开始重写版本历史数据...\n');

// 先清空现有数据
db.serialize(() => {
  db.run('DELETE FROM version_history', (err) => {
    if (err) {
      console.error('清空数据失败:', err);
      db.close();
      process.exit(1);
    }
    
    console.log('✓ 已清空现有数据\n');
    
    // 重置自增ID
    db.run('DELETE FROM sqlite_sequence WHERE name = "version_history"', (err) => {
      // 忽略错误，可能表不存在
    });
    
    // 插入新数据
    let inserted = 0;
    let errors = 0;
    
    // 按版本号从旧到新排序
    const sortedData = versionHistoryData.sort((a, b) => {
      const aParts = a.version.split('.').map(Number);
      const bParts = b.version.split('.').map(Number);
      for (let i = 0; i < 3; i++) {
        if (aParts[i] !== bParts[i]) {
          return aParts[i] - bParts[i];
        }
      }
      return 0;
    });
    
    sortedData.forEach((item, index) => {
      db.run(
        'INSERT INTO version_history (version, description, change_type, release_date) VALUES (?, ?, ?, ?)',
        [item.version, item.description, item.changeType, item.releaseDate],
        function (err) {
          if (err) {
            console.error(`✗ 插入版本 ${item.version} 失败:`, err);
            errors++;
          } else {
            console.log(`✓ 插入: v${item.version} (${item.changeType})`);
            inserted++;
          }
          
          // 所有记录处理完成
          if (inserted + errors === sortedData.length) {
            console.log(`\n重写完成！`);
            console.log(`成功插入: ${inserted} 条`);
            if (errors > 0) {
              console.log(`失败: ${errors} 条`);
            }
            
            // 验证数据
            db.all('SELECT version, change_type FROM version_history ORDER BY version DESC', [], (err, rows) => {
              if (err) {
                console.error('查询数据失败:', err);
              } else {
                console.log(`\n当前数据库中的版本历史 (共 ${rows.length} 条):`);
                rows.forEach((v) => {
                  console.log(`  - v${v.version} (${v.change_type})`);
                });
              }
              
              db.close();
              process.exit(0);
            });
          }
        }
      );
    });
  });
});

