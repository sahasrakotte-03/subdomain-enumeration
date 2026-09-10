import React from 'react';
import { Shield, ShieldAlert, BookOpen, SearchCode, ExternalLink } from 'lucide-react';

interface HeaderProps {
  activeTab: 'recon' | 'docs';
  setActiveTab: (tab: 'recon' | 'docs') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
                  Subdomain Enumeration
                </h1>
                <span className="px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                  Project 5 Prototype
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Authorized Reconnaissance & Vulnerability Assessment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Only assess domains you own or have written authorization to test</span>
            </div>

            <nav className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button
                id="tab-recon-btn"
                type="button"
                onClick={() => setActiveTab('recon')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'recon'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <SearchCode className="w-4 h-4" />
                <span>Enumeration</span>
              </button>
              <button
                id="tab-docs-btn"
                type="button"
                onClick={() => setActiveTab('docs')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'docs'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Documentation</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};
