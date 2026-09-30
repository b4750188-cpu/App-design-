import React from 'react';
import { Building2, Globe, ShieldAlert, Smartphone, Users, MapPin } from 'lucide-react';
import { StatsResponse } from '../types/client.ts';

interface StatsOverviewProps {
  stats: StatsResponse | null;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
      {/* 1. Total Businesses */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Discovered</span>
          <Building2 className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-white">{stats.totalBusinesses}</div>
        <div className="text-[11px] text-slate-400 mt-1">Real verified entities</div>
      </div>

      {/* 2. No Website Detected */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">No Website URI</span>
          <Globe className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-amber-300">{stats.noWebsiteCount}</div>
        <div className="text-[11px] text-slate-400 mt-1">
          {stats.noWebsiteRate}% of discovered
        </div>
      </div>

      {/* 3. Insecure HTTP */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">No HTTPS</span>
          <ShieldAlert className="w-4 h-4 text-red-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-red-300">{stats.insecureHttpCount}</div>
        <div className="text-[11px] text-slate-400 mt-1">Unencrypted HTTP</div>
      </div>

      {/* 4. Missing Viewport */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Mobile Deficit</span>
          <Smartphone className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-amber-300">{stats.mobileIssuesCount}</div>
        <div className="text-[11px] text-slate-400 mt-1">No mobile viewport</div>
      </div>

      {/* 5. Active Leads */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Pipeline Leads</span>
          <Users className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-emerald-300">{stats.totalLeads}</div>
        <div className="text-[11px] text-slate-400 mt-1">Saved for outreach</div>
      </div>

      {/* 6. Countries Represented */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Countries</span>
          <MapPin className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-cyan-300">
          {stats.countriesRepresented.length || 0}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Global coverage</div>
      </div>
    </div>
  );
};
