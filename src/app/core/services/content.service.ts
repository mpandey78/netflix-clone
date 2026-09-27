import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, catchError, from } from 'rxjs';
import { VideoContent } from '../models/content.model';
import { DbService } from './db.service';
import { liveQuery } from 'dexie';

@Injectable({
    providedIn: 'root'
})
export class ContentService {
    http = inject(HttpClient);
    db = inject(DbService);

    constructor() { }

    private async getActivePlaylistId(): Promise<number | undefined> {
        const active = await this.db.getActivePlaylist();
        return active?.id;
    }

    getMovies(): Observable<VideoContent[]> {
        return from(liveQuery(async () => {
            const pid = await this.getActivePlaylistId();
            if (!pid) return [];
            const movies = await this.db.movies.where('playlist_id').equals(pid).toArray();
            return this.mapXtreamToVideoContent(movies);
        }) as any) as Observable<VideoContent[]>;
    }

    getTrending(): Observable<VideoContent[]> {
        return from(liveQuery(async () => {
            const pid = await this.getActivePlaylistId();
            if (!pid) return [];
            const movies = await this.db.movies.where('playlist_id').equals(pid).limit(20).toArray();
            return this.mapXtreamToVideoContent(movies);
        }) as any) as Observable<VideoContent[]>;
    }

    getPopular(): Observable<VideoContent[]> {
        return from(liveQuery(async () => {
            const pid = await this.getActivePlaylistId();
            if (!pid) return [];
            const movies = await this.db.movies.where('playlist_id').equals(pid).limit(20).toArray();
            return this.mapXtreamToVideoContent(movies);
        }) as any) as Observable<VideoContent[]>;
    }

    getTopRated(): Observable<VideoContent[]> {
        return from(liveQuery(async () => {
            const pid = await this.getActivePlaylistId();
            if (!pid) return [];
            const movies = await this.db.movies.where('playlist_id').equals(pid).limit(20).toArray();
            return this.mapXtreamToVideoContent(movies);
        }) as any) as Observable<VideoContent[]>;
    }

    getNowPlaying(): Observable<VideoContent[]> {
        return from(liveQuery(async () => {
            const pid = await this.getActivePlaylistId();
            if (!pid) return [];
            const movies = await this.db.movies.where('playlist_id').equals(pid).limit(20).toArray();
            return this.mapXtreamToVideoContent(movies);
        }) as any) as Observable<VideoContent[]>;
    }

    getAppOriginals(): Observable<VideoContent[]> {
        return from(liveQuery(async () => {
            const pid = await this.getActivePlaylistId();
            if (!pid) return [];
            const series = await this.db.series.where('playlist_id').equals(pid).limit(20).toArray();
            return series.map(s => ({
                id: s.series_id,
                title: s.name,
                description: s.plot || 'No description',
                thumbnailUrl: s.cover,
                videoUrl: '',
                duration: '',
                genre: [],
                isOriginal: true,
                type: 'series',
                releaseDate: s.last_modified ? new Date(Number(s.last_modified) * 1000) : new Date(),
                rating: 0
            }));
        }) as any) as Observable<VideoContent[]>;
    }

    getLiveTv(): Observable<VideoContent[]> {
        return from(liveQuery(async () => {
            const pid = await this.getActivePlaylistId();
            if (!pid) return [];
            const live = await this.db.live_tv.where('playlist_id').equals(pid).limit(20).toArray();
            return live.map(l => ({
                id: l.stream_id,
                title: l.name,
                description: 'Live TV Channel',
                thumbnailUrl: l.stream_icon,
                videoUrl: '',
                duration: '',
                genre: [],
                isOriginal: false,
                type: 'live',
                releaseDate: new Date(),
                rating: 0
            }));
        }) as any) as Observable<VideoContent[]>;
    }

    getMovieDetails(id: number): Observable<any> {
        return from(this.db.movies.where('stream_id').equals(id).first()).pipe(
            map((m: any) => {
                if (!m) return null;
                return {
                    ...m,
                    title: m.name,
                    description: 'No detailed description available in quick list.',
                    thumbnailUrl: m.stream_icon,
                    rating: m.rating,
                    releaseDate: new Date(),
                    duration: '',
                    genre: [],
                    type: 'movie'
                };
            })
        );
    }

