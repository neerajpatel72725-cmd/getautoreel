export default function Hero({ totalTools }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <span className="hero-badge">AI DISCOVERY + CREATOR WORKSPACE</span>
        <h1>Create scroll-stopping videos with GENORA AI.</h1>
        <p>
          Discover useful AI tools and edit your own videos in one place.
          Upload a clip, trim it, add text and music, then export a social-ready reel.
        </p>
        <div className="hero-actions">
          <a className="btn" href="#reel-editor">✦ Open Reels Editor</a>
          <a className="hero-secondary-btn" href="#tools">Explore AI Tools</a>
        </div>
        <div className="hero-stats">
          <div className="stat"><h3>{totalTools}+</h3><span>AI Tools</span></div>
          <div className="stat"><h3>9:16</h3><span>Reel Format</span></div>
          <div className="stat"><h3>100%</h3><span>Local Editing</span></div>
        </div>
      </div>
    </section>
  );
}
