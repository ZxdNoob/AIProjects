/**
 * Mock API 服务
 * 当后端不可用时，提供模拟 API 响应
 */

import {
  mockUsers,
  mockKnowledge,
  mockProblems,
  mockAlgorithms,
  mockLearningProgress,
  createMockResponse,
  createPaginatedResponse,
} from './mockData';
import { User, UserRole } from '@/types';

// Mock 用户会话存储
let mockCurrentUser: User | null = null;
let mockToken: string | null = null;

// ============================================================
// Mock 认证 API
// ============================================================

export const mockAuthApi = {
  register: async (data: { email: string; password: string; nickname: string }) => {
    await delay(500);
    const newUser: User = {
      _id: `mock-${Date.now()}`,
      email: data.email,
      nickname: data.nickname,
      role: UserRole.USER,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockCurrentUser = newUser;
    mockToken = `mock-token-${Date.now()}`;
    return createMockResponse({ user: newUser, token: mockToken });
  },

  login: async (email: string, password: string) => {
    await delay(500);
    // Demo 账号
    if (email === 'demo@example.com' && password === 'demo123') {
      mockCurrentUser = mockUsers[0];
      mockToken = `mock-token-${Date.now()}`;
      return createMockResponse({ user: mockCurrentUser, token: mockToken });
    }
    if (email === 'admin@example.com' && password === 'admin123') {
      mockCurrentUser = mockUsers[1];
      mockToken = `mock-token-${Date.now()}`;
      return createMockResponse({ user: mockCurrentUser, token: mockToken });
    }
    // 任意账号都可以登录（演示模式）
    mockCurrentUser = {
      ...mockUsers[0],
      _id: `mock-${Date.now()}`,
      email,
      nickname: email.split('@')[0],
    };
    mockToken = `mock-token-${Date.now()}`;
    return createMockResponse({ user: mockCurrentUser, token: mockToken });
  },

  getMe: async () => {
    await delay(200);
    if (!mockCurrentUser) {
      mockCurrentUser = mockUsers[0];
    }
    return createMockResponse({ user: mockCurrentUser });
  },

  updateProfile: async (data: { nickname?: string; avatar?: string }) => {
    await delay(300);
    if (mockCurrentUser) {
      mockCurrentUser = { ...mockCurrentUser, ...data };
    }
    return createMockResponse({ user: mockCurrentUser });
  },

  changePassword: async () => {
    await delay(300);
    mockToken = `mock-token-${Date.now()}`;
    return createMockResponse({ token: mockToken });
  },

  upgradeMember: async () => {
    await delay(300);
    if (mockCurrentUser) {
      mockCurrentUser = { ...mockCurrentUser, role: UserRole.MEMBER };
    }
    return createMockResponse({
      role: UserRole.MEMBER,
      memberExpireAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    });
  },

  updateStudyPlan: async (data: any) => {
    await delay(300);
    return createMockResponse({ studyPlan: data });
  },
};

// ============================================================
// Mock 知识点 API
// ============================================================

export const mockKnowledgeApi = {
  getList: async (params?: { page?: number; limit?: number; category?: string; search?: string }) => {
    await delay(300);
    let filtered = [...mockKnowledge];
    if (params?.category) {
      filtered = filtered.filter(k => k.category === params.category);
    }
    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(k => 
        k.title.toLowerCase().includes(search) ||
        k.tags.some(t => t.toLowerCase().includes(search))
      );
    }
    return createPaginatedResponse(filtered, params?.page, params?.limit);
  },

  getDetail: async (id: string) => {
    await delay(200);
    const knowledge = mockKnowledge.find(k => k._id === id);
    if (!knowledge) {
      return createMockResponse(mockKnowledge[0]);
    }
    return createMockResponse(knowledge);
  },

  getCategories: async () => {
    await delay(200);
    const categories = mockKnowledge.reduce((acc, k) => {
      const existing = acc.find(c => c.name === k.category);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ name: k.category, count: 1 });
      }
      return acc;
    }, [] as { name: string; count: number }[]);
    return createMockResponse(categories);
  },

  getFavorites: async () => {
    await delay(200);
    return createMockResponse(mockKnowledge.slice(0, 2));
  },

  getWeakPoints: async () => {
    await delay(200);
    return createMockResponse(mockKnowledge.slice(1, 3));
  },

  favorite: async () => {
    await delay(200);
    return createMockResponse({ favorited: true });
  },

  markWeakPoint: async () => {
    await delay(200);
    return createMockResponse({ marked: true });
  },

  complete: async () => {
    await delay(200);
    return createMockResponse({ completed: true });
  },
};

// ============================================================
// Mock 编程题 API
// ============================================================

