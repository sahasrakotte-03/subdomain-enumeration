import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle, CheckCircle, Copy, Check, ExternalLink, ArrowRight, ShieldCheck, Terminal } from 'lucide-react';
import { SubdomainRecord } from '../types';

interface RecordDetailModalProps {
  record: SubdomainRecord | null;
  onClose: () => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({ record, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!record) return null;

  const handleCopyDetails = () => {
    const raw = JSON.stringify(record, null, 2);
    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
              record.riskLevel === 'CRITICAL'
                ? 'bg-rose-600'
                : record.riskLevel === 'HIGH'
                ? 'bg-amber-600'
                : record.riskLevel === 'MEDIUM'
                ? 'bg-yellow-600'
                : 'bg-indigo-600'
            }`}>
              {record.riskLevel === 'CRITICAL' || record.riskLevel === 'HIGH' ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                {record.subdomain}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500">Discovery Source: {record.source}</span>
                {record.responseTimeMs !== undefined && (
                  <span className="text-xs text-slate-400">• DNS Response: {record.responseTimeMs}ms</span>
                )}
              </div>
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

        {/* Modal Content */}
        <div className="px-6 py-5 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
          {/* Risk Level Alert Banner */}
          <div className={`p-4 rounded-lg border ${
            record.riskLevel === 'CRITICAL'
              ? 'bg-rose-50 border-rose-200 text-rose-950'
              : record.riskLevel === 'HIGH'
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : record.riskLevel === 'MEDIUM'
              ? 'bg-yellow-50 border-yellow-200 text-yellow-950'
              : 'bg-slate-50 border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between font-semibold text-xs mb-1.5">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Vulnerability Triage & Risk Assessment
              </span>
              <span className="uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/70 border border-current text-[10px]">
                {record.riskLevel} Severity
              </span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1">
              {record.riskReasons.map((reason, i) => (
                <li key={i} className="leading-relaxed">{reason}</li>
              ))}
            </ul>
          </div>

          {/* DNS Records Section */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-600" />
              Technical DNS Records & Infrastructure
            </h4>
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-[11px] text-slate-200 space-y-2">
              <div>
                <span className="text-slate-400"># Hostname:</span> {record.subdomain}
              </div>
              <div>
                <span className="text-slate-400"># Status:</span>{' '}
                <span className={record.status === 'RESOLVED' ? 'text-emerald-400' : 'text-rose-400'}>
                  {record.status}
                </span>
              </div>
              {record.cnames.length > 0 && (
                <div>
                  <span className="text-indigo-400">CNAME &rarr;</span> {record.cnames.join(', ')}
                </div>
              )}
              {record.ips.length > 0 ? (
                <div>
                  <span className="text-emerald-400">A (IPv4) &rarr;</span> {record.ips.join(', ')}
                </div>
              ) : (
                <div className="text-slate-500">
                  A (IPv4): [No active IP address mapped]
                </div>
              )}
              {record.identifiedService && (
                <div>
                  <span className="text-amber-400">Detected Service:</span> {record.identifiedService}
                </div>
              )}
            </div>
          </div>

          {/* Remediation Guidance */}
          {record.remediation && (
            <div className="space-y-1.5 bg-indigo-50/50 border border-indigo-100 rounded-lg p-3.5">
              <h4 className="font-semibold text-indigo-900 text-xs flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-indigo-600" />
                Recommended Remediation for Security Report
              </h4>
              <p className="text-slate-700 leading-relaxed pl-5">
                {record.remediation}
              </p>
            </div>
          )}

          {/* Subdomain Takeover Context (If Applicable) */}
          {record.status === 'DANGLING_CNAME' && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 space-y-1">
              <h5 className="font-bold text-xs">Understanding Subdomain Takeover:</h5>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                When a DNS CNAME points to a cloud resource (like an AWS S3 bucket, Heroku app, or GitHub Pages site) that has been deleted or expired without removing the DNS record, the pointer becomes "dangling". Anyone can register that resource name on the provider and claim complete control over this subdomain, enabling phishing, credential theft, or cookie leakage.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopyDetails}
            className="px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied Raw JSON</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Finding Details</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
