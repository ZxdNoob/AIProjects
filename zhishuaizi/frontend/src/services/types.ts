export type ApiMode = 'real' | 'mock' | 'unknown';

export type DicePoint = 1 | 2 | 3 | 4 | 5 | 6;

export interface DiceRollResponse {
  point: DicePoint;
}

export interface StatRow {
  point: DicePoint;
  count: number;
  percentage?: string;
}

export interface StatsResponse {
  stats: StatRow[];
}

export interface HistoryRecord {
  point: DicePoint;
  /**
   * ISO string or SQLite datetime string; client normalizes for display.
   * Example: "2026-05-28 16:23:01" or "2026-05-28T08:23:01.000Z"
   */
  timestamp: string;
}

export interface HistoryResponse {
  history: HistoryRecord[];
}

export interface VersionRecord {
  id: number;
  version: string;
  description: string;
  change_type: 'major' | 'minor' | 'patch' | string;
  release_date: string;
  created_at: string;
}

export interface VersionHistoryResponse {
  history: VersionRecord[];
}

export type RoadmapStatus = 'planned' | 'in-progress' | 'completed';
export type RoadmapPriority = 'high' | 'medium' | 'low';

export interface RoadmapItem {
  id: number;
  title: string;
  description: string;
  status: RoadmapStatus;
  priority: RoadmapPriority;
  created_at: string;
  updated_at: string;
  target_date: string | null;
  sort_order: number;
}

export interface RoadmapResponse {
  items: RoadmapItem[];
}

export interface MutationSuccess {
  success: boolean;
  id?: number;
}
