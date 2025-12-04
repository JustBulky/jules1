import type { Media, MediaRequest, OverseerrResponse } from '../types';

export class OverseerrService {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
  }

  private getHeaders() {
    return {
      'X-Api-Key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  // Exposed for Debug View
  public getTestUrl(): string {
    return `${this.baseUrl}/api/v1/auth/me`;
  }

  async testConnection(): Promise<boolean> {
    const url = this.getTestUrl();
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return response.ok;
    } catch (error) {
      console.error('Test connection failed:', error);
      throw error;
    }
  }

  async searchMedia(query: string): Promise<Media[]> {
    const url = `${this.baseUrl}/api/v1/search?query=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data: OverseerrResponse<any> = await response.json();

    // Normalize data
    return data.results.map((item: any) => ({
      id: item.id,
      mediaType: item.mediaType,
      title: item.title || item.name,
      releaseDate: item.releaseDate || item.firstAirDate,
      overview: item.overview,
      posterPath: item.posterPath
    }));
  }

  async requestMedia(request: MediaRequest): Promise<any> {
    const url = `${this.baseUrl}/api/v1/request`;
    const body = {
      mediaId: request.mediaId,
      mediaType: request.mediaType,
      seasons: request.seasons,
      is4k: false, // Default to false
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
       // Overseerr returns useful error messages often
       const errorData = await response.json().catch(() => ({}));
       throw new Error(`Request failed: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  }
}