    getContentById(id: number, type: 'movie' | 'series' | 'live'): Observable<VideoContent | null> {
        return from(liveQuery(async () => {
            const pid = await this.getActivePlaylistId();
            if (!pid) return null;

            let item: any;
            if (type === 'movie') {
                item = await this.db.movies.where('stream_id').equals(id).first();
            } else if (type === 'series') {
                // Series ID is series_id
                item = await this.db.series.where('series_id').equals(id).first();
            } else {
                item = await this.db.live_tv.where('stream_id').equals(id).first();
            }

            if (!item) return null;

            // Basic mapping
            return {
                id: type === 'series' ? item.series_id : item.stream_id,
                title: item.name,
                description: item.name || '',
                thumbnailUrl: item.stream_icon || item.cover,
                videoUrl: item.direct_source || '',
                duration: '',
                genre: [],
                isOriginal: type === 'series',
                type: type,
                releaseDate: new Date(),
                rating: 0
            };
        }) as any) as Observable<VideoContent | null>;
    }

    // --- Favorites & History ---

    getFavorites(): Observable<VideoContent[]> {
        return from(liveQuery(async () => {
            const pid = await this.getActivePlaylistId();
            if (!pid) return [];

            const playlist = await this.db.playlists.get(pid);
            const isM3U = playlist?.type === 'm3u';

            const favs = await this.db.favorites.where('playlist_id').equals(pid).toArray();
            return favs.map(f => ({
                id: f.content_id,
                title: f.title,
                description: '',
                thumbnailUrl: f.poster,
                videoUrl: '',
                duration: '',
                genre: [],
                isOriginal: f.type === 'series',
                type: isM3U ? 'live' : (f.type as 'movie' | 'series' | 'live'), // Force live for M3U
                releaseDate: new Date(),
                rating: 0
            }));
        }) as any) as Observable<VideoContent[]>;
    }

    getHistory(): Observable<VideoContent[]> {
        return from(liveQuery(async () => {
            const pid = await this.getActivePlaylistId();
            if (!pid) return [];
            const history = await this.db.history.where('playlist_id').equals(pid).reverse().sortBy('timestamp');
            return history.map(h => ({
                id: h.content_id,
                title: h.title,
                description: '',
                thumbnailUrl: h.poster,
                videoUrl: '',
                duration: '',
                genre: [],
                isOriginal: h.type === 'series',
                type: h.type as 'movie' | 'series' | 'live',
                releaseDate: new Date(h.timestamp || Date.now()),
                rating: 0
            }));
        }) as any) as Observable<VideoContent[]>;
    }

    async toggleFavorite(content: VideoContent) {
        const pid = await this.getActivePlaylistId();
        if (!pid) return;

        const existing = await this.db.favorites
            .where({ playlist_id: pid, content_id: content.id })
            .first();

        if (existing) {
            await this.db.favorites.delete(existing.id!);
        } else {
            await this.db.favorites.add({
                playlist_id: pid,
                content_id: content.id,
                type: content.type,
                title: content.title,
                poster: content.thumbnailUrl
            });
        }
    }

    async isFavorite(contentId: number): Promise<boolean> {
        const pid = await this.getActivePlaylistId();
        if (!pid) return false;
        const count = await this.db.favorites
            .where({ playlist_id: pid, content_id: contentId })
            .count();
        return count > 0;
    }

    async addToHistory(content: VideoContent) {
        const pid = await this.getActivePlaylistId();
        if (!pid) return;

        // Check if already in history, update timestamp if so
        const existing = await this.db.history
            .where({ playlist_id: pid, content_id: content.id })
            .first();

        if (existing) {
            await this.db.history.update(existing.id!, { timestamp: Date.now() });
        } else {
            await this.db.history.add({
                playlist_id: pid,
                content_id: content.id,
                type: content.type,
                title: content.title,
                poster: content.thumbnailUrl,
                timestamp: Date.now()
            });
        }
    }

