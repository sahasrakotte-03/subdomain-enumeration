import React from 'react';
import { AlertCircle, RefreshCw, Sparkles, X } from 'lucide-react';

interface ErrorAlertProps {
  error: string;
  onRetry: () => void;
  onLoadDemo: () => void;
  onDismiss: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onRetry, onLoadDemo, onDismiss }) => {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-xs text-xs text-rose-900 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-950 text-sm">
              Reconnaissance Service Notice
            </h4>
            <p className="text-rose-800 mt-1 leading-relaxed">
              {error}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="text-rose-400 hover:text-rose-700 p-1 rounded transition-colors"
          title="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-200/60">
        <button
          type="button"
          onClick={onRetry}
          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Assessment</span>
        </button>

        <button
          type="button"
          onClick={onLoadDemo}
          className="px-3 py-1.5 bg-white border border-rose-300 text-rose-800 hover:bg-rose-100 rounded-md font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-600" />
          <span>Load Simulated Vulnerability Dataset</span>
        </button>
      </div>
    </div>
  );
};
