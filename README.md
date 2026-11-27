# GetAutoReel

GetAutoReel is an independent creator-focused website with a browser-based short-video editor, a curated directory of third-party creator tools, and practical editing guides.

## What the site provides

- **Browser-based Reels Editor:** select a local video, preview it, trim a range, choose an aspect ratio, add text captions or subtitle files, optionally add an audio track, and export a video where supported by the browser.
- **Local media handling:** selected video and audio files are processed in the browser for editing. The site does not require an account or a media upload to a GetAutoReel server for the editor workflow.
- **Creator tool directory:** browse independent third-party services with descriptions, use cases and reminders to verify current plans, licensing and privacy terms.
- **Creator guides:** practical notes on aspect ratios, editing quality, captions, audio and content rights.

## Important limitations

The automatic edit suggestions use local visual scene-change and audio-energy analysis. They are heuristics, not semantic AI understanding, speech recognition or guaranteed highlight detection. Captions can be typed manually or loaded from supported SRT/WebVTT files; automatic speech-to-text is not claimed. Video export depends on browser codec support, available memory and device performance. Always play the exported file before publishing.

## Development

Requirements: Node.js 20 or later and npm.

```bash
npm install
npm test
npm run build
npm run dev
```

The production build runs the automated test suite before Vite creates the `dist` folder.

## Deployment

The production site is hosted on Vercel and connected to the `main` branch of this repository. A successful local build does not replace testing media playback and export on real target devices.

## Legal and content responsibility

GetAutoReel is independent and is not affiliated with the third-party providers listed in the directory. Users are responsible for ensuring they have the rights to all video, audio, images, voices and other material they edit or publish. Review the site's Privacy Policy and Terms before use.
