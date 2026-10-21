import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.log("App crashed", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container page">
          <div className="card">
            <div className="empty">
              <div className="empty-title">Something went wrong</div>
              <p>This page could not be displayed. Please try reloading.</p>
              <button
                type="button"
                className="btn btn-primary mt-16"
                onClick={() => window.location.reload()}
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
