import { Component, type ErrorInfo, type ReactNode } from 'react';

// A failing page shows a message with the cause instead of an empty white screen.
export class PortalErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Portal:', error, info.componentStack);
  }

  componentDidUpdate(previous: { resetKey?: string }) {
    if (this.state.error && previous.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="portal-page">
        <div className="portal-card">
          <h1 className="heading portal-title">Das hat leider nicht geklappt</h1>
          <p>Diese Seite konnte nicht angezeigt werden. Bitte laden Sie sie neu.</p>
          <p className="portal-muted portal-small">Hinweis für den Support: {this.state.error.message}</p>
          <button type="button" className="portal-btn" onClick={() => window.location.reload()}>Neu laden</button>
        </div>
      </div>
    );
  }
}
