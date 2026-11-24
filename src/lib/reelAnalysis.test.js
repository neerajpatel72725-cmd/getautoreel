import test from "node:test";
import assert from "node:assert/strict";
import { chooseSuggestedSegment, seekVideo, throwIfAborted } from "./reelAnalysis.js";

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


class FakeVideo extends EventTarget {
  constructor(currentTime = 0) {
    super();
    this.currentTime = currentTime;
    this.seeking = false;
  }
}

test("seekVideo resolves immediately when the video is already at the requested time", async () => {
  const video = new FakeVideo(4);
  await seekVideo(video, 4);
  assert.equal(video.currentTime, 4);
});

test("seekVideo waits for an active seek even when currentTime already matches", async () => {
  const video = new FakeVideo(4);
  video.seeking = true;
  const pending = seekVideo(video, 4, undefined, { timeoutMs: 100 });
  video.seeking = false;
  video.dispatchEvent(new Event("seeked"));
  await pending;
});

test("seekVideo resolves after a seeked event", async () => {
  const video = new FakeVideo(1);
  const pending = seekVideo(video, 7, undefined, { timeoutMs: 100 });
  video.currentTime = 7;
  video.seeking = false;
  video.dispatchEvent(new Event("seeked"));
  await pending;
});

test("seekVideo rejects with a useful message when seeking times out", async () => {
  const video = new FakeVideo(1);
  await assert.rejects(
    seekVideo(video, 7, undefined, { timeoutMs: 5, timeoutMessage: "seek timed out" }),
    /seek timed out/,
  );
});
