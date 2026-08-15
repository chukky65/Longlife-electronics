import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled storefront error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 text-center">
          <div className="max-w-lg">
            <p className="text-red-500 text-[11px] font-black uppercase tracking-[0.35em] mb-4">Temporary Error</p>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">We could not load this page.</h1>
            <p className="text-slate-400 mb-8">Your order and account data are safe. Reload the storefront to try again.</p>
            <button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 px-7 py-3 text-[11px] font-bold uppercase tracking-widest">
              Reload Storefront
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
