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
    type?: 'xtream' | 'm3u';
}

export interface Movie {
    playlist_id?: number;
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
    playlist_id?: number;
    series_id: number;
    name: string;
    cover: string;
    plot: string;
    category_id: string;
    last_modified: string;
}

export interface LiveTV {
    playlist_id?: number;
    stream_id: number;
    name: string;
    stream_icon: string;
    category_id: string;
    epg_channel_id: string;
    direct_source?: string; // For M3U playlists
}

@Injectable({
    providedIn: 'root'
})
export class DbService extends Dexie {
    playlists!: Table<Playlist, number>;
    movies!: Table<Movie, number>;
    series!: Table<Series, number>;
    live_tv!: Table<LiveTV, number>;
    favorites!: Table<VideoContentDB, number>;
    history!: Table<VideoContentDB, number>;

    constructor() {
        super('netflix-clone-db');
        this.version(2).stores({
            playlists: '++id, &name, isActive', // &name enforces uniqueness
            movies: 'stream_id, playlist_id, name, category_id, rating',
            series: 'series_id, playlist_id, name, category_id', // Compound index might be better but simple index ok 
            live_tv: 'stream_id, playlist_id, name, category_id',
            favorites: '++id, playlist_id, content_id',
            history: '++id, playlist_id, content_id, timestamp'
        });
    }

    async addPlaylist(playlist: Playlist) {
        // Enforce unique name strictly
        const existingName = await this.playlists.where('name').equals(playlist.name).first();
        if (existingName) {
            throw new Error('Playlist name must be unique');
        }

        // Check if duplicate url/user combination exists (optional logic, but user emphasized unique NAME)
        // We will stick to name uniqueness as primary constraint per request.

        return await this.playlists.add({ ...playlist, isActive: false }); // Default inactive
    }

    async getAllPlaylists() {
        return await this.playlists.toArray();
    }

    async setPlaylistActive(id: number) {
        await this.playlists.toCollection().modify({ isActive: false });
        await this.playlists.update(id, { isActive: true });
    }

    async getActivePlaylist() {
        return await this.playlists.filter(p => p.isActive).first();
    }

    // Clear content only for a specific playlist
    async clearPlaylistContent(playlistId: number) {
        await this.transaction('rw', this.movies, this.series, this.live_tv, async () => {
            await this.movies.where('playlist_id').equals(playlistId).delete();
            await this.series.where('playlist_id').equals(playlistId).delete();
            await this.live_tv.where('playlist_id').equals(playlistId).delete();
        });
    }

    async deletePlaylist(playlistId: number) {
        await this.transaction('rw', [this.playlists, this.movies, this.series, this.live_tv, this.favorites, this.history], async () => {
            // Delete the playlist entry
            await this.playlists.delete(playlistId);

            // Delete all associated content
            await this.movies.where('playlist_id').equals(playlistId).delete();
            await this.series.where('playlist_id').equals(playlistId).delete();
            await this.live_tv.where('playlist_id').equals(playlistId).delete();

            await this.history.where('playlist_id').equals(playlistId).delete();
        });
    }

    async updatePlaylist(id: number, changes: Partial<Playlist>) {
        return await this.playlists.update(id, changes);
    }
}

// Helper interface for DB storage of favorites/history
export interface VideoContentDB {
    id?: number;
    playlist_id: number;
    content_id: number; // stream_id or series_id
    type: 'movie' | 'series' | 'live';
    title: string;
    poster: string;
    timestamp?: number; // for history
}
