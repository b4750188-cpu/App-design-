/**
 * Official Google Places API (New) Provider Adapter
 * Implements Text Search (New), Nearby Search (New), Place Details (New), Autocomplete
 * Strict field masking (NO wildcard *), solution ID attribution, error classification & caching
 */

import { ProviderSource, ErrorClassification } from '../types.ts';
import { db } from '../db/storage.ts';

const SOLUTION_ID = 'gmp_mcp_codeassist_v1_aistudio';
const BASE_URL = 'https://places.googleapis.com/v1';

// In-memory response cache with TTL (15 minutes)
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}
const placesCache = new Map<string, CacheEntry<unknown>>();

function getFromCache<T>(key: string): T | null {
  const entry = placesCache.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    return entry.data as T;
  }
  return null;
}

function setInCache<T>(key: string, data: T, ttlMs = 15 * 60 * 1000): void {
  placesCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export interface PlaceSearchRawItem {
  id: string;
  displayName?: { text: string; languageCode?: string };
  formattedAddress?: string;
  addressComponents?: Array<{
    longText: string;
    shortText: string;
    types: string[];
    languageCode?: string;
  }>;
  location?: { latitude: number; longitude: number };
  primaryType?: string;
  types?: string[];
  businessStatus?: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY';
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  regularOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
  };
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
}

export interface SearchBusinessesParams {
  query: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  pageSize?: number;
  pageToken?: string;
}

export interface AutocompletePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  types?: string[];
}

export class GooglePlacesProvider {
  private getApiKey(): string {
    // Check environment or saved provider config
    const envKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || '';
    if (envKey) return envKey;

    const configs = db.getProviderConfigs();
    const gConfig = configs.find((c) => c.providerName === 'google_places');
    // We also support runtime config if stored in memory or env
    return process.env.GMP_CUSTOM_API_KEY || '';
  }

  public isConfigured(): boolean {
    return Boolean(this.getApiKey());
  }

