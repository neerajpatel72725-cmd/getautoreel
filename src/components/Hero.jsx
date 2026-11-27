export default function Hero() {
  return (
    <section className="hero reel-first-hero magic-hero">
      <div className="magic-copy">
        <span className="magic-kicker"><span className="magic-kicker-dot" /> THE CREATOR UNIVERSE</span>
        <h1>Create.<br /><span>Edit.</span> <em>Share.</em></h1>
        <div className="magic-rule" />
        <p className="magic-description">Trim videos, choose vertical or landscape formats, add captions and music, then preview and export in your browser. Your selected media stays on your device during editing.</p>
        <a className="btn magic-cta" href="#reel-editor">Open Reel Studio <span aria-hidden="true">↗</span></a>
      </div>
      <div className="magic-art" aria-hidden="true">
        <div className="magic-halo magic-halo-one" />
        <div className="magic-halo magic-halo-two" />
        <div className="magic-orb"><div className="magic-orb-core">✦</div></div>
        <span className="magic-star star-one">✧</span><span className="magic-star star-two">✦</span>
        <span className="magic-star star-three">✧</span><span className="magic-star star-four">·</span>
        <div className="magic-float magic-float-top"><span>✦</span><div><b>CREATIVE MODE</b><small>ON</small></div></div>
        <div className="magic-float magic-float-bottom"><span>◈</span><div><b>YOUR NEXT STORY</b><small>Starts here</small></div></div>
      </div>
    </section>
  );
}
