export default function Hero({ totalTools }) {
  return (
    <section className="hero reel-first-hero">
      <div className="hero-content">
        <span className="hero-badge">GENORA AI · ONLINE REELS STUDIO</span>
        <h1>Edit your videos. Create your next viral reel.</h1>
        <p>Upload a video, cut the best part, add captions, music and creative looks. Build social-ready content in one simple workspace.</p>
        <div className="hero-actions">
          <a className="btn" href="#reel-editor">✦ Start editing free</a>
          <a className="hero-secondary-btn" href="#reel-editor">Explore editor ↓</a>
        </div>
        <div className="hero-stats">
          <div className="stat"><h3>9:16</h3><span>Reels ready</span></div>
          <div className="stat"><h3>Free</h3><span>Browser editing</span></div>
          <div className="stat"><h3>{totalTools}+</h3><span>AI tools directory</span></div>
        </div>
      </div>
    </section>
  );
}
