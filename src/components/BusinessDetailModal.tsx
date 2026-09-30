import React, { useState, useEffect } from 'react';
import {
  X,
  Globe,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Clock,
  RefreshCw,
  UserCheck,
  Send,
  Sliders,
  Code,
  Layers,
  Sparkles,
  Share2,
} from 'lucide-react';
import { FullProfileResponse, EnrichedBusiness } from '../types/client.ts';
import { LeadStatus, ContactMethod } from '../server/types.ts';

interface BusinessDetailModalProps {
  businessId: string;
  onClose: () => void;
  onRunAudit: (id: string) => Promise<void>;
  onRescan: (id: string, mode: 'FULL' | 'WEBSITE_ONLY' | 'CONTACTS_ONLY' | 'SOCIAL_ONLY') => Promise<void>;
  onSaveLead: (businessId: string, status: LeadStatus, priority: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW') => Promise<void>;
  onAddNote: (leadId: string, content: string) => Promise<void>;
  onLogContact: (
    leadId: string,
    data: {
      date: string;
      time: string;
      method: ContactMethod;
      notes: string;
      outcome: 'NO_ANSWER' | 'GATEKEEPER' | 'INTERESTED' | 'NOT_INTERESTED' | 'REQUESTED_PROPOSAL' | 'SCHEDULED_CALL' | 'COMPLETED';
      nextFollowUp?: string;
    }
  ) => Promise<void>;
}

export const BusinessDetailModal: React.FC<BusinessDetailModalProps> = ({
  businessId,
  onClose,
  onRunAudit,
  onRescan,
  onSaveLead,
  onAddNote,
  onLogContact,
}) => {
  const [profile, setProfile] = useState<FullProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'evidence' | 'audit' | 'industry' | 'social' | 'outreach' | 'history' | 'raw'>('evidence');
  const [auditRunning, setAuditRunning] = useState(false);
  const [rescanRunning, setRescanRunning] = useState(false);

  // Outreach form state
  const [outreachMethod, setOutreachMethod] = useState<ContactMethod>('phone');
  const [outreachNotes, setOutreachNotes] = useState('');
  const [outreachOutcome, setOutreachOutcome] = useState<'NO_ANSWER' | 'GATEKEEPER' | 'INTERESTED' | 'NOT_INTERESTED' | 'REQUESTED_PROPOSAL' | 'SCHEDULED_CALL' | 'COMPLETED'>('INTERESTED');
  const [outreachFollowUp, setOutreachFollowUp] = useState('');
  const [newNote, setNewNote] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/businesses/${businessId}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [businessId]);

  const handleAuditClick = async () => {
    setAuditRunning(true);
    await onRunAudit(businessId);
    await fetchProfile();
    setAuditRunning(false);
  };

  const handleRescanClick = async () => {
    setRescanRunning(true);
    await onRescan(businessId, 'FULL');
    await fetchProfile();
    setRescanRunning(false);
  };

