import { Injectable, signal } from '@angular/core';
import Dexie, { Table } from 'dexie';

export interface Playlist {
    id?: number;
    name: string;
    username: string;
    password: string;
    url: string;
    server_info: any;
    isActive: boolean;
}

export interface Movie {
    stream_id: number;
    name: string;
    stream_icon: string;
    rating: string;
    added: string;
    category_id: string;
    container_extension: string;
    direct_source: string;
}

export interface Series {
    series_id: number;
    name: string;
    cover: string;
    plot: string;
    category_id: string;
    last_modified: string;
}

export interface LiveTV {
    stream_id: number;
    name: string;
    stream_icon: string;
    category_id: string;
    epg_channel_id: string;
}

@Injectable({
    providedIn: 'root'
})
export class DbService extends Dexie {
    playlists!: Table<Playlist, number>;
    movies!: Table<Movie, number>;
    series!: Table<Series, number>;
    live_tv!: Table<LiveTV, number>;

    constructor() {
        super('netflix-clone-db');
        this.version(1).stores({
            playlists: '++id, name, isActive',
            movies: 'stream_id, name, category_id, rating',
            series: 'series_id, name, category_id',
            live_tv: 'stream_id, name, category_id'
        });
    }

    async addPlaylist(playlist: Playlist) {
        // Deactivate others if this one is active
        if (playlist.isActive) {
            await this.playlists.toCollection().modify({ isActive: false });
        }
        return await this.playlists.add(playlist);
    }

    async getActivePlaylist() {
        return await this.playlists.filter(p => p.isActive).first();
    }

    async clearContent() {
        await this.transaction('rw', this.movies, this.series, this.live_tv, async () => {
            await this.movies.clear();
            await this.series.clear();
            await this.live_tv.clear();
        });
    }
}
