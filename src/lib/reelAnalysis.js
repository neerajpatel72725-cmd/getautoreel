const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function seek(video, time) {
  return new Promise((resolve, reject) => {
    if (Math.abs(video.currentTime - time) < 0.04) return resolve();
    const timer = setTimeout(() => reject(new Error("Video analysis timed out while seeking.")), 5000);
    const done = () => { clearTimeout(timer); video.removeEventListener("error", fail); resolve(); };
    const fail = () => { clearTimeout(timer); video.removeEventListener("seeked", done); reject(new Error("The browser could not decode a video frame.")); };
    video.addEventListener("seeked", done, { once: true });
    video.addEventListener("error", fail, { once: true });
    video.currentTime = time;
  });
}

function frameSignature(video, canvas, context) {
  canvas.width = 32; canvas.height = 18;
  context.drawImage(video, 0, 0, 32, 18);
  const pixels = context.getImageData(0, 0, 32, 18).data;
  const signature = new Float32Array(32 * 18 * 3);
  for (let p = 0, i = 0; p < pixels.length; p += 4) {
    signature[i++] = pixels[p] / 255;
    signature[i++] = pixels[p + 1] / 255;
    signature[i++] = pixels[p + 2] / 255;
  }
  return signature;
}

function frameDifference(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
  return sum / a.length;
}

async function detectBeats(file, duration, onProgress) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass || !file) return [];
  let audioContext;
  try {
    audioContext = new AudioContextClass();
    const buffer = await audioContext.decodeAudioData(await file.arrayBuffer());
    const channel = buffer.getChannelData(0);
    const windowSize = Math.max(1, Math.floor(buffer.sampleRate * 0.10));
    const energy = [];
    for (let start = 0; start < channel.length; start += windowSize) {
      let sum = 0;
      const stop = Math.min(channel.length, start + windowSize);
      for (let i = start; i < stop; i++) sum += channel[i] * channel[i];
      energy.push(Math.sqrt(sum / Math.max(1, stop - start)));
    }
    const sorted = [...energy].sort((a, b) => a - b);
    const floor = sorted[Math.floor(sorted.length * 0.55)] || 0;
    const threshold = Math.max(floor * 1.45, 0.012);
    const beats = [];
    let last = -1;
    for (let i = 1; i < energy.length - 1; i++) {
      const t = (i * windowSize) / buffer.sampleRate;
      if (t > duration || t - last < 0.32) continue;
      if (energy[i] > threshold && energy[i] >= energy[i - 1] && energy[i] >= energy[i + 1]) {
        beats.push(Number(t.toFixed(2)));
        last = t;
      }
    }
    onProgress?.(65);
    return beats;
  } catch {
    return [];
  } finally {
    if (audioContext) await audioContext.close().catch(() => {});
  }
}

export async function analyzeReelMedia({ video, file, onProgress = () => {} }) {
  if (!video || !Number.isFinite(video.duration) || video.duration < 2) {
    throw new Error("Upload a video that is at least 2 seconds long.");
  }
  const duration = video.duration;
  const originalTime = video.currentTime;
  const wasPlaying = !video.paused;
  video.pause();
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("This browser cannot create the analysis canvas.");
  const sampleStep = clamp(duration / 28, 0.8, 2.2);
  const samples = [];
  let previous = null;
  try {
    const times = [];
    for (let t = 0; t < duration; t += sampleStep) times.push(t);
    for (let i = 0; i < times.length; i++) {
      await seek(video, times[i]);
      if (video.readyState < 2) await new Promise(resolve => video.addEventListener("loadeddata", resolve, { once: true }));
      const signature = frameSignature(video, canvas, context);
      const difference = previous ? frameDifference(previous, signature) : 0;
      samples.push({ time: times[i], difference });
      previous = signature;
      onProgress(Math.round((i + 1) / times.length * 55));
    }
    const sceneCuts = samples.filter((item, i) => i > 0 && item.difference > 0.19).map(item => item.time);
    const beats = await detectBeats(file, duration, onProgress);
    const anchors = [...new Set([0, ...sceneCuts, ...beats.filter(t => t > 1 && t < duration - 1)])].sort((a, b) => a - b);
    const cuts = [0];
    for (const t of anchors.slice(1)) {
      if (t - cuts[cuts.length - 1] >= 1.8) cuts.push(t);
    }
    if (duration - cuts[cuts.length - 1] < 1.1 && cuts.length > 1) cuts.pop();
    cuts.push(duration);
    const segments = [];
    for (let i = 0; i < cuts.length - 1; i++) {
      const start = cuts[i], end = cuts[i + 1];
      if (end - start >= 1.1) segments.push({ start: Number(start.toFixed(2)), end: Number(end.toFixed(2)) });
    }
    return {
      duration,
      sceneChanges: sceneCuts.length,
      beatMarkers: beats,
      segments,
      analysis: beats.length ? "Visual scene changes + audio energy peaks" : "Visual scene changes (audio beat analysis unavailable)",
    };
  } finally {
    await seek(video, originalTime).catch(() => {});
    if (wasPlaying) await video.play().catch(() => {});
  }
}