    private mapXtreamToVideoContent(items: any[]): VideoContent[] {
        // console.log(`Mapping ${items.length} items from DB`);
        return items.map(item => ({
            id: item.stream_id,
            title: item.name,
            description: item.name,
            thumbnailUrl: item.stream_icon,
            videoUrl: '',
            duration: '',
            genre: [],
            isOriginal: false,
            type: 'movie',
            releaseDate: new Date(),
            rating: Number(item.rating) || 0
        }));
    }

    // --- All Content & Search ---

    getAllMovies(): Observable<VideoContent[]> {
        return from(liveQuery(async () => {
            const pid = await this.getActivePlaylistId();
            if (!pid) return [];
            const movies = await this.db.movies.where('playlist_id').equals(pid).toArray();
            return this.mapXtreamToVideoContent(movies);
        }) as any) as Observable<VideoContent[]>;
    }

    getAllSeries(): Observable<VideoContent[]> {
        return from(liveQuery(async () => {
            const pid = await this.getActivePlaylistId();
            if (!pid) return [];
            const series = await this.db.series.where('playlist_id').equals(pid).toArray();
            return series.map(s => ({
                id: s.series_id,
                title: s.name,
                description: s.plot || 'No description',
                thumbnailUrl: s.cover,
                videoUrl: '',
                duration: '',
                genre: [],
                isOriginal: true,
                releaseDate: s.last_modified ? new Date(Number(s.last_modified) * 1000) : new Date(),
                rating: 0
            }));
        }) as any) as Observable<VideoContent[]>;
    }

    getAllLiveTv(): Observable<VideoContent[]> {
        return from(liveQuery(async () => {
            const pid = await this.getActivePlaylistId();
            if (!pid) return [];
            const live = await this.db.live_tv.where('playlist_id').equals(pid).toArray();
            return live.map(l => ({
                id: l.stream_id,
                title: l.name,
                description: 'Live TV Channel',
                thumbnailUrl: l.stream_icon,
                videoUrl: '',
                duration: '',
                genre: [],
                isOriginal: false,
                type: 'live',
                releaseDate: new Date(),
                rating: 0
            }));
        }) as any) as Observable<VideoContent[]>;
    }

    searchContent(query: string): Observable<VideoContent[]> {
        return from(liveQuery(async () => {
            const pid = await this.getActivePlaylistId();
            if (!pid || !query) return [];

            const q = query.toLowerCase();

            // Search in all 3 tables
            const movies = await this.db.movies.where('playlist_id').equals(pid)
                .filter(m => m.name.toLowerCase().includes(q)).toArray();

            const series = await this.db.series.where('playlist_id').equals(pid)
                .filter(s => s.name.toLowerCase().includes(q)).toArray();

            const live = await this.db.live_tv.where('playlist_id').equals(pid)
                .filter(l => l.name.toLowerCase().includes(q)).toArray();

            const moviesMapped = this.mapXtreamToVideoContent(movies);
            const seriesMapped = series.map(s => ({
                id: s.series_id,
                title: s.name,
                description: s.plot || 'No description',
                thumbnailUrl: s.cover,
                videoUrl: '',
                duration: '',
                genre: [],
                isOriginal: true,
                releaseDate: s.last_modified ? new Date(Number(s.last_modified) * 1000) : new Date(),
                rating: 0
            }));
            const liveMapped = live.map(l => ({
                id: l.stream_id,
                title: l.name,
                description: 'Live TV Channel',
                thumbnailUrl: l.stream_icon,
                videoUrl: '',
                duration: '',
                genre: [],
                isOriginal: false, // Flag for routing (needs to be handled) or type
                releaseDate: new Date(),
                rating: 0
            }));

            // For search results, we might want to distinguish types better in the UI, 
            // but for now we mix them.
            // A clearer type indicator in VideoContent would be good.
            // We reuse 'isOriginal' for Series, maybe 'description' for Live TV.

            return [...moviesMapped, ...seriesMapped, ...liveMapped];
        }) as any) as Observable<VideoContent[]>;
    }
}
