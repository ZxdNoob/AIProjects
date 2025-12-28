/**
 * API 服务模块
 * 统一管理所有 API 请求，支持后端不可用时自动 fallback 到 Mock 模式
 */

// ============================================================
// 配置
// ============================================================

// 后端服务地址
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Mock 模式状态
let isMockMode: boolean | null = null;

// ============================================================
// Mock 数据
// ============================================================

// Mock 统计数据
const mockStats = [
  { point: 1, count: 12, percentage: '10.0%' },
  { point: 2, count: 15, percentage: '12.5%' },
  { point: 3, count: 35, percentage: '29.2%' },
  { point: 4, count: 38, percentage: '31.7%' },
  { point: 5, count: 10, percentage: '8.3%' },
  { point: 6, count: 10, percentage: '8.3%' },
];

// Mock 历史记录
const mockHistory: { id: number; point: number; created_at: string }[] = [];

// Mock 版本历史
const mockVersionHistory = [
  {
    id: 1,
    version: '1.8.2',
    description: '支持 GitHub Pages Mock 模式',
    change_type: 'minor',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    version: '1.8.0',
    description: '添加产品路线图功能',
    change_type: 'minor',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    version: '1.5.0',
    description: '3D 骰子动画效果',
    change_type: 'major',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock 路线图
const mockRoadmap = [
  {
    id: 1,
    title: '多人联机掷骰子',
    description: '支持多人同时在线掷骰子，实时同步结果',
    status: 'planned',
    priority: 'high',
    target_date: '2024-06-01',
    sort_order: 1,
  },
  {
    id: 2,
    title: '自定义骰子皮肤',
    description: '支持选择不同的骰子外观主题',
    status: 'in-progress',
    priority: 'medium',
    target_date: '2024-04-01',
    sort_order: 2,
  },
  {
    id: 3,
    title: '移动端 App',
    description: '开发 iOS/Android 原生应用',
    status: 'planned',
    priority: 'low',
    target_date: null,
    sort_order: 3,
  },
];

// ============================================================
// 后端可用性检测
// ============================================================

async function checkBackendAvailability(): Promise<boolean> {
  // GitHub Pages 环境直接使用 Mock 模式
  if (window.location.hostname.includes('github.io')) {
    console.log('📍 GitHub Pages 环境，使用 Mock 模式');
    return false;
  }
  
  // 手动启用 Mock 模式
  if (localStorage.getItem('MOCK_MODE') === 'true') {
    console.log('🔧 手动启用 Mock 模式');
    return false;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(`${API_BASE_URL}/api/stats`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

// 初始化时检测后端可用性
async function initApiMode() {
  if (isMockMode === null) {
    const isAvailable = await checkBackendAvailability();
    isMockMode = !isAvailable;
    
    if (isMockMode) {
      console.log('⚠️ 后端服务不可用，使用 Mock 模式');
    } else {
      console.log('✅ 后端服务已连接');
    }
  }
  return isMockMode;
}

// ============================================================
// 加权随机算法（与后端一致）
// ============================================================

function weightedRandomDice(): number {
  const weights = { 1: 1, 2: 1, 3: 3, 4: 3, 5: 1, 6: 1 };
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const random = Math.random() * totalWeight;
  
  let cumulative = 0;
  for (let point = 1; point <= 6; point++) {
    cumulative += weights[point as keyof typeof weights];
    if (random < cumulative) {
      return point;
    }
  }
  return 3;
}

// ============================================================
// API 方法
// ============================================================

/**
 * 掷骰子
 */
export async function rollDice(): Promise<{ point: number }> {
  const useMock = await initApiMode();
  
  if (useMock) {
    await delay(300);
    const point = weightedRandomDice();
    
    // 更新 Mock 统计
    const stat = mockStats.find(s => s.point === point);
    if (stat) stat.count++;
    
    // 添加历史记录
    mockHistory.unshift({
      id: Date.now(),
      point,
      created_at: new Date().toISOString(),
    });
    if (mockHistory.length > 100) mockHistory.pop();
    
    return { point };
  }
  
  const response = await fetch(`${API_BASE_URL}/api/roll`, { method: 'POST' });
  return response.json();
}

/**
 * 获取统计数据
 */
export async function getStats(): Promise<{ stats: typeof mockStats }> {
  const useMock = await initApiMode();
  
  if (useMock) {
    await delay(200);
    // 重新计算百分比
    const total = mockStats.reduce((sum, s) => sum + s.count, 0);
    const stats = mockStats.map(s => ({
      ...s,
      percentage: total > 0 ? ((s.count / total) * 100).toFixed(1) + '%' : '0%',
    }));
    return { stats };
  }
  
  const response = await fetch(`${API_BASE_URL}/api/stats`);
  return response.json();
}

/**
 * 获取历史记录
 */
export async function getHistory(): Promise<{ history: typeof mockHistory }> {
  const useMock = await initApiMode();
  
  if (useMock) {
    await delay(200);
    return { history: mockHistory };
  }
  
  const response = await fetch(`${API_BASE_URL}/api/history`);
  return response.json();
}

/**
 * 获取版本历史
 */
export async function getVersionHistory(): Promise<{ history: typeof mockVersionHistory }> {
  const useMock = await initApiMode();
  
  if (useMock) {
    await delay(200);
    return { history: mockVersionHistory };
  }
  
  const response = await fetch(`${API_BASE_URL}/api/version-history`);
  return response.json();
}

/**
 * 添加版本历史
 */
export async function addVersionHistory(data: {
  version: string;
  description: string;
  changeType: string;
}): Promise<{ success: boolean; id?: number }> {
  const useMock = await initApiMode();
  
  if (useMock) {
    await delay(300);
    const newItem = {
      id: Date.now(),
      version: data.version,
      description: data.description,
      change_type: data.changeType,
      created_at: new Date().toISOString(),
    };
    mockVersionHistory.unshift(newItem);
    return { success: true, id: newItem.id };
  }
  
  const response = await fetch(`${API_BASE_URL}/api/version-history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * 获取路线图
 */
export async function getRoadmap(): Promise<{ items: typeof mockRoadmap }> {
  const useMock = await initApiMode();
  
  if (useMock) {
    await delay(200);
    return { items: mockRoadmap };
  }
  
  const response = await fetch(`${API_BASE_URL}/api/roadmap`);
  return response.json();
}

/**
 * 添加路线图项目
 */
export async function addRoadmapItem(data: {
  title: string;
  description?: string;
  status: string;
  priority: string;
  targetDate?: string;
  sortOrder?: number;
}): Promise<{ success: boolean; id?: number }> {
  const useMock = await initApiMode();
  
  if (useMock) {
    await delay(300);
    const newItem = {
      id: Date.now(),
      title: data.title,
      description: data.description || '',
      status: data.status,
      priority: data.priority,
      target_date: data.targetDate || null,
      sort_order: data.sortOrder || mockRoadmap.length + 1,
    };
    mockRoadmap.push(newItem);
    return { success: true, id: newItem.id };
  }
  
  const response = await fetch(`${API_BASE_URL}/api/roadmap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * 更新路线图项目
 */
export async function updateRoadmapItem(
  id: number,
  data: {
    title: string;
    description?: string;
    status: string;
    priority: string;
    targetDate?: string;
    sortOrder?: number;
  }
): Promise<{ success: boolean }> {
  const useMock = await initApiMode();
  
  if (useMock) {
    await delay(300);
    const index = mockRoadmap.findIndex(item => item.id === id);
    if (index !== -1) {
      mockRoadmap[index] = {
        ...mockRoadmap[index],
        title: data.title,
        description: data.description || '',
        status: data.status,
        priority: data.priority,
        target_date: data.targetDate || null,
        sort_order: data.sortOrder || mockRoadmap[index].sort_order,
      };
    }
    return { success: true };
  }
  
  const response = await fetch(`${API_BASE_URL}/api/roadmap/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * 删除路线图项目
 */
export async function deleteRoadmapItem(id: number): Promise<{ success: boolean }> {
  const useMock = await initApiMode();
  
  if (useMock) {
    await delay(300);
    const index = mockRoadmap.findIndex(item => item.id === id);
    if (index !== -1) {
      mockRoadmap.splice(index, 1);
    }
    return { success: true };
  }
  
  const response = await fetch(`${API_BASE_URL}/api/roadmap/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}

// ============================================================
// 工具函数
// ============================================================

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 获取当前模式
 */
export function getApiMode(): 'real' | 'mock' | 'unknown' {
  if (isMockMode === null) return 'unknown';
  return isMockMode ? 'mock' : 'real';
}

/**
 * 手动设置 Mock 模式
 */
export function setMockMode(enabled: boolean): void {
  if (enabled) {
    localStorage.setItem('MOCK_MODE', 'true');
  } else {
    localStorage.removeItem('MOCK_MODE');
  }
  isMockMode = enabled;
}

