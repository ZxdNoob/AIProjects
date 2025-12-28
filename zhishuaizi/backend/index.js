const express = require('express');
const cors = require('cors');
const { initDB, getStats, incrementPoint, addHistory, getHistory, addRoadmapItem, updateRoadmapItem, deleteRoadmapItem, getRoadmapItems } = require('./db');
const { initVersionHistoryDB, addVersionHistory, getVersionHistory } = require('./version_history_db');

const app = express();
const PORT = 3001;

// 允许所有来源跨域
app.use(cors());
app.use(express.json());

// 初始化数据库
if (initDB) {
  initDB();
  console.log('数据库初始化完成');
} else {
  console.error('initDB 函数未定义');
}

// 初始化版本历史数据库
if (initVersionHistoryDB) {
  initVersionHistoryDB();
  console.log('版本历史数据库初始化完成');
} else {
  console.error('initVersionHistoryDB 函数未定义');
}

/**
 * 加权随机算法 - 使用累积分布函数（CDF）方法
 * 业界标准的高效加权随机实现
 * 
 * 概率分布：
 * - 1、2、5、6 点：各 10% (低概率)
 * - 3、4 点：各 30% (高概率)
 */
function weightedRandomDice() {
  // 定义每个点数的权重（权重越大，概率越高）
  const weights = {
    1: 1,  // 10% 概率
    2: 1,  // 10% 概率
    3: 3,  // 30% 概率
    4: 3,  // 30% 概率
    5: 1,  // 10% 概率
    6: 1,  // 10% 概率
  };
  
  // 计算总权重
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  
  // 生成 0 到 totalWeight 之间的随机数
  const random = Math.random() * totalWeight;
  
  // 使用累积分布函数（CDF）选择点数
  let cumulative = 0;
  for (let point = 1; point <= 6; point++) {
    cumulative += weights[point];
    if (random < cumulative) {
      return point;
    }
  }
  
  // 理论上不会到达这里，但为了安全返回 3（最高概率的点数）
  return 3;
}

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 掷骰子接口
app.post('/api/roll', (req, res) => {
  const point = weightedRandomDice();
  if (incrementPoint && addHistory) {
    // 更新统计数据
    incrementPoint(point, (err) => {
      if (err) {
        console.error('更新统计数据失败:', err);
        return res.status(500).json({ error: '数据库更新失败' });
      }
      // 保存历史记录
      addHistory(point, (err, lastID) => {
        if (err) {
          console.error('保存历史记录失败:', err);
          // 即使历史记录保存失败，也返回点数结果，但不应该静默失败
        } else {
          console.log(`历史记录保存成功: point=${point}, id=${lastID}`);
        }
        res.json({ point });
      });
    });
  } else {
    console.warn('数据库函数未定义: incrementPoint=', !!incrementPoint, 'addHistory=', !!addHistory);
    res.json({ point });
  }
});

// 获取统计接口
app.get('/api/stats', (req, res) => {
  if (getStats) {
    getStats((err, stats) => {
      if (err) {
        return res.status(500).json({ error: '数据库查询失败' });
      }
      res.json({ stats });
    });
  } else {
    res.json({ stats: [] });
  }
});

// 获取历史记录接口
app.get('/api/history', (req, res) => {
  if (getHistory) {
    getHistory((err, history) => {
      if (err) {
        console.error('获取历史记录失败:', err);
        return res.status(500).json({ error: '数据库查询失败' });
      }
      console.log(`获取历史记录: ${history ? history.length : 0} 条记录`);
      res.json({ history: history || [] });
    });
  } else {
    console.warn('getHistory 函数未定义');
    res.json({ history: [] });
  }
});

// 添加版本历史接口
app.post('/api/version-history', (req, res) => {
  const { version, description, changeType } = req.body;
  
  if (!version || !changeType) {
    return res.status(400).json({ error: '版本号和变更类型是必需的' });
  }
  
  if (!['major', 'minor', 'patch'].includes(changeType)) {
    return res.status(400).json({ error: '变更类型必须是 major、minor 或 patch' });
  }
  
  if (addVersionHistory) {
    addVersionHistory(version, description || '', changeType, (err, lastID) => {
      if (err) {
        console.error('添加版本历史失败:', err);
        return res.status(500).json({ error: '数据库操作失败' });
      }
      console.log(`版本历史添加成功: version=${version}, id=${lastID}`);
      res.json({ success: true, id: lastID });
    });
  } else {
    res.status(500).json({ error: '数据库函数未定义' });
  }
});

