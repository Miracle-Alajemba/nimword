import React, { Component } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Global React error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", color: "#fff", background: "#0d131d", minHeight: "100vh", fontFamily: "sans-serif" }}>
          <h2>NIMWORD Error</h2>
          <p>{this.state.error?.message || "An unexpected error occurred while loading NIMWORD."}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ padding: "10px 20px", background: "#00B4D8", color: "#fff", border: "none", borderRadius: "20px", cursor: "pointer" }}
          >
            Reload Game
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>,
);

