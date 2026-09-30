/**
 * International Business Normalization Layer
 * - Standardized ISO 3166-1 alpha-2 country codes & metadata
 * - Safe Unicode & Non-Latin scripts support
 * - RTL language detection (Arabic, Urdu, Hebrew, Persian)
 * - Safe Phone Number normalization (E.164 and local)
 * - URL normalization and sanitization
 * - Separate RAW data from NORMALIZED data
 */

export interface CountryInfo {
  name: string;
  isoCode: string;
  defaultPhoneCode: string;
  isRtl: boolean;
  defaultLanguage: string;
  defaultTimezone: string;
}

export const KNOWN_COUNTRIES: Record<string, CountryInfo> = {
  US: { name: 'United States', isoCode: 'US', defaultPhoneCode: '+1', isRtl: false, defaultLanguage: 'en', defaultTimezone: 'America/New_York' },
  GB: { name: 'United Kingdom', isoCode: 'GB', defaultPhoneCode: '+44', isRtl: false, defaultLanguage: 'en', defaultTimezone: 'Europe/London' },
  CA: { name: 'Canada', isoCode: 'CA', defaultPhoneCode: '+1', isRtl: false, defaultLanguage: 'en', defaultTimezone: 'America/Toronto' },
  AU: { name: 'Australia', isoCode: 'AU', defaultPhoneCode: '+61', isRtl: false, defaultLanguage: 'en', defaultTimezone: 'Australia/Sydney' },
  DE: { name: 'Germany', isoCode: 'DE', defaultPhoneCode: '+49', isRtl: false, defaultLanguage: 'de', defaultTimezone: 'Europe/Berlin' },
  FR: { name: 'France', isoCode: 'FR', defaultPhoneCode: '+33', isRtl: false, defaultLanguage: 'fr', defaultTimezone: 'Europe/Paris' },
  JP: { name: 'Japan', isoCode: 'JP', defaultPhoneCode: '+81', isRtl: false, defaultLanguage: 'ja', defaultTimezone: 'Asia/Tokyo' },
  IN: { name: 'India', isoCode: 'IN', defaultPhoneCode: '+91', isRtl: false, defaultLanguage: 'hi', defaultTimezone: 'Asia/Kolkata' },
  BR: { name: 'Brazil', isoCode: 'BR', defaultPhoneCode: '+55', isRtl: false, defaultLanguage: 'pt', defaultTimezone: 'America/Sao_Paulo' },
  NG: { name: 'Nigeria', isoCode: 'NG', defaultPhoneCode: '+234', isRtl: false, defaultLanguage: 'en', defaultTimezone: 'Africa/Lagos' },
  AE: { name: 'United Arab Emirates', isoCode: 'AE', defaultPhoneCode: '+971', isRtl: true, defaultLanguage: 'ar', defaultTimezone: 'Asia/Dubai' },
  SA: { name: 'Saudi Arabia', isoCode: 'SA', defaultPhoneCode: '+966', isRtl: true, defaultLanguage: 'ar', defaultTimezone: 'Asia/Riyadh' },
  PK: { name: 'Pakistan', isoCode: 'PK', defaultPhoneCode: '+92', isRtl: true, defaultLanguage: 'ur', defaultTimezone: 'Asia/Karachi' },
  EG: { name: 'Egypt', isoCode: 'EG', defaultPhoneCode: '+20', isRtl: true, defaultLanguage: 'ar', defaultTimezone: 'Africa/Cairo' },
  ZA: { name: 'South Africa', isoCode: 'ZA', defaultPhoneCode: '+27', isRtl: false, defaultLanguage: 'en', defaultTimezone: 'Africa/Johannesburg' },
  MX: { name: 'Mexico', isoCode: 'MX', defaultPhoneCode: '+52', isRtl: false, defaultLanguage: 'es', defaultTimezone: 'America/Mexico_City' },
  ES: { name: 'Spain', isoCode: 'ES', defaultPhoneCode: '+34', isRtl: false, defaultLanguage: 'es', defaultTimezone: 'Europe/Madrid' },
  IT: { name: 'Italy', isoCode: 'IT', defaultPhoneCode: '+39', isRtl: false, defaultLanguage: 'it', defaultTimezone: 'Europe/Rome' },
  SG: { name: 'Singapore', isoCode: 'SG', defaultPhoneCode: '+65', isRtl: false, defaultLanguage: 'en', defaultTimezone: 'Asia/Singapore' },
  NZ: { name: 'New Zealand', isoCode: 'NZ', defaultPhoneCode: '+64', isRtl: false, defaultLanguage: 'en', defaultTimezone: 'Pacific/Auckland' },
  NL: { name: 'Netherlands', isoCode: 'NL', defaultPhoneCode: '+31', isRtl: false, defaultLanguage: 'nl', defaultTimezone: 'Europe/Amsterdam' },
  SE: { name: 'Sweden', isoCode: 'SE', defaultPhoneCode: '+46', isRtl: false, defaultLanguage: 'sv', defaultTimezone: 'Europe/Stockholm' },
  CH: { name: 'Switzerland', isoCode: 'CH', defaultPhoneCode: '+41', isRtl: false, defaultLanguage: 'de', defaultTimezone: 'Europe/Zurich' },
  TR: { name: 'Turkey', isoCode: 'TR', defaultPhoneCode: '+90', isRtl: false, defaultLanguage: 'tr', defaultTimezone: 'Europe/Istanbul' },
  ID: { name: 'Indonesia', isoCode: 'ID', defaultPhoneCode: '+62', isRtl: false, defaultLanguage: 'id', defaultTimezone: 'Asia/Jakarta' },
  MY: { name: 'Malaysia', isoCode: 'MY', defaultPhoneCode: '+60', isRtl: false, defaultLanguage: 'ms', defaultTimezone: 'Asia/Kuala_Lumpur' },
  KR: { name: 'South Korea', isoCode: 'KR', defaultPhoneCode: '+82', isRtl: false, defaultLanguage: 'ko', defaultTimezone: 'Asia/Seoul' },
  KE: { name: 'Kenya', isoCode: 'KE', defaultPhoneCode: '+254', isRtl: false, defaultLanguage: 'en', defaultTimezone: 'Africa/Nairobi' },
  AR: { name: 'Argentina', isoCode: 'AR', defaultPhoneCode: '+54', isRtl: false, defaultLanguage: 'es', defaultTimezone: 'America/Argentina/Buenos_Aires' },
};

