import React, { useState } from 'react';
import { Bot, Terminal, Play, Copy, Check, ShieldCheck, Database, Layers } from 'lucide-react';
import { AGENT_API_ENDPOINTS } from '../data/aiEcosystemData';
import { AgentApiEndpoint } from '../types/aiHeaven';
import { useAIHeaven } from '../context/AIHeavenContext';

export const AgentsView: React.FC = () => {
  const { entities } = useAIHeaven();

  const [selectedEndpoint, setSelectedEndpoint] = useState<AgentApiEndpoint>(AGENT_API_ENDPOINTS[0]);
  const [paramValues, setParamValues] = useState<Record<string, string>>({
    category: 'model',
    minTrust: '95',
  });
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExecute = () => {
    setIsExecuting(true);
    setTimeout(() => {
      let responseData: any = selectedEndpoint.exampleResponse;

      // Dynamic demo matching
      if (selectedEndpoint.id === 'ep_discover') {
        const cat = paramValues['category'] || 'model';
        const filtered = entities.filter((e) => (cat === 'all' ? true : e.category === cat));
        responseData = {
          status: 'success',
          endpoint: '/api/v1/discover',
          totalCount: filtered.length,
          timestamp: new Date().toISOString(),
          results: filtered.map((e) => ({
            id: e.id,
            name: e.name,
            category: e.category,
            trustScore: e.trustScore,
            license: e.license,
            version: e.version,
          })),
        };
      }

      setExecutionResult(JSON.stringify(responseData, null, 2));
      setIsExecuting(false);
    }, 400);
  };

  const curlSnippet = `curl -X ${selectedEndpoint.method} "https://aiheaven.global${selectedEndpoint.path}" \\
  -H "Authorization: Bearer aih_demo_key_2026" \\
  -H "Content-Type: application/json"`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-200">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4 font-mono">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold mb-1">
          <Bot className="w-4 h-4" />
          <span>MACHINE-TO-MACHINE AGENT COMMAND</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Autonomous Agent Interface & OpenAPI Registry</h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">
          Standardized machine interfaces enabling external AI agents to query the knowledge graph, verify model weights, and resolve dependencies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-mono text-xs">
        {/* Endpoint Selector Sidebar */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-[10px] text-slate-500 uppercase font-bold">AVAILABLE AGENT ENDPOINTS</div>
          <div className="space-y-1.5">
            {AGENT_API_ENDPOINTS.map((ep) => {
              const isSelected = selectedEndpoint.id === ep.id;
              return (
                <div
                  key={ep.id}
                  onClick={() => {
                    setSelectedEndpoint(ep);
                    setExecutionResult(null);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all space-y-1 ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-700/80 text-cyan-200 shadow-md'
                      : 'bg-[#090d18] border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-[9px] font-bold text-emerald-400">
                      {ep.method}
                    </span>
                    <span className="font-bold text-xs truncate">{ep.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans line-clamp-1">{ep.description}</div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-400 space-y-1">
            <div className="text-cyan-400 font-bold">AGENT AUTHENTICATION</div>
            <div>Supports Bearer token headers and Ed25519 payload signatures for verifiable agent audit logs.</div>
          </div>
        </div>

        {/* Endpoint Interactive Harness */}
        <div className="lg:col-span-8 space-y-4">
          {/* Endpoint Details Card */}
          <div className="p-4 rounded-xl bg-[#090d18] border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2 text-sm">
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold">
                  {selectedEndpoint.method}
                </span>
                <span className="font-bold text-white">{selectedEndpoint.path}</span>
              </div>

              <button
                onClick={handleCopyCurl}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px]"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied cURL' : 'Copy cURL'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 font-sans">{selectedEndpoint.description}</p>

            {/* Parameter Inputs Form */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="text-[10px] text-slate-500 uppercase font-bold">PARAMETERS & SCHEMA:</div>
              <div className="space-y-2">
                {selectedEndpoint.parameters.map((param) => (
                  <div key={param.name} className="flex flex-col sm:grid sm:grid-cols-12 gap-1.5 sm:gap-2 sm:items-center text-[11px]">
                    <div className="sm:col-span-4 text-slate-300 font-bold truncate">
                      {param.name} {param.required && <span className="text-red-400">*</span>}
                      <span className="text-slate-500 font-normal text-[10px] ml-1">({param.type})</span>
                    </div>
                    <div className="sm:col-span-8">
                      <input
                        type="text"
                        value={paramValues[param.name] ?? param.example}
                        onChange={(e) => setParamValues({ ...paramValues, [param.name]: e.target.value })}
                        placeholder={param.description}
                        className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1 text-white text-xs outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Harness Action */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>{isExecuting ? 'Simulating API Call...' : 'Execute Test Request'}</span>
              </button>
            </div>
          </div>

          {/* Response Payload Display */}
          <div className="p-4 rounded-xl bg-[#050810] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>LIVE RESPONSE EMULATOR</span>
              </span>
              <span className="text-emerald-400">STATUS: 200 OK</span>
            </div>

            <pre className="p-3 rounded bg-slate-950 border border-slate-900 text-slate-200 overflow-x-auto text-[11px] leading-relaxed max-h-72">
              {executionResult || JSON.stringify(selectedEndpoint.exampleResponse, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
