export default function Hero({ totalTools }) {
  return (
    <section className="hero reel-first-hero">
      <div className="hero-content">
        <span className="hero-badge">GENORA AI · VIDEO CREATOR</span>
        <h1>Apna video chunein. Reel banayein.</h1>
        <p>Shuruaat ke liye bas video select karein. Preview dekhein aur jab ready ho, export karein. Advanced options alag se milenge.</p>
        <div className="hero-actions">
          <a className="btn" href="#reel-editor">✦ Reel banana shuru karein</a>
          <a className="hero-secondary-btn" href="#reel-editor">3 simple steps ↓</a>
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