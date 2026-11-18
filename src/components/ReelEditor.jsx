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
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (musicUrl) URL.revokeObjectURL(musicUrl);
    cancelAnimationFrame(frameRef.current);
    audioContextRef.current?.close().catch(() => {});
  }, [videoUrl, musicUrl]);

  const loadVideo = (file) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setStatus("Please choose a valid video file.");
      return;
    }
    setVideoUrl(URL.createObjectURL(file));
    setStatus("");
    setStart(0);
    setEnd(0);
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
    const scale = Math.max(w / video.videoWidth, h / video.videoHeight);
    const dw = video.videoWidth * scale;
    const dh = video.videoHeight * scale;
    ctx.fillStyle = "#080914";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(video, (w - dw) / 2, (h - dh) / 2, dw, dh);
    if (caption.trim()) {
      const fontSize = Math.max(30, Math.round(w * 0.055));
      ctx.font = `800 ${fontSize}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const words = caption.trim().split(/\s+/);
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
      const y = h * 0.78 - ((lines.length - 1) * lineHeight) / 2;
      ctx.lineWidth = Math.max(4, fontSize * 0.16);
      ctx.strokeStyle = "rgba(0,0,0,.78)";
      ctx.fillStyle = "#fff";
      lines.forEach((text, index) => {
        const yy = y + index * lineHeight;
        ctx.strokeText(text, w / 2, yy, w * 0.88);
        ctx.fillText(text, w / 2, yy, w * 0.88);
      });
    }
  };

  const previewFrame = () => {
    drawFrame();
    frameRef.current = requestAnimationFrame(previewFrame);
  };

  const seekToStart = async () => {
    const video = videoRef.current;
    if (!video || !duration) return;
    video.currentTime = start;
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
    setStatus("Preparing your reel…");
    try {
      video.pause();
      video.currentTime = start;
      await new Promise((resolve) => {
        if (Math.abs(video.currentTime - start) < 0.05) resolve();
        else video.addEventListener("seeked", resolve, { once: true });
      });
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

      const mimeType = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]
        .find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(output, mimeType ? { mimeType } : undefined);
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
        link.download = "genora-ai-reel.webm";
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
        music?.pause();
        audioContext?.close().catch(() => {});
        setBusy(false);
        setStatus("Your reel is ready. Download started.");
        video.pause();
      };
      recorder.start(250);
      await video.play();
      const render = () => {
        drawFrame();
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
            <video ref={videoRef} src={videoUrl || undefined} onLoadedMetadata={onMetadata}
              onPlay={() => { cancelAnimationFrame(frameRef.current); previewFrame(); }}
              onPause={() => cancelAnimationFrame(frameRef.current)}
              onSeeked={drawFrame} playsInline controls={false} />
            <canvas ref={canvasRef} aria-label="Edited reel preview" />
            {!videoUrl && <div className="reel-empty"><span>▶</span><strong>Your video preview</strong><small>Upload a clip to get started</small></div>}
          </div>
          <div className="reel-preview-controls">
            <button type="button" className="reel-secondary" onClick={() => { if (videoRef.current) videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause(); }} disabled={!videoUrl}>▶ / Pause</button>
            <span>{formatTime(start)} — {formatTime(end || duration)}</span>
            <span>{ratio}</span>
          </div>
        </div>
        <div className="reel-controls-panel">
          <div className="reel-step"><span>01</span><div><h3>Upload your video</h3><p>MP4, WebM or MOV supported by your browser.</p></div></div>
          <label className="reel-upload">
            <input type="file" accept="video/*" onChange={(e) => loadVideo(e.target.files?.[0])} />
            <span>＋</span><strong>{videoUrl ? "Choose another video" : "Choose video"}</strong><small>Files stay on your device</small>
          </label>
          {videoUrl && <div className="reel-step"><span>02</span><div><h3>Trim your clip</h3><p>Set the start and end points.</p></div></div>}
          {videoUrl && <div className="reel-trim">
            <label>Start <b>{formatTime(start)}</b><input type="range" min="0" max={Math.max(duration, 0.1)} step="0.1" value={start} onChange={(e) => { const v = Number(e.target.value); setStart(Math.min(v, Math.max(0, end - 0.2))); }} /></label>
            <label>End <b>{formatTime(end)}</b><input type="range" min="0" max={Math.max(duration, 0.1)} step="0.1" value={end} onChange={(e) => setEnd(Math.max(Number(e.target.value), start + 0.2))} /></label>
          </div>}
          <div className="reel-step"><span>03</span><div><h3>Make it yours</h3><p>Choose format, language and your editing vibe.</p></div></div>
          <div className="reel-field"><label htmlFor="reel-ratio">Video format</label><select id="reel-ratio" value={ratio} onChange={(e) => setRatio(e.target.value)}><option>9:16</option><option>1:1</option><option>16:9</option></select></div>
          <div className="reel-field"><label htmlFor="reel-language">Caption language</label><select id="reel-language" value={language} onChange={(e) => setLanguage(e.target.value)}><option>Hindi</option><option>English</option><option>Hinglish</option></select></div>
          <div className="reel-field"><label htmlFor="reel-style">Editing style</label><select id="reel-style" value={style} onChange={(e) => setStyle(e.target.value)}><option>Clean & cinematic</option><option>Bold creator</option><option>Minimal</option><option>Vlog</option></select></div>
          <div className="reel-field"><label htmlFor="reel-caption">On-screen text / caption</label><textarea id="reel-caption" rows="2" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Write a short hook or caption…" /></div>
          <div className="reel-step"><span>04</span><div><h3>Add background music</h3><p>Use an audio file you have rights to use.</p></div></div>
          <label className="reel-audio-upload"><input type="file" accept="audio/*" onChange={(e) => loadMusic(e.target.files?.[0])} />♫ {musicUrl ? "Music added · change track" : "Add music track"}</label>
          {musicUrl && <label className="reel-volume">Music volume <b>{musicVolume}%</b><input type="range" min="0" max="100" value={musicVolume} onChange={(e) => setMusicVolume(Number(e.target.value))} /></label>}
          <button className="reel-export" type="button" onClick={exportReel} disabled={!videoUrl || busy}>{busy ? "Preparing your reel…" : "✦ Export Reel"}</button>
          <p className="reel-status" role="status">{status || "Your files are processed locally in this browser."}</p>
          <p className="reel-note">Note: Language and style are setup preferences in this MVP. Automatic speech-to-caption generation and AI scene editing are planned for a later phase.</p>
        </div>
      </div>
    </section>
  );
}