export const mockProblemApi = {
  getList: async (params?: { page?: number; limit?: number; difficulty?: string; search?: string }) => {
    await delay(300);
    let filtered = [...mockProblems];
    if (params?.difficulty) {
      filtered = filtered.filter(p => p.difficulty === params.difficulty);
    }
    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(search) ||
        p.tags.some(t => t.toLowerCase().includes(search))
      );
    }
    return createPaginatedResponse(filtered, params?.page, params?.limit);
  },

  getDetail: async (id: string) => {
    await delay(200);
    const problem = mockProblems.find(p => p._id === id);
    if (!problem) {
      return createMockResponse(mockProblems[0]);
    }
    return createMockResponse(problem);
  },

  submit: async () => {
    await delay(1000);
    return createMockResponse({
      status: 'accepted',
      passedCount: 3,
      totalCount: 3,
      testResults: [
        { passed: true, input: 'test1', expected: 'pass', actual: 'pass' },
        { passed: true, input: 'test2', expected: 'pass', actual: 'pass' },
        { passed: true, input: 'test3', expected: 'pass', actual: 'pass' },
      ],
    });
  },

  getSubmissions: async () => {
    await delay(200);
    return createPaginatedResponse([
      { _id: 's1', status: 'accepted', createdAt: new Date().toISOString() },
    ]);
  },

  favorite: async () => {
    await delay(200);
    return createMockResponse({ favorited: true });
  },
};

// ============================================================
// Mock 算法题 API
// ============================================================

export const mockAlgorithmApi = {
  getList: async (params?: { page?: number; limit?: number; category?: string; search?: string }) => {
    await delay(300);
    let filtered = [...mockAlgorithms];
    if (params?.category) {
      filtered = filtered.filter(a => a.category === params.category);
    }
    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(search) ||
        a.tags.some(t => t.toLowerCase().includes(search))
      );
    }
    return createPaginatedResponse(filtered, params?.page, params?.limit);
  },

  getDetail: async (id: string) => {
    await delay(200);
    const algorithm = mockAlgorithms.find(a => a._id === id);
    if (!algorithm) {
      return createMockResponse(mockAlgorithms[0]);
    }
    return createMockResponse(algorithm);
  },

  getAnimation: async (id: string) => {
    await delay(300);
    const algorithm = mockAlgorithms.find(a => a._id === id) || mockAlgorithms[0];
    return createMockResponse({
      type: algorithm.animationType,
      defaultData: algorithm.defaultInput,
      steps: [
        { step: 1, description: '初始状态', data: [5, 3, 8, 4, 2] },
        { step: 2, description: '比较 5 和 3，交换', data: [3, 5, 8, 4, 2] },
        { step: 3, description: '比较 8 和 4，交换', data: [3, 5, 4, 8, 2] },
        { step: 4, description: '继续排序...', data: [2, 3, 4, 5, 8] },
      ],
      solution: algorithm.solution,
    });
  },

  submit: async () => {
    await delay(1000);
    return createMockResponse({
      status: 'accepted',
      passedCount: 5,
      totalCount: 5,
      testResults: [],
    });
  },

  favorite: async () => {
    await delay(200);
    return createMockResponse({ favorited: true });
  },
};

// ============================================================
// Mock 用户代码 API
// ============================================================

export const mockUserCodeApi = {
  getList: async () => {
    await delay(200);
    return createPaginatedResponse([
      {
        _id: 'uc1',
        projectName: '我的第一个项目',
        description: '练习 React Hooks',
        files: [{ filename: 'index.js', content: 'console.log("Hello")', language: 'javascript' }],
        createdAt: new Date().toISOString(),
      },
    ]);
  },

  getDetail: async () => {
    await delay(200);
    return createMockResponse({
      _id: 'uc1',
      projectName: '我的第一个项目',
      description: '练习 React Hooks',
      files: [{ filename: 'index.js', content: 'console.log("Hello")', language: 'javascript' }],
    });
  },

  save: async (data: any) => {
    await delay(300);
    return createMockResponse({ ...data, _id: `uc-${Date.now()}` });
  },

  update: async (_id: string, data: any) => {
    await delay(300);
    return createMockResponse({ _id, ...data });
  },

  delete: async () => {
    await delay(200);
    return createMockResponse(null);
  },

  run: async (code: string) => {
    await delay(500);
    try {
      // 简单的代码执行模拟
      return createMockResponse({
        output: `[Mock 模式] 代码长度: ${code.length} 字符\n执行成功！`,
        executionTime: Math.random() * 100,
        memoryUsage: Math.random() * 1024 * 1024,
      });
    } catch (error) {
      return createMockResponse({
        output: '',
        executionTime: 0,
        memoryUsage: 0,
        error: '执行失败',
      });
    }
  },
};

// ============================================================
// Mock 学习管理 API
// ============================================================

