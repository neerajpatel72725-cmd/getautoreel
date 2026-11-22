const decodeEntities = (value) => value.replace(/&(#x[\\da-f]+|#\\d+|amp|lt|gt|quot|apos|nbsp);/gi, (match, entity) => {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  if (entity[0] !== "#") return named[entity.toLowerCase()] ?? match;
  const codePoint = entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
  if (!Number.isFinite(codePoint) || codePoint < 0 || codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff)) return match;
  return String.fromCodePoint(codePoint);
});

function timestampToSeconds(timestamp) {
  const match = timestamp.match(/^(?:(\\d+):)?(\\d{1,2}):(\\d{2})[,.](\\d{1,3})$/);
  if (!match) return NaN;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  const milliseconds = Number((match[4] + "00").slice(0, 3));
  if (seconds > 59 || (match[1] && minutes > 59)) return NaN;
  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

export function parseSubtitleText(input) {
  if (typeof input !== "string" || !input.trim()) return [];
  const source = input.replace(/^\\uFEFF/, "").replace(/\\r\\n?/g, "\\n");
  return source.split(/\\n{2,}/).map((block) => {
    const lines = block.trim().split("\\n");
    const timestampLine = lines.findIndex((line) => line.includes("-->"));
    if (timestampLine < 0) return null;
    const [startText, endText] = lines[timestampLine].split("-->").map((part) => part.trim().split(/\\s+/)[0]);
    const start = timestampToSeconds(startText);
    const end = timestampToSeconds(endText);
    const text = decodeEntities(lines.slice(timestampLine + 1).join(" ").replace(/<[^>]*>/g, "").trim());
    return Number.isFinite(start) && Number.isFinite(end) && end > start && text
      ? { start, end, text }
      : null;
  }).filter(Boolean).sort((a, b) => a.start - b.start);
}