/**
 * Detect if text contains RTL script characters (Arabic, Urdu, Hebrew, Farsi)
 */
export function isRtlText(text: string): boolean {
  if (!text) return false;
  // Arabic, Hebrew, Syriac, Thaana, Samaritan, Mandaic, Arabic Supplement/Extended
  const rtlRegex = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  return rtlRegex.test(text);
}

/**
 * Resolve country ISO code and metadata from country string or address components
 */
export function resolveCountry(countryOrAddress: string, isoHint?: string): CountryInfo {
  if (isoHint && KNOWN_COUNTRIES[isoHint.toUpperCase()]) {
    return KNOWN_COUNTRIES[isoHint.toUpperCase()];
  }

  const query = (countryOrAddress || '').trim().toLowerCase();
  for (const [code, info] of Object.entries(KNOWN_COUNTRIES)) {
    if (code.toLowerCase() === query || info.name.toLowerCase() === query) {
      return info;
    }
  }

  // Check substring match
  for (const info of Object.values(KNOWN_COUNTRIES)) {
    if (query.includes(info.name.toLowerCase())) {
      return info;
    }
  }

  const isRtl = isRtlText(countryOrAddress);
  return {
    name: countryOrAddress || 'Unknown',
    isoCode: (isoHint || 'XX').toUpperCase(),
    defaultPhoneCode: '',
    isRtl,
    defaultLanguage: isRtl ? 'ar' : 'en',
    defaultTimezone: 'UTC',
  };
}

/**
 * Clean & normalize a business name for comparison and display
 * Preserves international characters, trims whitespace, standardizes punctuation
 */
