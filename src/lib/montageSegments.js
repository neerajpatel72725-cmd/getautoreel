const MIN_SEGMENT_LENGTH = 0.3;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function normalizeMontageSegments(segments, duration) {
  if (!Array.isArray(segments) || !Number.isFinite(duration) || duration < MIN_SEGMENT_LENGTH) return [];
  const normalized = segments
    .filter((segment) => Number.isFinite(Number(segment?.start)) && Number.isFinite(Number(segment?.end)))
    .map((segment) => {
      const rawStart = Number(segment.start);
      const rawEnd = Number(segment.end);
      const orderedStart = Math.min(rawStart, rawEnd);
      const orderedEnd = Math.max(rawStart, rawEnd);
      const start = clamp(orderedStart, 0, duration - MIN_SEGMENT_LENGTH);
      const end = clamp(orderedEnd, start + MIN_SEGMENT_LENGTH, duration);
      return { start: Number(start.toFixed(2)), end: Number(end.toFixed(2)) };
    })
    .filter((segment) => segment.end - segment.start >= MIN_SEGMENT_LENGTH - 1e-6)
    .sort((a, b) => a.start - b.start || a.end - b.end);

  // Overlapping cuts would replay the same source frames twice in the final
  // montage. Coalesce them so every source moment is exported at most once.
  return normalized.reduce((merged, segment) => {
    const previous = merged[merged.length - 1];
    if (previous && segment.start <= previous.end + 0.001) {
      previous.end = Number(Math.max(previous.end, segment.end).toFixed(2));
    } else {
      merged.push({ ...segment });
    }
    return merged;
  }, []);
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
