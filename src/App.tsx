import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { DomainInput } from './components/DomainInput';
import { StatsOverview } from './components/StatsOverview';
import { FilterBar } from './components/FilterBar';
import { ResultsTable } from './components/ResultsTable';
import { RecordDetailModal } from './components/RecordDetailModal';
import { ReportModal } from './components/ReportModal';
import { DocumentationSection } from './components/DocumentationSection';
import { ErrorAlert } from './components/ErrorAlert';
import { SubdomainRecord, EnumerationSummary, ScanOptions, RiskLevel } from './types';
import { performEnumeration } from './utils/enumerationService';
import { exportToCsv, exportToJson, generateMarkdownReport } from './utils/exportUtils';
import { AlertCircle, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'recon' | 'docs'>('recon');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [records, setRecords] = useState<SubdomainRecord[]>([]);
  const [summary, setSummary] = useState<EnumerationSummary | null>(null);
  const [lastDomain, setLastDomain] = useState<string>('demo-corp.internal');
  const [lastOptions, setLastOptions] = useState<ScanOptions>({
    includeCertTransparency: true,
    includeWordlist: true,
    checkDanglingCname: true,
    checkWildcard: true,
    concurrencyLimit: 15,
  });

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');

  // Modals state
  const [selectedRecord, setSelectedRecord] = useState<SubdomainRecord | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Initial demonstration load
  useEffect(() => {
    handleScan('demo-corp.internal', lastOptions);
  }, []);

  const handleScan = async (domainToScan: string, options: ScanOptions) => {
    setIsLoading(true);
    setError(null);
    setWarnings([]);
    setLastDomain(domainToScan);
    setLastOptions(options);

    try {
      const data = await performEnumeration(domainToScan, options);
      setRecords(data.records);
      setSummary(data.summary);
      if (data.warnings && data.warnings.length > 0) {
        setWarnings(data.warnings);
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(err.message || 'An error occurred during subdomain enumeration.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered and searched records memoization
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSub = rec.subdomain.toLowerCase().includes(q);
        const matchesIp = rec.ips.some((ip) => ip.includes(q));
        const matchesCname = rec.cnames.some((c) => c.toLowerCase().includes(q));
        const matchesService = rec.identifiedService?.toLowerCase().includes(q);
        const matchesReason = rec.riskReasons.some((r) => r.toLowerCase().includes(q));
        if (!matchesSub && !matchesIp && !matchesCname && !matchesService && !matchesReason) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'ALL' && rec.status !== statusFilter) {
        return false;
      }

      // Risk level filter
      if (riskFilter === 'CRITICAL_HIGH') {
        if (rec.riskLevel !== 'CRITICAL' && rec.riskLevel !== 'HIGH') return false;
      } else if (riskFilter === 'LOW_INFO') {
        if (rec.riskLevel !== 'LOW' && rec.riskLevel !== 'INFO') return false;
      } else if (riskFilter !== 'ALL' && rec.riskLevel !== riskFilter) {
        return false;
      }

      // Source filter
      if (sourceFilter !== 'ALL' && rec.source !== sourceFilter) {
        return false;
      }

      return true;
    });
  }, [records, searchQuery, statusFilter, riskFilter, sourceFilter]);

  // Export handlers
  const handleExportCsv = () => {
    exportToCsv(filteredRecords, summary);
  };

  const handleExportJson = () => {
    exportToJson(filteredRecords, summary);
  };

  const reportMarkdown = useMemo(() => {
    return generateMarkdownReport(filteredRecords, summary);
  }, [filteredRecords, summary]);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Global Navigation Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {activeTab === 'recon' ? (
          <>
            {/* Input & Methodology Section */}
            <section aria-label="Domain Input Section">
              <DomainInput onStartScan={handleScan} isLoading={isLoading} />
            </section>

            {/* Error Notification Banner */}
            {error && (
              <ErrorAlert
                error={error}
                onRetry={() => handleScan(lastDomain, lastOptions)}
                onLoadDemo={() => handleScan('demo-corp.internal', lastOptions)}
                onDismiss={() => setError(null)}
              />
            )}

            {/* Scan Warnings or Service Info */}
            {warnings.length > 0 && !error && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  {warnings.map((w, idx) => (
                    <div key={idx}>{w}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Assessment Statistics Overview */}
            {summary && (
              <section aria-label="Reconnaissance Metrics">
                <StatsOverview summary={summary} records={records} />
              </section>
            )}

            {/* Filtering, Search & Export Bar */}
            {records.length > 0 && (
              <section aria-label="Result Filters and Export Controls">
                <FilterBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  riskFilter={riskFilter}
                  setRiskFilter={setRiskFilter}
                  sourceFilter={sourceFilter}
                  setSourceFilter={setSourceFilter}
                  onExportCsv={handleExportCsv}
                  onExportJson={handleExportJson}
                  onOpenReportModal={() => setIsReportModalOpen(true)}
                  totalFilteredCount={filteredRecords.length}
                />
              </section>
            )}

            {/* Subdomain Findings Table */}
            {records.length > 0 && (
              <section aria-label="Enumeration Results Table">
                <ResultsTable
                  records={filteredRecords}
                  onSelectRecord={(rec) => setSelectedRecord(rec)}
                />
              </section>
            )}
          </>
        ) : (
          /* Documentation & Educational How It Works View */
          <DocumentationSection />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Project 5 Prototype:</span>
            <span>Subdomain Enumeration & Vulnerability Assessment</span>
          </div>
          <div className="text-[11px] text-slate-400">
            For authorized testing, educational demonstrations, and vulnerability reporting only.
          </div>
        </div>
      </footer>

      {/* Detail Inspection Modal */}
      <RecordDetailModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />

      {/* Vulnerability Report Markdown Modal */}
      {isReportModalOpen && (
        <ReportModal
          reportMarkdown={reportMarkdown}
          targetDomain={summary?.targetDomain || 'Target Domain'}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}
    </div>
  );
}
