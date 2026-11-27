const guides = [
  {
    title: "How to edit and export a video with GetAutoReel",
    intro: "The editor works in your browser. Follow these steps with a short test clip first so you can check compatibility and output quality on your device.",
    steps: [
      ["Choose a supported video", "Open Reel Studio and select a video file from your device. MP4 with H.264 video is a practical compatibility choice. The editor accepts video files up to 500 MB, but large files may be slow or exceed phone memory."],
      ["Wait for the preview", "Keep the page open while the video metadata and first frame load. If the browser reports an unsupported codec, try a standard MP4 export from your camera or editing app."],
      ["Set the section and format", "Use the trim controls to choose the portion you want. Select 9:16 for vertical short-form platforms, or keep the original aspect ratio when that better fits your footage."],
      ["Add captions or music", "Type a short caption or load an SRT/WebVTT subtitle file. You can optionally add an audio file. Make sure you have permission to publish all footage, music and other assets."],
      ["Preview, export and review", "Play the preview, check the start and end, then create the export. Play the downloaded file from beginning to end before sharing it. Export support and quality depend on your browser, device memory and codecs."]
    ],
    takeaway: "Start with a short clip, check the exported file, and only then move on to longer or higher-resolution footage."
  },
  {
    title: "Choose the right aspect ratio before editing",
    intro: "The frame shape affects how a video looks in a feed, how much of the original scene remains visible, and whether captions cover important details.",
    steps: [
      ["9:16 for vertical feeds", "Use 1080 × 1920 as a practical target for Instagram Reels, YouTube Shorts and TikTok-style vertical viewing. Keep faces and important text away from the very top and bottom, where app controls may cover them."],
      ["4:5 for portrait feed posts", "A 1080 × 1350 frame takes up more vertical space than a square post while keeping more of a landscape source visible than a full-height vertical crop."],
      ["16:9 for landscape viewing", "Use 1920 × 1080 for standard widescreen video, tutorials and desktop-first viewing. Avoid stretching a portrait clip to fill a landscape frame."],
      ["Preview before export", "Check the first, middle and final frames. Look for cut-off faces, logos, subtitles and objects near the edges. If the crop feels tight, choose a fit or blurred-background treatment rather than stretching the footage."]
    ],
    takeaway: "A good export is not just the highest resolution. It is the aspect ratio that suits the destination without hiding the subject."
  },
  {
    title: "A practical checklist for a clean short-form video",
    intro: "A short video should communicate one clear idea quickly. A simple review before export can improve clarity without adding unnecessary effects.",
    steps: [
      ["Start with one message", "Write the main point in one sentence. Remove clips that do not support it, and place the most useful moment near the beginning."],
      ["Trim pauses with context", "Remove long gaps and repeated phrases, but leave enough breathing room for viewers to understand a sentence or action. Very aggressive cuts can make speech hard to follow."],
      ["Make captions readable", "Use short lines, strong contrast and a consistent position. Keep captions clear of faces, product details and platform interface areas. Review spelling and timing while the video plays."],
      ["Balance music and speech", "Speech should remain easy to hear. Lower background music under dialogue and listen to the export on both headphones and a phone speaker."],
      ["Watch the complete export", "Check audio sync, opening and ending frames, crop, captions and file playback before publishing. A successful export message alone does not confirm every frame is correct."]
    ],
    takeaway: "Clarity, pacing and intelligible audio usually matter more than stacking filters or transitions."
  },
  {
    title: "Use music and footage you have permission to publish",
    intro: "A video can look polished and still receive a copyright claim if its footage, music, images or sound effects are not cleared for the intended use.",
    steps: [
      ["Check the licence, not just the download button", "Read whether an asset permits commercial use, social publishing, editing and redistribution. A free download does not automatically mean unrestricted use."],
      ["Keep proof of permission", "Save the licence page, receipt or written permission associated with each important asset. Record the source and any attribution requirement."],
      ["Do not assume platform music is portable", "Music available inside one social platform may be licensed only for use within that platform. A downloaded edit containing that track may not be cleared for another service or for commercial use."],
      ["Review AI-generated material", "Check the provider's current terms for ownership, commercial rights, prohibited uses and any restrictions on generated voices, likenesses or branded material."],
      ["Replace uncertain assets", "If you cannot confirm the rights, use original footage, your own recording or a clearly licensed alternative before publishing."]
    ],
    takeaway: "You are responsible for having the necessary rights to every video, image, audio track and other asset in the content you publish."
  }
];

export default function CreatorGuides() {
  return (
    <section id="creator-guides" className="creator-guides">
      <div className="section-heading">
        <span className="eyebrow">CREATOR LEARNING CENTRE</span>
        <h2>Practical guides for better Reels</h2>
        <p>Clear, step-by-step editing advice to help creators prepare videos confidently.</p>
      </div>
      <div className="guide-grid">
        {guides.map((guide) => (
          <article className="guide-card" key={guide.title}>
            <h3>{guide.title}</h3>
            <p>{guide.intro}</p>
            <ol>
              {guide.steps.map(([heading, detail]) => (
                <li key={heading}>
                  <strong>{heading}</strong>
                  <p>{detail}</p>
                </li>
              ))}
            </ol>
            <p className="guide-takeaway"><strong>In short:</strong> {guide.takeaway}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