// 获取版本历史接口
app.get('/api/version-history', (req, res) => {
  if (getVersionHistory) {
    getVersionHistory((err, history) => {
      if (err) {
        console.error('获取版本历史失败:', err);
        return res.status(500).json({ error: '数据库查询失败' });
      }
      console.log(`获取版本历史: ${history ? history.length : 0} 条记录`);
      res.json({ history: history || [] });
    });
  } else {
    console.warn('getVersionHistory 函数未定义');
    res.json({ history: [] });
  }
});

// 获取路线图需求列表接口
app.get('/api/roadmap', (req, res) => {
  if (getRoadmapItems) {
    getRoadmapItems((err, items) => {
      if (err) {
        console.error('获取路线图需求失败:', err);
        return res.status(500).json({ error: '数据库查询失败' });
      }
      console.log(`获取路线图需求: ${items ? items.length : 0} 条记录`);
      res.json({ items: items || [] });
    });
  } else {
    console.warn('getRoadmapItems 函数未定义');
    res.json({ items: [] });
  }
});

// 添加路线图需求接口
app.post('/api/roadmap', (req, res) => {
  const { title, description, status, priority, targetDate, sortOrder } = req.body;
  
  if (!title || !title.trim()) {
    return res.status(400).json({ error: '标题是必需的' });
  }
  
  if (!['planned', 'in-progress', 'completed'].includes(status || 'planned')) {
    return res.status(400).json({ error: '状态必须是 planned、in-progress 或 completed' });
  }
  
  if (!['high', 'medium', 'low'].includes(priority || 'medium')) {
    return res.status(400).json({ error: '优先级必须是 high、medium 或 low' });
  }
  
  if (addRoadmapItem) {
    addRoadmapItem(title.trim(), description || '', status || 'planned', priority || 'medium', targetDate || null, sortOrder || 0, (err, lastID) => {
      if (err) {
        console.error('添加路线图需求失败:', err);
        return res.status(500).json({ error: '数据库操作失败' });
      }
      console.log(`路线图需求添加成功: title=${title}, id=${lastID}`);
      res.json({ success: true, id: lastID });
    });
  } else {
    res.status(500).json({ error: '数据库函数未定义' });
  }
});

// 更新路线图需求接口
app.put('/api/roadmap/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, targetDate, sortOrder } = req.body;
  
  if (!title || !title.trim()) {
    return res.status(400).json({ error: '标题是必需的' });
  }
  
  if (!['planned', 'in-progress', 'completed'].includes(status)) {
    return res.status(400).json({ error: '状态必须是 planned、in-progress 或 completed' });
  }
  
  if (!['high', 'medium', 'low'].includes(priority)) {
    return res.status(400).json({ error: '优先级必须是 high、medium 或 low' });
  }
  
  if (updateRoadmapItem) {
    updateRoadmapItem(parseInt(id, 10), title.trim(), description || '', status, priority, targetDate || null, sortOrder || 0, (err, changes) => {
      if (err) {
        console.error('更新路线图需求失败:', err);
        return res.status(500).json({ error: '数据库操作失败' });
      }
      if (changes === 0) {
        return res.status(404).json({ error: '需求不存在' });
      }
      console.log(`路线图需求更新成功: id=${id}`);
      res.json({ success: true });
    });
  } else {
    res.status(500).json({ error: '数据库函数未定义' });
  }
});

// 删除路线图需求接口
app.delete('/api/roadmap/:id', (req, res) => {
  const { id } = req.params;
  
  if (deleteRoadmapItem) {
    deleteRoadmapItem(parseInt(id, 10), (err, changes) => {
      if (err) {
        console.error('删除路线图需求失败:', err);
        return res.status(500).json({ error: '数据库操作失败' });
      }
      if (changes === 0) {
        return res.status(404).json({ error: '需求不存在' });
      }
      console.log(`路线图需求删除成功: id=${id}`);
      res.json({ success: true });
    });
  } else {
    res.status(500).json({ error: '数据库函数未定义' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 