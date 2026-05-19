export const DASH_COLS = 6;
export const DASH_GAP = 12;
export const DASH_ROW_HEIGHT = 64;
export const DASH_GROUP_SPAN = 1;

export function makeWidgetId() {
  return `w_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
