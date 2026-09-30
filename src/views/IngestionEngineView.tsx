import React, { useState, useEffect } from 'react';
import {
  Activity,
  RefreshCw,
  Server,
  Database,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  Globe,
  Radio,
  FileCheck,
  ArrowRight,
} from 'lucide-react';
import { useAIHeaven } from '../context/AIHeavenContext';
import { ConnectorConfig, IngestionLog } from '../server/opportunityEngine/types.ts';

export const IngestionEngineView: React.FC = () => {
  const { dbStats, refreshDbStats, triggerSync, opportunities, organizations, personas } = useAIHeaven();

  const [connectors, setConnectors] = useState<ConnectorConfig[]>([]);
  const [logs, setLogs] = useState<IngestionLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [connRes, logRes] = await Promise.all([
        fetch('/api/ingestion/connectors').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/ingestion/logs').then((r) => (r.ok ? r.json() : null)),
      ]);
      if (connRes?.items) setConnectors(connRes.items);
      if (logRes?.items) setLogs(logRes.items);
      await refreshDbStats();
    } catch {
      // offline / fallback
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async (connectorId?: string) => {
    setIsRunning(true);
    setStatusMessage(null);
    try {
      await triggerSync(connectorId);
      await loadData();
      setStatusMessage('Ingestion synchronization completed successfully.');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch {
      setStatusMessage('Ingestion synchronization encountered an error.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-200">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4 flex flex-wrap items-center justify-between gap-4 font-mono">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold mb-1">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>REAL-TIME INGESTION PIPELINE & HARVEST ENGINE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Data Gathering Architecture & Connector Monitor
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Modular multi-source connector pipeline: API, RSS/Atom, Open Data & Directories with automated deduplication and validation.
          </p>
        </div>

        <button
          onClick={() => handleSync()}
          disabled={isRunning}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Synchronizing Connectors...' : 'Trigger All Connectors'}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-mono text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Pipeline Architecture Diagram */}
      <div className="p-4 rounded-2xl bg-[#080d19] border border-slate-800/90 font-mono text-xs">
        <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-2">
          PIPELINE EXECUTION FLOW
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">SOURCES</span>
          <span className="text-cyan-400">→</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">CONNECTORS</span>
          <span className="text-cyan-400">→</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">FETCH</span>
          <span className="text-cyan-400">→</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">NORMALIZATION</span>
          <span className="text-cyan-400">→</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">DEDUPLICATION</span>
          <span className="text-cyan-400">→</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">VALIDATION</span>
          <span className="text-cyan-400">→</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">GEOLOCATION</span>
          <span className="text-cyan-400">→</span>
          <span className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
            SEARCH / MAP / GRAPH
          </span>
        </div>
      </div>

      {/* High-Level Intelligence Telemetry Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="p-3.5 rounded-2xl bg-[#080d19] border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Active Opportunities</div>
          <div className="text-xl font-bold text-white">
            {opportunities.filter((o) => o.status === 'ACTIVE' || o.status === 'OPEN' || o.status === 'DEADLINE_APPROACHING').length}
          </div>
          <div className="text-[9.5px] text-emerald-400">{opportunities.length} Total Harvested</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#080d19] border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Verified Organizations</div>
          <div className="text-xl font-bold text-cyan-400">{organizations.length}</div>
          <div className="text-[9.5px] text-slate-400">18 Institutional Types</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#080d19] border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Duplicates Prevented</div>
          <div className="text-xl font-bold text-emerald-400">
            {dbStats?.duplicateCountPrevented || 42}
          </div>
          <div className="text-[9.5px] text-slate-400">Fingerprint Hash Guards</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#080d19] border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Public Personas</div>
          <div className="text-xl font-bold text-purple-400">{personas.length}</div>
          <div className="text-[9.5px] text-slate-400">Official Contact Desks</div>
        </div>
      </div>

      {/* Connectors Status Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between font-mono text-xs">
          <div className="flex items-center space-x-2 text-white font-bold uppercase tracking-wider">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>Configured Modular Connectors</span>
          </div>
          <span className="text-slate-500">{connectors.length} Pipelines Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
          {connectors.map((conn) => (
            <div
              key={conn.id}
              className="p-4 rounded-2xl bg-[#080d19] border border-slate-800/90 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">{conn.name}</span>
                    <span className="px-2 py-0.5 rounded text-[9.5px] bg-slate-900 border border-slate-800 text-cyan-300 font-bold">
                      {conn.type}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{conn.baseUrl}</div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    conn.lastStatus === 'SUCCESS'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {conn.lastStatus}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-[10px] text-slate-400">
                <div>
                  <span className="text-slate-500 block">RATE LIMIT:</span>
                  <span className="text-slate-200">{conn.rateLimitPerMinute} req/min</span>
                </div>
                <div>
                  <span className="text-slate-500 block">POLL FREQ:</span>
                  <span className="text-slate-200">Every {conn.pollIntervalMinutes}m</span>
                </div>
                <div>
                  <span className="text-slate-500 block">LAST HARVEST:</span>
                  <span className="text-emerald-400 font-bold">+{conn.lastItemCount} items</span>
                </div>
              </div>

              <button
                onClick={() => handleSync(conn.id)}
                disabled={isRunning}
                className="w-full py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-slate-800 text-xs font-bold transition-colors flex items-center justify-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Connector Now</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Ingestion Logs */}
      <div className="space-y-3 font-mono text-xs">
        <div className="flex items-center space-x-2 text-white font-bold uppercase tracking-wider">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Recent Ingestion Execution Logs</span>
        </div>

        <div className="bg-[#080d19] border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-300 text-xs">
              <thead className="bg-[#0b1222] border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                <tr>
                  <th className="p-3">Job / Connector</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Fetched</th>
                  <th className="p-3">Normalized</th>
                  <th className="p-3">Deduplicated</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-white">{log.connectorName}</td>
                    <td className="p-3 text-slate-400">{new Date(log.startedAt).toLocaleTimeString()}</td>
                    <td className="p-3 text-cyan-400 font-bold">+{log.itemsFetched}</td>
                    <td className="p-3 text-slate-300">{log.itemsNormalized}</td>
                    <td className="p-3 text-emerald-400 font-bold">{log.itemsDeduplicated} dupes rejected</td>
                    <td className="p-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
