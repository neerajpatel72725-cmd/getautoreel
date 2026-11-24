const tools = [
  {
    name: "Perplexity",
    category: "Research AI",
    description: "An AI-assisted search and research service that combines generated summaries with links to supporting web sources. Useful when you need to explore a topic and follow up on references.",
    type: "Check current plans",
    bestFor: "Exploring a question, comparing sources and starting research.",
    checkBeforeUse: "Open the cited sources yourself before relying on a summary. Check current plan limits and how your searches or uploaded files are handled.",
    link: "https://www.perplexity.ai",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=perplexity.ai"
  },
  {
    name: "Gemini",
    category: "Writing AI",
    description: "Google's AI assistant for brainstorming, drafting, explaining topics and helping with coding tasks. Available features can vary by account, region and plan.",
    type: "Check current plans",
    bestFor: "Drafting and refining text, understanding topics and getting help with everyday tasks.",
    checkBeforeUse: "Verify important facts and code before using them. Review Google's current privacy settings before sharing confidential information.",
    link: "https://gemini.google.com",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=gemini.google.com"
  },
  {
    name: "Midjourney",
    category: "Image AI",
    description: "An image-generation service that creates visual artwork from written prompts. Creators can explore styles, compositions and concept directions.",
    type: "Check current plans",
    bestFor: "Concept art, visual mood boards, illustrations and creative image exploration.",
    checkBeforeUse: "Review current subscription requirements, commercial-use terms and rules about real people, brands and copyrighted references.",
    link: "https://www.midjourney.com",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=midjourney.com"
  },
  {
    name: "Runway",
    category: "Video AI",
    description: "A creative platform offering AI-assisted video and image workflows. Its available generation and editing features change over time.",
    type: "Check current plans",
    bestFor: "Experimenting with generated video, visual effects and creative production workflows.",
    checkBeforeUse: "Check credit limits, export options, output rights and the latest supported input formats before starting a project.",
    link: "https://runwayml.com",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=runwayml.com"
  },
  {
    name: "Cursor",
    category: "Coding AI",
    description: "An AI-focused code editor that helps developers understand codebases, generate code and make changes with editor context.",
    type: "Check current plans",
    bestFor: "Developers who want AI assistance while navigating and editing software projects.",
    checkBeforeUse: "Review privacy and code-indexing settings before opening private repositories, and inspect generated changes before committing them.",
    link: "https://cursor.com",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=cursor.com"
  },
  {
    name: "ElevenLabs",
    category: "Voice AI",
    description: "A voice technology platform with text-to-speech, voice tools and audio-related features for creative and production workflows.",
    type: "Check current plans",
    bestFor: "Narration, voiceovers and prototyping spoken audio for videos or other media.",
    checkBeforeUse: "Only clone or use a voice when you have the necessary consent and rights. Check commercial terms, attribution and usage limits.",
    link: "https://elevenlabs.io",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=elevenlabs.io"
  },
  {
    name: "TubeBuddy",
    category: "YouTube AI",
    description: "A YouTube creator toolkit with channel-management, optimization and research features intended to support publishing workflows.",
    type: "Check current plans",
    bestFor: "Organizing channel tasks and reviewing available video optimization tools.",
    checkBeforeUse: "Confirm which features are included in each plan and grant only the account permissions you are comfortable with.",
    link: "https://www.tubebuddy.com",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=tubebuddy.com"
  },
  {
    name: "vidIQ",
    category: "YouTube AI",
    description: "A YouTube-focused research and analytics service with tools for topic discovery, keyword exploration and channel improvement.",
    type: "Check current plans",
    bestFor: "Planning video topics and reviewing channel or keyword insights.",
    checkBeforeUse: "Treat keyword and performance estimates as guidance, not guaranteed results. Review the current plan and data permissions.",
    link: "https://vidiq.com",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=vidiq.com"
  },
  {
    name: "Opus Clip",
    category: "Video AI",
    description: "A tool designed to help turn longer recordings into shorter social-video clips with automated editing assistance.",
    type: "Check current plans",
    bestFor: "Finding candidate short clips from podcasts, interviews and longer recordings.",
    checkBeforeUse: "Review every suggested cut for context, speaker accuracy, captions and permissions before publishing.",
    link: "https://www.opus.pro",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=opus.pro"
  },
  {
    name: "Submagic",
    category: "Video AI",
    description: "A short-form video editing service focused on captions and creator-oriented visual enhancements.",
    type: "Check current plans",
    bestFor: "Adding subtitles and visual treatments to social-video edits.",
    checkBeforeUse: "Proofread automatically generated captions, check export quality and compare the current subscription limits.",
    link: "https://www.submagic.co",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=submagic.co"
  },
  {
    name: "Thumbly",
    category: "YouTube AI",
    description: "A thumbnail-focused service intended to help creators review and improve the presentation of video thumbnails.",
    type: "Check current plans",
    bestFor: "Exploring thumbnail concepts and evaluating visual presentation.",
    checkBeforeUse: "Confirm the provider's current features and pricing before uploading unpublished artwork or channel material.",
    link: "https://thumbly.ai",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=thumbly.ai"
  },
  {
    name: "Canva AI",
    category: "Design AI",
    description: "Canva combines a visual design editor with AI-assisted features for creating social posts, presentations and other design assets.",
    type: "Check current plans",
    bestFor: "Designing social graphics, simple promotional material and presentation layouts.",
    checkBeforeUse: "Check the licence for individual stock and generated assets, especially before commercial use or redistribution.",
    link: "https://www.canva.com",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=canva.com"
  },
  {
    name: "Adobe Firefly",
    category: "Design AI",
    description: "Adobe's family of generative creative tools for producing and editing images and other visual assets within supported workflows.",
    type: "Check current plans",
    bestFor: "Generating and refining creative visuals for design and content projects.",
    checkBeforeUse: "Review the current Firefly terms, feature availability and usage conditions for the specific output you plan to publish.",
    link: "https://firefly.adobe.com",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=firefly.adobe.com"
  },
  {
    name: "Ideogram",
    category: "Image AI",
    description: "An image-generation platform known for workflows that can include text within generated visual designs.",
    type: "Check current plans",
    bestFor: "Exploring poster, graphic and typography-led image concepts.",
    checkBeforeUse: "Inspect spelling and layout manually, and review the provider's current rights and privacy terms.",
    link: "https://ideogram.ai",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=ideogram.ai"
  },
  {
    name: "Leonardo AI",
    category: "Image AI",
    description: "A generative visual platform for creating and refining images, illustrations and other creative assets.",
    type: "Check current plans",
    bestFor: "Developing visual concepts, game-art directions and illustrative assets.",
    checkBeforeUse: "Check the terms attached to your plan and generation settings before using outputs commercially or sharing project files.",
    link: "https://leonardo.ai",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=leonardo.ai"
  },
  {
    name: "Krea AI",
    category: "Design AI",
    description: "A creative AI platform with image-generation and enhancement workflows designed for visual iteration.",
    type: "Check current plans",
    bestFor: "Experimenting with visual ideas and refining image concepts.",
    checkBeforeUse: "Check current model availability, usage limits and the rights that apply to uploaded references and generated outputs.",
    link: "https://www.krea.ai",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=krea.ai"
  }
];

export default tools;
