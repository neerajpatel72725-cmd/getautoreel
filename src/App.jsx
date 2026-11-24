import { useState } from "react";
import tools from "./data/tools";

import Hero from "./components/Hero";
import OurAITools from "./components/OurAITools";
import Categories from "./components/Categories";
import AICreatorStudio from "./components/AICreatorStudio";
import ReelEditor from "./components/ReelEditor";
import SearchBar from "./components/SearchBar";
import ToolCard from "./components/ToolCard";
import Footer from "./components/Footer";
import CreatorGuides from "./components/CreatorGuides";
import AdSenseLoader from "./components/AdSenseLoader";

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
      <AdSenseLoader />
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
        </section>

        <CreatorGuides />

        <OurAITools />

        <section className="closing-banner">
          <span className="eyebrow">MAKE SOMETHING AMAZING</span>
          <h2>Your next great idea starts with AI.</h2>
          <p>Discover tools, explore possibilities and build your next project.</p>
          <a href="#tools" className="btn">
            Explore AI Tools →
          </a>
        </section>

        <details id="privacy" className="policy-content legal-glass"><summary>Privacy Policy</summary><div className="legal-body">
          <h2>Privacy Policy</h2>
          <p><strong>Last updated: November 24, 2026</strong></p>
          <p>GetAutoReel aims to process video edits in your browser. Video files selected in the Reel Editor are handled locally by your browser for preview and export; the editor is not designed to upload your video files to our servers.</p>
          <ul>
            <li>We do not ask you to enter passwords or sensitive personal information to use the basic editor.</li>
            <li>Third-party AI tool listings may link to external websites. Those websites have their own privacy practices.</li>
            <li>Browser storage, temporary media URLs and processing resources may be used to provide editor functionality. Closing the page or refreshing may clear your current editing session.</li>
            <li>We may use essential browser storage and, if enabled in a future release, analytics or advertising technologies. This policy will be updated when those services are activated.</li>
          </ul>
          <h3>Advertising and third-party cookies</h3>
          <p>When Google AdSense or another advertising provider is enabled on this site, that provider and its partners may use cookies, web beacons, IP addresses or similar identifiers to serve, measure and help prevent repeated ads. Third-party vendors may use information about visits to this and other websites to show relevant advertisements. Advertising technologies are not active until the site is configured and approved for them.</p>
          <p>Where personalized advertising is available, you can review or change Google ad personalization choices in <a href="https://adssettings.google.com/" target="_blank" rel="noreferrer">Google Ads Settings</a>. You can also learn <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer">how Google uses information from sites or apps that use its services</a>, or visit <a href="https://www.aboutads.info/choices/" target="_blank" rel="noreferrer">AboutAds choices</a> for participating companies.</p>
          <h3>External services and links</h3>
          <p>Links to AI tools and other external services are provided for convenience. Those providers operate their own websites and determine their own privacy, cookie and data practices. Review their policies before sharing information with them.</p>
          <p>Do not upload content you do not have permission to edit. This policy is a general notice and will be revised when specific analytics, advertising or account services are activated. Contact details for privacy questions will be published here once an official support address is configured.</p>
        </div></details>
        <details id="terms" className="policy-content legal-glass"><summary>Terms of Use</summary><div className="legal-body">
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
        </div></details>
      </main>
    </>
  );
}