/**
 * YouTube Data API v3 Adapter
 * Allows searching channels and verifying official channel presence
 * Strictly adheres to "NEVER FABRICATE DATA" — returns "NOT CHECKED" when unconfigured
 */

import { SocialProfile, SocialObservation } from '../types.ts';
import { db } from '../db/storage.ts';

export interface YouTubeSearchResult {
  status: 'FOUND' | 'NOT_FOUND' | 'NOT_CHECKED' | 'ERROR';
  channelId?: string;
  channelTitle?: string;
  description?: string;
  customUrl?: string;
  subscriberCount?: number;
  videoCount?: number;
  viewCount?: number;
  publishedAt?: string;
  message?: string;
}

export class YouTubeProvider {
  private getApiKey(): string {
    return process.env.YOUTUBE_API_KEY || process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || '';
  }

  public isConfigured(): boolean {
    return Boolean(this.getApiKey());
  }

  /**
   * Search for an official channel matching business name + city
   */
  public async searchChannel(businessName: string, city?: string): Promise<YouTubeSearchResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return {
        status: 'NOT_CHECKED',
        message: 'YouTube Data API key is not configured.',
      };
    }

    try {
      const query = `${businessName} ${city || ''}`.trim();
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(
        query
      )}&maxResults=1&key=${apiKey}`;

      const res = await fetch(searchUrl);
      if (!res.ok) {
        if (res.status === 403 || res.status === 401) {
          return { status: 'NOT_CHECKED', message: 'YouTube API key lacks permissions or quota.' };
        }
        return { status: 'ERROR', message: `YouTube API returned HTTP ${res.status}` };
      }

      const json = await res.json();
      const items = json.items || [];
      if (items.length === 0) {
        return { status: 'NOT_FOUND', message: 'No matching channel discovered on YouTube.' };
      }

      const item = items[0];
      const channelId = item.id?.channelId || item.snippet?.channelId;
      const snippet = item.snippet || {};

      // If channel found, get stats
      let subscriberCount: number | undefined;
      let videoCount: number | undefined;
      let viewCount: number | undefined;
      let customUrl: string | undefined;

      if (channelId) {
        try {
          const detailUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`;
          const detailRes = await fetch(detailUrl);
          if (detailRes.ok) {
            const detailJson = await detailRes.json();
            const detailItem = detailJson.items?.[0];
            if (detailItem) {
              subscriberCount = detailItem.statistics?.subscriberCount
                ? parseInt(detailItem.statistics.subscriberCount, 10)
                : undefined;
              videoCount = detailItem.statistics?.videoCount
                ? parseInt(detailItem.statistics.videoCount, 10)
                : undefined;
              viewCount = detailItem.statistics?.viewCount
                ? parseInt(detailItem.statistics.viewCount, 10)
                : undefined;
              customUrl = detailItem.snippet?.customUrl;
            }
          }
        } catch {
          // ignore detail error
        }
      }

      return {
        status: 'FOUND',
        channelId,
        channelTitle: snippet.title,
        description: snippet.description,
        customUrl,
        subscriberCount,
        videoCount,
        viewCount,
        publishedAt: snippet.publishedAt,
      };
    } catch (e: unknown) {
      return {
        status: 'ERROR',
        message: e instanceof Error ? e.message : 'Network error connecting to YouTube',
      };
    }
  }
}

export const youtubeProvider = new YouTubeProvider();
