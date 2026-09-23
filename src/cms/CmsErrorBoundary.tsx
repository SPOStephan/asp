import { Component, type ReactNode } from 'react';

export class CmsErrorBoundary extends Component<{ children: ReactNode }, { message: string | null }> {
  state = { message: null as string | null };

  static getDerivedStateFromError(error: Error) {
    return { message: error.message || 'Unbekannter Fehler' };
  }

  render() {
    if (this.state.message) {
      return (
        <main className="cms-missing">
          <h1>Editor ist stehen geblieben</h1>
          <p>{this.state.message}</p>
          <p>
            <a href="/cms">Editor neu laden</a>
          </p>
        </main>
      );
    }
    return this.props.children;
  }
}
