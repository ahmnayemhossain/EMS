import type { DashboardGridRect } from '../slices/dashboard-builder.types';

export function removeFromArray(arr: string[], value: string) {
  const index = arr.indexOf(value);
  if (index < 0) return arr;
  const next = arr.slice();
  next.splice(index, 1);
  return next;
}

export function insertIntoArray(arr: string[], index: number, value: string) {
  const next = arr.slice();
  next.splice(Math.max(0, Math.min(next.length, index)), 0, value);
  return next;
}

export function defaultLayout(maxY: number): DashboardGridRect {
  return { x: 1, y: maxY + 1, w: 2, h: 8 };
}
