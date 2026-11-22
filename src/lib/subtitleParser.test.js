import test from "node:test";
import assert from "node:assert/strict";
import { parseSubtitleText } from "./subtitleParser.js";

test("parses SRT cues with hour timestamps, multiline text and entities", () => {
  const input = "1\r\n00:00:01,250 --> 00:00:02,500\r\nHello &amp; <b>world</b>\r\nsecond line\r\n\r\n2\r\n00:00:03,000 --> 00:00:04,250\r\nBye";
  assert.deepEqual(parseSubtitleText(input), [
    { start: 1.25, end: 2.5, text: "Hello & world second line" },
    { start: 3, end: 4.25, text: "Bye" },
  ]);
});

test("parses WebVTT timestamps without hours and ignores cue settings", () => {
  const input = "WEBVTT\n\n00:01.100 --> 00:02.250 align:start\n<v Speaker>Namaste</v>";
  assert.deepEqual(parseSubtitleText(input), [
    { start: 1.1, end: 2.25, text: "Namaste" },
  ]);
});

test("sorts valid cues and skips malformed or zero-length cues", () => {
  const input = "00:00:05,000 --> 00:00:06,000\nLater\n\n00:00:02,000 --> 00:00:02,000\nZero\n\n00:00:01,000 --> 00:00:02,000\nEarlier\n\n00:00:00,000 --> 00:00:61,000\nBad seconds";
  assert.deepEqual(parseSubtitleText(input), [
    { start: 1, end: 2, text: "Earlier" },
    { start: 5, end: 6, text: "Later" },
  ]);
});

test("returns an empty array for empty or header-only files", () => {
  assert.deepEqual(parseSubtitleText(""), []);
  assert.deepEqual(parseSubtitleText("WEBVTT"), []);
});