  const handleOutreachSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.lead) return;

    await onLogContact(profile.lead.id, {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      method: outreachMethod,
      notes: outreachNotes,
      outcome: outreachOutcome,
      nextFollowUp: outreachFollowUp || undefined,
    });

    setOutreachNotes('');
    setOutreachFollowUp('');
    await fetchProfile();
  };

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.lead || !newNote.trim()) return;

    await onAddNote(profile.lead.id, newNote.trim());
    setNewNote('');
    await fetchProfile();
  };

  if (loading || !profile) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-sm w-full text-center text-slate-300">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <span>Loading verified establishment profile...</span>
        </div>
      </div>
    );
  }

  const { business, location, contacts, website, latestAudit, opportunities, evidence, lead, socials, snapshots, changeEvents } = profile;
  const hasWebsite = business.websiteStatus === 'WEBSITE_DETECTED' && website?.originalUrl;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/80">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="text-xs uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {business.primaryCategory.replace(/_/g, ' ')}
              </span>
              {hasWebsite ? (
                <span className="inline-flex items-center space-x-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Website Detected</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 text-xs px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Website Not Detected from Provider</span>
                </span>
              )}
              {business.confidence && (
                <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 bg-slate-900 rounded border border-slate-800">
                  Confidence: {business.confidence}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{business.name}</h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-2">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{location?.formattedAddress || 'Address Not Available'}</span>
              </div>
              {hasWebsite && (
                <a
                  href={website?.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 underline"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{website?.domain}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Contact Channels Bar */}
            {contacts.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-300 mt-2.5 pt-2 border-t border-slate-800/80">
                {contacts.map((c) => (
                  <div key={c.id} className="flex items-center space-x-1.5">
                    {c.contactType === 'phone' || c.contactType === 'international_phone' ? (
                      <Phone className="w-3.5 h-3.5 text-indigo-400" />
                    ) : c.contactType === 'email' ? (
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span className="font-mono">{c.value}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
                      {c.source}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Conflicting Contact Information Warning */}
            {contacts.some((c) => c.hasConflict) && (
              <div className="mt-3 p-3 rounded-xl bg-amber-950/80 border border-amber-800 text-xs text-amber-200 space-y-1">
                <div className="font-bold flex items-center space-x-1.5 text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>CONFLICTING CONTACT INFORMATION DETECTED</span>
                </div>
                <div className="text-[11px] text-amber-200/90">
                  {contacts
                    .filter((c) => c.hasConflict && c.conflictingSources)
                    .map((c, i) => (
                      <div key={i} className="pl-5 space-y-0.5 mt-1">
                        <div>Type: <span className="font-mono font-semibold">{c.contactType}</span></div>
                        {c.conflictingSources?.map((src, sIdx) => (
                          <div key={sIdx} className="font-mono text-slate-300">
                            Source {sIdx === 0 ? 'A' : 'B'} ({src.source}): <span className="text-white font-semibold">{src.value}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  <div className="text-[10px] text-amber-400 mt-1 pl-5">
                    User should verify before contacting.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRescanClick}
              disabled={rescanRunning}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Rescan & Check for Changes"
            >
              <RefreshCw className={`w-4 h-4 ${rescanRunning ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 px-6 border-b border-slate-800 bg-slate-900 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'evidence'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Opportunities ({opportunities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'audit'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Website Audit</span>
            {latestAudit?.status && (
              <span className="ml-1 px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono">
                {latestAudit.status}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('industry')}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'industry'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Industry Blueprint</span>
          </button>

          <button
            onClick={() => setActiveTab('social')}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'social'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Socials ({socials.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('outreach')}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'outreach'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Lead & Outreach</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>History & Diffs ({changeEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('raw')}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'raw'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Raw vs Normalized</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Opportunities & Evidence */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                  Evidence-Driven Modernization Opportunities
                </h3>
                <span className="text-xs text-slate-500">
                  Strictly verified observations — No arbitrary scores
                </span>
              </div>

              {opportunities.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
                  No opportunities identified yet. Run a website audit to inspect technical and conversion signals.
                </div>
              ) : (
                <div className="space-y-4">
                  {opportunities.map((opp) => (
                    <div
                      key={opp.id}
                      className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              opp.severity === 'HIGH'
                                ? 'bg-red-500'
                                : opp.severity === 'MEDIUM'
                                ? 'bg-amber-400'
                                : 'bg-blue-400'
                            }`}
                          />
                          <h4 className="font-bold text-slate-100 text-base">{opp.title}</h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                            Confidence: {opp.confidence}
                          </span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 font-mono">
                            {opp.type}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{opp.reasoning}</p>

                      {opp.recommendedFeatures.length > 0 && (
                        <div>
                          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                            Recommended Modernization Actions:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {opp.recommendedFeatures.map((feat, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 text-indigo-200 border border-indigo-950/80 font-medium"
                              >
                                + {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Associated Evidence Log */}
                      <div className="pt-3 border-t border-slate-900">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          Supporting Verified Evidence:
                        </div>
                        <div className="space-y-1.5">
                          {evidence
                            .filter((e) => e.opportunityId === opp.id)
                            .map((ev) => (
                              <div
                                key={ev.id}
                                className="text-xs p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-4"
                              >
                                <div>
                                  <span className="font-semibold text-slate-200">{ev.testName}: </span>
                                  <span className="text-slate-300">{ev.evidenceText}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 shrink-0 font-mono text-right">
                                  <div>Source: {ev.source}</div>
                                  <div>{new Date(ev.observedAt).toLocaleTimeString()}</div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Website Audit */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                    SSRF-Safe Automated Technical Audit
                  </h3>
                  <p className="text-xs text-slate-500">
                    Safe non-destructive crawler checks DNS, SSL, Viewport, SEO tags, forms, and response time.
                  </p>
                </div>

                {hasWebsite && (
                  <button
                    onClick={handleAuditClick}
                    disabled={auditRunning}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{auditRunning ? 'Crawling & Auditing...' : 'Run Safe Live Audit Now'}</span>
                  </button>
                )}
              </div>

              {!hasWebsite ? (
                <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-300">No Website Detected From Provider</p>
                  <p className="text-xs text-slate-500 mt-1">
                    An audit cannot be executed because no website URI was returned for this establishment.
                  </p>
                </div>
              ) : !latestAudit ? (
                <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
                  <Globe className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-300">Audit Not Yet Executed</p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Target website: <span className="font-mono text-indigo-300">{website.originalUrl}</span>
                  </p>
                  <button
                    onClick={handleAuditClick}
                    disabled={auditRunning}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                  >
                    <span>Execute First Audit</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">HTTP Status</div>
                      <div className="text-lg font-bold font-mono text-slate-100 mt-0.5">
                        {latestAudit.httpStatus || 'N/A'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {latestAudit.httpsEnforced ? 'HTTPS Enforced' : 'Insecure HTTP'}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Mobile Viewport</div>
                      <div
                        className={`text-lg font-bold font-mono mt-0.5 ${
                          latestAudit.hasViewportMeta ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {latestAudit.hasViewportMeta ? 'PASS' : 'MISSING'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {latestAudit.hasViewportMeta ? 'Mobile-ready tag' : 'Needs viewport meta'}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Response Time</div>
                      <div className="text-lg font-bold font-mono text-slate-100 mt-0.5">
                        {latestAudit.ttfbMs ? `${latestAudit.ttfbMs} ms` : 'N/A'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">Measured server TTFB</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Conversion Form</div>
                      <div
                        className={`text-lg font-bold font-mono mt-0.5 ${
                          latestAudit.hasContactForm ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {latestAudit.hasContactForm ? 'FOUND' : 'NOT DETECTED'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {latestAudit.hasClickToCall ? 'tel: link detected' : 'No tel: link'}
                      </div>
                    </div>
                  </div>

                  {/* Audit Evidence Log */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
                      Complete Test Evidence Log ({latestAudit.evidenceLog.length} tests)
                    </h4>
                    <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800/80">
                      {latestAudit.evidenceLog.map((item, idx) => (
                        <div key={idx} className="p-3 flex items-start justify-between text-xs gap-4">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-200">{item.test}: </span>
                            <span className="text-slate-300">{item.result}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 shrink-0 font-mono text-right">
                            <span>{item.source}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Industry & Modernization Blueprint */}
          {activeTab === 'industry' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-800/50">
                <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Custom Industry Analysis Engine</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-1">
                  Tailored Needs for {business.primaryCategory.replace(/_/g, ' ')}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Different business verticals require distinct conversion workflows. The system compares
                  currently detected features against what clients in this specific industry expect.
                </p>
              </div>

              {/* Recommended Website Types */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
                  Recommended Website Architectures
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-xs font-bold text-slate-200 mb-1">Modern Lead Generation Website</div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Optimized for local search with prominent click-to-call, service breakdowns, customer reviews,
                      and simple mobile contact capture.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-xs font-bold text-slate-200 mb-1">Interactive Booking / Inquiry Portal</div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Enables visitors to select services, request consultations or reservations, and receive
                      immediate confirmation without phone bottlenecks.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Social Channels */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                  Verified Social Channels & Attribution
                </h3>
                <span className="text-xs text-slate-500">
                  Never matched on vague names alone — Requires verified evidence
                </span>
              </div>

              {socials.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
                  <Share2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-300">No Social Profiles Discovered Yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Run a website crawl to detect official outbound social links, or trigger YouTube search.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {socials.map((soc) => (
                    <div key={soc.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase font-mono tracking-wider text-indigo-300">
                          {soc.platform}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          Confidence: {soc.matchingConfidence}
                        </span>
                      </div>

                      <a
                        href={soc.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 underline truncate"
                      >
                        <span className="truncate">{soc.profileUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>

                      <p className="text-[11px] text-slate-400 leading-normal">{soc.matchingEvidence}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Lead Actions & Manual Outreach */}
          {activeTab === 'outreach' && (
            <div className="space-y-6">
              {/* Lead Status Bar */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Lead Pipeline Status</div>
                  <div className="text-base font-bold text-slate-100 mt-0.5">
                    {lead ? lead.status : 'NOT SAVED AS LEAD'}
                  </div>
                </div>

                {!lead ? (
                  <button
                    onClick={() => onSaveLead(business.id, 'NEW', 'NORMAL')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition"
                  >
                    + Save to Lead Pipeline
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">Change Status:</span>
                    <select
                      value={lead.status}
                      onChange={(e) => onSaveLead(business.id, e.target.value as LeadStatus, lead.priority)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200"
                    >
                      <option value="NEW">NEW</option>
                      <option value="RESEARCHING">RESEARCHING</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="FOLLOW_UP">FOLLOW_UP</option>
                      <option value="INTERESTED">INTERESTED</option>
                      <option value="PROPOSAL">PROPOSAL</option>
                      <option value="WON">WON</option>
                      <option value="LOST">LOST</option>
                      <option value="NOT_A_FIT">NOT_A_FIT</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Outreach Logging Form */}
              {lead && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Log Contact Form */}
                  <form onSubmit={handleOutreachSubmit} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                      <Send className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Log Manual Outreach Interaction</span>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Record client contact attempts. (The system strictly prohibits automated spamming).
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Method</label>
                        <select
                          value={outreachMethod}
                          onChange={(e) => setOutreachMethod(e.target.value as ContactMethod)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                        >
                          <option value="phone">Phone Call</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="email">Email</option>
                          <option value="instagram">Instagram DM</option>
                          <option value="facebook">Facebook Msg</option>
                          <option value="in_person">In Person</option>
                          <option value="website_form">Website Form</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Outcome</label>
                        <select
                          value={outreachOutcome}
                          onChange={(e) =>
                            setOutreachOutcome(
                              e.target.value as 'NO_ANSWER' | 'GATEKEEPER' | 'INTERESTED' | 'NOT_INTERESTED' | 'REQUESTED_PROPOSAL' | 'SCHEDULED_CALL' | 'COMPLETED'
                            )
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                        >
                          <option value="INTERESTED">Interested in Website</option>
                          <option value="REQUESTED_PROPOSAL">Requested Proposal</option>
                          <option value="SCHEDULED_CALL">Scheduled Call</option>
                          <option value="GATEKEEPER">Spoke with Gatekeeper</option>
                          <option value="NO_ANSWER">No Answer</option>
                          <option value="NOT_INTERESTED">Not Interested</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Outreach Notes / Discussion</label>
                      <textarea
                        value={outreachNotes}
                        onChange={(e) => setOutreachNotes(e.target.value)}
                        placeholder="e.g. Spoke with manager regarding missing mobile menu and reservation options..."
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Schedule Follow-up Date (Optional)</label>
                      <input
                        type="date"
                        value={outreachFollowUp}
                        onChange={(e) => setOutreachFollowUp(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
                    >
                      Record Contact & Update Timeline
                    </button>
                  </form>

                  {/* Add Internal Lead Note */}
                  <form onSubmit={handleNoteSubmit} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Internal Researcher Notes</span>
                    </div>

                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add private observations, competitive insights, or pricing estimates..."
                      rows={5}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />

                    <button
                      type="submit"
                      disabled={!newNote.trim()}
                      className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition disabled:opacity-50"
                    >
                      Save Internal Note
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: History & Diffs */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                  Change Detection & Audit Trail
                </h3>
                <span className="text-xs text-slate-500">Historical records are never destroyed</span>
              </div>

              {changeEvents.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
                  <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-300">No Changes Detected Yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Trigger a Rescan in the future to detect website additions, phone updates, or fixed issues.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {changeEvents.map((evt) => (
                    <div key={evt.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between text-xs gap-4">
                      <div>
                        <div className="font-semibold text-indigo-300 font-mono mb-1">{evt.eventType}</div>
                        <div className="text-slate-300">
                          <span className="text-slate-500">Old: </span>
                          <span className="font-mono text-red-300">{evt.oldValue || 'none'}</span>
                          <span className="mx-2 text-slate-600">→</span>
                          <span className="text-slate-500">New: </span>
                          <span className="font-mono text-emerald-300">{evt.newValue || 'none'}</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono shrink-0 text-right">
                        <div>{new Date(evt.detectedAt).toLocaleDateString()}</div>
                        <div>{evt.source}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: Raw vs Normalized Data */}
          {activeTab === 'raw' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                Data Normalization & Provenance
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Requirement 9: Original provider payloads are stored separately from normalized data models to ensure
                debugging accuracy and deduplication safety.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-indigo-400 font-bold mb-2 uppercase">Normalized Business Data</div>
                  <pre className="text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-80">
                    {JSON.stringify(
                      {
                        id: business.id,
                        normalizedName: business.normalizedName,
                        category: business.primaryCategory,
                        status: business.status,
                        websiteStatus: business.websiteStatus,
                        location,
                        contacts,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-amber-400 font-bold mb-2 uppercase">Raw Provider Data (Google Places)</div>
                  <pre className="text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-80">
                    {JSON.stringify(
                      {
                        placeId: business.primaryProviderId,
                        provider: business.primaryProvider,
                        rawData: business.rawData,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
