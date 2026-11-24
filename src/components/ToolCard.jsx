export default function ToolCard({ tool }) {
  return (
    <article className="card">
      <div className="tool-header">
        <img
          src={tool.logo}
          alt=""
          className="tool-logo"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        <div>
          <h2>{tool.name}</h2>
          <p className="tool-category">{tool.category}</p>
        </div>
      </div>

      <span className="type">{tool.type || "Check provider website"}</span>
      <p className="description">{tool.description}</p>

      <div className="tool-editorial-notes">
        <p><strong>Best for:</strong> {tool.bestFor}</p>
        <p><strong>Before you use it:</strong> {tool.checkBeforeUse}</p>
      </div>

      <a
        className="btn"
        href={tool.link}
        target="_blank"
        rel="noopener noreferrer"
      >
        Visit official website ↗
      </a>
    </article>
  );
}
