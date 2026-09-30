/**
 * Evidence-Driven Website Audit Engine
 * Inspects real HTML responses for technical, mobile, SEO, content, conversion, and social signals.
 * Reports verified facts and measurements — never subjective insults or arbitrary score numbers.
 */

import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { safeFetchUrl } from './crawler.ts';
import { WebsiteAudit, Website, SocialProfile, BusinessContact, WebsitePage, WebsiteLink } from '../types.ts';

export interface AuditExecutionResult {
  audit: WebsiteAudit;
  discoveredSocials: Array<{ platform: SocialProfile['platform']; url: string; handle?: string }>;
  discoveredContacts: Array<{ type: BusinessContact['contactType']; value: string }>;
  discoveredPages: WebsitePage[];
  discoveredLinks: WebsiteLink[];
}

export async function executeWebsiteAudit(
  businessId: string,
  websiteRecord: Website
): Promise<AuditExecutionResult> {
  const auditId = `audit_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const evidenceLog: WebsiteAudit['evidenceLog'] = [];
  const discoveredPages: WebsitePage[] = [];
  const discoveredLinks: WebsiteLink[] = [];

  const addEvidence = (test: string, result: string, source = 'HTTP Website Crawl') => {
    evidenceLog.push({ test, result, timestamp: now, source });
  };

  const fetchResult = await safeFetchUrl(websiteRecord.originalUrl);

  if (!fetchResult.isSuccess || !fetchResult.html) {
    addEvidence('HTTP Request', `Failed: ${fetchResult.error || fetchResult.incompleteReason || 'No response'}`);
    const failedAudit: WebsiteAudit = {
      id: auditId,
      websiteId: websiteRecord.id,
      businessId,
      auditDate: now,
      status: 'INCOMPLETE',
      incompleteReason: fetchResult.incompleteReason || 'Website audit incomplete — access could not be verified.',
      httpStatus: fetchResult.httpStatus,
      httpsEnforced: fetchResult.isHttps,
      evidenceLog,
    };
    return { audit: failedAudit, discoveredSocials: [], discoveredContacts: [], discoveredPages: [], discoveredLinks: [] };
  }

  const $ = cheerio.load(fetchResult.html);
  const discoveredSocials: Array<{ platform: SocialProfile['platform']; url: string; handle?: string }> = [];
  const discoveredContacts: Array<{ type: BusinessContact['contactType']; value: string }> = [];

  // --- 1. Technical Audit ---
  const httpStatus = fetchResult.httpStatus || 200;
  const httpsEnforced = fetchResult.isHttps || false;
  addEvidence('HTTP Status Code', `${httpStatus} (Tested against ${websiteRecord.originalUrl})`);
  addEvidence('HTTPS Protocol', httpsEnforced ? 'Enforced (Secure transport detected)' : 'Not enforced (Insecure HTTP detected)');

  // Canonical tag
  const canonicalHref = $('link[rel="canonical"]').attr('href');
  const hasCanonical = Boolean(canonicalHref);
  addEvidence('Canonical Tag', hasCanonical ? `Detected (${canonicalHref})` : 'Not detected');

  // --- 2. Mobile Audit ---
  const viewportTag = $('meta[name="viewport"]').attr('content');
  const hasViewportMeta = Boolean(viewportTag && viewportTag.includes('width=device-width'));
  addEvidence(
    'Mobile Viewport Meta',
    hasViewportMeta ? `Detected (${viewportTag})` : 'Not detected or missing width=device-width'
  );

  const styleText = $('style').text() + $('[style]').text();
  const hasResponsiveMediaQueries = /@media\s*\([^{]+(max-width|min-width)/i.test(styleText);
  const mobileSignals: string[] = [];
  if (hasViewportMeta) mobileSignals.push('viewport_tag');
  if (hasResponsiveMediaQueries) mobileSignals.push('css_media_queries');

  // --- 3. SEO Audit ---
  const rawTitle = $('title').text().trim();
  const pageTitle = rawTitle || undefined;
  const pageTitleLength = rawTitle ? rawTitle.length : 0;
  addEvidence('Page Title', rawTitle ? `"${rawTitle}" (${pageTitleLength} chars)` : 'No <title> tag detected');

  const metaDesc = $('meta[name="description"]').attr('content')?.trim();
  const metaDescription = metaDesc || undefined;
  const metaDescriptionLength = metaDesc ? metaDesc.length : 0;
  addEvidence(
    'Meta Description',
    metaDesc ? `"${metaDesc.slice(0, 80)}..." (${metaDescriptionLength} chars)` : 'No meta description detected'
  );

  const h1Elements = $('h1');
  const h1Count = h1Elements.length;
  const h1Text = h1Elements.first().text().trim() || undefined;
  const h2Count = $('h2').length;
  addEvidence('H1 Headings', `${h1Count} detected${h1Text ? ` (First: "${h1Text.slice(0, 60)}")` : ''}`);
  addEvidence('H2 Headings', `${h2Count} detected`);

  // Structured Data (JSON-LD or microdata)
  const jsonLdScripts = $('script[type="application/ld+json"]');
  const structuredDataTypes: string[] = [];
  jsonLdScripts.each((_, el) => {
    try {
      const content = $(el).html();
      if (content) {
        const parsed = JSON.parse(content);
        if (parsed['@type']) {
          structuredDataTypes.push(String(parsed['@type']));
        } else if (Array.isArray(parsed)) {
          parsed.forEach((item) => item['@type'] && structuredDataTypes.push(String(item['@type'])));
        }
      }
    } catch {
      // ignore invalid json-ld
    }
  });

  const hasStructuredData = structuredDataTypes.length > 0;
  addEvidence(
    'Structured Data (JSON-LD)',
    hasStructuredData ? `Detected schema types: ${structuredDataTypes.join(', ')}` : 'None detected'
  );

  // --- 4. Content Audit ---
  const bodyText = $('body').text().replace(/\s+/g, ' ');
  const hasBusinessDescription = bodyText.length > 300;
  const hasServicesListed = /services|our work|what we do|specialties|treatments|menu|practice areas/i.test(bodyText);
  const hasProductsListed = /products|shop|store|catalog|cart|buy now/i.test(bodyText);
  const hasPricing = /\$|€|£|₹|Rs|\bpricing\b|\brates\b|\bpackages\b/i.test(bodyText);
  const hasHoursDisplayed = /hours|open daily|monday|tuesday|closed/i.test(bodyText);

  addEvidence('Service Information', hasServicesListed ? 'Services section signals detected' : 'No explicit services signals detected');
  addEvidence('Pricing Information', hasPricing ? 'Pricing/currency symbols detected' : 'No visible pricing signals detected');
  addEvidence('Opening Hours on Site', hasHoursDisplayed ? 'Hours/schedule keywords detected' : 'No opening hours detected');

  // --- 5. Conversion Audit ---
  const formCount = $('form').length;
  let hasContactForm = formCount > 0 || $('input[type="email"], textarea').length > 0;
  const telLinks = $('a[href^="tel:"]');
  let hasClickToCall = telLinks.length > 0;
  const mailtoLinks = $('a[href^="mailto:"]');
  const hasMailto = mailtoLinks.length > 0;

  telLinks.each((_, el) => {
    const rawHref = $(el).attr('href') || '';
    const phone = rawHref.replace(/^tel:/i, '').trim();
    if (phone) {
      discoveredContacts.push({ type: 'phone', value: phone });
    }
  });

  mailtoLinks.each((_, el) => {
    const rawHref = $(el).attr('href') || '';
    const email = rawHref.replace(/^mailto:/i, '').split('?')[0].trim();
    if (email && email.includes('@')) {
      discoveredContacts.push({ type: 'email', value: email });
    }
  });

  const bookingKeywords = /book now|schedule|appointment|reservation|table reservation|reserve/i;
  const hasBookingSystem =
    bookingKeywords.test(bodyText) ||
    $('a, button').filter((_, el) => bookingKeywords.test($(el).text())).length > 0 ||
    /calendly|acuity|opentable|resy|mindbody|booksy/i.test(fetchResult.html);

  const hasOnlineOrdering = /order online|takeout|delivery|ubereats|doordash|toasttab|chownow/i.test(fetchResult.html);

  addEvidence('Contact Form', hasContactForm ? `Detected (${formCount} form elements)` : 'No contact form detected');
  addEvidence('Click-to-Call Link (tel:)', hasClickToCall ? `Detected (${telLinks.length} links)` : 'Not detected');
  addEvidence('Email Link (mailto:)', hasMailto ? `Detected (${mailtoLinks.length} links)` : 'Not detected');
  addEvidence('Booking/Reservation Mechanism', hasBookingSystem ? 'Booking signals / booking widget detected' : 'No booking mechanism detected');
  addEvidence('Online Ordering Mechanism', hasOnlineOrdering ? 'Ordering integration signals detected' : 'No online ordering detected');

  // --- 6. Social Discovery from Official Website Links ---
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')?.trim();
    if (!href) return;

    if (/instagram\.com\/([^/?#]+)/i.test(href)) {
      const match = href.match(/instagram\.com\/([^/?#]+)/i);
      const handle = match ? match[1] : undefined;
      if (handle && !['p', 'reel', 'stories', 'explore'].includes(handle.toLowerCase())) {
        discoveredSocials.push({ platform: 'instagram', url: href, handle });
      }
    } else if (/facebook\.com\/([^/?#]+)/i.test(href)) {
      discoveredSocials.push({ platform: 'facebook', url: href });
    } else if (/youtube\.com\/(channel|c|@|user)\/([^/?#]+)/i.test(href)) {
      discoveredSocials.push({ platform: 'youtube', url: href });
    } else if (/(twitter\.com|x\.com)\/([^/?#]+)/i.test(href)) {
      discoveredSocials.push({ platform: 'x', url: href });
    } else if (/tiktok\.com\/@([^/?#]+)/i.test(href)) {
      discoveredSocials.push({ platform: 'tiktok', url: href });
    } else if (/linkedin\.com\/(company|in)\/([^/?#]+)/i.test(href)) {
      discoveredSocials.push({ platform: 'linkedin', url: href });
    }
  });

  if (discoveredSocials.length > 0) {
    const platforms = Array.from(new Set(discoveredSocials.map((s) => s.platform)));
    addEvidence('Official Social Links', `Detected ${platforms.join(', ')} links on website`);
  } else {
    addEvidence('Official Social Links', 'No social links detected on the crawled page');
  }

  // --- 7. Performance Audit (Measured facts) ---
  const ttfbMs = fetchResult.durationMs || 0;
  const totalPageSizeBytes = fetchResult.responseSizeBytes || 0;
  const scriptCount = $('script').length;
  const imgCount = $('img').length;
  const cssCount = $('link[rel="stylesheet"]').length;
  const resourceCount = scriptCount + imgCount + cssCount;

  addEvidence('Initial Response Time (Measured)', `${ttfbMs} ms under test`);
  addEvidence('HTML Page Size (Measured)', `${Math.round(totalPageSizeBytes / 1024)} KB`);
  addEvidence('Resource References (Measured)', `${resourceCount} (Scripts: ${scriptCount}, Images: ${imgCount}, Stylesheets: ${cssCount})`);

  // --- 8. Stale/Outdated Content Signals ---
  const outdatedSignals: string[] = [];
  const copyrightMatch = bodyText.match(/(?:copyright|©|\(c\))\s*(?:20\d\d\s*[-–]\s*)?(20\d\d)/i);
  let copyrightYear: number | undefined;
  if (copyrightMatch) {
    copyrightYear = parseInt(copyrightMatch[1], 10);
    const currentYear = new Date().getFullYear();
    if (copyrightYear < currentYear - 2) {
      outdatedSignals.push(`Copyright year signal: ${copyrightYear} (Current year: ${currentYear})`);
      addEvidence('Outdated Content Signal', `Copyright notice detected from ${copyrightYear}`);
    }
  }

  // Record homepage as first crawled page
  discoveredPages.push({
    id: `page_${crypto.randomUUID()}`,
    websiteId: websiteRecord.id,
    url: websiteRecord.originalUrl,
    pageType: 'home',
    httpStatus,
    title: pageTitle,
    crawledAt: now,
  });

  // Extract internal and external links
  let targetHost = '';
  try {
    targetHost = new URL(websiteRecord.normalizedUrl).hostname.toLowerCase();
  } catch {
    targetHost = '';
  }

  const candidateSubpages: string[] = [];

  $('a[href]').each((_, el) => {
    const rawHref = $(el).attr('href')?.trim();
    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:')) return;

    try {
      const resolved = new URL(rawHref, websiteRecord.normalizedUrl);
      const isInternal = targetHost ? resolved.hostname.toLowerCase() === targetHost : false;

      discoveredLinks.push({
        id: `lnk_${crypto.randomUUID()}`,
        websiteId: websiteRecord.id,
        fromPageUrl: websiteRecord.originalUrl,
        toUrl: resolved.toString(),
        isInternal,
        isBroken: false,
      });

      if (isInternal && candidateSubpages.length < 5) {
        const path = resolved.pathname.toLowerCase();
        if (
          (path.includes('contact') || path.includes('about') || path.includes('services') || path.includes('menu') || path.includes('booking') || path.includes('reservations')) &&
          !candidateSubpages.includes(resolved.toString()) &&
          resolved.toString() !== websiteRecord.normalizedUrl
        ) {
          candidateSubpages.push(resolved.toString());
        }
      }
    } catch {
      // ignore invalid relative url
    }
  });

  // Safe crawl of up to 2 prioritized subpages
  for (let i = 0; i < Math.min(candidateSubpages.length, 2); i++) {
    const subUrl = candidateSubpages[i];
    try {
      const subRes = await safeFetchUrl(subUrl);
      if (subRes.isSuccess && subRes.html) {
        const sub$ = cheerio.load(subRes.html);
        const subTitle = sub$('title').text().trim() || undefined;
        let pType: WebsitePage['pageType'] = 'other';
        const lowerSub = subUrl.toLowerCase();
        if (lowerSub.includes('contact')) pType = 'contact';
        else if (lowerSub.includes('about')) pType = 'about';
        else if (lowerSub.includes('services')) pType = 'services';
        else if (lowerSub.includes('booking') || lowerSub.includes('reservations')) pType = 'booking';
        else if (lowerSub.includes('menu')) pType = 'menu';

        discoveredPages.push({
          id: `page_${crypto.randomUUID()}`,
          websiteId: websiteRecord.id,
          url: subUrl,
          pageType: pType,
          httpStatus: subRes.httpStatus || 200,
          title: subTitle,
          crawledAt: now,
        });

        // If contact form or tel: was not on homepage but found on /contact:
        if (!hasContactForm && (sub$('form').length > 0 || sub$('input[type="email"], textarea').length > 0)) {
          hasContactForm = true;
          addEvidence('Contact Form (Subpage)', `Detected on ${subUrl}`);
        }
        if (!hasClickToCall && sub$('a[href^="tel:"]').length > 0) {
          hasClickToCall = true;
          addEvidence('Click-to-Call Link (Subpage)', `Detected tel: link on ${subUrl}`);
        }
      }
    } catch {
      // ignore subpage crawl error
    }
  }

  const audit: WebsiteAudit = {
    id: auditId,
    websiteId: websiteRecord.id,
    businessId,
    auditDate: now,
    status: 'COMPLETED',
    httpStatus,
    httpsEnforced,
    hasCanonical,
    hasViewportMeta,
    viewportContent: viewportTag,
    hasResponsiveElements: hasResponsiveMediaQueries,
    mobileSignalsDetected: mobileSignals,
    pageTitle,
    pageTitleLength,
    metaDescription,
    metaDescriptionLength,
    h1Count,
    h1Text,
    h2Count,
    hasStructuredData,
    structuredDataTypes,
    hasBusinessDescription,
    hasServicesListed,
    hasProductsListed,
    hasPricing,
    hasHoursDisplayed,
    hasContactForm,
    hasClickToCall,
    hasMailto,
    hasBookingSystem,
    hasOnlineOrdering,
    ttfbMs,
    totalPageSizeBytes,
    resourceCount,
    copyrightYear,
    outdatedSignals,
    evidenceLog,
  };

  return {
    audit,
    discoveredSocials,
    discoveredContacts,
    discoveredPages,
    discoveredLinks,
  };
}
