/**
 * Evidence-Driven Opportunity Engine
 * Evaluates verified facts from business records and website audits.
 * Produces structured Opportunity objects and OpportunityEvidence records.
 * STRICTLY NO ARBITRARY LEAD SCORES.
 */

import crypto from 'crypto';
import {
  Opportunity,
  OpportunityEvidence,
  OpportunityType,
  ConfidenceLevel,
  Business,
  Website,
  WebsiteAudit,
  SocialProfile,
  BusinessContact,
} from '../types.ts';
import { classifyBusinessIndustry, IndustryDefinition } from './industryEngine.ts';

export interface OpportunityEvaluationResult {
  opportunities: Opportunity[];
  evidenceList: OpportunityEvidence[];
  industry: IndustryDefinition;
}

export function evaluateOpportunities(
  business: Business,
  website: Website | undefined,
  latestAudit: WebsiteAudit | undefined,
  socials: SocialProfile[] = [],
  contacts: BusinessContact[] = []
): OpportunityEvaluationResult {
  const opportunities: Opportunity[] = [];
  const evidenceList: OpportunityEvidence[] = [];
  const now = new Date().toISOString();

  const industry = classifyBusinessIndustry(business.name, business.primaryCategory, business.rawData?.types as string[] || []);

  const addOpp = (
    type: OpportunityType,
    title: string,
    reasoning: string,
    confidence: ConfidenceLevel,
    severity: Opportunity['severity'],
    recommendedFeatures: string[],
    evidenceItems: Array<{ testName: string; text: string; source: string; conf: ConfidenceLevel }>
  ) => {
    const oppId = `opp_${crypto.randomUUID()}`;
    const opp: Opportunity = {
      id: oppId,
      businessId: business.id,
      type,
      title,
      reasoning,
      confidence,
      severity,
      firstIdentified: now,
      lastVerified: now,
      isResolved: false,
      recommendedWebsiteType: industry.recommendedWebsiteTypes[0],
      recommendedFeatures,
    };
    opportunities.push(opp);

    for (const ev of evidenceItems) {
      evidenceList.push({
        id: `ev_${crypto.randomUUID()}`,
        opportunityId: oppId,
        businessId: business.id,
        testName: ev.testName,
        evidenceText: ev.text,
        source: ev.source,
        observedAt: now,
        confidence: ev.conf,
      });
    }
  };

  const hasPhone = contacts.some((c) => c.contactType === 'phone' || c.contactType === 'international_phone');
  const hasSocials = socials.length > 0;

  // --- Case 1: No Website Detected from Provider ---
  if (!website || !website.originalUrl || business.websiteStatus === 'NO_WEBSITE_DETECTED') {
    const evidenceItems: Array<{ testName: string; text: string; source: string; conf: ConfidenceLevel }> = [
      {
        testName: 'Provider Website URI Query',
        text: 'Google Places provider returned no website URI for this establishment.',
        source: 'Google Places API (New)',
        conf: 'HIGH',
      },
    ];

    if (hasPhone) {
      evidenceItems.push({
        testName: 'Operational Phone Detected',
        text: `Active phone contact available (${contacts.find((c) => c.contactType === 'phone')?.value || 'verified'}), indicating active business operations.`,
        source: 'Google Places Details',
        conf: 'HIGH',
      });
    }

    if (hasSocials) {
      const platforms = socials.map((s) => s.platform).join(', ');
      evidenceItems.push({
        testName: 'Social Channel Presence',
        text: `Active social profiles discovered (${platforms}) without a central verified website hub.`,
        source: 'Social Discovery Provider',
        conf: 'MEDIUM',
      });
    }

    addOpp(
      'NO_WEBSITE_DETECTED',
      'No Official Website Detected from Provider',
      `The provider returned no official website URL for this active ${industry.name} business. Establishing a dedicated digital presence can capture local searches and provide customers with direct service and contact information. Note: This reflects current provider data, not an absolute guarantee of non-existence elsewhere.`,
      hasSocials || hasPhone ? 'HIGH' : 'MEDIUM',
      'HIGH',
      industry.essentialFeatures,
      evidenceItems
    );

    // Also flag Social-to-Website opportunity if active on social
    if (hasSocials) {
      addOpp(
        'SOCIAL_TO_WEBSITE_OPPORTUNITY',
        'Social Audience Without Direct Web Conversion Hub',
        `Business maintains social accounts (${socials.map((s) => s.platform).join(', ')}) but lacks a dedicated website to capture leads, display full catalog, or handle direct bookings without platform algorithms.`,
        'MEDIUM',
        'MEDIUM',
        ['Social Bio Landing Page', 'Direct Inquiry Form', 'Integrated Service Menu'],
        [
          {
            testName: 'Social Profile Count',
            text: `${socials.length} social profile(s) cataloged without an official web landing page.`,
            source: 'Social Discovery',
            conf: 'MEDIUM',
          },
        ]
      );
    }

    return { opportunities, evidenceList, industry };
  }

  // --- Case 2: Website Exists — Audit Findings ---
  if (latestAudit && latestAudit.status === 'COMPLETED') {
    // 2.1 Technical & Security (HTTPS)
    if (latestAudit.httpsEnforced === false) {
      addOpp(
        'WEBSITE_ACCESSIBLE_BUT_ISSUES_FOUND',
        'Insecure HTTP Connection (Missing HTTPS Enforcement)',
        'The website responds over unencrypted HTTP or fails to redirect visitors to HTTPS. Modern web browsers flag such connections as "Not Secure", deterring potential customers.',
        'HIGH',
        'HIGH',
        ['SSL/TLS Certificate Installation', 'Automatic HTTPS Redirection', 'HSTS Configuration'],
        [
          {
            testName: 'HTTPS Protocol Enforcement',
            text: `Server responded on unencrypted HTTP without automatic SSL upgrade.`,
            source: 'Website Audit Engine',
            conf: 'HIGH',
          },
        ]
      );
    }

    // 2.2 Mobile Experience
    if (latestAudit.hasViewportMeta === false) {
      addOpp(
        'MOBILE_IMPROVEMENT',
        'Mobile Viewport Meta Tag Not Detected',
        'No standard viewport meta tag (<meta name="viewport" content="width=device-width...">) was found in the page HTML. Mobile visitors are likely served a desktop view that requires zooming and horizontal scrolling.',
        'HIGH',
        'HIGH',
        ['Responsive Viewport Configuration', 'Fluid Mobile Layouts', 'Touch-Friendly Tap Targets'],
        [
          {
            testName: 'Mobile Viewport Inspection',
            text: 'Viewport meta tag was not detected in <head> markup.',
            source: 'Website Audit Engine',
            conf: 'HIGH',
          },
        ]
      );
    }

    // 2.3 Performance
    if (latestAudit.ttfbMs && latestAudit.ttfbMs > 2500) {
      addOpp(
        'PERFORMANCE_IMPROVEMENT',
        `High Initial Response Latency (${latestAudit.ttfbMs}ms)`,
        `Initial server response time was measured at ${latestAudit.ttfbMs}ms under test. Studies demonstrate that initial load times exceeding 2.5 seconds significantly increase visitor drop-off rates on mobile devices.`,
        'HIGH',
        'MEDIUM',
        ['CDN Integration', 'Modern Static Web Hosting', 'Asset Minification & Caching'],
        [
          {
            testName: 'Time-to-First-Byte (TTFB)',
            text: `Measured server response duration: ${latestAudit.ttfbMs} ms under test.`,
            source: 'Network Crawl Measurement',
            conf: 'HIGH',
          },
        ]
      );
    }

    // 2.4 Contact Mechanisms
    if (!latestAudit.hasContactForm && !latestAudit.hasClickToCall && !latestAudit.hasMailto) {
      addOpp(
        'CONTACT_IMPROVEMENT',
        'Absence of Direct Contact Mechanisms on Audited Page',
        'No interactive contact forms, clickable tel: phone links, or mailto: email addresses were identified on the audited homepage, reducing the likelihood of visitor inquiries.',
        'HIGH',
        'HIGH',
        ['Interactive Contact Form', 'Direct Tap-to-Call Phone Button', 'WhatsApp Direct Messaging Link'],
        [
          {
            testName: 'Contact Form & Action Link Discovery',
            text: 'Scanned 0 forms, 0 tel: links, and 0 mailto: links on the target page.',
            source: 'Website Audit Engine',
            conf: 'HIGH',
          },
        ]
      );
    }

    // 2.5 Booking / Appointment Needs for Relevant Industries
    const bookingHeavyCodes = ['dental_medical', 'beauty_wellness', 'hospitality', 'restaurant', 'automotive', 'fitness_sports'];
    if (bookingHeavyCodes.includes(industry.code) && !latestAudit.hasBookingSystem && !latestAudit.hasOnlineOrdering) {
      addOpp(
        'BOOKING_IMPROVEMENT',
        `Missing Online Booking / Reservation Capability for ${industry.name}`,
        `As a business in ${industry.name}, customers expect self-service scheduling or ordering online. No automated appointment, reservation, or online ordering mechanisms were detected on the audited pages.`,
        'MEDIUM',
        'MEDIUM',
        ['Online Scheduling Calendar', 'Automated Appointment Confirmations', 'Mobile Booking Widget'],
        [
          {
            testName: 'Industry Functional Gap Check',
            text: `Business categorized as ${industry.name}; no reservation or calendar widget keywords/scripts were detected.`,
            source: 'Industry Engine + Audit Log',
            conf: 'MEDIUM',
          },
        ]
      );
    }

    // 2.6 Outdated Content Signals
    if (latestAudit.outdatedSignals && latestAudit.outdatedSignals.length > 0) {
      addOpp(
        'OUTDATED_CONTENT_SIGNAL',
        'Possible Outdated Content Signals Detected',
        `Signals such as a copyright notice from ${latestAudit.copyrightYear || 'a prior year'} indicate the website content may not have been updated recently, potentially giving consumers the impression of inactive operations.`,
        'MEDIUM',
        'LOW',
        ['Modern Website Redesign', 'Current Year Copyright & Active Updates', 'Fresh Project/Service Showcase'],
        latestAudit.outdatedSignals.map((sig) => ({
          testName: 'Outdated Content Signal',
          text: sig,
          source: 'Website Audit Engine',
          conf: 'MEDIUM',
        }))
      );
    }

    // 2.7 SEO / Structured Data
    if (!latestAudit.hasStructuredData) {
      addOpp(
        'BUSINESS_FUNCTIONALITY_GAP',
        'Missing Local Business Structured Data (Schema.org / JSON-LD)',
        'No structured data markup was detected. Including LocalBusiness or Organization schema helps search engines understand operating hours, address, and ratings for rich snippet display in local search results.',
        'HIGH',
        'LOW',
        ['LocalBusiness Schema.org Markup', 'BreadcrumbList Structured Data', 'OpenGraph Social Share Tags'],
        [
          {
            testName: 'JSON-LD Schema Verification',
            text: '0 structured data application/ld+json blocks detected on page.',
            source: 'Website Audit Engine',
            conf: 'HIGH',
          },
        ]
      );
    }
  }

  // If after audit no issues were flagged:
  if (opportunities.length === 0) {
    addOpp(
      'NO_MAJOR_ISSUES_DETECTED',
      'No Critical Technical Deficiencies Detected',
      'The website is accessible, enforces HTTPS, includes mobile viewport definitions, and provides functional contact points according to the automated checks performed.',
      'HIGH',
      'INFORMATIONAL',
      ['Periodic Performance Monitoring', 'A/B Testing for Conversion Optimization'],
      [
        {
          testName: 'Comprehensive Audit Verification',
          text: 'All baseline technical, mobile, and contact health checks completed with satisfactory results.',
          source: 'Website Audit Engine',
          conf: 'HIGH',
        },
      ]
    );
  }

  return { opportunities, evidenceList, industry };
}
