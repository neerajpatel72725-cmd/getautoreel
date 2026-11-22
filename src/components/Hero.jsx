export default function Hero({ totalTools }) {
  return (
    <section className="hero reel-first-hero">
      <div className="hero-content">
        <span className="hero-badge">GetAutoReel · VIDEO CREATOR</span>
        <h1>Choose your video. Create your reel.</h1>
        <p>Select a video, review your preview, and export when you’re ready. Advanced controls are available when you need them.</p>
        <div className="hero-actions">
          <a className="btn" href="#reel-editor">✦ Create your reel</a>
          <a className="hero-secondary-btn" href="#reel-editor">How it works ↓</a>
        </div>
        <div className="hero-stats">
          <div className="stat"><h3>9:16</h3><span>Reels format</span></div>
          <div className="stat"><h3>On device</h3><span>Local browser editing</span></div>
          <div className="stat"><h3>{totalTools}+</h3><span>AI tools directory</span></div>
        </div>
      </div>
    </section>
  );
}