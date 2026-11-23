const MIN_SEGMENT_LENGTH = 0.3;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function normalizeMontageSegments(segments, duration) {
  if (!Array.isArray(segments) || !Number.isFinite(duration) || duration < MIN_SEGMENT_LENGTH) return [];
  return segments
    .filter((segment) => Number.isFinite(Number(segment?.start)) && Number.isFinite(Number(segment?.end)))
    .map((segment) => {
      const start = clamp(Number(segment.start), 0, duration - MIN_SEGMENT_LENGTH);
      const end = clamp(Number(segment.end), start + MIN_SEGMENT_LENGTH, duration);
      return { start: Number(start.toFixed(2)), end: Number(end.toFixed(2)) };
    })
    .filter((segment) => segment.end - segment.start >= MIN_SEGMENT_LENGTH)
    .sort((a, b) => a.start - b.start || a.end - b.end);
}

export function updateMontageSegment(segments, index, field, rawValue, duration) {
  if (rawValue === "" || rawValue == null || !Number.isFinite(Number(rawValue))) return segments;
  if (!Array.isArray(segments) || !segments[index] || !["start", "end"].includes(field)) return segments;

  const current = segments[index];
  const value = Number(rawValue);
  const updated = segments.map((segment, itemIndex) => {
    if (itemIndex !== index) return segment;
    if (field === "start") {
      return { ...segment, start: clamp(value, 0, segment.end - MIN_SEGMENT_LENGTH) };
    }
    return { ...segment, end: clamp(value, segment.start + MIN_SEGMENT_LENGTH, duration) };
  });
  return normalizeMontageSegments(updated, duration);
}
