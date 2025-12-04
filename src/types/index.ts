export interface Settings {
  overseerrUrl: string;
  overseerrApiKey: string;
  geminiApiKey: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Media {
  id: number;
  mediaType: 'movie' | 'tv';
  title: string; // name for TV, title for Movie
  releaseDate?: string; // firstAirDate for TV, releaseDate for Movie
  overview?: string;
  posterPath?: string;
}

export interface MediaRequest {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  seasons?: number[]; // For TV shows
}

export interface OverseerrResponse<T> {
  results: T[];
  page: number;
  totalResults: number;
  totalPages: number;
}
