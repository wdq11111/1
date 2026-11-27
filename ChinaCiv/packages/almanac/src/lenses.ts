import type { Lens } from '../../core-types/src/map';

export const lenses: Record<Lens, { name: string; sub: string; scale: string; unit: string }> = {
  terrain: { name: '地形地貌', sub: '山脉、平原与河湖', scale: '', unit: '' },
  population: { name: '人口密度', sub: '观察聚落分布', scale: 'population', unit: '人/km²' },
  economy: { name: '经济活动', sub: '观察经济活动强度', scale: 'economy', unit: '合成指数' },
};
