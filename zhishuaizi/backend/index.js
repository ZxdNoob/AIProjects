const express = require('express');
const cors = require('cors');
const { initDB, getStats, incrementPoint, addHistory, getHistory, addRoadmapItem, updateRoadmapItem, deleteRoadmapItem, getRoadmapItems } = require('./db');
const { initVersionHistoryDB, addVersionHistory, getVersionHistory } = require('./version_history_db');

const app = express();
const PORT = 3001;

// 允许所有来源跨域
app.use(cors());
app.use(express.json());

function sendOk(res, data, meta) {
  res.json({ data, meta: meta || { ts: new Date().toISOString() } });
}

function sendError(res, status, message, code, details) {
  res.status(status).json({
    error: {
      message,
      code: code || 'UNKNOWN',
      details: details || null,
    },
    meta: { ts: new Date().toISOString() },
  });
}

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
  sendOk(res, { status: 'ok', service: 'zhishuaizi-api' });
});

// 掷骰子接口
app.post('/api/roll', (req, res) => {
  const point = weightedRandomDice();
  if (incrementPoint && addHistory) {
    // 更新统计数据
    incrementPoint(point, (err) => {
      if (err) {
        console.error('更新统计数据失败:', err);
        return sendError(res, 500, '数据库更新失败', 'DB_UPDATE_FAILED');
      }
      // 保存历史记录
      addHistory(point, (err, lastID) => {
        if (err) {
          console.error('保存历史记录失败:', err);
          // 即使历史记录保存失败，也返回点数结果，但不应该静默失败
        } else {
          console.log(`历史记录保存成功: point=${point}, id=${lastID}`);
        }
        sendOk(res, { point }, { id: lastID ?? null });
      });
    });
  } else {
    console.warn('数据库函数未定义: incrementPoint=', !!incrementPoint, 'addHistory=', !!addHistory);
    sendOk(res, { point }, { degraded: true });
  }
});

// 获取统计接口
app.get('/api/stats', (req, res) => {
  if (getStats) {
    getStats((err, stats) => {
      if (err) {
        return sendError(res, 500, '数据库查询失败', 'DB_QUERY_FAILED');
      }
      sendOk(res, { stats });
    });
  } else {
    sendOk(res, { stats: [] }, { degraded: true });
  }
});

// 获取历史记录接口
app.get('/api/history', (req, res) => {
  if (getHistory) {
    getHistory((err, history) => {
      if (err) {
        console.error('获取历史记录失败:', err);
        return sendError(res, 500, '数据库查询失败', 'DB_QUERY_FAILED');
      }
      console.log(`获取历史记录: ${history ? history.length : 0} 条记录`);
      sendOk(res, { history: history || [] });
    });
  } else {
    console.warn('getHistory 函数未定义');
    sendOk(res, { history: [] }, { degraded: true });
  }
});

// 添加版本历史接口
app.post('/api/version-history', (req, res) => {
  const { version, description, changeType } = req.body;
  
  if (!version || !changeType) {
    return sendError(res, 400, '版本号和变更类型是必需的', 'BAD_REQUEST');
  }
  
  if (!['major', 'minor', 'patch'].includes(changeType)) {
    return sendError(res, 400, '变更类型必须是 major、minor 或 patch', 'BAD_REQUEST');
  }
  
  if (addVersionHistory) {
    addVersionHistory(version, description || '', changeType, (err, lastID) => {
      if (err) {
        console.error('添加版本历史失败:', err);
        return sendError(res, 500, '数据库操作失败', 'DB_WRITE_FAILED');
      }
      console.log(`版本历史添加成功: version=${version}, id=${lastID}`);
      sendOk(res, { success: true, id: lastID });
    });
  } else {
    sendError(res, 500, '数据库函数未定义', 'SERVER_MISCONFIG');
  }
});

// 获取版本历史接口
app.get('/api/version-history', (req, res) => {
  if (getVersionHistory) {
    getVersionHistory((err, history) => {
      if (err) {
        console.error('获取版本历史失败:', err);
        return sendError(res, 500, '数据库查询失败', 'DB_QUERY_FAILED');
      }
      console.log(`获取版本历史: ${history ? history.length : 0} 条记录`);
      sendOk(res, { history: history || [] });
    });
  } else {
    console.warn('getVersionHistory 函数未定义');
    sendOk(res, { history: [] }, { degraded: true });
  }
});

