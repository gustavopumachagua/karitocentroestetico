const VIEWPORT_PADDING = 12;
const CONTROL_GAP = 8;
const MAX_MENU_HEIGHT = 288;

/** Position a portalled menu next to its control, using its actual content height. */
export function getSelectMenuPosition({ rect, viewportWidth, viewportHeight, contentHeight }) {
  const availableBelow = Math.max(0, viewportHeight - rect.bottom - VIEWPORT_PADDING - CONTROL_GAP);
  const availableAbove = Math.max(0, rect.top - VIEWPORT_PADDING - CONTROL_GAP);
  const desiredHeight = Math.min(MAX_MENU_HEIGHT, Math.max(0, contentHeight));
  const openUp = desiredHeight > availableBelow && availableAbove > availableBelow;
  const availableSpace = openUp ? availableAbove : availableBelow;
  const width = Math.max(0, Math.min(rect.width, viewportWidth - VIEWPORT_PADDING * 2));
  const left = Math.max(
    VIEWPORT_PADDING,
    Math.min(rect.left, viewportWidth - width - VIEWPORT_PADDING)
  );

  return {
    left,
    width,
    maxHeight: Math.min(MAX_MENU_HEIGHT, availableSpace),
    // Anchor the actual bottom edge when opening upwards. Subtracting a maximum
    // height instead would leave a large gap for menus containing few options.
    ...(openUp
      ? { bottom: Math.max(VIEWPORT_PADDING, viewportHeight - rect.top + CONTROL_GAP) }
      : { top: Math.max(VIEWPORT_PADDING, rect.bottom + CONTROL_GAP) }),
  };
}
