import React from 'react';
import { Globe, Search, Building2, Flame, Users, Calendar, Settings, ShieldCheck, AlertCircle } from 'lucide-react';
import { ProviderConfig } from '../server/types.ts';

interface HeaderProps {
  activeTab: 'search' | 'businesses' | 'opportunities' | 'leads' | 'followups';
  setActiveTab: (tab: 'search' | 'businesses' | 'opportunities' | 'leads' | 'followups') => void;
  providers: ProviderConfig[];
  onOpenSettings: () => void;
  leadsCount: number;
  businessesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  providers,
  onOpenSettings,
  leadsCount,
  businessesCount,
}) => {
  const gProvider = providers.find((p) => p.providerName === 'google_places');
  const isGoogleOnline = gProvider?.status === 'ONLINE';

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('search')}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                GLOBAL WEBSITE OPPORTUNITY FINDER
              </span>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Evidence-Driven Business Intelligence</span>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'search'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Discovery</span>
            </button>

            <button
              onClick={() => setActiveTab('businesses')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'businesses'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Businesses</span>
              {businessesCount > 0 && (
                <span className="ml-1.5 px-2 py-0.5 text-xs bg-slate-800 text-slate-200 rounded-full font-mono">
                  {businessesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('opportunities')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'opportunities'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Opportunities</span>
            </button>

            <button
              onClick={() => setActiveTab('leads')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'leads'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Leads Pipeline</span>
              {leadsCount > 0 && (
                <span className="ml-1.5 px-2 py-0.5 text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full font-mono">
                  {leadsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('followups')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'followups'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Follow-ups</span>
            </button>
          </nav>

          {/* Right Status & Settings */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenSettings}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              title="Provider Integrations & Settings"
            >
              {isGoogleOnline ? (
                <div className="flex items-center space-x-1.5 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="font-mono">Google Places Live</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span className="font-mono">Config Provider</span>
                </div>
              )}
              <Settings className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>
          </div>
        </div>

        {/* Mobile Nav Tabs */}
        <div className="md:hidden flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1.5 rounded text-xs whitespace-nowrap ${
              activeTab === 'search' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Discovery
          </button>
          <button
            onClick={() => setActiveTab('businesses')}
            className={`px-3 py-1.5 rounded text-xs whitespace-nowrap ${
              activeTab === 'businesses' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Businesses ({businessesCount})
          </button>
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`px-3 py-1.5 rounded text-xs whitespace-nowrap ${
              activeTab === 'opportunities' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Opportunities
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-3 py-1.5 rounded text-xs whitespace-nowrap ${
              activeTab === 'leads' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Leads ({leadsCount})
          </button>
          <button
            onClick={() => setActiveTab('followups')}
            className={`px-3 py-1.5 rounded text-xs whitespace-nowrap ${
              activeTab === 'followups' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Follow-ups
          </button>
        </div>
      </div>
    </header>
  );
};
