import React from 'react';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('UI ErrorBoundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
          <p className="text-gray-300 font-black uppercase tracking-[0.2em] text-xs">Algo salió mal</p>
          <p className="mt-3 text-xs text-gray-500">Intenta recargar la página.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-white hover:border-white/30 transition-colors"
          >
            Recargar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
