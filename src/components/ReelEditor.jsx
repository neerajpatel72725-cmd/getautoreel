import { useEffect, useRef, useState } from "react";
import "./ReelEditor.css";

const formatTime = (value) => {
  if (!Number.isFinite(value)) return "00:00";
  const seconds = Math.max(0, Math.floor(value));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
};

export default function ReelEditor() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const musicElementRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [ratio, setRatio] = useState("9:16");
  const [caption, setCaption] = useState("");
  const [language, setLanguage] = useState("Hinglish");
  const [style, setStyle] = useState("Clean & cinematic");
  const [musicVolume, setMusicVolume] = useState(35);
  const [fitMode, setFitMode] = useState("fill");
  const [playbackSpeed, setPlaybackSpeed] = useState("1");
  const [videoVolume, setVideoVolume] = useState(100);
  const [visualFilter, setVisualFilter] = useState("none");
  const [exportQuality, setExportQuality] = useState("8");
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
  const [videoLoading, setVideoLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

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
    if (!/\.(srt|vtt)$/i.test(file.name)) { setStatus("Choose an SRT or WebVTT subtitle file."); return; }
    const source = (await file.text()).replace(/^\uFEFF/, "").replace(/\r/g, "");
    const blocks = source.split(/\n\s*\n/);
    const toSeconds = (stamp) => { const m = stamp.match(/(?:(\d+):)?(\d{2}):(\d{2})[,.](\d{3})/); return m ? Number(m[1] || 0) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4]) / 1000 : NaN; };
    const parsed = blocks.map((block) => { const lines = block.trim().split("\n"); const i = lines.findIndex((line) => line.includes("-->")); if (i < 0) return null; const times = lines[i].split("-->").map((part) => part.trim().split(/\s+/)[0]); const a = toSeconds(times[0]); const b = toSeconds(times[1]); const text = lines.slice(i + 1).join(" ").replace(/<[^>]*>/g, "").trim(); return Number.isFinite(a) && Number.isFinite(b) && b > a && text ? { start: a, end: b, text } : null; }).filter(Boolean).sort((a,b) => a.start-b.start);
    if (!parsed.length) { setStatus("No valid subtitle cues found in this file."); return; }
    setSubtitles(parsed); setSubtitleName(file.name); setStatus(`${parsed.length} subtitle cues loaded for preview and export.`);
  };

  const loadMusic = (file) => {
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      setStatus("Please choose an audio file.");
      return;
    }
    setMusicUrl(URL.createObjectURL(file));
  };

  const onMetadata = () => {
    const length = videoRef.current?.duration || 0;
    setDuration(length);
    setEnd(length);
    setVideoLoading(false);
    setStatus("Video ready. Your file stays on this device; no upload is required.");
  };

  const onVideoError = () => {
    setVideoLoading(false);
    setStatus("This video format or codec is not supported by your browser. Try an MP4 (H.264) file.");
  };

  const drawFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;
    const [w, h] = ratio === "9:16" ? [720, 1280] : ratio === "1:1" ? [1080, 1080] : [1280, 720];
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const ctx = canvas.getContext("2d");
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
    const visibleCaption = activeSubtitle?.text || (captionTime >= captionStart && (!captionEnd || captionTime <= captionEnd) ? caption.trim() : "");
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
  }, [caption, ratio, videoUrl, fitMode, style, textPosition, visualFilter, captionBackground, captionScale, captionStart, captionEnd, subtitles]);

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
    if (!window.MediaRecorder || !canvas.captureStream) {
      setStatus("Video export is not supported in this browser. Try the latest Chrome.");
      return;
    }
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
      drawFrame();

      const canvasStream = canvas.captureStream(30);
      const output = new MediaStream([...canvasStream.getVideoTracks()]);
      let audioContext;
      let music;
      if (musicUrl) {
        audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        const sourceStream = video.captureStream ? video.captureStream() : video.mozCaptureStream?.();
        sourceStream?.getAudioTracks().forEach((track) => output.addTrack(track));
        music = new Audio(musicUrl);
        musicElementRef.current = music;
        music.loop = true;
        music.volume = 1;
        const musicSource = audioContext.createMediaElementSource(music);
        const gain = audioContext.createGain();
        gain.gain.value = musicVolume / 100;
        musicSource.connect(gain).connect(audioContext.destination);
        const musicDestination = audioContext.createMediaStreamDestination();
        gain.connect(musicDestination);
        musicDestination.stream.getAudioTracks().forEach((track) => output.addTrack(track));
        await audioContext.resume();
        await music.play();
      } else {
        const sourceStream = video.captureStream ? video.captureStream() : video.mozCaptureStream?.();
        sourceStream?.getAudioTracks().forEach((track) => output.addTrack(track));
      }

      const mimeType = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]
        .find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(output, { ...(mimeType ? { mimeType } : {}), videoBitsPerSecond: Number(exportQuality) * 1000000, audioBitsPerSecond: 192000 });
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const extension = (recorder.mimeType || mimeType || "").includes("mp4") ? "mp4" : "webm";
        link.download = `genora-ai-reel.${extension}`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
        music?.pause();
        audioContext?.close().catch(() => {});
        output.getTracks().forEach((track) => track.stop());
        canvasStream.getTracks().forEach((track) => track.stop());
        setProgress(100);
        setBusy(false);
        setStatus("Your reel is ready. Download started.");
        video.pause();
      };
      recorder.start(250);
      await video.play();
      const render = () => {
        drawFrame();
        setProgress(Math.min(99, Math.round(((video.currentTime - start) / (end - start)) * 100)));
        if (video.currentTime >= end || video.ended) {
          video.pause();
          if (recorder.state !== "inactive") recorder.stop();
          cancelAnimationFrame(frameRef.current);
          return;
        }
        frameRef.current = requestAnimationFrame(render);
      };
      frameRef.current = requestAnimationFrame(render);
    } catch (error) {
      setBusy(false);
      setProgress(0);
      setStatus(error?.message || "Export failed. Please try again in Chrome.");
    }
  };

  return (
    <section className="reel-editor" id="reel-editor">
      <div className="reel-heading">
        <span className="reel-kicker">GENORA CREATOR TOOLS · BETA</span>
        <h2>Reels Editor</h2>
        <p>Turn your raw clips into a vertical, social-ready video — right in your browser.</p>
      </div>
      <div className="reel-workspace">
        <div className="reel-preview-panel">
          <div className="reel-preview-top"><span>LIVE PREVIEW</span><span className="reel-live-dot">● LOCAL EDITING</span></div>
          <div className={`reel-stage stage-${ratio.replace(":", "-")}`}>
            <video ref={videoRef} src={videoUrl || undefined} preload="metadata" onLoadStart={() => videoUrl && setVideoLoading(true)} onLoadedMetadata={onMetadata} onError={onVideoError}
              onTimeUpdate={(e) => { const t = e.currentTarget.currentTime; setCurrentTime(t); if (end > start && t >= end) { e.currentTarget.pause(); e.currentTarget.currentTime = end; } }}
              onPlay={() => { cancelAnimationFrame(frameRef.current); previewFrame(); }}
              onPause={() => cancelAnimationFrame(frameRef.current)}
              onSeeked={drawFrame} playsInline controls={false} />
            <canvas ref={canvasRef} aria-label="Edited reel preview" />
            {!videoUrl && <div className="reel-empty"><span>▶</span><strong>Your video preview</strong><small>Upload a clip to get started</small></div>}
          </div>
          <div className="reel-preview-controls">
            <div className="reel-transport"><button type="button" className="reel-secondary" onClick={seekToStart} disabled={!videoUrl}>↺ Play from start</button><button type="button" className="reel-secondary" onClick={() => { if (videoRef.current) { videoRef.current.playbackRate = Number(playbackSpeed); videoRef.current.volume = videoVolume / 100; videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause(); } }} disabled={!videoUrl}>▶ / Pause</button></div>
            <span>{formatTime(currentTime)} / {formatTime(end || duration)}</span>
            <span>{ratio}</span>
          </div>
          {videoUrl && <label className="reel-timeline">Timeline · scrub preview<input type="range" min={start} max={Math.max(end, start + 0.1)} step="0.05" value={Math.min(videoRef.current?.currentTime || start, end || duration)} onChange={(e) => { if (videoRef.current) { videoRef.current.currentTime = Number(e.target.value); drawFrame(); } }} /></label>}
        </div>
        <div className="reel-controls-panel">
          <div className="reel-step"><span>01</span><div><h3>Upload your video</h3><p>MP4, WebM or MOV supported by your browser.</p></div></div>
          <label className={`reel-upload ${dragOver ? "is-dragging" : ""}`} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); loadVideo(e.dataTransfer.files?.[0]); }}>
            <input type="file" accept="video/*" onChange={(e) => loadVideo(e.target.files?.[0])} />
            <span>＋</span><strong>{videoUrl ? "Choose another video" : "Choose video"}</strong><small>Files stay on your device</small>
          </label>
          {videoName && <div className="reel-file-meta"><span>▣</span><span title={videoName}>{videoName} · {(videoSize / (1024 * 1024)).toFixed(1)} MB</span><button type="button" onClick={() => { setVideoUrl(""); setVideoName(""); setVideoSize(0); setVideoLoading(false); setDuration(0); setStart(0); setEnd(0); setStatus(""); }}>Remove</button></div>}
          {videoLoading && <p className="reel-loading" role="status"><span className="reel-spinner" /> Preparing video preview… Large 4K files may take longer on mobile.</p>}
          {videoUrl && <div className="reel-step"><span>02</span><div><h3>Trim your clip</h3><p>Set the start and end points.</p></div></div>}
          {videoUrl && <div className="reel-trim">
            <label>Start <b>{formatTime(start)}</b><input type="range" min="0" max={Math.max(duration, 0.1)} step="0.1" value={start} onChange={(e) => { const v = Number(e.target.value); setStart(Math.min(v, Math.max(0, end - 0.2))); }} /></label>
            <label>End <b>{formatTime(end)}</b><input type="range" min="0" max={Math.max(duration, 0.1)} step="0.1" value={end} onChange={(e) => setEnd(Math.max(Number(e.target.value), start + 0.2))} /></label>
          </div>}
          <div className="reel-step"><span>03</span><div><h3>Make it yours</h3><p>Choose format, language and your editing vibe.</p></div></div>
          <div className="reel-field"><label htmlFor="reel-ratio">Video format</label><select id="reel-ratio" value={ratio} onChange={(e) => setRatio(e.target.value)}><option>9:16</option><option>1:1</option><option>16:9</option></select></div>
          <div className="reel-field"><label htmlFor="reel-speed">Playback speed</label><select id="reel-speed" value={playbackSpeed} onChange={(e) => setPlaybackSpeed(e.target.value)}><option value="0.5">0.5× Slow motion</option><option value="0.75">0.75×</option><option value="1">1× Normal</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2× Fast</option></select></div>
          <div className="reel-field"><label htmlFor="reel-filter">Visual look</label><select id="reel-filter" value={visualFilter} onChange={(e) => setVisualFilter(e.target.value)}><option value="none">Original</option><option value="contrast(1.18) saturate(1.2)">Vibrant</option><option value="grayscale(1)">Black & white</option><option value="sepia(.45) contrast(1.08)">Warm vintage</option><option value="brightness(1.12) saturate(.85)">Bright soft</option></select></div>
          <div className="reel-field"><label htmlFor="reel-original-volume">Original video volume · {videoVolume}%</label><input id="reel-original-volume" type="range" min="0" max="100" value={videoVolume} onChange={(e) => setVideoVolume(Number(e.target.value))} /></div>
          <div className="reel-field"><label htmlFor="reel-quality">Export quality</label><select id="reel-quality" value={exportQuality} onChange={(e) => setExportQuality(e.target.value)}><option value="5">Standard · 5 Mbps</option><option value="8">High · 8 Mbps</option><option value="12">Best · 12 Mbps</option></select></div>
          <div className="reel-field"><label htmlFor="reel-fit">Video framing</label><select id="reel-fit" value={fitMode} onChange={(e) => setFitMode(e.target.value)}><option value="fill">Fill frame · crop edges</option><option value="fit">Fit whole video · add bars</option></select></div>
          <div className="reel-field"><label htmlFor="reel-language">Caption language · AI captions coming soon</label><select id="reel-language" value={language} onChange={(e) => setLanguage(e.target.value)}><option>Hindi</option><option>English</option><option>Hinglish</option></select></div>
          <div className="reel-field"><label htmlFor="reel-style">Text style</label><select id="reel-style" value={style} onChange={(e) => setStyle(e.target.value)}><option>Clean & cinematic</option><option>Bold creator</option><option>Minimal</option><option>Vlog</option></select></div>
          <div className="reel-field"><label htmlFor="reel-caption-scale">Caption size · {captionScale}%</label><input id="reel-caption-scale" type="range" min="70" max="140" step="5" value={captionScale} onChange={(e) => setCaptionScale(Number(e.target.value))} /></div>
          <label className="reel-caption-toggle"><input type="checkbox" checked={captionBackground} onChange={(e) => setCaptionBackground(e.target.checked)} /> Add readable caption background</label>
          <div className="reel-field"><label htmlFor="reel-text-position">Text position</label><select id="reel-text-position" value={textPosition} onChange={(e) => setTextPosition(e.target.value)}><option value="bottom">Bottom</option><option value="center">Center</option><option value="top">Top</option></select></div>
          <div className="reel-field"><label htmlFor="reel-subtitles">Import timed subtitles (SRT / VTT)</label><input id="reel-subtitles" type="file" accept=".srt,.vtt" onChange={(e) => loadSubtitles(e.target.files?.[0])} /></div>
          {subtitleName && <div className="reel-file-meta"><span>CC</span><span title={subtitleName}>{subtitleName} · {subtitles.length} cues</span><button type="button" onClick={() => { setSubtitles([]); setSubtitleName(""); }}>Remove</button></div>}
          <div className="reel-field"><label htmlFor="reel-caption">On-screen text / caption</label><textarea id="reel-caption" rows="2" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Write a short hook or caption…" /></div>
          {videoUrl && <div className="reel-caption-timing">
            <strong>Caption timing</strong>
            <label>Show from <b>{formatTime(captionStart)}</b><input type="range" min={start} max={Math.max(end, start + 0.1)} step="0.1" value={Math.min(captionStart, end || duration)} onChange={(e) => setCaptionStart(Number(e.target.value))} /></label>
            <label>Hide after <b>{formatTime(captionEnd || end || duration)}</b><input type="range" min={captionStart} max={Math.max(end, captionStart + 0.1)} step="0.1" value={Math.min(captionEnd || end || duration, end || duration)} onChange={(e) => setCaptionEnd(Number(e.target.value))} /></label>
            <button type="button" className="reel-secondary" onClick={() => { setCaptionStart(start); setCaptionEnd(end || duration); }}>Show for full trimmed clip</button>
          </div>}
          <div className="reel-step"><span>04</span><div><h3>Add background music</h3><p>Use an audio file you have rights to use.</p></div></div>
          <label className="reel-audio-upload"><input type="file" accept="audio/*" onChange={(e) => loadMusic(e.target.files?.[0])} />♫ {musicUrl ? "Music added · change track" : "Add music track"}</label>
          {musicUrl && <><label className="reel-volume">Music volume <b>{musicVolume}%</b><input type="range" min="0" max="100" value={musicVolume} onChange={(e) => setMusicVolume(Number(e.target.value))} /></label><button type="button" className="reel-secondary" onClick={() => setMusicUrl("")}>Remove music track</button></>}
          <button className="reel-export" type="button" onClick={exportReel} disabled={!videoUrl || busy}>{busy ? `Exporting… ${progress}%` : "✦ Export Reel"}</button>
          {busy && <progress className="reel-progress" max="100" value={progress} aria-label="Export progress" />}
          <p className="reel-export-format">Export format is selected automatically by your browser (MP4 when supported, otherwise WebM).</p>
          <p className="reel-status" role="status">{status || "Your files are processed locally in this browser."}</p>
          <p className="reel-note">Note: Language and style are setup preferences in this MVP. Automatic speech-to-caption generation and AI scene editing are planned for a later phase.</p>
        </div>
      </div>
    </section>
  );
}
