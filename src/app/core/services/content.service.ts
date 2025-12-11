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
        }) as any);
    }

    getTrending(): Observable<VideoContent[]> {
        return from(liveQuery(async () => {
            const movies = await this.db.movies.filter(m => Number(m.rating) > 5).limit(20).toArray();
            return this.mapXtreamToVideoContent(movies);
        }) as any);
    }

    getPopular(): Observable<VideoContent[]> {
        return from(liveQuery(async () => {
            const movies = await this.db.movies.filter(m => Number(m.rating) > 7).limit(20).toArray();
            return this.mapXtreamToVideoContent(movies);
        }) as any);
    }

    getTopRated(): Observable<VideoContent[]> {
        return from(liveQuery(async () => {
            const movies = await this.db.movies.filter(m => Number(m.rating) >= 8).limit(20).toArray();
            return this.mapXtreamToVideoContent(movies);
        }) as any);
    }

    getNowPlaying(): Observable<VideoContent[]> {
        return from(liveQuery(async () => {
            const movies = await this.db.movies.limit(20).toArray();
            return this.mapXtreamToVideoContent(movies);
        }) as any);
    }

    getAppOriginals(): Observable<VideoContent[]> {
        return from(liveQuery(async () => {
            const series = await this.db.series.limit(20).toArray();
            return series.map(s => ({
                id: s.series_id,
                title: s.name,
                description: s.plot,
                thumbnailUrl: s.cover,
                videoUrl: '',
                duration: '',
                genre: [],
                isOriginal: true,
                releaseDate: new Date(Number(s.last_modified) * 1000),
                rating: 0
            }));
        }) as any);
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