export function normalizeBusinessName(rawName: string): string {
  if (!rawName) return '';
  return rawName
    .trim()
    .normalize('NFKC') // Unicode normal form KC
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

const KNOWN_CALLING_CODES = [
  '+971', '+966', '+254', '+234', '+92', '+91', '+90', '+82', '+81',
  '+65', '+64', '+62', '+61', '+60', '+55', '+54', '+52', '+49',
  '+46', '+44', '+41', '+39', '+34', '+33', '+31', '+27', '+20',
  '+7', '+1'
];

/**
 * Safe Phone Number Normalizer
 * Keeps international prefix (+), strips extraneous punctuation
 */
export function normalizePhoneNumber(rawPhone: string, defaultCountryCode?: string): {
  e164: string;
  national: string;
  countryCode: string;
} {
  if (!rawPhone) {
    return { e164: '', national: '', countryCode: '' };
  }

  const cleaned = rawPhone.trim().replace(/[^\d+]/g, '');
  let e164 = '';
  let countryCode = defaultCountryCode || '';

  if (cleaned.startsWith('+')) {
    e164 = cleaned;
    // Match against standard calling codes from longest to shortest
    const matched = KNOWN_CALLING_CODES.find((cc) => cleaned.startsWith(cc));
    if (matched) {
      countryCode = matched;
    } else {
      const match = cleaned.match(/^\+(\d{1,3})/);
      if (match) {
        countryCode = `+${match[1]}`;
      }
    }
  } else if (cleaned.startsWith('00')) {
    e164 = `+${cleaned.slice(2)}`;
  } else if (defaultCountryCode) {
    // Prefix if local number
    const prefix = defaultCountryCode.startsWith('+') ? defaultCountryCode : `+${defaultCountryCode}`;
    const local = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
    e164 = `${prefix}${local}`;
    countryCode = prefix;
  } else {
    e164 = cleaned;
  }

  return {
    e164,
    national: rawPhone.trim(),
    countryCode,
  };
}

/**
 * Safe URL Normalizer & Validator
 * Strips tracking params, normalizes protocol, resolves domain
 */
export function normalizeWebsiteUrl(rawUrl: string): {
  normalizedUrl: string;
  domain: string;
  protocol: 'http' | 'https' | 'unknown';
  isValid: boolean;
  rejectReason?: string;
} {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { normalizedUrl: '', domain: '', protocol: 'unknown', isValid: false, rejectReason: 'EMPTY_URL' };
  }

  let cleaned = rawUrl.trim();
  // If an explicit protocol is present, ensure it is http or https; otherwise reject
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/i.test(cleaned)) {
    if (!/^https?:\/\//i.test(cleaned)) {
      return {
        normalizedUrl: '',
        domain: '',
        protocol: 'unknown',
        isValid: false,
        rejectReason: 'DISALLOWED_SCHEME',
      };
    }
  } else {
    // If scheme is completely missing (e.g. "example.com"), prefix with https://
    cleaned = `https://${cleaned}`;
  }

  try {
    const parsed = new URL(cleaned);

    // Reject dangerous schemes
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        normalizedUrl: '',
        domain: '',
        protocol: 'unknown',
        isValid: false,
        rejectReason: `DISALLOWED_SCHEME_${parsed.protocol}`,
      };
    }

    const domain = parsed.hostname.toLowerCase();
    const protocol = parsed.protocol === 'https:' ? 'https' : 'http';

    // Remove tracking queries
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
    trackingParams.forEach((param) => parsed.searchParams.delete(param));

    // Normalize path: strip trailing slash if root
    let path = parsed.pathname;
    if (path === '/') path = '';

    const normalizedUrl = `${protocol}://${domain}${path}${parsed.search ? parsed.search : ''}`;

    return {
      normalizedUrl,
      domain,
      protocol,
      isValid: true,
    };
  } catch (err: unknown) {
    return {
      normalizedUrl: '',
      domain: '',
      protocol: 'unknown',
      isValid: false,
      rejectReason: err instanceof Error ? err.message : 'INVALID_URL_SYNTAX',
    };
  }
}
