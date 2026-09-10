import React, { useState } from 'react';
import { Search, SlidersHorizontal, CheckCircle2, AlertTriangle, Globe, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { ScanOptions } from '../types';

interface DomainInputProps {
  onStartScan: (domain: string, options: ScanOptions) => void;
  isLoading: boolean;
}

export const DomainInput: React.FC<DomainInputProps> = ({ onStartScan, isLoading }) => {
  const [domain, setDomain] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [options, setOptions] = useState<ScanOptions>({
    includeCertTransparency: true,
    includeWordlist: true,
    checkDanglingCname: true,
    checkWildcard: true,
    concurrencyLimit: 15,
  });

  const PRESETS = [
    { label: 'Demo Vulnerable Target', value: 'demo-corp.internal', badge: 'Dangling CNAMEs & Staging' },
    { label: 'OWASP.org', value: 'owasp.org', badge: 'Live Target' },
    { label: 'Mozilla.org', value: 'mozilla.org', badge: 'Live Target' },
    { label: 'Example.com', value: 'example.com', badge: 'RFC 2606' },
  ];

  const cleanDomainString = (input: string) => {
    return input
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//i, '')
      .split('/')[0]
      .split(':')[0]
      .replace(/^\.+|\.+$/g, '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleaned = cleanDomainString(domain);

    if (!cleaned) {
      setValidationError('Please enter a domain name to evaluate (e.g., example.com).');
      return;
    }

    // Standard FQDN validation regex
    const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i;
    if (!domainRegex.test(cleaned) && cleaned !== 'localhost') {
      setValidationError('Invalid domain format. Enter a valid domain name without protocol or paths (e.g. example.com).');
      return;
    }

    if (!isAuthorized) {
      setValidationError('Authorization acknowledgment is required before starting security enumeration.');
      return;
    }

    onStartScan(cleaned, options);
  };

  const handleSelectPreset = (presetValue: string) => {
    setDomain(presetValue);
    setValidationError(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 transition-all">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Domain Input Bar */}
        <div>
          <label htmlFor="domain-input-field" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Target Domain Assessment Scope
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-5 h-5" />
              </div>
              <input
                id="domain-input-field"
                type="text"
                value={domain}
                onChange={(e) => {
                  setDomain(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="e.g. example.com, owasp.org, or demo-corp.internal"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                id="options-toggle-btn"
                type="button"
                onClick={() => setShowOptions(!showOptions)}
                className={`px-3 py-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  showOptions
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
                title="Configure enumeration parameters"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Methodology</span>
              </button>

              <button
                id="start-enumeration-btn"
                type="submit"
                disabled={isLoading}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-300" />
                    <span>Enumerating...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-indigo-400" />
                    <span>Start Enumeration</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Validation error display */}
        {validationError && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Authorization checkbox */}
        <div className="flex items-start gap-2.5 pt-1">
          <input
            id="auth-agreement-checkbox"
            type="checkbox"
            checked={isAuthorized}
            onChange={(e) => setIsAuthorized(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <label htmlFor="auth-agreement-checkbox" className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none">
            <span className="font-semibold text-slate-800">Authorization Acknowledgment:</span> I confirm that I own this domain or have explicit written permission from the asset owner to perform security reconnaissance and vulnerability assessment.
          </label>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Presets:
          </span>
          {PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => handleSelectPreset(preset.value)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-colors border ${
                domain === preset.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-800 font-semibold'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{preset.value}</span>
              <span className="text-[10px] text-slate-400">({preset.badge})</span>
            </button>
          ))}
        </div>

        {/* Advanced Options Accordion */}
        {showOptions && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 mt-3">
            <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Enumeration Techniques & Vulnerability Probes
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2.5 p-2 bg-white rounded-md border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeCertTransparency}
                  onChange={(e) => setOptions({ ...options, includeCertTransparency: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-medium text-slate-900 block">Certificate Transparency (CT Logs)</span>
                  <span className="text-slate-500 text-[11px]">Passive OSINT query via public RFC 6962 append-only logs</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2 bg-white rounded-md border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeWordlist}
                  onChange={(e) => setOptions({ ...options, includeWordlist: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-medium text-slate-900 block">DNS Wordlist Permutations</span>
                  <span className="text-slate-500 text-[11px]">Active resolution of common prefixes (api, dev, admin, vpn, mail)</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2 bg-white rounded-md border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.checkDanglingCname}
                  onChange={(e) => setOptions({ ...options, checkDanglingCname: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-medium text-slate-900 block">Dangling CNAME Takeover Check</span>
                  <span className="text-slate-500 text-[11px]">Detect pointers to dead AWS S3, GitHub Pages, Heroku, Azure</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2 bg-white rounded-md border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.checkWildcard}
                  onChange={(e) => setOptions({ ...options, checkWildcard: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-medium text-slate-900 block">Wildcard DNS Detection</span>
                  <span className="text-slate-500 text-[11px]">Probe synthetic non-existent subdomain to filter false positives</span>
                </div>
              </label>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
