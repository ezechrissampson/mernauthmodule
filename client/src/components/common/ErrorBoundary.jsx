import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // In production, forward this to an error-tracking service (Sentry, etc.)
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-center px-3">
          <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: '3rem' }} />
          <h2 className="mt-3">Something went wrong</h2>
          <p className="text-secondary">Please refresh the page. If the problem persists, contact support.</p>
          <button className="btn btn-primary mt-2" onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
