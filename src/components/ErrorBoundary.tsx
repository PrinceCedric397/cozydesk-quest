import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in CozyDesk:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('cozydesk_positions_v2');
      localStorage.removeItem('cozydesk_quests_v2');
      localStorage.removeItem('cozydesk_xp_v2');
      localStorage.removeItem('cozydesk_corkboard_v2');
      localStorage.removeItem('cozydesk_stickies_v2');
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#0d0f17] flex items-center justify-center p-6 text-slate-100 font-sans">
          <div className="max-w-md w-full bg-slate-900/95 border-2 border-amber-400/50 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center gap-4 backdrop-blur-md">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-lg font-bold font-display text-white">Desk System Recovery</h2>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                An unexpected state issue occurred. You can restore your cozy workspace to default settings.
              </p>
            </div>

            {this.state.error && (
              <div className="w-full bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-red-400 max-h-24 overflow-y-auto text-left">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold font-display text-xs rounded-xl transition active:scale-95 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Desk & Restore Defaults</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
