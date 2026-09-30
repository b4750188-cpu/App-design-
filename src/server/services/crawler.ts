/**
 * SSRF-Safe Website Crawler & Fetcher
 * Follows strict size limits, timeout limits, allowed redirects, and IP checks
 */

import { validateSafeHost } from './security.ts';
import { normalizeWebsiteUrl } from './normalization.ts';

export interface SafeFetchResult {
  isSuccess: boolean;
  httpStatus?: number;
  finalUrl?: string;
  isHttps?: boolean;
  html?: string;
  responseSizeBytes?: number;
  durationMs?: number;
  dnsResolvedIp?: string;
  redirectsCount?: number;
  error?: string;
  incompleteReason?: string;
}

const MAX_RESPONSE_BYTES = 2 * 1024 * 1024; // 2MB max
const REQUEST_TIMEOUT_MS = 8000; // 8 seconds max

/**
 * Fetch a URL safely with SSRF defense, size bounds, and timeout
 */
export async function safeFetchUrl(inputUrl: string): Promise<SafeFetchResult> {
  const norm = normalizeWebsiteUrl(inputUrl);
  if (!norm.isValid) {
    return {
      isSuccess: false,
      error: `Invalid URL: ${norm.rejectReason}`,
      incompleteReason: 'INVALID_URL_SYNTAX',
    };
  }

  // 1. Pre-flight SSRF check on hostname
  const hostCheck = await validateSafeHost(norm.domain);
  if (!hostCheck.isSafe) {
    return {
      isSuccess: false,
      error: `Security Block: ${hostCheck.reason}`,
      incompleteReason: 'ACCESS_RESTRICTED_SECURITY_GATE',
    };
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    let currentUrl = norm.normalizedUrl;
    let redirectsCount = 0;
    let response: Response | null = null;

    // Manual safe redirect loop (max 3 redirects) to verify each redirected hostname
    for (let r = 0; r < 4; r++) {
      const parsedCurrent = new URL(currentUrl);
      const hopCheck = await validateSafeHost(parsedCurrent.hostname);
      if (!hopCheck.isSafe) {
        clearTimeout(timeoutId);
        return {
          isSuccess: false,
          error: `Redirect blocked: ${hopCheck.reason}`,
          incompleteReason: 'REDIRECT_BLOCKED_UNSAFE_HOST',
        };
      }

      response = await fetch(currentUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'GlobalWebsiteOpportunityFinder/1.0 (+https://opportunityfinder.global; Bot Verification)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'manual', // do not follow automatically to check each target host
        signal: controller.signal,
      });

      // Handle redirect status
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const locationHeader = response.headers.get('location');
        if (!locationHeader) break;

        const nextUrl = new URL(locationHeader, currentUrl).toString();
        currentUrl = nextUrl;
        redirectsCount++;
        if (redirectsCount > 3) {
          clearTimeout(timeoutId);
          return {
            isSuccess: false,
            httpStatus: response.status,
            finalUrl: currentUrl,
            error: 'Too many redirects (limit: 3)',
            incompleteReason: 'EXCESSIVE_REDIRECTS',
          };
        }
      } else {
        // Not a redirect, arrived at destination
        break;
      }
    }

    clearTimeout(timeoutId);

    if (!response) {
      return {
        isSuccess: false,
        error: 'No response received',
        incompleteReason: 'NO_RESPONSE',
      };
    }

    const durationMs = Date.now() - startTime;
    const finalUrl = currentUrl;
    const isHttps = finalUrl.startsWith('https://');

    // Read response with size safety
    const contentLengthHeader = response.headers.get('content-length');
    if (contentLengthHeader && parseInt(contentLengthHeader, 10) > MAX_RESPONSE_BYTES) {
      return {
        isSuccess: true,
        httpStatus: response.status,
        finalUrl,
        isHttps,
        durationMs,
        responseSizeBytes: parseInt(contentLengthHeader, 10),
        incompleteReason: 'RESPONSE_SIZE_EXCEEDED_MAX_2MB',
      };
    }

    const htmlText = await response.text();
    const actualBytes = Buffer.byteLength(htmlText, 'utf-8');

    return {
      isSuccess: response.ok || [401, 403, 404, 500].includes(response.status), // Even non-200 is useful audit evidence
      httpStatus: response.status,
      finalUrl,
      isHttps,
      html: actualBytes <= MAX_RESPONSE_BYTES ? htmlText : htmlText.slice(0, MAX_RESPONSE_BYTES),
      responseSizeBytes: actualBytes,
      durationMs,
      dnsResolvedIp: hostCheck.resolvedIp,
      redirectsCount,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      return {
        isSuccess: false,
        error: `Request timed out after ${REQUEST_TIMEOUT_MS}ms`,
        incompleteReason: 'REQUEST_TIMEOUT',
      };
    }
    return {
      isSuccess: false,
      error: err instanceof Error ? err.message : 'Unknown crawl error',
      incompleteReason: 'CONNECTION_FAILED',
    };
  }
}
