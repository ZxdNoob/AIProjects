const { addVersionHistory, getVersionHistory } = require('./db');

// 初始化版本历史记录
// 根据 README.md 中的更新日志添加所有版本

const versionHistory = [
  {
    version: '1.7.0',
    description: '版本历史管理和首页优化 - 新增版本历史页面，数据库管理的版本更新记录。风琴（Accordion）方式展示版本信息，支持单个/多个展开模式切换。支持分页浏览，可自定义每页显示数量。固定头部和底部，流畅滚动体验。全新现代化首页设计，渐变背景和浮动装饰。卡片式功能展示，主功能突出显示。全局移除按钮焦点边框，统一视觉体验。',
    changeType: 'minor'
  },
  {
    version: '1.6.0',
    description: 'Logo 和品牌设计升级 - 创建 DiceLogo 组件，采用 3D CSS 立体效果，实现紫蓝渐变配色，支持动画模式（首页自动旋转）和悬停光晕效果。统一所有页面标题为「一起掷骰子」，添加 SVG favicon，所有标题采用渐变文字效果。',
    changeType: 'minor'
  },
  {
    version: '1.5.0',
    description: '加权随机算法优化 - 实现基于累积分布函数（CDF）的加权随机算法，1、2、5、6 点概率降低至各 10%，3、4 点概率提升至各 30%。采用业界标准的算法实现，高效且准确。',
    changeType: 'minor'
  },
  {
    version: '1.4.0',
    description: '散点图统计功能 - 统计页面添加时间分布散点图，X轴显示时间（年月日时分秒），Y轴显示点数（1-6）。新增 dice_history 表存储每次掷骰子的记录，新增 /api/history 接口获取历史记录。统计页面改为左右布局，响应式设计。',
    changeType: 'minor'
  },
  {
    version: '1.3.0',
    description: 'UI/UX 大幅优化 - 按钮设计全面升级，主按钮采用紫蓝渐变背景，立体阴影效果，光泽扫过动画。次要按钮无边框透明设计，悬浮时渐变填充效果。修复标题与按钮的垂直居中对齐问题，表格样式美化。',
    changeType: 'minor'
  },
  {
    version: '1.2.0',
    description: '数据库优化 - 修复重复数据问题，清理数据库中的重复点数记录，添加唯一约束防止未来重复，合并历史统计数据。',
    changeType: 'patch'
  },
  {
    version: '1.1.0',
    description: '骰子显示修复 - 修复骰子 3D 显示与实际点数不匹配的问题，优化骰子旋转映射逻辑，确保视觉显示与数值完全一致。调整点数显示的延迟时间，确保骰子动画完全停止后再显示结果。',
    changeType: 'patch'
  },
  {
    version: '1.0.0',
    description: '项目初始版本 - 核心功能实现：3D 骰子组件开发，掷骰子随机数生成，统计数据记录和显示。基础架构搭建：React + TypeScript 前端框架，Node.js + Express 后端服务，SQLite 数据库集成。页面设计：掷骰子主页面，统计数据页面，响应式布局设计。',
    changeType: 'major'
  }
];

// 添加版本历史记录
function initVersionHistory() {
  console.log('开始初始化版本历史记录...');
  
  let completed = 0;
  let errors = 0;
  
  versionHistory.forEach((item, index) => {
    addVersionHistory(item.version, item.description, item.changeType, (err, lastID) => {
      if (err) {
        console.error(`添加版本 ${item.version} 失败:`, err);
        errors++;
      } else {
        console.log(`✓ 版本 ${item.version} 添加成功 (ID: ${lastID})`);
        completed++;
      }
      
      // 所有记录处理完成后显示统计
      if (completed + errors === versionHistory.length) {
        console.log(`\n版本历史初始化完成！`);
        console.log(`成功: ${completed} 条`);
        console.log(`失败: ${errors} 条`);
        
        // 显示所有版本历史
        getVersionHistory((err, history) => {
          if (err) {
            console.error('获取版本历史失败:', err);
          } else {
            console.log(`\n当前数据库中的版本历史 (共 ${history.length} 条):`);
            history.forEach((v) => {
              console.log(`  - v${v.version} (${v.change_type}) - ${v.release_date}`);
            });
          }
          process.exit(0);
        });
      }
    });
  });
}

// 执行初始化
initVersionHistory();

