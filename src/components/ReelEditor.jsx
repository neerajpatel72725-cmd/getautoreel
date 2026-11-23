import { useEffect, useRef, useState } from "react";
import "./ReelEditor.css";
import { analyzeReelMedia } from "../lib/reelAnalysis";
import { parseSubtitleText } from "../lib/subtitleParser";

const formatTime = (value) => {
  if (!Number.isFinite(value)) return "00:00";
  const seconds = Math.max(0, Math.floor(value));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
};

export default function ReelEditor() {
  const videoRef = useRef(null);
  const videoFileRef = useRef(null);
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const exportCancelledRef = useRef(false);
  const audioContextRef = useRef(null);
  const videoAudioSourceRef = useRef(null);
  const videoAudioGainRef = useRef(null);
  const musicElementRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [ratio, setRatio] = useState("original");
  const [caption, setCaption] = useState("");
  const [captionEnabled, setCaptionEnabled] = useState(true);
  const [style, setStyle] = useState("Clean & cinematic");
  const [musicVolume, setMusicVolume] = useState(35);
  const [fitMode, setFitMode] = useState("fit");
  const [playbackSpeed, setPlaybackSpeed] = useState("1");
  const [videoVolume, setVideoVolume] = useState(100);
  const [visualFilter, setVisualFilter] = useState("none");
  const [exportQuality, setExportQuality] = useState("original");
  const [currentTime, setCurrentTime] = useState(0);
  const [captionBackground, setCaptionBackground] = useState(true);
  const [captionScale, setCaptionScale] = useState(100);
  const [captionStart, setCaptionStart] = useState(0);
  const [captionEnd, setCaptionEnd] = useState(0);
  const [subtitles, setSubtitles] = useState([]);
  const [subtitleName, setSubtitleName] = useState("");
  const [textPosition, setTextPosition] = useState("bottom");
  const [dragOver, setDragOver] = useState(false);
  const [videoName, setVideoName] = useState("");
  const [videoSize, setVideoSize] = useState(0);
  const [videoDimensions, setVideoDimensions] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pendingDownload, setPendingDownload] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [autoSegments, setAutoSegments] = useState([]);

  useEffect(() => () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
  }, [videoUrl]);

  useEffect(() => () => {
    if (musicUrl) URL.revokeObjectURL(musicUrl);
  }, [musicUrl]);

  useEffect(() => () => {
    cancelAnimationFrame(frameRef.current);
    audioContextRef.current?.close().catch(() => {});
  }, []);

  useEffect(() => () => {
    if (pendingDownload?.url) URL.revokeObjectURL(pendingDownload.url);
  }, [pendingDownload]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = videoVolume / 100;
    if (videoAudioGainRef.current) videoAudioGainRef.current.gain.value = videoVolume / 100;
  }, [videoVolume]);

  const loadVideo = (file) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setStatus("Please choose a valid video file.");
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setStatus("This file is over 500 MB. Please choose a smaller video for browser editing.");
      return;
    }
    const nextUrl = URL.createObjectURL(file);
    videoFileRef.current = file;
    setAnalysisResult(null);
    setAutoSegments([]);
    setSubtitles([]);
    setSubtitleName("");
    setCaptionStart(0);
    setCaptionEnd(0);
    setPendingDownload((previous) => {
      if (previous?.url) URL.revokeObjectURL(previous.url);
      return null;
    });
    setVideoLoading(true);
    setVideoUrl(nextUrl);
    setVideoName(file.name);
    setVideoSize(file.size);
    setStatus("Video selected. Preparing a lightweight preview on your device…");
    setStart(0);
    setEnd(0);
  };

  const loadSubtitles = async (file) => {
    if (!file) return;
    if (!/\.(srt|vtt)$/i.test(file.name)) {
      setStatus("Choose an SRT or WebVTT subtitle file.");
      return;
    }
    try {
      const parsed = parseSubtitleText(await file.text());
      if (!parsed.length) {
        setStatus("No valid subtitle cues found. Check the SRT or WebVTT timestamps and try again.");
        return;
      }
      const bounded = duration > 0
        ? parsed.filter((cue) => cue.start < duration).map((cue) => ({ ...cue, end: Math.min(cue.end, duration) })).filter((cue) => cue.end > cue.start)
        : parsed;
      if (!bounded.length) {
        setStatus("Subtitle cues do not overlap this video. Check the timestamp range.");
        return;
      }
      setSubtitles(bounded);
      setSubtitleName(file.name);
      setStatus(`${bounded.length} subtitle cues loaded for preview and export.`);
    } catch {
      setStatus("Subtitle file could not be read. Please choose a valid SRT or WebVTT file.");
    }
  };
  const loadMusic = (file) => {
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      setStatus("Please choose an audio file.");
      return;
    }
    const nextUrl = URL.createObjectURL(file);
    setMusicUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return nextUrl;
    });
    setStatus("Music loaded. It will be mixed into the exported reel; the live preview does not play the added music yet.");
  };

  const removeVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute("src");
      videoRef.current.load();
    }
    setVideoUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return "";
    });
    videoFileRef.current = null;
    setAnalysisResult(null);
    setAutoSegments([]);
    setVideoName("");
    setVideoSize(0);
    setVideoDimensions("");
    setVideoLoading(false);
    setDuration(0);
    setCurrentTime(0);
    setStart(0);
    setEnd(0);
    setSubtitles([]);
    setSubtitleName("");
    setPendingDownload((previous) => {
      if (previous?.url) URL.revokeObjectURL(previous.url);
      return null;
    });
    setStatus("Video removed. Choose another file to start.");
  };

  const onMetadata = () => {
    const video = videoRef.current;
    const length = video?.duration || 0;
    setDuration(length);
    setEnd(length);
    if (video?.videoWidth && video?.videoHeight) setVideoDimensions(`${video.videoWidth} × ${video.videoHeight}`);
    setStatus("Video details loaded. Preparing the first preview frame…");
  };

  const onFirstFrameReady = () => {
    setVideoLoading(false);
    setStatus("Video ready. Your file stays on this device; no upload is required.");
    drawFrame();
  };

  const runAutoAnalysis = async ({ autoApply = false } = {}) => {
    const video = videoRef.current;
    if (!video || videoLoading || analyzing || !videoUrl) return;
    setAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisResult(null);
    setStatus("Analyzing video scenes and audio rhythm on this device…");
    try {
      const result = await analyzeReelMedia({ video, file: videoFileRef.current, onProgress: setAnalysisProgress });
      // Suggest a short, usable section from the analyzed timeline. This is a
      // transparent heuristic—not semantic AI highlight detection.
      const targetLength = Math.min(20, Math.max(8, duration || 12));
      const eligible = result.segments.filter((segment) => segment.end - segment.start >= 4);
      const chosen = eligible.reduce((best, segment) => {
        const length = segment.end - segment.start;
        const score = Math.abs(length - targetLength);
        return !best || score < best.score ? { segment, score } : best;
      }, null)?.segment;
      const suggestedStart = chosen ? chosen.start : Math.max(0, Math.min(duration - targetLength, duration * 0.15));
      const suggestedEnd = chosen ? Math.min(chosen.end, suggestedStart + targetLength) : Math.min(duration, suggestedStart + targetLength);
      result.suggestedStart = Number(suggestedStart.toFixed(2));
      result.suggestedEnd = Number(suggestedEnd.toFixed(2));
      result.suggestionMethod = chosen ? "analysis segment nearest the target length" : "centered fallback window";
      setAnalysisResult(result);
      if (autoApply) {
        const candidates = result.segments
          .map((segment) => {
            const duration = segment.end - segment.start;
            const beatCount = result.beatMarkers.filter((beat) => beat >= segment.start && beat < segment.end).length;
            const sceneCutCount = result.sceneCutMarkers.filter((cut) => cut >= segment.start && cut < segment.end).length;
            const score = Math.min(duration, 8) + beatCount * 1.5 + sceneCutCount * 2;
            return { ...segment, score };
          })
          .filter((segment) => segment.end - segment.start >= 2.5)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .sort((a, b) => a.start - b.start);
        const montage = candidates.length
          ? candidates.map(({ start, end }) => ({ start, end }))
          : [{ start: result.suggestedStart, end: result.suggestedEnd }];
        setAutoSegments(montage);
        setStart(montage[0].start);
        setEnd(montage[0].end);
        setCaptionStart(montage[0].start);
        setCaptionEnd(montage[0].end);
        setRatio("9:16");
        setFitMode("fill");
        setVisualFilter("contrast(1.08) saturate(1.12) brightness(1.02)");
        setStyle("Bold creator");
        setTextPosition("bottom");
        setCaptionBackground(true);
        setCaptionEnabled(true);
        if (videoRef.current) {
          const player = videoRef.current;
          const redraw = () => {
            requestAnimationFrame(() => requestAnimationFrame(() => drawFrame()));
          };
          player.addEventListener("seeked", redraw, { once: true });
          player.currentTime = result.suggestedStart;
          if (player.currentTime === result.suggestedStart) redraw();
        }
        setStatus(`Auto Reel selected ${montage.length} highlight segments. Export will join these cuts into one vertical montage with the applied look.`);
      } else {
        setStatus(`Analysis complete: ${result.sceneChanges} scene changes and ${result.beatMarkers.length} audio rhythm peaks detected. A suggested trim is ready to review.`);
      }
    } catch (error) {
      setStatus(error?.message || "Automatic analysis failed. Try a shorter MP4 video.");
    } finally {
      setAnalyzing(false);
    }
  };

  const onVideoError = () => {
    setVideoLoading(false);
    setStatus("This video format or codec is not supported by your browser. Try an MP4 (H.264) file.");
  };

  // Keep the interactive preview lightweight on phones; render exports at full source dimensions.
  const drawFrame = (targetCanvas = canvasRef.current, maxDimension = 960) => {
    const video = videoRef.current;
    const canvas = targetCanvas;
    if (!video || !canvas || !video.videoWidth) return;
    // Export at practical social-video resolutions; preview is scaled separately.
    // Source mode preserves the exact source dimensions and aspect ratio.
    let [w, h] = ratio === "original" ? [video.videoWidth, video.videoHeight]
      : ratio === "9:16" ? [1080, 1920]
      : ratio === "4:5" ? [1080, 1350]
      : ratio === "1:1" ? [1080, 1080]
      : [1920, 1080];
    if (Number.isFinite(maxDimension) && Math.max(w, h) > maxDimension) {
      const previewScale = maxDimension / Math.max(w, h);
      w = Math.max(1, Math.round(w * previewScale));
      h = Math.max(1, Math.round(h * previewScale));
    }
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setStatus("Preview could not be created on this device. Close other tabs and reload the editor.");
      return;
    }
    const scale = fitMode === "fit" ? Math.min(w / video.videoWidth, h / video.videoHeight) : Math.max(w / video.videoWidth, h / video.videoHeight);
    const dw = video.videoWidth * scale;
    const dh = video.videoHeight * scale;
    ctx.fillStyle = "#080914";
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.filter = visualFilter === "none" ? "none" : visualFilter;
    ctx.drawImage(video, (w - dw) / 2, (h - dh) / 2, dw, dh);
    ctx.restore();
    const captionTime = video.currentTime || 0;
    const activeSubtitle = subtitles.find((item) => captionTime >= item.start && captionTime <= item.end);
    const visibleCaption = captionEnabled ? (activeSubtitle?.text || (captionTime >= captionStart && (!captionEnd || captionTime <= captionEnd) ? caption.trim() : "")) : "";
    if (visibleCaption) {
      const fontSize = Math.max(24, Math.round(w * (style === "Minimal" ? 0.045 : 0.055) * captionScale / 100));
      ctx.font = `${style === "Minimal" ? "600" : "800"} ${fontSize}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const words = visibleCaption.split(/\s+/);
      const lines = [];
      let line = "";
      words.forEach((word) => {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > w * 0.82 && line) {
          lines.push(line);
          line = word;
        } else line = test;
      });
      if (line) lines.push(line);
      const lineHeight = fontSize * 1.22;
      const anchor = textPosition === "top" ? 0.18 : textPosition === "center" ? 0.5 : 0.78;
      const y = h * anchor - ((lines.length - 1) * lineHeight) / 2;
      if (captionBackground) {
        const widest = Math.min(w * 0.9, Math.max(...lines.map((item) => ctx.measureText(item).width)) + fontSize * 0.8);
        const boxHeight = lines.length * lineHeight + fontSize * 0.45;
        ctx.fillStyle = "rgba(8, 9, 20, 0.62)";
        ctx.fillRect((w - widest) / 2, y - boxHeight / 2 + lineHeight / 2, widest, boxHeight);
      }
      ctx.lineWidth = style === "Minimal" ? 2 : Math.max(4, fontSize * 0.16);
      ctx.strokeStyle = "rgba(0,0,0,.88)";
      ctx.fillStyle = style === "Bold creator" ? "#ffe66d" : "#fff";
      lines.forEach((text, index) => {
        const yy = y + index * lineHeight;
        ctx.strokeText(text, w / 2, yy, w * 0.88);
        ctx.fillText(text, w / 2, yy, w * 0.88);
      });
    }
  };

  useEffect(() => {
    if (videoRef.current && !videoRef.current.paused) return;
    drawFrame();
  }, [caption, captionEnabled, ratio, videoUrl, fitMode, style, textPosition, visualFilter, captionBackground, captionScale, captionStart, captionEnd, start, end, subtitles]);

  const previewFrame = () => {
    drawFrame();
    frameRef.current = requestAnimationFrame(previewFrame);
  };

  const seekToStart = async () => {
    const video = videoRef.current;
    if (!video || !duration) return;
    video.currentTime = start;
    video.playbackRate = Number(playbackSpeed);
    video.volume = videoVolume / 100;
    await video.play().catch(() => {});
  };

  const exportReel = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !videoUrl || end <= start) {
      setStatus("Upload a video and choose a valid trim range first.");
      return;
    }
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth || !video.videoHeight) {
      setStatus("The video is still preparing. Wait until its preview is visible, then export.");
      return;
    }
    if (busy) return;
    if (!window.MediaRecorder || !canvas.captureStream) {
      setStatus("Video export is not supported in this browser. Please use the latest version of Chrome.");
      return;
    }
    exportCancelledRef.current = false;
    setBusy(true);
    setProgress(0);
    setStatus("Preparing your reel…");
    try {
      video.pause();
      video.playbackRate = Number(playbackSpeed);
      video.volume = videoVolume / 100;
      if (Math.abs(video.currentTime - start) > 0.05) {
        await new Promise((resolve, reject) => {
          const timeout = window.setTimeout(() => reject(new Error("Could not seek to the selected start point. Please try again.")), 8000);
          video.addEventListener("seeked", () => { window.clearTimeout(timeout); resolve(); }, { once: true });
          video.addEventListener("error", () => { window.clearTimeout(timeout); reject(new Error("The video could not be decoded.")); }, { once: true });
          video.currentTime = start;
        });
      }
      // Separate full-resolution export surface prevents the phone preview from forcing a low-res export.
      const exportCanvas = document.createElement("canvas");
      drawFrame(exportCanvas, Infinity);

      // Export only the canvas-rendered video track. Adding the source video track
      // here created a second video track with the unedited source frames, which
      // some players selected instead of the edited canvas (ratio/captions/filters).
      const canvasStream = exportCanvas.captureStream(30);
      const output = new MediaStream([...canvasStream.getVideoTracks()]);
      let audioContext = audioContextRef.current;
      let music;
      let audioDestination;
      let musicSource;
      let musicGain;
      if (videoVolume > 0 || musicUrl) {
        audioContext ||= new AudioContext();
        audioContextRef.current = audioContext;
        // Keep the original video audible in preview after export by maintaining
        // a persistent gain-to-speakers route and a temporary export route.
        videoAudioGainRef.current ||= audioContext.createGain();
        videoAudioGainRef.current.gain.value = videoVolume / 100;
        if (!videoAudioSourceRef.current) {
          videoAudioSourceRef.current = audioContext.createMediaElementSource(video);
          videoAudioSourceRef.current.connect(videoAudioGainRef.current);
          videoAudioGainRef.current.connect(audioContext.destination);
        }
        audioDestination = audioContext.createMediaStreamDestination();
        videoAudioGainRef.current.connect(audioDestination);
        if (musicUrl) {
          music = new Audio(musicUrl);
          musicElementRef.current = music;
          music.loop = true;
          musicSource = audioContext.createMediaElementSource(music);
          musicGain = audioContext.createGain();
          musicGain.gain.value = musicVolume / 100;
          musicSource.connect(musicGain);
          musicGain.connect(audioDestination);
        }
        audioDestination.stream.getAudioTracks().forEach((track) => output.addTrack(track));
        await audioContext.resume();
        if (music) await music.play();
      }

      const mimeCandidates = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
      const mimeType = typeof MediaRecorder.isTypeSupported === "function"
        ? mimeCandidates.find((type) => MediaRecorder.isTypeSupported(type))
        : undefined;
      const exportPixels = exportCanvas.width * exportCanvas.height;
      const automaticBitrate = exportPixels >= 3840 * 2160 ? 50000000 : exportPixels >= 2560 * 1440 ? 30000000 : exportPixels >= 1920 * 1080 ? 16000000 : 10000000;
      const selectedBitrate = exportQuality === "original" ? automaticBitrate : Number(exportQuality) * 1000000;
      const recorderOptions = { ...(mimeType ? { mimeType } : {}), videoBitsPerSecond: selectedBitrate, audioBitsPerSecond: 256000 };
      let recorder;
      try {
        recorder = new MediaRecorder(output, recorderOptions);
      } catch (encodingError) {
        // Some mobile browsers report a codec as supported but reject its options at runtime.
        if (!mimeType) throw encodingError;
        recorder = new MediaRecorder(output, { videoBitsPerSecond: selectedBitrate, audioBitsPerSecond: 128000 });
      }
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      let renderFrameId = null;
      let watchdogTimer = null;
      let exportFailed = false;
      let exportCompleted = false;
      const cleanupExport = () => {
        if (renderFrameId !== null) cancelAnimationFrame(renderFrameId);
        if (watchdogTimer !== null) window.clearInterval(watchdogTimer);
        renderFrameId = null;
        watchdogTimer = null;
        music?.pause();
        musicSource?.disconnect();
        musicGain?.disconnect();
        if (audioDestination) {
          try { videoAudioGainRef.current?.disconnect(audioDestination); } catch {}
        }
        output.getTracks().forEach((track) => track.stop());
        canvasStream.getTracks().forEach((track) => track.stop());
        video.pause();
      };
      recorder.onerror = () => {
        exportFailed = true;
        cleanupExport();
        setBusy(false);
        setProgress(0);
        setStatus("Export could not be encoded by this browser. Try a shorter clip, close other apps, and retry. Your original video is unchanged.");
      };
      recorder.onstop = () => {
        cleanupExport();
        if (exportFailed || exportCancelledRef.current || !exportCompleted) {
          setBusy(false);
          if (exportCancelledRef.current) setStatus("Export cancelled. No file was saved.");
          else if (!exportFailed) setStatus("Export stopped before the selected clip finished. No file was downloaded; please retry.");
          setProgress(0);
          return;
        }
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" });
        if (!blob.size) {
          setBusy(false);
          setProgress(0);
          setStatus("Export produced an empty file. Please retry in Chrome with the screen kept awake.");
          return;
        }
        const url = URL.createObjectURL(blob);
        const extension = (recorder.mimeType || mimeType || "").includes("mp4") ? "mp4" : "webm";
        setPendingDownload((previous) => {
          if (previous?.url) URL.revokeObjectURL(previous.url);
          return { url, filename: `getautoreel-reel.${extension}` };
        });
        setProgress(100);
        setBusy(false);
        setStatus("Your edited reel is ready. Play the preview below and download only if you approve it.");
        video.pause();
      };
      recorder.start(1000);
      const ranges = autoSegments.length > 1 ? autoSegments : [{ start, end }];
      const totalDuration = ranges.reduce((sum, range) => sum + Math.max(0, range.end - range.start), 0);
      let completedDuration = 0;
      let lastRenderedAt = 0;
      const renderExportFrame = (timestamp) => {
        if (recorder.state === "inactive") return;
        if (timestamp - lastRenderedAt >= 1000 / 30) {
          drawFrame(exportCanvas, Infinity);
          lastRenderedAt = timestamp;
        }
        renderFrameId = requestAnimationFrame(renderExportFrame);
      };
      renderFrameId = requestAnimationFrame(renderExportFrame);
      for (const range of ranges) {
        if (exportCancelledRef.current || recorder.state === "inactive") break;
        video.pause();
        await new Promise((resolve, reject) => {
          const timeout = window.setTimeout(() => reject(new Error("Could not seek to a selected highlight.")), 8000);
          const done = () => { clearTimeout(timeout); resolve(); };
          video.addEventListener("seeked", done, { once: true });
          video.currentTime = range.start;
        });
        try { await video.play(); }
        catch { throw new Error("Playback could not start for export. Tap Play once, then try Export again."); }
        const rangeStartedAt = performance.now();
        while (!exportCancelledRef.current && recorder.state !== "inactive" && video.currentTime < range.end - 0.04 && !video.ended) {
          const progressed = Math.max(0, video.currentTime - range.start);
          setProgress(Math.min(99, Math.round(((completedDuration + progressed) / totalDuration) * 100)));
          if (performance.now() - rangeStartedAt > Math.max(30000, (range.end - range.start) * 5000)) {
            throw new Error("Export stalled while processing a selected clip. Try a shorter video.");
          }
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        video.pause();
        completedDuration += range.end - range.start;
      }
      if (!exportCancelledRef.current && recorder.state !== "inactive") {
        exportCompleted = true;
        recorder.stop();
      }
    } catch (error) {
      if (recorderRef.current?.state && recorderRef.current.state !== "inactive") {
        try { recorderRef.current.stop(); } catch {}
      }
      setBusy(false);
      setProgress(0);
      setStatus(error?.message || "Export failed. Please try again in Chrome.");
    }
  };

  return (
    <section className="reel-editor" id="reel-editor">
      <div className="reel-heading">
        <span className="reel-kicker">GetAutoReel CREATOR TOOLS · BETA</span>
        <h2>Make a Reel</h2>
        <p>Choose a video, review the preview, then export. No setup required.</p>
      </div>
      <div className="reel-workspace">
        <div className="reel-preview-panel">
          <div className="reel-preview-top"><span>LIVE PREVIEW</span><span className="reel-live-dot">● LOCAL EDITING</span></div>
          <div className={`reel-stage stage-${ratio.replace(":", "-")}`}>
            <video ref={videoRef} src={videoUrl || undefined} preload="metadata" onLoadStart={() => videoUrl && setVideoLoading(true)} onLoadedMetadata={onMetadata} onLoadedData={onFirstFrameReady} onError={onVideoError}
              onTimeUpdate={(e) => { const t = e.currentTarget.currentTime; setCurrentTime(t); if (!busy && end > start && t >= end) { e.currentTarget.pause(); e.currentTarget.currentTime = end; } }}
              onPlay={() => { cancelAnimationFrame(frameRef.current); previewFrame(); }}
              onPause={() => cancelAnimationFrame(frameRef.current)}
              onSeeked={() => drawFrame()} playsInline controls={false} />
            <canvas ref={canvasRef} aria-label="Edited reel preview" />
            {!videoUrl && <div className="reel-empty"><span>▶</span><strong>Your video preview</strong><small>Upload a clip to get started</small></div>}
          </div>
          <div className="reel-preview-controls">
            <div className="reel-transport"><button type="button" className="reel-secondary" onClick={seekToStart} disabled={!videoUrl}>↺ Play from start</button><button type="button" className="reel-secondary" onClick={() => { if (videoRef.current) { videoRef.current.playbackRate = Number(playbackSpeed); videoRef.current.volume = videoVolume / 100; videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause(); } }} disabled={!videoUrl}>▶ / Pause</button></div>
            <span>{formatTime(currentTime)} / {formatTime(end || duration)}</span>
            <span>{ratio}</span>
          </div>
          {videoUrl && <div className="reel-timeline">
            <span>Timeline · scrub preview</span>
            {analysisResult && <div className="reel-marker-legend" aria-label="Detected timeline markers">
              <span><i className="reel-marker-swatch scene" /> Scene-change candidates ({analysisResult.sceneCutMarkers.length})</span>
              <span><i className="reel-marker-swatch beat" /> Audio peaks ({analysisResult.beatMarkers.length})</span>
            </div>}
            {analysisResult && <div className="reel-marker-track" role="group" aria-label="Detected markers across the source video">
              <span className="reel-marker-trim" style={{left: `${duration ? start / duration * 100 : 0}%`, width: `${duration ? Math.max(0, (end - start) / duration * 100) : 0}%`}} />
              {analysisResult.sceneCutMarkers.map((time) => <button key={`scene-${time}`} type="button" className="reel-tick scene" style={{left: `${duration ? time / duration * 100 : 0}%`}} title={`Scene-change candidate · ${formatTime(time)}`} aria-label={`Seek to scene-change candidate at ${formatTime(time)}`} disabled={time < start || time > end} onClick={() => { if (videoRef.current) { videoRef.current.currentTime = time; setCurrentTime(time); drawFrame(); } }} />)}
              {analysisResult.beatMarkers.filter((_, index, all) => all.length <= 180 || index % Math.ceil(all.length / 180) === 0).map((time) => <button key={`beat-${time}`} type="button" className="reel-tick beat" style={{left: `${duration ? time / duration * 100 : 0}%`}} title={`Audio energy peak · ${formatTime(time)}`} aria-label={`Seek to audio energy peak at ${formatTime(time)}`} disabled={time < start || time > end} onClick={() => { if (videoRef.current) { videoRef.current.currentTime = time; setCurrentTime(time); drawFrame(); } }} />)}
            </div>}
            <input aria-label="Scrub video preview" type="range" min={start} max={Math.max(end, start + 0.1)} step="0.05" value={Math.min(videoRef.current?.currentTime || start, end || duration)} onChange={(e) => { if (videoRef.current) { videoRef.current.currentTime = Number(e.target.value); drawFrame(); } }} />
          </div>}
        </div>
        <div className="reel-controls-panel">
          <div className="reel-simple-intro"><strong>Get started in 3 easy steps</strong><ol><li>Choose your video.</li><li>Review the preview.</li><li>Export and save your video.</li></ol><small>Your files are processed on this device.</small></div>
          <div className="reel-step"><span>01</span><div><h3>Choose your video</h3><p>Select a video from your device.</p></div></div>
          <label className={`reel-upload ${dragOver ? "is-dragging" : ""}`} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); loadVideo(e.dataTransfer.files?.[0]); }}>
            <input type="file" accept="video/*" onChange={(e) => { loadVideo(e.target.files?.[0]); e.target.value = ""; }} />
            <span>＋</span><strong>{videoUrl ? "Choose another video" : "Choose video"}</strong><small>Files stay on your device</small>
          </label>
          {videoName && <div className="reel-file-meta"><span>▣</span><span title={videoName}>{videoName} · {(videoSize / (1024 * 1024)).toFixed(1)} MB{videoDimensions ? ` · ${videoDimensions}` : ""}</span><button type="button" onClick={removeVideo}>Remove</button></div>}
          {videoLoading && <p className="reel-loading" role="status"><span className="reel-spinner" /> Preparing video preview… Large 4K files may take longer on mobile.</p>}
          <details className="reel-advanced"><summary>Optional settings · Video, captions, music</summary>
          {videoUrl && <div className="reel-step"><span>02</span><div><h3>Trim video</h3><p>Adjust only if you want to trim the clip.</p></div></div>}
          {videoUrl && <div className="reel-trim">
            <label>Start <b>{formatTime(start)}</b><input type="range" min="0" max={Math.max(duration, 0.1)} step="0.1" value={start} onChange={(e) => { const v = Number(e.target.value); setStart(Math.min(v, Math.max(0, end - 0.2))); }} /></label>
            <label>End <b>{formatTime(end)}</b><input type="range" min="0" max={Math.max(duration, 0.1)} step="0.1" value={end} onChange={(e) => setEnd(Math.max(Number(e.target.value), start + 0.2))} /></label>
          </div>}
          <div className="reel-step"><span>03</span><div><h3>Make it yours</h3><p>Choose format, language and your editing vibe.</p></div></div>
          <div className="reel-field"><label htmlFor="reel-ratio">Video format</label><select id="reel-ratio" value={ratio} onChange={(e) => setRatio(e.target.value)}><option value="9:16">Full-screen vertical · 9:16 · Reels / Shorts · 1080×1920</option><option value="4:5">Vertical portrait · 4:5 · Instagram feed · 1080×1350</option><option value="original">Original · preserve exact source ratio & dimensions</option><option value="1:1">1:1 · Square · 1080×1080</option><option value="16:9">16:9 · Landscape · 1920×1080</option></select></div>
          <div className="reel-field"><label htmlFor="reel-speed">Playback speed</label><select id="reel-speed" value={playbackSpeed} onChange={(e) => setPlaybackSpeed(e.target.value)}><option value="0.5">0.5× Slow motion</option><option value="0.75">0.75×</option><option value="1">1× Normal</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2× Fast</option></select></div>
          <div className="reel-field"><label htmlFor="reel-filter">Visual look</label><select id="reel-filter" value={visualFilter} onChange={(e) => setVisualFilter(e.target.value)}><option value="contrast(1.08) saturate(1.12) brightness(1.02)">Auto Reel Enhance · recommended</option><option value="none">Original · no color changes</option><option value="contrast(1.18) saturate(1.2)">Vibrant</option><option value="grayscale(1)">Black & white</option><option value="sepia(.45) contrast(1.08)">Warm vintage</option><option value="brightness(1.12) saturate(.85)">Bright soft</option></select></div>
          <div className="reel-field"><label htmlFor="reel-original-volume">Original video volume · {videoVolume}%</label><input id="reel-original-volume" type="range" min="0" max="100" value={videoVolume} onChange={(e) => setVideoVolume(Number(e.target.value))} /></div>
          <div className="reel-field"><label htmlFor="reel-quality">Export quality</label><select id="reel-quality" value={exportQuality} onChange={(e) => setExportQuality(e.target.value)}><option value="original">Original quality · Auto bitrate</option><option value="12">High · 12 Mbps</option><option value="20">Very high · 20 Mbps</option><option value="35">Maximum · 35 Mbps</option></select></div>
          <div className="reel-field"><label htmlFor="reel-fit">Video framing</label><select id="reel-fit" value={fitMode} onChange={(e) => setFitMode(e.target.value)}><option value="fill">Fill frame · crop edges</option><option value="fit">Fit whole video · add bars</option></select></div>
          <p className="reel-caption-help">Automatic speech-to-text captions are not available yet. Type a caption below or import timed SRT/VTT subtitles.</p>
          <div className="reel-field"><label htmlFor="reel-style">Text style</label><select id="reel-style" value={style} onChange={(e) => setStyle(e.target.value)}><option>Clean & cinematic</option><option>Bold creator</option><option>Minimal</option></select></div>
          <div className="reel-field"><label htmlFor="reel-caption-scale">Caption size · {captionScale}%</label><input id="reel-caption-scale" type="range" min="70" max="140" step="5" value={captionScale} onChange={(e) => setCaptionScale(Number(e.target.value))} /></div>
          <label className="reel-caption-toggle"><input type="checkbox" checked={captionBackground} onChange={(e) => setCaptionBackground(e.target.checked)} /> Add readable caption background</label>
          <div className="reel-field"><label htmlFor="reel-text-position">Text position</label><select id="reel-text-position" value={textPosition} onChange={(e) => setTextPosition(e.target.value)}><option value="bottom">Bottom</option><option value="center">Center</option><option value="top">Top</option></select></div>
          <div className="reel-field"><label htmlFor="reel-subtitles">Import timed subtitles (SRT / VTT)</label><input id="reel-subtitles" type="file" accept=".srt,.vtt" onChange={(e) => { loadSubtitles(e.target.files?.[0]); e.target.value = ""; }} /></div>
          {subtitleName && <div className="reel-file-meta"><span>CC</span><span title={subtitleName}>{subtitleName} · {subtitles.length} cues</span><button type="button" onClick={() => { setSubtitles([]); setSubtitleName(""); }}>Remove</button></div>}
          <label className="reel-caption-toggle"><input type="checkbox" checked={captionEnabled} onChange={(e) => setCaptionEnabled(e.target.checked)} /> Show caption on video</label>
          <div className="reel-caption-presets" aria-label="Quick caption templates">
            <span>Quick text templates</span>
            {[
              { label: "Hook", text: "Wait for it… 👀" },
              { label: "Story", text: "A moment worth remembering ✨" },
              { label: "CTA", text: "Follow for more 💫" },
              { label: "No text", text: "" },
            ].map((preset) => <button key={preset.label} type="button" className="reel-secondary" onClick={() => { setCaption(preset.text); setCaptionEnabled(Boolean(preset.text)); setCaptionStart(start); setCaptionEnd(end || duration); setStatus(preset.text ? `“${preset.label}” caption template applied. Edit the wording before export.` : "Caption text cleared."); }}>{preset.label}</button>)}
          </div>
          <div className="reel-field"><label htmlFor="reel-caption">On-screen text / caption (burned into video)</label><textarea id="reel-caption" rows="3" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Type your caption here. It will appear on the video preview and exported reel…" /></div>
          <p className="reel-caption-help">Caption preview appears on the video. During export it is rendered into every matching frame, not added as a separate text file.</p>
          {videoUrl && <div className="reel-caption-timing">
            <strong>Caption timing</strong>
            <label>Show from <b>{formatTime(captionStart)}</b><input type="range" min={start} max={Math.max(end, start + 0.1)} step="0.1" value={Math.min(captionStart, end || duration)} onChange={(e) => setCaptionStart(Number(e.target.value))} /></label>
            <label>Hide after <b>{formatTime(captionEnd || end || duration)}</b><input type="range" min={captionStart} max={Math.max(end, captionStart + 0.1)} step="0.1" value={Math.min(captionEnd || end || duration, end || duration)} onChange={(e) => setCaptionEnd(Number(e.target.value))} /></label>
            <button type="button" className="reel-secondary" onClick={() => { setCaptionStart(start); setCaptionEnd(end || duration); }}>Show for full trimmed clip</button>
          </div>}
          <div className="reel-step"><span>04</span><div><h3>Add background music</h3><p>Music is mixed into export; live preview currently plays the original video audio only.</p></div></div>
          <label className="reel-audio-upload"><input type="file" accept="audio/*" onChange={(e) => loadMusic(e.target.files?.[0])} />♫ {musicUrl ? "Music added · change track" : "Add music track (export)"}</label>
          {musicUrl && <><label className="reel-volume">Export music volume <b>{musicVolume}%</b><input type="range" min="0" max="100" value={musicVolume} onChange={(e) => setMusicVolume(Number(e.target.value))} /></label><button type="button" className="reel-secondary" onClick={() => { setMusicUrl((previous) => { if (previous) URL.revokeObjectURL(previous); return ""; }); setStatus("Background music removed."); }}>Remove music track</button></>}
          </details>
          <button className="reel-export reel-auto-create" type="button" onClick={() => runAutoAnalysis({ autoApply: true })} disabled={!videoUrl || videoLoading || analyzing || busy}>{analyzing ? `Creating reel… ${analysisProgress}%` : "✨ Auto-create Reel"}</button>
          <p className="reel-caption-help">Analyzes visual changes and audio energy, applies a suggested trim, vertical framing and creator-style look. Review before export; semantic AI highlights and speech captions are not enabled.</p>
          <button className="reel-export reel-analyze" type="button" onClick={() => runAutoAnalysis()} disabled={!videoUrl || videoLoading || analyzing || busy}>{analyzing ? `Analyzing… ${analysisProgress}%` : "Optional: Check video & audio"}</button>
          {analyzing && <progress className="reel-progress" max="100" value={analysisProgress} aria-label="Analysis progress" />}
          {autoSegments.length > 1 && <div className="reel-analysis-card reel-montage-editor"><strong>Auto Reel montage · {autoSegments.length} cuts</strong>{autoSegments.map((segment, index) => <div className="reel-montage-cut" key={`${index}-${segment.start}`}><span>Clip {index + 1}</span><label>Start <input type="number" min="0" max={Math.max(0, segment.end - 0.3)} step="0.1" value={segment.start.toFixed(1)} onChange={(e) => { const value = Math.max(0, Math.min(Number(e.target.value), segment.end - 0.3)); setAutoSegments((items) => items.map((item, i) => i === index ? { ...item, start: value } : item)); }} /></label><label>End <input type="number" min={segment.start + 0.3} max={duration} step="0.1" value={segment.end.toFixed(1)} onChange={(e) => { const value = Math.max(segment.start + 0.3, Math.min(Number(e.target.value), duration)); setAutoSegments((items) => items.map((item, i) => i === index ? { ...item, end: value } : item)); }} /></label>{analysisResult?.beatMarkers?.length > 0 && <button type="button" className="reel-secondary" onClick={() => { const nearest = analysisResult.beatMarkers.reduce((best, beat) => Math.abs(beat - segment.start) < Math.abs(best - segment.start) ? beat : best, analysisResult.beatMarkers[0]); setAutoSegments((items) => items.map((item, i) => i === index ? { ...item, start: Math.max(0, Math.min(nearest, item.end - 0.3)) } : item)); }}>Snap start to beat</button>}<button type="button" className="reel-secondary" onClick={() => setAutoSegments((items) => { const next = items.filter((_, i) => i !== index); if (next.length === 1) { setStart(next[0].start); setEnd(next[0].end); } return next; })}>Remove</button></div>)}<small>Adjust clip start/end or remove cuts. Export joins selected clips chronologically.</small></div>}
          {analysisResult && <div className="reel-analysis-card"><strong>Automatic analysis report</strong><span>{analysisResult.sceneChanges} visual scene changes</span><span>{analysisResult.beatMarkers.length} audio rhythm peaks</span><span>{analysisResult.segments.length} timeline sections mapped</span><span>Suggested trim: {formatTime(analysisResult.suggestedStart)} – {formatTime(analysisResult.suggestedEnd)}</span><button type="button" className="reel-secondary" onClick={() => { setStart(analysisResult.suggestedStart); setEnd(analysisResult.suggestedEnd); setCaptionStart(analysisResult.suggestedStart); setCaptionEnd(analysisResult.suggestedEnd); if (videoRef.current) videoRef.current.currentTime = analysisResult.suggestedStart; setStatus("Suggested trim applied. Preview it before exporting."); }}>Apply suggested trim</button><small>Suggestion method: {analysisResult.suggestionMethod}. This is a timeline heuristic, not semantic AI highlight detection. Visual changes and audio energy are analyzed; speech-to-text captions and semantic AI editing are not enabled.</small></div>}
          <button className="reel-export" type="button" onClick={exportReel} disabled={!videoUrl || videoLoading || busy}>{busy ? `Exporting… ${progress}%` : "2. Export video"}</button>
          {busy && <><progress className="reel-progress" max="100" value={progress} aria-label="Export progress" /><button type="button" className="reel-secondary reel-cancel-export" onClick={() => { exportCancelledRef.current = true; const recorder = recorderRef.current; if (recorder && recorder.state !== "inactive") recorder.stop(); else { setBusy(false); setProgress(0); setStatus("Export cancelled."); } }}>■ Stop export</button></>}
          {pendingDownload && <div className="reel-export-preview"><strong>Review your edited reel before saving</strong><video key={pendingDownload.url} src={pendingDownload.url} controls playsInline preload="metadata" /><button type="button" className="reel-secondary" onClick={() => {
            const link = document.createElement("a");
            link.href = pendingDownload.url;
            link.download = pendingDownload.filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            const url = pendingDownload.url;
            setPendingDownload(null);
            window.setTimeout(() => URL.revokeObjectURL(url), 60000);
          }}>↓ Download edited reel</button></div>}
          <p className="reel-export-format">Your exported file includes the selected framing, color filter, captions, speed and audio settings. Default preset: original dimensions, original framing and no color filter. The browser re-encodes exported video, so a small quality difference may still occur.</p>
          <p className="reel-status" role="status">{status || "Your files are processed locally in this browser."}</p>
          <p className="reel-note">Important: Automatic AI editing, song-synced captions, smart cuts and photo selection are not active yet. This version exports the settings you choose; it does not create a complete AI-edited reel automatically.</p>
        </div>
      </div>
    </section>
  );
}