  /**
   * Helper to make authenticated POST requests with solution ID and field mask
   */
  private async request<T>(
    endpoint: string,
    body: Record<string, unknown>,
    fieldMask?: string,
    method = 'POST'
  ): Promise<{ data?: T; error?: { message: string; classification: ErrorClassification; status?: number } }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return {
        error: {
          message: 'Google Places API key is not configured. Configure your key in Settings or environment variables.',
          classification: 'AUTHENTICATION_ERROR',
        },
      };
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-Maps-Solution-ID': SOLUTION_ID,
    };

    if (fieldMask) {
      headers['X-Goog-FieldMask'] = fieldMask;
    }

    try {
      const url = `${BASE_URL}${endpoint}`;
      const res = await fetch(url, {
        method,
        headers,
        body: method === 'POST' ? JSON.stringify(body) : undefined,
      });

      // Record provider usage
      db.recordProviderUsage({
        provider: 'google_places',
        endpoint,
        requestsCount: 1,
        lastRequestAt: new Date().toISOString(),
        fieldMaskUsed: fieldMask,
      });

      if (!res.ok) {
        let errMessage = `HTTP ${res.status} ${res.statusText}`;
        try {
          const errJson = await res.json();
          if (errJson?.error?.message) {
            errMessage = errJson.error.message;
          }
        } catch {
          // ignore json parse error
        }

        let classification: ErrorClassification = 'PROVIDER_UNAVAILABLE';
        if (res.status === 401 || res.status === 403) {
          classification = 'AUTHENTICATION_ERROR';
          db.updateProviderConfig('google_places', {
            status: 'UNAVAILABLE',
            statusMessage: `Auth failure: ${errMessage}`,
          });
        } else if (res.status === 429) {
          classification = 'RATE_LIMITED';
          db.updateProviderConfig('google_places', {
            status: 'RATE_LIMITED',
            statusMessage: 'Rate limit / quota exceeded',
          });
        } else if (res.status === 400) {
          classification = 'INVALID_DATA';
        }

        return { error: { message: errMessage, classification, status: res.status } };
      }

      const data = (await res.json()) as T;
      return { data };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown network failure';
      return {
        error: {
          message: `Network error connecting to Google Places: ${msg}`,
          classification: 'PROVIDER_UNAVAILABLE',
        },
      };
    }
  }

  /**
   * 1. Search Businesses using Text Search (New)
   * Explicit field masks only — never wildcard *
   */
  public async searchBusinesses(params: SearchBusinessesParams): Promise<{
    places: PlaceSearchRawItem[];
    nextPageToken?: string;
    error?: string;
    classification?: ErrorClassification;
  }> {
    const cacheKey = `search:${JSON.stringify(params)}`;
    const cached = getFromCache<{ places: PlaceSearchRawItem[]; nextPageToken?: string }>(cacheKey);
    if (cached) {
      return cached;
    }

    // Explicit field mask for discovery
    const fieldMask = [
      'places.id',
      'places.displayName',
      'places.formattedAddress',
      'places.location',
      'places.primaryType',
      'places.types',
      'places.businessStatus',
      'places.nationalPhoneNumber',
      'places.internationalPhoneNumber',
      'places.websiteUri',
      'places.rating',
      'places.userRatingCount',
      'places.googleMapsUri',
      'places.regularOpeningHours',
    ].join(',');

    const reqBody: Record<string, unknown> = {
      textQuery: params.query,
      pageSize: Math.min(params.pageSize || 20, 20), // Max allowed by Google Places API New per page is 20
    };

    if (params.pageToken) {
      reqBody.pageToken = params.pageToken;
    }

    if (params.latitude && params.longitude && params.radiusMeters) {
      reqBody.locationBias = {
        circle: {
          center: { latitude: params.latitude, longitude: params.longitude },
          radius: params.radiusMeters,
        },
      };
    }

    const res = await this.request<{ places?: PlaceSearchRawItem[]; nextPageToken?: string }>(
      '/places:searchText',
      reqBody,
      fieldMask
    );

    if (res.error) {
      return {
        places: [],
        error: res.error.message,
        classification: res.error.classification,
      };
    }

    const places = res.data?.places || [];
    const result = { places, nextPageToken: res.data?.nextPageToken };
    setInCache(cacheKey, result);
    return result;
  }

  /**
   * 2. getBasicBusinessDetails()
   * Requests basic identifying fields only
   */
  public async getBasicBusinessDetails(placeId: string): Promise<{
    place?: PlaceSearchRawItem;
    error?: string;
  }> {
    const cacheKey = `basic:${placeId}`;
    const cached = getFromCache<PlaceSearchRawItem>(cacheKey);
    if (cached) return { place: cached };

    const fieldMask = 'id,displayName,formattedAddress,location,primaryType,businessStatus';
    const res = await this.request<PlaceSearchRawItem>(`/places/${placeId}`, {}, fieldMask, 'GET');

    if (res.error) return { error: res.error.message };
    if (res.data) setInCache(cacheKey, res.data);
    return { place: res.data };
  }

  /**
   * 3. getContactDetails()
   * Requests contact and location fields
   */
  public async getContactDetails(placeId: string): Promise<{
    phone?: string;
    internationalPhone?: string;
    googleMapsUri?: string;
    error?: string;
  }> {
    const fieldMask = 'id,nationalPhoneNumber,internationalPhoneNumber,googleMapsUri';
    const res = await this.request<PlaceSearchRawItem>(`/places/${placeId}`, {}, fieldMask, 'GET');

    if (res.error) return { error: res.error.message };
    return {
      phone: res.data?.nationalPhoneNumber,
      internationalPhone: res.data?.internationalPhoneNumber,
      googleMapsUri: res.data?.googleMapsUri,
    };
  }

  /**
   * 4. getWebsiteDetails()
   * Requests websiteUri specifically
   */
  public async getWebsiteDetails(placeId: string): Promise<{
    websiteUri?: string;
    error?: string;
  }> {
    const fieldMask = 'id,websiteUri';
    const res = await this.request<PlaceSearchRawItem>(`/places/${placeId}`, {}, fieldMask, 'GET');

    if (res.error) return { error: res.error.message };
    return { websiteUri: res.data?.websiteUri };
  }

  /**
   * 5. Autocomplete for Location / Address input
   */
  public async autocompleteLocation(input: string): Promise<{
    predictions: AutocompletePrediction[];
    error?: string;
  }> {
    if (!input || input.trim().length < 2) return { predictions: [] };

    const cacheKey = `ac:${input.trim().toLowerCase()}`;
    const cached = getFromCache<AutocompletePrediction[]>(cacheKey);
    if (cached) return { predictions: cached };

    const res = await this.request<{
      suggestions?: Array<{
        placePrediction?: {
          placeId: string;
          text?: { text: string };
          structuredFormat?: {
            mainText?: { text: string };
            secondaryText?: { text: string };
          };
          types?: string[];
        };
      }>;
    }>('/places:autocomplete', {
      input,
      includedPrimaryTypes: ['locality', 'sublocality', 'postal_code', 'administrative_area_level_1', 'country'],
    });

    if (res.error) return { predictions: [], error: res.error.message };

    const predictions: AutocompletePrediction[] = (res.data?.suggestions || [])
      .filter((s) => s.placePrediction)
      .map((s) => {
        const p = s.placePrediction!;
        return {
          placeId: p.placeId,
          description: p.text?.text || '',
          mainText: p.structuredFormat?.mainText?.text || p.text?.text || '',
          secondaryText: p.structuredFormat?.secondaryText?.text || '',
          types: p.types,
        };
      });

    setInCache(cacheKey, predictions);
    return { predictions };
  }
}

export const googlePlacesProvider = new GooglePlacesProvider();
