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

    getMovies(): Observable<VideoContent[]> {
        return from(liveQuery(async () => {
            const movies = await this.db.movies.toArray();
            return this.mapXtreamToVideoContent(movies);
        }) as any) as Observable<VideoContent[]>;
    }

    getTrending(): Observable<VideoContent[]> {
        return from(liveQuery(async () => {
            const movies = await this.db.movies.limit(20).toArray();
            return this.mapXtreamToVideoContent(movies);
        }) as any) as Observable<VideoContent[]>;
    }

    getPopular(): Observable<VideoContent[]> {
        return from(liveQuery(async () => {
            const movies = await this.db.movies.limit(20).toArray();
            return this.mapXtreamToVideoContent(movies);
        }) as any) as Observable<VideoContent[]>;
    }

    getTopRated(): Observable<VideoContent[]> {
        return from(liveQuery(async () => {
            const movies = await this.db.movies.limit(20).toArray();
            return this.mapXtreamToVideoContent(movies);
        }) as any) as Observable<VideoContent[]>;
    }

    getNowPlaying(): Observable<VideoContent[]> {
        return from(liveQuery(async () => {
            const movies = await this.db.movies.limit(20).toArray();
            return this.mapXtreamToVideoContent(movies);
        }) as any) as Observable<VideoContent[]>;
    }

    getAppOriginals(): Observable<VideoContent[]> {
        return from(liveQuery(async () => {
            const series = await this.db.series.limit(20).toArray();
            console.log(`Mapping ${series.length} series from DB`);
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

    getLiveTv(): Observable<VideoContent[]> {
        return from(liveQuery(async () => {
            const live = await this.db.live_tv.limit(20).toArray();
            console.log(`Mapping ${live.length} live channels from DB`);
            return live.map(l => ({
                id: l.stream_id,
                title: l.name,
                description: 'Live TV Channel',
                thumbnailUrl: l.stream_icon,
                videoUrl: '',
                duration: '',
                genre: [],
                isOriginal: false,
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
                    genre: []
                };
            })
        );
    }

    private mapXtreamToVideoContent(items: any[]): VideoContent[] {
        console.log(`Mapping ${items.length} items from DB`);
        return items.map(item => ({
            id: item.stream_id,
            title: item.name,
            description: item.name,
            thumbnailUrl: item.stream_icon,
            videoUrl: '',
            duration: '',
            genre: [],
            isOriginal: false,
            releaseDate: new Date(),
            rating: Number(item.rating) || 0
        }));
    }
}
