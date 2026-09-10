import React, { useState } from 'react';
import { X, Download, Copy, Check, FileText } from 'lucide-react';
import { downloadBlob } from '../utils/exportUtils';

interface ReportModalProps {
  reportMarkdown: string;
  targetDomain: string;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ reportMarkdown, targetDomain, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadBlob(
      reportMarkdown,
      `Vulnerability_Report_${targetDomain}_${Date.now()}.md`,
      'text/markdown;charset=utf-8;'
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Security Assessment Report Preview
              </h3>
              <p className="text-xs text-slate-500">
                Target: <span className="font-mono font-medium text-slate-700">{targetDomain}</span> • Format: Markdown
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Markdown Content Viewer */}
        <div className="px-6 py-4 overflow-y-auto flex-1 bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed selection:bg-indigo-600">
          <pre className="whitespace-pre-wrap font-mono">{reportMarkdown}</pre>
        </div>

        {/* Footer with Copy and Download */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Markdown</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download .md Report</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
