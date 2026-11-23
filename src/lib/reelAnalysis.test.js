import test from "node:test";
import assert from "node:assert/strict";
import { chooseSuggestedSegment, throwIfAborted } from "./reelAnalysis.js";

test("suggested segment ignores short analysis intervals", () => {
  const segments = [
    { start: 0, end: 2.4 },
    { start: 3, end: 8 },
    { start: 10, end: 19 },
  ];
  assert.deepEqual(chooseSuggestedSegment(segments, 8), { start: 10, end: 19 });
});

test("suggested segment chooses the eligible interval closest to target length", () => {
  const segments = [
    { start: 0, end: 4 },
    { start: 5, end: 13 },
    { start: 14, end: 24 },
  ];
  assert.deepEqual(chooseSuggestedSegment(segments, 9), { start: 5, end: 13 });
});

test("returns null when no interval is long enough", () => {
  assert.equal(chooseSuggestedSegment([{ start: 0, end: 3.9 }], 8), null);
  assert.equal(chooseSuggestedSegment([], 8), null);
});

test("analysis cancellation is a named AbortError", () => {
  assert.doesNotThrow(() => throwIfAborted(undefined));
  const controller = new AbortController();
  controller.abort();
  assert.throws(() => throwIfAborted(controller.signal), (error) => error.name === "AbortError");
});
