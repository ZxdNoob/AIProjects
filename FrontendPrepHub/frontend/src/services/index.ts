/**
 * API 服务导出模块
 * 自动检测后端可用性，在后端不可用时 fallback 到 Mock API
 */

import {
  authApi as realAuthApi,
  knowledgeApi as realKnowledgeApi,
  problemApi as realProblemApi,
  algorithmApi as realAlgorithmApi,
  userCodeApi as realUserCodeApi,
  learningApi as realLearningApi,
  adminApi as realAdminApi,
} from './api';

import {
  mockAuthApi,
  mockKnowledgeApi,
  mockProblemApi,
  mockAlgorithmApi,
  mockUserCodeApi,
  mockLearningApi,
  mockAdminApi,
  isMockMode,
  setMockMode,
} from './mockApi';

// ============================================================
// 后端可用性检测
// ============================================================

let isBackendAvailable: boolean | null = null;
let checkPromise: Promise<boolean> | null = null;

/**
 * 检查后端服务是否可用
 */
async function checkBackendAvailability(): Promise<boolean> {
  // 如果已经在检查中，返回现有的 Promise
  if (checkPromise) return checkPromise;
  
  // 如果是 GitHub Pages，直接使用 Mock 模式
  if (window.location.hostname.includes('github.io')) {
    isBackendAvailable = false;
    console.log('📍 GitHub Pages 环境，使用 Mock 模式');
    return false;
  }
  
  // 检查本地存储的 Mock 模式设置
  if (localStorage.getItem('MOCK_MODE') === 'true') {
    isBackendAvailable = false;
    console.log('🔧 手动启用 Mock 模式');
    return false;
  }
  
  checkPromise = (async () => {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      isBackendAvailable = response.ok;
    } catch {
      isBackendAvailable = false;
    }
    
    if (!isBackendAvailable) {
      console.log('⚠️ 后端服务不可用，切换到 Mock 模式');
    } else {
      console.log('✅ 后端服务已连接');
    }
    
    checkPromise = null;
    return isBackendAvailable;
  })();
  
  return checkPromise;
}

/**
 * 创建带 fallback 的 API 代理
 */
function createApiProxy<T extends object>(realApi: T, mockApi: T): T {
  return new Proxy(realApi, {
    get(target, prop) {
      const realMethod = target[prop as keyof T];
      const mockMethod = mockApi[prop as keyof T];
      
      if (typeof realMethod !== 'function') {
        return realMethod;
      }
      
      return async (...args: any[]) => {
        // 如果已知后端不可用，直接使用 Mock
        if (isBackendAvailable === false) {
          return (mockMethod as Function)(...args);
        }
        
        // 首次调用时检查后端可用性
        if (isBackendAvailable === null) {
          await checkBackendAvailability();
          if (!isBackendAvailable) {
            return (mockMethod as Function)(...args);
          }
        }
        
        // 尝试调用真实 API
        try {
          return await (realMethod as Function)(...args);
        } catch (error: any) {
          // 网络错误时 fallback 到 Mock
          if (error.code === 'ECONNREFUSED' || 
              error.code === 'ERR_NETWORK' ||
              error.message?.includes('Network Error') ||
              error.status === 0) {
            console.warn(`⚠️ API 请求失败，使用 Mock 数据: ${String(prop)}`);
            isBackendAvailable = false;
            return (mockMethod as Function)(...args);
          }
          throw error;
        }
      };
    },
  }) as T;
}

// ============================================================
// 导出带 fallback 的 API
// ============================================================

export const authApi = createApiProxy(realAuthApi, mockAuthApi);
export const knowledgeApi = createApiProxy(realKnowledgeApi, mockKnowledgeApi);
export const problemApi = createApiProxy(realProblemApi, mockProblemApi);
export const algorithmApi = createApiProxy(realAlgorithmApi, mockAlgorithmApi);
export const userCodeApi = createApiProxy(realUserCodeApi, mockUserCodeApi);
export const learningApi = createApiProxy(realLearningApi, mockLearningApi);
export const adminApi = createApiProxy(realAdminApi, mockAdminApi);

// 导出工具函数
export { isMockMode, setMockMode };

// 导出检查函数
export { checkBackendAvailability };

// 获取当前模式
export function getCurrentMode(): 'real' | 'mock' | 'checking' {
  if (isBackendAvailable === null) return 'checking';
  return isBackendAvailable ? 'real' : 'mock';
}

