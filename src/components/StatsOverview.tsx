import React from 'react';
import { ShieldCheck, AlertOctagon, CheckCircle, Clock, Server, Radio, HelpCircle } from 'lucide-react';
import { EnumerationSummary, SubdomainRecord } from '../types';

interface StatsOverviewProps {
  summary: EnumerationSummary;
  records: SubdomainRecord[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ summary, records }) => {
  const criticalCount = records.filter((r) => r.riskLevel === 'CRITICAL').length;
  const highRiskCount = records.filter((r) => r.riskLevel === 'HIGH').length;
  const danglingCount = records.filter((r) => r.status === 'DANGLING_CNAME').length;
  const resolvedCount = records.filter((r) => r.status === 'RESOLVED').length;

  return (
    <div className="space-y-3">
      {/* Top Banner with Scope & Execution Details */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Target Domain:</span>
          <span className="font-mono font-bold text-white text-sm">{summary.targetDomain}</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-medium text-[11px] border border-slate-700">
            {summary.methodUsed}
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-300">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{(summary.durationMs / 1000).toFixed(2)}s scan time</span>
          </div>
          {summary.wildcardDnsDetected && (
            <div className="flex items-center gap-1 text-amber-400" title={`Wildcard *.${summary.targetDomain} resolves to ${summary.wildcardIp}`}>
              <Radio className="w-3.5 h-3.5" />
              <span>Wildcard DNS Detected</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid of Statistical Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {/* Total Discovered */}
        <div className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Found</span>
            <Server className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{records.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Asset attack surface</div>
        </div>

        {/* Live Resolved */}
        <div className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Live Resolving</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{resolvedCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Valid DNS IPv4 records</div>
        </div>

        {/* Dangling CNAMEs (Subdomain Takeovers) */}
        <div className={`p-3.5 rounded-lg border shadow-2xs ${
          danglingCount > 0 ? 'bg-rose-50 border-rose-200 text-rose-950' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-medium ${danglingCount > 0 ? 'text-rose-800' : 'text-slate-500'}`}>
              Dangling CNAMEs
            </span>
            <AlertOctagon className={`w-4 h-4 ${danglingCount > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <div className={`text-2xl font-bold ${danglingCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
            {danglingCount}
          </div>
          <div className={`text-[11px] ${danglingCount > 0 ? 'text-rose-700 font-medium' : 'text-slate-500'} mt-0.5`}>
            {danglingCount > 0 ? 'Takeover vulnerability!' : 'No dangling pointers'}
          </div>
        </div>

        {/* High Risk / Exposed Endpoints */}
        <div className={`p-3.5 rounded-lg border shadow-2xs ${
          highRiskCount > 0 ? 'bg-amber-50 border-amber-200 text-amber-950' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-medium ${highRiskCount > 0 ? 'text-amber-800' : 'text-slate-500'}`}>
              Sensitive Panels
            </span>
            <ShieldCheck className={`w-4 h-4 ${highRiskCount > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <div className={`text-2xl font-bold ${highRiskCount > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
            {highRiskCount + criticalCount}
          </div>
          <div className={`text-[11px] ${highRiskCount > 0 ? 'text-amber-700 font-medium' : 'text-slate-500'} mt-0.5`}>
            Staging, admin, or API
          </div>
        </div>

        {/* Inactive Records */}
        <div className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Inactive / History</span>
            <HelpCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-700">
            {records.filter((r) => r.status === 'NXDOMAIN').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Historical CT logs</div>
        </div>
      </div>
    </div>
  );
};
