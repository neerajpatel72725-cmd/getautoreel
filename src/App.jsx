import { useState } from "react";
import tools from "./data/tools";

import Hero from "./components/Hero";
import OurAITools from "./components/OurAITools";
import Categories from "./components/Categories";
import AICreatorStudio from "./components/AICreatorStudio";
import ReelEditor from "./components/ReelEditor";
import ThumbnailGenerator from "./ThumbnailGenerator";
import SearchBar from "./components/SearchBar";
import ToolCard from "./components/ToolCard";
import Footer from "./components/Footer";

export default function App() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = tools.filter((tool) => {
    const matchesSearch = tool.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || tool.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <nav className="navbar">
        <a href="#home" className="brand">
          ✦ GetAutoReel
        </a>

        <div className="menu">
          <a href="#home">Home</a>
          <a href="#tools">AI Tools</a>
          <a href="#categories">Categories</a>
          <a href="#reel-editor">Reels Editor</a>
          <a href="#creator">Creator Studio</a>
        </div>
      </nav>

      <main className="container">
        <section id="home">
          <Hero totalTools={filtered.length} />
        </section>

        <ReelEditor />

        <section className="tool-discovery">
          <div className="section-heading">
            <span className="eyebrow">YOUR AI TOOLKIT</span>
            <h2>Find the right AI for your next idea.</h2>
            <p>Search, explore and discover tools for your workflow.</p>
          </div>

          <SearchBar
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
          />
        </section>

        <section id="categories" className="category-section">
          <div className="section-heading">
            <span className="eyebrow">EXPLORE BY INTEREST</span>
            <h2>Browse Categories</h2>
          </div>

          <Categories
            setCategory={setCategory}
            setSearch={setSearch}
          />
        </section>

        <section id="tools" className="tools-section">
          <div className="section-heading">
            <span className="eyebrow">THE TOOL DIRECTORY</span>
            <h2>
              {category === "All" ? "Explore AI Tools" : category}
            </h2>
            <p>{filtered.length} tools to explore</p>
          </div>

          <div className="grid">
            {filtered.length > 0 ? (
              filtered.map((tool) => (
                <ToolCard key={tool.name} tool={tool} />
              ))
            ) : (
              <div className="empty-state">
                <span>🔎</span>
                <h3>No tools found</h3>
                <p>Try another search or select a different category.</p>
                <button
                  className="btn"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                  }}
                >
                  Show all tools
                </button>
              </div>
            )}
          </div>
        </section>

        <section id="creator" className="creator-section">
          <AICreatorStudio />
          <ThumbnailGenerator />
        </section>

        <OurAITools />

        <section className="closing-banner">
          <span className="eyebrow">MAKE SOMETHING AMAZING</span>
          <h2>Your next great idea starts with AI.</h2>
          <p>Discover tools, explore possibilities and build your next project.</p>
          <a href="#tools" className="btn">
            Explore AI Tools →
          </a>
        </section>

        <section id="about" className="legal-section">
          <Footer />
          <div className="policy-content">
            <h2>About GetAutoReel</h2>
            <p>GetAutoReel is a browser-based video editing experience designed to help creators trim videos, add captions and music, adjust social formats, preview edits and export short-form content. Features may change as the service improves.</p>
          </div>
        </section>
        <section id="contact" className="policy-content">
          <h2>Contact</h2>
          <p>We are preparing an official support contact. Until it is published, please do not send sensitive personal information through this website.</p>
        </section>
        <section id="privacy" className="policy-content">
          <h2>Privacy Policy</h2>
          <p><strong>Last updated: November 22, 2026</strong></p>
          <p>GetAutoReel aims to process video edits in your browser. Video files selected in the Reel Editor are handled locally by your browser for preview and export; the editor is not designed to upload your video files to our servers.</p>
          <ul>
            <li>We do not ask you to enter passwords or sensitive personal information to use the basic editor.</li>
            <li>Third-party AI tool listings may link to external websites. Those websites have their own privacy practices.</li>
            <li>Browser storage, temporary media URLs and processing resources may be used to provide editor functionality. Closing the page or refreshing may clear your current editing session.</li>
            <li>We may update this policy as analytics, advertising or account features are added. Those features will be described here before or when they are introduced.</li>
          </ul>
          <p>Do not upload content you do not have permission to edit. This policy is a general notice and may be updated as the service and its providers are finalized.</p>
        </section>
        <section id="terms" className="policy-content">
          <h2>Terms of Use</h2>
          <p><strong>Last updated: November 22, 2026</strong></p>
          <ul>
            <li>Use GetAutoReel only for lawful purposes and content you own or are authorized to edit.</li>
            <li>You are responsible for rights to videos, audio, images, captions and other material you use or export.</li>
            <li>The editor is provided as-is while we improve reliability, compatibility and features. Export availability can depend on your browser, device memory and media codecs.</li>
            <li>Do not misuse the site, interfere with its operation, or attempt to harm other users or the service.</li>
            <li>Third-party tools linked from the directory are operated independently; we do not guarantee their availability, pricing or performance.</li>
          </ul>
          <p>We may revise these terms as the product develops. Continued use after an update means you accept the updated terms to the extent permitted by applicable law.</p>
        </section>
      </main>
    </>
  );
}