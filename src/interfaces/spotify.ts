export interface ISpotifyAccessToken {
  access_token: string;
}

export interface IExternalUrls {
  spotify: string;
}

export interface IImagesEntity {
  height: number;
  url: string;
  width: number;
}

export interface ISpotifyArtist {
  external_urls: IExternalUrls;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

export interface ISpotifyAlbum {
  album_type: string;
  artists: ISpotifyAlbum[];
  available_markets: string[];
  external_urls: IExternalUrls;
  href: string;
  id: string;
  images: IImagesEntity[];
  name: string;
  release_date: string;
  release_date_precision: string;
  total_tracks: number;
  type: string;
  uri: string;
}

export interface ISpotifyTrack {
  album: ISpotifyAlbum;
  artists: ISpotifyAlbum[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_urls: IExternalUrls;
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  popularity: number;
  preview_url?: string;
  track_number: number;
  type: string;
  uri: string;
}