// 获取路线图需求列表接口
app.get('/api/roadmap', (req, res) => {
  if (getRoadmapItems) {
    getRoadmapItems((err, items) => {
      if (err) {
        console.error('获取路线图需求失败:', err);
        return sendError(res, 500, '数据库查询失败', 'DB_QUERY_FAILED');
      }
      console.log(`获取路线图需求: ${items ? items.length : 0} 条记录`);
      sendOk(res, { items: items || [] });
    });
  } else {
    console.warn('getRoadmapItems 函数未定义');
    sendOk(res, { items: [] }, { degraded: true });
  }
});

// 添加路线图需求接口
app.post('/api/roadmap', (req, res) => {
  const { title, description, status, priority, targetDate, sortOrder } = req.body;
  
  if (!title || !title.trim()) {
    return sendError(res, 400, '标题是必需的', 'BAD_REQUEST');
  }
  
  if (!['planned', 'in-progress', 'completed'].includes(status || 'planned')) {
    return sendError(res, 400, '状态必须是 planned、in-progress 或 completed', 'BAD_REQUEST');
  }
  
  if (!['high', 'medium', 'low'].includes(priority || 'medium')) {
    return sendError(res, 400, '优先级必须是 high、medium 或 low', 'BAD_REQUEST');
  }
  
  if (addRoadmapItem) {
    addRoadmapItem(title.trim(), description || '', status || 'planned', priority || 'medium', targetDate || null, sortOrder || 0, (err, lastID) => {
      if (err) {
        console.error('添加路线图需求失败:', err);
        return sendError(res, 500, '数据库操作失败', 'DB_WRITE_FAILED');
      }
      console.log(`路线图需求添加成功: title=${title}, id=${lastID}`);
      sendOk(res, { success: true, id: lastID });
    });
  } else {
    sendError(res, 500, '数据库函数未定义', 'SERVER_MISCONFIG');
  }
});

// 更新路线图需求接口
app.put('/api/roadmap/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, targetDate, sortOrder } = req.body;
  
  if (!title || !title.trim()) {
    return sendError(res, 400, '标题是必需的', 'BAD_REQUEST');
  }
  
  if (!['planned', 'in-progress', 'completed'].includes(status)) {
    return sendError(res, 400, '状态必须是 planned、in-progress 或 completed', 'BAD_REQUEST');
  }
  
  if (!['high', 'medium', 'low'].includes(priority)) {
    return sendError(res, 400, '优先级必须是 high、medium 或 low', 'BAD_REQUEST');
  }
  
  if (updateRoadmapItem) {
    updateRoadmapItem(parseInt(id, 10), title.trim(), description || '', status, priority, targetDate || null, sortOrder || 0, (err, changes) => {
      if (err) {
        console.error('更新路线图需求失败:', err);
        return sendError(res, 500, '数据库操作失败', 'DB_WRITE_FAILED');
      }
      if (changes === 0) {
        return sendError(res, 404, '需求不存在', 'NOT_FOUND');
      }
      console.log(`路线图需求更新成功: id=${id}`);
      sendOk(res, { success: true });
    });
  } else {
    sendError(res, 500, '数据库函数未定义', 'SERVER_MISCONFIG');
  }
});

// 删除路线图需求接口
app.delete('/api/roadmap/:id', (req, res) => {
  const { id } = req.params;
  
  if (deleteRoadmapItem) {
    deleteRoadmapItem(parseInt(id, 10), (err, changes) => {
      if (err) {
        console.error('删除路线图需求失败:', err);
        return sendError(res, 500, '数据库操作失败', 'DB_WRITE_FAILED');
      }
      if (changes === 0) {
        return sendError(res, 404, '需求不存在', 'NOT_FOUND');
      }
      console.log(`路线图需求删除成功: id=${id}`);
      sendOk(res, { success: true });
    });
  } else {
    sendError(res, 500, '数据库函数未定义', 'SERVER_MISCONFIG');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 