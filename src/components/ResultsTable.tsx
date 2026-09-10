import React, { useState } from 'react';
import { Copy, Check, ExternalLink, AlertTriangle, ShieldAlert, Info, ArrowUpRight, Search } from 'lucide-react';
import { SubdomainRecord, RiskLevel, SubdomainStatus } from '../types';

interface ResultsTableProps {
  records: SubdomainRecord[];
  onSelectRecord: (record: SubdomainRecord) => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ records, onSelectRecord }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
            MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
            LOW
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            INFO
          </span>
        );
    }
  };

  const getStatusBadge = (status: SubdomainStatus) => {
    switch (status) {
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Resolved
          </span>
        );
      case 'DANGLING_CNAME':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Dangling CNAME
          </span>
        );
      case 'NXDOMAIN':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            NXDOMAIN
          </span>
        );
      case 'TIMEOUT':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-amber-600">
            Timeout
          </span>
        );
    }
  };

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
          <Search className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">No Subdomain Records Found</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          No records matched your search query or filter parameters. Try clearing filters or running a broader scan with both CT logs and wordlists enabled.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Subdomain Finding</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Severity</th>
              <th className="py-3 px-3">DNS Resolution / Target</th>
              <th className="py-3 px-3 hidden md:table-cell">Source</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {records.map((rec) => (
              <tr
                key={rec.id}
                onClick={() => onSelectRecord(rec)}
                className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                  rec.riskLevel === 'CRITICAL' ? 'bg-rose-50/20' : ''
                }`}
              >
                {/* Subdomain name & copy */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-slate-900 text-xs truncate max-w-[220px] sm:max-w-xs">
                      {rec.subdomain}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopy(rec.subdomain, rec.id, e)}
                      title="Copy subdomain to clipboard"
                      className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors"
                    >
                      {copiedId === rec.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  {rec.riskReasons.length > 0 && (
                    <div className="text-[11px] text-slate-500 truncate max-w-sm mt-0.5">
                      {rec.riskReasons[0]}
                    </div>
                  )}
                </td>

                {/* Status */}
                <td className="py-3 px-3 whitespace-nowrap">
                  {getStatusBadge(rec.status)}
                </td>

                {/* Risk Level */}
                <td className="py-3 px-3 whitespace-nowrap">
                  {getRiskBadge(rec.riskLevel)}
                </td>

                {/* DNS Resolution / CNAME */}
                <td className="py-3 px-3 max-w-xs">
                  {rec.cnames.length > 0 && (
                    <div className="text-[11px] font-mono text-indigo-700 truncate" title={`CNAME: ${rec.cnames.join(', ')}`}>
                      CNAME: {rec.cnames[0]}
                    </div>
                  )}
                  {rec.ips.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {rec.ips.slice(0, 2).map((ip) => (
                        <span key={ip} className="font-mono text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded border border-slate-200">
                          {ip}
                        </span>
                      ))}
                      {rec.ips.length > 2 && (
                        <span className="text-[10px] text-slate-400">+{rec.ips.length - 2} more</span>
                      )}
                    </div>
                  ) : rec.cnames.length === 0 ? (
                    <span className="text-slate-400 text-[11px]">No active DNS records</span>
                  ) : null}
                </td>

                {/* Source */}
                <td className="py-3 px-3 hidden md:table-cell whitespace-nowrap">
                  <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {rec.source}
                  </span>
                </td>

                {/* Inspect Action */}
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRecord(rec);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                  >
                    <span>Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
