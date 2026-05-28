/**
 * API 服务模块（V2 重构第一步）
 * - 拆分类型/Mock/http 基础能力，降低耦合
 * - 统一 history 字段为 timestamp（修复 mock/real 不一致）
 * - 移除递归 fallback：失败后最多降级一次，避免无限递归与吞错
 */

import { requestJson } from './http';
import { mockGetStats, mockRollDice, mockState } from './mock';
import type {
  ApiMode,
  DiceRollResponse,
  HistoryResponse,
  MutationSuccess,
  RoadmapResponse,
  StatsResponse,
  VersionHistoryResponse,
} from './types';

const HEALTHCHECK_TIMEOUT_MS = 2000;

// Mock 模式状态：null 表示未探测
let mockMode: boolean | null = null;

const listeners = new Set<(mode: ApiMode) => void>();

function emitMode() {
  const mode: ApiMode = mockMode === null ? 'unknown' : mockMode ? 'mock' : 'real';
  listeners.forEach((fn) => fn(mode));
}

function getApiBaseUrl(): string {
  // GitHub Pages 环境：默认走 Mock（也允许用户手动关闭，但通常没有后端）
  if (window.location.hostname.includes('github.io')) return '';
  // 本地开发：使用 Vite 代理
  if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') return '';
  // 生产环境：支持环境变量
  return import.meta.env.VITE_API_URL || '';
}

function isMockForced(): boolean {
  return localStorage.getItem('MOCK_MODE') === 'true';
}

async function detectBackendAvailable(): Promise<boolean> {
  if (window.location.hostname.includes('github.io')) return false;
  if (isMockForced()) return false;

  try {
    await requestJson<{ status: string }>(`${getApiBaseUrl()}/api/health`, { timeoutMs: HEALTHCHECK_TIMEOUT_MS });
    return true;
  } catch {
    return false;
  }
}

async function useMockMode(): Promise<boolean> {
  if (mockMode === null) {
    const ok = await detectBackendAvailable();
    mockMode = !ok;
    if (mockMode) console.log('⚠️ 后端不可用，使用 Mock 模式');
    else console.log('✅ 后端已连接');
    emitMode();
  }
  return mockMode;
}

function setMockModeInternal(enabled: boolean): void {
  mockMode = enabled;
  emitMode();
}

// ============================================================
// API 方法
// ============================================================

/**
 * 掷骰子
 */
