/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected rendering error',
    };
  }

  componentDidCatch(error: Error) {
    console.error('BrickVerse runtime error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-white/10 p-6 flex flex-col gap-4 text-center shadow-2xl">
            <div className="text-4xl">🧱</div>
            <h1 className="text-xl font-bold text-white">BrickVerse Had a Hiccup</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              {this.state.errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Reload BrickVerse
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
