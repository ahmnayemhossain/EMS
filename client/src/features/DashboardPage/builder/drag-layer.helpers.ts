export const PREVIEW_COL = 56;
export const PREVIEW_GAP = 16;
export const PREVIEW_ROW_HEIGHT = 72;

export function layerStyles(): React.CSSProperties {
  return { position: "fixed", pointerEvents: "none", zIndex: 70, left: 0, top: 0, width: "100%", height: "100%" };
}

export function getItemStyles(offset: { x: number; y: number } | null): React.CSSProperties {
  if (!offset) return { display: "none" };
  const transform = `translate(${offset.x}px, ${offset.y}px)`;
  return { transform, WebkitTransform: transform };
}
