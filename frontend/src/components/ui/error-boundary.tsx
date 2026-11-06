import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Panel seviyesinde sınır: çökme durumunda gösterilecek kısa etiket */
  label?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Tiptap / Excalidraw / WebGL gibi ağır bağımlılıklardan gelebilecek
 * render hatalarında tüm uygulamanın beyaz ekrana düşmesini engeller.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`ErrorBoundary${this.props.label ? ` (${this.props.label})` : ''}:`, error, info.componentStack);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div className="flex items-center justify-center min-h-[50vh] p-6">
        <div className="max-w-md w-full rounded-2xl bg-slate-900/80 border border-slate-800 p-6 text-center space-y-4 shadow-2xl">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">
              {this.props.label ? `${this.props.label} yüklenirken bir hata oluştu` : 'Bir şeyler ters gitti'}
            </h3>
            <p className="text-xs text-slate-400 break-words">
              {this.state.error.message || 'Beklenmeyen bir hata oluştu.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Yeniden Dene
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      </div>
    );
  }
}
