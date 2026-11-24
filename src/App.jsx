import { lazy, Suspense, useEffect, useRef, useState } from "react";
import tools from "./data/tools";

import Hero from "./components/Hero";
import Categories from "./components/Categories";
const ReelEditor = lazy(() => import("./components/ReelEditor"));
import SearchBar from "./components/SearchBar";
import ToolCard from "./components/ToolCard";
import Footer from "./components/Footer";
import CreatorGuides from "./components/CreatorGuides";
import AdSenseLoader from "./components/AdSenseLoader";

export default function App() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [shouldLoadEditor, setShouldLoadEditor] = useState(false);
  const editorSectionRef = useRef(null);

  useEffect(() => {
    const section = editorSectionRef.current;
    if (!section) return undefined;
    if (!("IntersectionObserver" in window)) {
      setShouldLoadEditor(true);
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setShouldLoadEditor(true);
        observer.disconnect();
      }
    }, { rootMargin: "700px 0px" });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const filtered = tools.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || tool.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <AdSenseLoader />
      <nav className="navbar" aria-label="Main navigation">
        <a href="#home" className="brand">✦ GetAutoReel</a>
        <div className="menu">
          <a href="#home">Home</a>
          <a href="#tools">AI Tools</a>
          <a href="#categories">Categories</a>
          <a href="#reel-editor">Reels Editor</a>
        </div>
      </nav>

      <main className="container">
        <section id="home">
          <Hero totalTools={filtered.length} />
        </section>

        <section id="reel-editor" ref={editorSectionRef} aria-label="Reels Studio">
          {shouldLoadEditor ? (
            <Suspense fallback={<div className="reel-editor-loading" aria-live="polite" aria-busy="true"><span className="reel-loading-spinner" /><div><strong>Reels Studio is loading…</strong><p>Preparing the editor.</p></div></div>}>
              <ReelEditor />
            </Suspense>
          ) : (
            <div className="reel-editor-loading" aria-live="polite">
              <span className="reel-loading-spinner" />
              <div><strong>Reels Studio is ready when you are</strong><p>The editor loads as you get close to it, helping the home page open faster.</p></div>
            </div>
          )}
        </section>

        <section className="tool-discovery">
          <div className="section-heading">
            <span className="eyebrow">YOUR AI TOOLKIT</span>
            <h2>Find the right AI for your next idea.</h2>
            <p>Explore independent services with practical notes about their uses, limitations and things to check before signing up.</p>
          </div>
          <SearchBar search={search} setSearch={setSearch} category={category} setCategory={setCategory} />
        </section>

        <section id="categories" className="category-section">
          <div className="section-heading">
            <span className="eyebrow">EXPLORE BY INTEREST</span>
            <h2>Browse Categories</h2>
          </div>
          <Categories setCategory={setCategory} setSearch={setSearch} />
        </section>

        <section id="tools" className="tools-section">
          <div className="section-heading">
            <span className="eyebrow">THE TOOL DIRECTORY</span>
            <h2>{category === "All" ? "Explore AI Tools" : category}</h2>
            <p>{filtered.length} tools to explore. Plans, features and availability can change; confirm details on each provider's official website.</p>
          </div>
          <div className="grid">
            {filtered.length > 0 ? (
              filtered.map((tool) => <ToolCard key={tool.name} tool={tool} />)
            ) : (
              <div className="empty-state">
                <span>🔎</span>
                <h3>No tools found</h3>
                <p>Try another search or select a different category.</p>
                <button className="btn" onClick={() => { setSearch(""); setCategory("All"); }}>
                  Show all tools
                </button>
              </div>
            )}
          </div>
        </section>

        <CreatorGuides />

        <section id="about" className="closing-banner">
          <span className="eyebrow">ABOUT THE PROJECT</span>
          <h2>About GetAutoReel</h2>
          <p>
            GetAutoReel is an independent creator-focused website. It provides
            a browser-based Reels Editor, a directory of third-party creator
            and AI services, and practical guides about video formats, editing,
            captions, audio and content rights.
          </p>
          <p>
            GetAutoReel is not affiliated with, endorsed by, or sponsored by
            Google, Gemini, Canva, Adobe, Runway or the other third-party
            services listed here. Their names and marks belong to their
            respective owners. Links open the providers' own websites.
          </p>
          <p>
            Editing results can vary by browser, device capability and media
            files. Users should preview exported videos and make sure they have
            permission to use every video, image and audio asset they publish.
          </p>
          <a href="#reel-editor" className="btn">Try the Reels Editor →</a>
        </section>

        <section id="contact" className="closing-banner">
          <span className="eyebrow">HELP & FEEDBACK</span>
          <h2>Contact & Support</h2>
          <p>
            For technical problems, broken links or suggestions about this
            website, use the public project issue page. Please do not post
            passwords, payment details, private video files or other sensitive
            information in a public report.
          </p>
          <a href="https://github.com/neerajpatel72725-cmd/toolmint-ai/issues/new" className="btn" target="_blank" rel="noopener noreferrer">
            Report a website issue →
          </a>
          <p><small>The issue tracker is public and is intended for website feedback, not private account or payment support.</small></p>
        </section>

        <section className="closing-banner">
          <span className="eyebrow">MAKE SOMETHING AMAZING</span>
          <h2>Your next great idea starts with a clear workflow.</h2>
          <p>Use the editor, learn the basics and compare creator tools before choosing a service.</p>
          <a href="#tools" className="btn">Explore AI Tools →</a>
        </section>

        <Footer />

        <details id="privacy" className="policy-content legal-glass">
          <summary>Privacy Policy</summary>
          <div className="legal-body">
            <h2>Privacy Policy</h2>
            <p><strong>Last updated: November 25, 2026</strong></p>
            <p>Video files selected in the Reels Editor are processed in your browser for preview and export. The editor is not designed to upload those selected video files to GetAutoReel servers. Browser storage and temporary media URLs may be used while editing; refreshing or closing the page may clear your session.</p>
            <p>When you follow a link to a third-party service, that provider operates its own website and handles information under its own privacy policy. GetAutoReel does not control those external data practices.</p>
            <h3>Advertising and cookies</h3>
            <p>Google AdSense is not enabled on this website until the publisher configures it after account approval. If advertising is enabled in the future, Google and its partners may use cookies or similar technologies, IP addresses and device or browser information to serve, measure and help prevent invalid advertising activity, subject to applicable settings and law. This policy will be updated if advertising or analytics services are activated or our data practices change.</p>
            <p>Learn <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">how Google uses information from sites or apps that use its services</a> and review <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</p>
            <p>Do not upload content you do not have permission to edit. For technical website feedback, use the public issue tracker linked in the Contact & Support section; do not include sensitive personal information.</p>
          </div>
        </details>

        <details id="terms" className="policy-content legal-glass">
          <summary>Terms of Use</summary>
          <div className="legal-body">
            <h2>Terms of Use</h2>
            <p><strong>Last updated: November 25, 2026</strong></p>
            <ul>
              <li>Use GetAutoReel only for lawful purposes and content you own or are authorized to edit.</li>
              <li>You are responsible for rights to videos, audio, images, captions and other material you use or export.</li>
              <li>The editor is provided as-is while we improve reliability, compatibility and features. Export availability can depend on your browser, device memory and media codecs.</li>
              <li>Do not misuse the site, interfere with its operation, or attempt to harm other users or the service.</li>
              <li>Third-party tools linked from the directory are operated independently; we do not guarantee their availability, pricing or performance.</li>
            </ul>
            <p>We may revise these terms as the product develops. Continued use after an update means you accept the updated terms to the extent permitted by applicable law.</p>
          </div>
        </details>
      </main>
    </>
  );
}
