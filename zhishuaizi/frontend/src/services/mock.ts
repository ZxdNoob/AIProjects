import type {
  DicePoint,
  HistoryRecord,
  RoadmapItem,
  StatRow,
  VersionRecord,
} from './types';

export function weightedRandomDice(): DicePoint {
  const weights = { 1: 1, 2: 1, 3: 3, 4: 3, 5: 1, 6: 1 } as const;
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const random = Math.random() * totalWeight;

  let cumulative = 0;
  for (let point = 1 as DicePoint; point <= 6; point = (point + 1) as DicePoint) {
    cumulative += weights[point];
    if (random < cumulative) return point;
  }
  return 3;
}

export const mockState = {
  stats: [
    { point: 1, count: 12, percentage: '10.0%' },
    { point: 2, count: 15, percentage: '12.5%' },
    { point: 3, count: 35, percentage: '29.2%' },
    { point: 4, count: 38, percentage: '31.7%' },
    { point: 5, count: 10, percentage: '8.3%' },
    { point: 6, count: 10, percentage: '8.3%' },
  ] satisfies StatRow[],

  history: [] as HistoryRecord[],

  versionHistory: [
    {
      id: 1,
      version: '1.9.0',
      description: 'Mock 模式与 GitHub Pages 部署支持',
      change_type: 'minor',
      release_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      version: '1.8.0',
      description: '添加产品路线图功能',
      change_type: 'minor',
      release_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      version: '1.5.0',
      description: '3D 骰子动画效果',
      change_type: 'major',
      release_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ] satisfies VersionRecord[],

  roadmap: [
    {
      id: 1,
      title: '多人联机掷骰子',
      description: '支持多人同时在线掷骰子，实时同步结果',
      status: 'planned',
      priority: 'high',
      target_date: '2024-06-01',
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: '自定义骰子皮肤',
      description: '支持选择不同的骰子外观主题',
      status: 'in-progress',
      priority: 'medium',
      target_date: '2024-04-01',
      sort_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      title: '移动端 App',
      description: '开发 iOS/Android 原生应用',
      status: 'planned',
      priority: 'low',
      target_date: null,
      sort_order: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ] satisfies RoadmapItem[],
};

export function mockRollDice(): { point: DicePoint } {
  const point = weightedRandomDice();

  const stat = mockState.stats.find((s) => s.point === point);
  if (stat) stat.count++;

  mockState.history.unshift({
    point,
    timestamp: new Date().toISOString(),
  });
  if (mockState.history.length > 200) mockState.history.pop();

  return { point };
}

export function mockGetStats(): { stats: StatRow[] } {
  const total = mockState.stats.reduce((sum, s) => sum + s.count, 0);
  const stats = mockState.stats.map((s) => ({
    ...s,
    percentage: total > 0 ? `${((s.count / total) * 100).toFixed(1)}%` : '0%',
  }));
  return { stats };
}
