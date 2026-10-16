import assert from "node:assert/strict";
import test from "node:test";
import { getSelectMenuPosition } from "./selectMenuPosition.js";

const viewport = { viewportWidth: 1200, viewportHeight: 800 };
const control = { left: 100, top: 350, bottom: 400, width: 450 };

test("a short professional list opens below when its actual content fits", () => {
  const style = getSelectMenuPosition({
    ...viewport,
    rect: { ...control, top: 550, bottom: 600 },
    contentHeight: 142,
  });

  assert.equal(style.top, 608);
  assert.equal(style.bottom, undefined);
  assert.equal(style.maxHeight, 180);
  assert.equal(style.width, 450);
});

test("upwards menus are anchored eight pixels from the control regardless of their height", () => {
  for (const contentHeight of [142, 240, 700]) {
    const style = getSelectMenuPosition({
      ...viewport,
      rect: { ...control, top: 690, bottom: 740 },
      contentHeight,
    });

    assert.equal(style.bottom, 118);
    assert.equal(style.top, undefined);
    assert.equal(viewport.viewportHeight - style.bottom, 682);
    assert.equal(style.maxHeight, 288);
  }
});

test("long menus scroll on the side with more available space", () => {
  const style = getSelectMenuPosition({ ...viewport, rect: control, contentHeight: 1800 });

  assert.equal(style.top, 408);
  assert.equal(style.maxHeight, 288);
  assert.equal(style.bottom, undefined);
});

test("short viewports do not force a 160px menu outside the viewport", () => {
  const style = getSelectMenuPosition({
    viewportWidth: 360,
    viewportHeight: 180,
    rect: { left: 20, top: 65, bottom: 110, width: 320 },
    contentHeight: 900,
  });

  assert.equal(style.top, 118);
  assert.equal(style.maxHeight, 50);
  assert.equal(style.top + style.maxHeight, 168);
});

test("the menu stays within horizontal viewport bounds on narrow screens", () => {
  const style = getSelectMenuPosition({
    viewportWidth: 320,
    viewportHeight: 640,
    rect: { left: -18, top: 120, bottom: 168, width: 480 },
    contentHeight: 98,
  });

  assert.equal(style.left, 12);
  assert.equal(style.width, 296);
  assert.equal(style.left + style.width, 308);
});

test("the preferred side can change after scrolling without retaining the old anchor", () => {
  const before = getSelectMenuPosition({ ...viewport, rect: control, contentHeight: 180 });
  const after = getSelectMenuPosition({
    ...viewport,
    rect: { ...control, top: 690, bottom: 740 },
    contentHeight: 180,
  });

  assert.equal(before.bottom, undefined);
  assert.equal(after.top, undefined);
  assert.equal(after.bottom, 118);
});
