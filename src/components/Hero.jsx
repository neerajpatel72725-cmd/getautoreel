export default function Hero({ totalTools }) {
  return (
    <section className="hero reel-first-hero">
      <div className="hero-content">
        <span className="hero-badge">✦ TOOLMINT AI · CREATOR STUDIO</span>
        <h1>Turn your clips into stories worth sharing.</h1>
        <p>One creative space for smarter video editing, creator tools and fresh ideas. Start with a video, make it yours, and export when it feels right.</p>
        <div className="hero-actions">
          <a className="btn" href="#reel-editor">✦ Start creating</a>
          <a className="hero-secondary-btn" href="#tools">Explore AI tools ↓</a>
        </div>
        <div className="hero-stats">
          <div className="stat"><h3>One studio</h3><span>Your video workflow</span></div>
          <div className="stat"><h3>On device</h3><span>Private browser editing</span></div>
          <div className="stat"><h3>{totalTools}+</h3><span>Tools to discover</span></div>
        </div>
      </div>
    </section>
  );
}
