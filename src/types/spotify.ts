export interface SpotifyImage {
	url: string;
	height: number;
	width: number;
}

export interface SpotifyArtist {
	id: string;
	name: string;
	external_urls: {
		spotify: string;
	};
	images: SpotifyImage[];
	genres: string[];
	popularity: number;
}

export interface SpotifyTrack {
	id: string;
	name: string;
	artists: SpotifyArtist[];
	album: {
		id: string;
		name: string;
		images: SpotifyImage[];
		external_urls: {
			spotify: string;
		};
	};
	external_urls: {
		spotify: string;
	};
	preview_url: string | null;
	duration_ms: number;
	popularity: number;
}

export interface SpotifyPlayHistoryItem {
	track: SpotifyTrack;
	played_at: string;
	context: {
		type: string;
		href: string;
		external_urls: {
			spotify: string;
		};
		uri: string;
	} | null;
}

export interface SpotifyTopArtistsResponse {
	items: SpotifyArtist[];
	total: number;
	limit: number;
	offset: number;
	href: string;
	previous: string | null;
	next: string | null;
}

export interface SpotifyTopTracksResponse {
	items: SpotifyTrack[];
	total: number;
	limit: number;
	offset: number;
	href: string;
	previous: string | null;
	next: string | null;
}

export interface SpotifyRecentlyPlayedResponse {
	items: SpotifyPlayHistoryItem[];
	next: string | null;
	cursors: {
		after: string;
		before: string;
	};
	limit: number;
	href: string;
}

export type TimeRange = "short_term" | "medium_term" | "long_term";

export interface SpotifyStats {
	topArtists: SpotifyArtist[];
	topTracks: SpotifyTrack[];
	recentlyPlayed: SpotifyPlayHistoryItem[];
	timeRange: TimeRange;
}
