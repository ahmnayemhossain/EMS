export const DASH_COLS = 12;
export const DASH_GAP = 16;
export const DASH_ROW_HEIGHT = 72;
export const DASH_GROUP_SPAN = 3;

export function makeWidgetId() {
  return `w_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
