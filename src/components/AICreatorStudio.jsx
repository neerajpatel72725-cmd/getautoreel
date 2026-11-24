export default function AICreatorStudio() {
  return (
    <section className="creator-studio">
      <h2>Creator Studio — planned tools</h2>
      <p>
        These tools are not available yet. The working browser-based Reels
        Editor is available above; thumbnail and poster generation are planned
        for a future update.
      </p>

      <div className="creator-grid">
        <article className="creator-card">
          <div className="creator-icon" aria-hidden="true">🎯</div>
          <h3>AI Thumbnail Generator</h3>
          <p>Planned workflow for creating and refining video thumbnail concepts.</p>
          <button className="btn" type="button" disabled aria-disabled="true">
            Not available yet
          </button>
        </article>

        <article className="creator-card">
          <div className="creator-icon" aria-hidden="true">🎨</div>
          <h3>AI Poster Generator</h3>
          <p>Planned workflow for preparing poster concepts for creator projects.</p>
          <button className="btn" type="button" disabled aria-disabled="true">
            Not available yet
          </button>
        </article>
      </div>
    </section>
  );
}
