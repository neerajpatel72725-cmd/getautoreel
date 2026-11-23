import test from "node:test";
import assert from "node:assert/strict";
import { normalizeMontageSegments, updateMontageSegment } from "./montageSegments.js";

test("normalizes, clamps and sorts montage cuts chronologically", () => {
  assert.deepEqual(normalizeMontageSegments([
    { start: 8, end: 10 },
    { start: -2, end: 1 },
    { start: 4, end: 3 },
  ], 12), [
    { start: 0, end: 1 },
    { start: 3, end: 4 },
    { start: 8, end: 10 },
  ]);
});

test("keeps a cut at least 0.3 seconds long and within the video", () => {
  assert.deepEqual(normalizeMontageSegments([{ start: 11.9, end: 12 }], 12), [
    { start: 11.7, end: 12 },
  ]);
});

test("ignores cleared or non-numeric input without corrupting segments", () => {
  const segments = [{ start: 1, end: 3 }, { start: 5, end: 7 }];
  assert.strictEqual(updateMontageSegment(segments, 0, "start", "", 10), segments);
  assert.strictEqual(updateMontageSegment(segments, 0, "end", "abc", 10), segments);
});

test("editing a cut endpoint clamps it and keeps cuts ordered", () => {
  const segments = [{ start: 1, end: 3 }, { start: 5, end: 7 }];
  assert.deepEqual(updateMontageSegment(segments, 1, "start", 9, 10), [
    { start: 1, end: 3 },
    { start: 6.7, end: 7 },
  ]);
  assert.deepEqual(updateMontageSegment(segments, 0, "end", 0.1, 10), [
    { start: 1, end: 1.3 },
    { start: 5, end: 7 },
  ]);
});