export const mockLearningApi = {
  getProgress: async () => {
    await delay(300);
    return createMockResponse(mockLearningProgress);
  },

  getWrongRecords: async () => {
    await delay(200);
    return createPaginatedResponse([
      {
        _id: 'wr1',
        type: 'problem',
        problemId: 'p1',
        title: '实现 debounce',
        wrongCount: 2,
        isResolved: false,
        createdAt: new Date().toISOString(),
      },
    ]);
  },

  getWrongRecordDetail: async () => {
    await delay(200);
    return createMockResponse({
      _id: 'wr1',
      type: 'problem',
      problemId: 'p1',
      title: '实现 debounce',
      wrongCount: 2,
      isResolved: false,
    });
  },

  resolveWrongRecord: async () => {
    await delay(200);
    return createMockResponse({ isResolved: true });
  },

  reviewWrongRecord: async () => {
    await delay(200);
    return createMockResponse({ reviewed: true });
  },

  getStats: async () => {
    await delay(300);
    return createMockResponse({
      submissions: { total: 25, accepted: 18, wrong: 7 },
      wrongRecords: { total: 7, resolved: 3, unresolved: 4 },
      submissionTrend: [
        { date: '2024-01-01', count: 3 },
        { date: '2024-01-02', count: 5 },
        { date: '2024-01-03', count: 2 },
      ],
      problemsByDifficulty: [
        { difficulty: 'easy', count: 10 },
        { difficulty: 'medium', count: 12 },
        { difficulty: 'hard', count: 3 },
      ],
    });
  },

  generatePlan: async (data: any) => {
    await delay(500);
    return createMockResponse({
      studyPlan: data,
      currentStatus: mockLearningProgress.overview,
      daysRemaining: 30,
    });
  },

  getDailyTasks: async () => {
    await delay(200);
    return createMockResponse({
      tasks: ['完成 2 个知识点', '做 1 道编程题', '复习错题'],
      todayProgress: { completed: 1, total: 3 },
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      targetLevel: 'intermediate',
    });
  },
};

// ============================================================
// Mock 管理员 API
// ============================================================

export const mockAdminApi = {
  getUsers: async () => {
    await delay(300);
    return createPaginatedResponse(mockUsers);
  },

  getUserDetail: async (id: string) => {
    await delay(200);
    const user = mockUsers.find(u => u._id === id) || mockUsers[0];
    return createMockResponse({ user, stats: { submissions: 10, favorites: 5 } });
  },

  updateUserRole: async () => {
    await delay(300);
    return createMockResponse({ success: true });
  },

  resetUserPassword: async () => {
    await delay(300);
    return createMockResponse({ success: true });
  },

  updateUserStatus: async () => {
    await delay(300);
    return createMockResponse({ success: true });
  },

  deleteUser: async () => {
    await delay(300);
    return createMockResponse({ success: true });
  },

  getStats: async () => {
    await delay(300);
    return createMockResponse({
      overview: {
        totalUsers: 156,
        totalKnowledge: 80,
        totalProblems: 50,
        totalAlgorithms: 30,
      },
      registrationTrend: [],
      hotKnowledge: mockKnowledge.slice(0, 3),
      hotProblems: mockProblems.slice(0, 3),
    });
  },

  // 内容管理方法...
  createKnowledge: async (data: any) => createMockResponse({ ...data, _id: `k-${Date.now()}` }),
  updateKnowledge: async (_id: string, data: any) => createMockResponse({ _id, ...data }),
  deleteKnowledge: async () => createMockResponse({ success: true }),
  createProblem: async (data: any) => createMockResponse({ ...data, _id: `p-${Date.now()}` }),
  updateProblem: async (_id: string, data: any) => createMockResponse({ _id, ...data }),
  deleteProblem: async () => createMockResponse({ success: true }),
  createAlgorithm: async (data: any) => createMockResponse({ ...data, _id: `a-${Date.now()}` }),
  updateAlgorithm: async (_id: string, data: any) => createMockResponse({ _id, ...data }),
  deleteAlgorithm: async () => createMockResponse({ success: true }),
  batchImportKnowledge: async (items: any[]) => createMockResponse({ imported: items.length, total: items.length }),
  getPendingCodes: async () => createPaginatedResponse([]),
  auditUserCode: async () => createMockResponse({ success: true }),
};

// ============================================================
// 工具函数
// ============================================================

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 检查是否为 Mock 模式
export function isMockMode(): boolean {
  // GitHub Pages 部署或无后端时启用 Mock 模式
  const hostname = window.location.hostname;
  return hostname.includes('github.io') || 
         hostname === 'localhost' && !navigator.onLine ||
         localStorage.getItem('MOCK_MODE') === 'true';
}

// 设置 Mock 模式
export function setMockMode(enabled: boolean) {
  if (enabled) {
    localStorage.setItem('MOCK_MODE', 'true');
  } else {
    localStorage.removeItem('MOCK_MODE');
  }
}