export async function rollDice(): Promise<{ point: number }> {
  const mock = await useMockMode();
  if (mock) {
    await delay(260);
    return mockRollDice();
  }

  try {
    return await requestJson<DiceRollResponse>(`${getApiBaseUrl()}/api/roll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('掷骰子请求失败:', error.message);
    // 失败后降级一次，避免无限递归
    setMockModeInternal(true);
    await delay(160);
    return mockRollDice();
  }
}

/**
 * 获取统计数据
 */
export async function getStats(): Promise<StatsResponse> {
  const mock = await useMockMode();
  if (mock) {
    await delay(160);
    return mockGetStats();
  }

  try {
    return await requestJson<StatsResponse>(`${getApiBaseUrl()}/api/stats`);
  } catch (error: any) {
    console.error('获取统计数据失败:', error.message);
    setMockModeInternal(true);
    await delay(120);
    return mockGetStats();
  }
}

/**
 * 获取历史记录
 */
export async function getHistory(): Promise<HistoryResponse> {
  const mock = await useMockMode();
  if (mock) {
    await delay(160);
    return { history: mockState.history };
  }

  try {
    return await requestJson<HistoryResponse>(`${getApiBaseUrl()}/api/history`);
  } catch (error: any) {
    console.error('获取历史记录失败:', error.message);
    setMockModeInternal(true);
    await delay(120);
    return { history: mockState.history };
  }
}

/**
 * 获取版本历史
 */
export async function getVersionHistory(): Promise<VersionHistoryResponse> {
  const mock = await useMockMode();
  if (mock) {
    await delay(160);
    return { history: mockState.versionHistory };
  }

  try {
    return await requestJson<VersionHistoryResponse>(`${getApiBaseUrl()}/api/version-history`);
  } catch (error: any) {
    console.error('获取版本历史失败:', error.message);
    setMockModeInternal(true);
    await delay(120);
    return { history: mockState.versionHistory };
  }
}

/**
 * 添加版本历史
 */
export async function addVersionHistory(data: {
  version: string;
  description: string;
  changeType: string;
}): Promise<{ success: boolean; id?: number }> {
  const mock = await useMockMode();
  if (mock) {
    await delay(220);
    const id = Date.now();
    mockState.versionHistory.unshift({
      id,
      version: data.version,
      description: data.description,
      change_type: data.changeType,
      release_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });
    return { success: true, id };
  }

  try {
    return await requestJson<MutationSuccess>(`${getApiBaseUrl()}/api/version-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (error: any) {
    console.error('添加版本历史失败:', error.message);
    return { success: false };
  }
}

/**
 * 获取路线图
 */
export async function getRoadmap(): Promise<RoadmapResponse> {
  const mock = await useMockMode();
  if (mock) {
    await delay(160);
    return { items: mockState.roadmap };
  }

  try {
    return await requestJson<RoadmapResponse>(`${getApiBaseUrl()}/api/roadmap`);
  } catch (error: any) {
    console.error('获取路线图失败:', error.message);
    setMockModeInternal(true);
    await delay(120);
    return { items: mockState.roadmap };
  }
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
  const mock = await useMockMode();
  if (mock) {
    await delay(220);
    const id = Date.now();
    mockState.roadmap.push({
      id,
      title: data.title,
      description: data.description || '',
      status: data.status as any,
      priority: data.priority as any,
      target_date: data.targetDate || null,
      sort_order: data.sortOrder || mockState.roadmap.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return { success: true, id };
  }

  try {
    return await requestJson<MutationSuccess>(`${getApiBaseUrl()}/api/roadmap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (error: any) {
    console.error('添加路线图项目失败:', error.message);
    return { success: false };
  }
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
  const mock = await useMockMode();
  if (mock) {
    await delay(220);
    const index = mockState.roadmap.findIndex((item) => item.id === id);
    if (index !== -1) {
      mockState.roadmap[index] = {
        ...mockState.roadmap[index],
        title: data.title,
        description: data.description || '',
        status: data.status as any,
        priority: data.priority as any,
        target_date: data.targetDate || null,
        sort_order: data.sortOrder ?? mockState.roadmap[index].sort_order,
        updated_at: new Date().toISOString(),
      };
    }
    return { success: true };
  }

  try {
    return await requestJson<{ success: boolean }>(`${getApiBaseUrl()}/api/roadmap/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (error: any) {
    console.error('更新路线图项目失败:', error.message);
    return { success: false };
  }
}

/**
 * 删除路线图项目
 */
export async function deleteRoadmapItem(id: number): Promise<{ success: boolean }> {
  const mock = await useMockMode();
  if (mock) {
    await delay(180);
    const index = mockState.roadmap.findIndex((item) => item.id === id);
    if (index !== -1) mockState.roadmap.splice(index, 1);
    return { success: true };
  }

  try {
    return await requestJson<{ success: boolean }>(`${getApiBaseUrl()}/api/roadmap/${id}`, {
      method: 'DELETE',
    });
  } catch (error: any) {
    console.error('删除路线图项目失败:', error.message);
    return { success: false };
  }
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
  if (mockMode === null) return 'unknown';
  return mockMode ? 'mock' : 'real';
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
  mockMode = enabled;
  emitMode();
}

/**
 * 重置 API 模式（强制重新检测）
 */
export function resetApiMode(): void {
  mockMode = null;
  emitMode();
}

// Re-export typed aliases for future refactor ergonomics
export type { ApiMode };

export function onApiModeChange(listener: (mode: ApiMode) => void): () => void {
  listeners.add(listener);
  // push current snapshot
  listener(getApiMode());
  return () => {
    listeners.delete(listener);
  };
}
