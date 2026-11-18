import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("GENORA application render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f7f8fc", fontFamily: "Arial,sans-serif" }}>
          <section style={{ maxWidth: 480, padding: 28, borderRadius: 18, background: "#fff", boxShadow: "0 12px 40px #24284a14", textAlign: "center" }}>
            <h1 style={{ color: "#29245a" }}>GENORA AI is recovering</h1>
            <p style={{ color: "#626980", lineHeight: 1.6 }}>A page component could not load. Reload once. If this continues, share this screen with support so the issue can be identified.</p>
            <button onClick={() => window.location.reload()} style={{ padding: "12px 20px", border: 0, borderRadius: 10, background: "#6558e8", color: "#fff", fontWeight: 700 }}>Reload website</button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </React.StrictMode>
  );
} else {
  document.body.innerHTML = "<main style='padding:24px;font-family:Arial'>GENORA AI could not find its app root. Please contact support.</main>";
}
