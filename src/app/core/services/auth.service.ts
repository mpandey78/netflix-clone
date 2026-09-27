import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/content.model';
import { XtreamService } from './xtream.service';
import { DbService } from './db.service';
import { ToastService } from './toast.service';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

export interface SyncStatus {
    category: 'movies' | 'series' | 'live';
    status: 'loading' | 'completed' | 'error';
    count?: number;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    currentUser = signal<User | null>(null);
    xtream = inject(XtreamService);
    db = inject(DbService);
    router = inject(Router);
    toast = inject(ToastService);

    // exposing router for skip functionality if needed externally, but usually component handles it.

    constructor() {
        // Check if there is an active session in DB on load
        this.checkActiveSession();
    }

    async checkActiveSession() {
        const activePlaylist = await this.db.getActivePlaylist();
        if (activePlaylist) {
            this.currentUser.set({
                id: activePlaylist.id!,
                name: activePlaylist.username,
                email: activePlaylist.username,
                photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png',
                type: activePlaylist.type
            });
            return true;
        }
        return false;
    }

    login(url: string, user: string, pass: string, playlistName: string) {
        this.xtream.authenticate(url, user, pass).subscribe({
            next: async (res) => {
                if (res.user_info && res.user_info.auth == 1) {
                    const playlist = {
                        name: playlistName,
                        username: user,
                        password: pass,
                        url: url,
                        server_info: res.server_info,
                        isActive: false
                    };

                    // Save to DB
                    this.db.addPlaylist(playlist).then(() => {
                        this.router.navigate(['/profiles']);
                    }).catch(error => {
                        this.toast.show(error.message, 'error'); // Should verify 'unique constraint' message
                    });
                } else {
                    this.toast.show('Login failed: Invalid credentials', 'error');
                }
            },
            error: (err) => {
                console.error(err);
                this.toast.show('Login failed: Connectivity issue or invalid URL', 'error');
            }
        });
    }

    async selectProfile(playlistId: number) {
        const playlists = await this.db.playlists.toArray();
        const selected = playlists.find(p => p.id === playlistId);

        if (selected) {
            await this.db.setPlaylistActive(playlistId);
            this.currentUser.set({
                id: playlistId,
                name: selected.name,
                email: selected.username,
                photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png',
                type: selected.type
            });
            // Navigation and sync logic moved to ProfilesComponent for better UI control
        }
    }

    async syncData(url: string, user: string, pass: string, playlistId: number): Promise<Observable<SyncStatus>> {
        const progress$ = new Subject<SyncStatus>();

        // Check type
        const playlist = await this.db.playlists.get(playlistId);
        if (playlist?.type === 'm3u') {
            // M3U doesn't sync from Xtream API
            setTimeout(() => {
                progress$.next({ category: 'live', status: 'completed', count: 0 }); // Already imported
                progress$.complete();
            }, 100);
            return progress$.asObservable();
        }

        // Helper to handle individual sync
        const syncCategory = (category: 'movies' | 'series' | 'live', apiCall: Observable<any[]>, table: any) => {
            progress$.next({ category, status: 'loading' });
            apiCall.subscribe({
                next: async (data) => {
                    if (Array.isArray(data)) {
                        try {
                            await table.where('playlist_id').equals(playlistId).delete();
                            const items = data.map(item => ({ ...item, playlist_id: playlistId }));
                            await table.bulkPut(items);
                            console.log(`Synced ${data.length} ${category} for playlist ${playlistId}`);
                            progress$.next({ category, status: 'completed', count: data.length });
                        } catch (err) {
                            console.error(`Error saving ${category}`, err);
                            progress$.next({ category, status: 'error' });
                        }
                    } else {
                        progress$.next({ category, status: 'error' });
                    }
                },
                error: (err) => {
                    console.error(`Error fetching ${category}`, err);
                    progress$.next({ category, status: 'error' });
                }
            });
        };

        syncCategory('movies', this.xtream.getVodStreams(url, user, pass), this.db.movies);
        syncCategory('series', this.xtream.getSeries(url, user, pass), this.db.series);
        syncCategory('live', this.xtream.getLiveStreams(url, user, pass), this.db.live_tv);

        return progress$.asObservable();
    }

    logout() {
        this.currentUser.set(null);
        // Deactivate playlist or clear
        this.router.navigate(['/login']);
    }
}
