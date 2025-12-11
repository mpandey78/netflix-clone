import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/content.model';
import { XtreamService } from './xtream.service';
import { DbService } from './db.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    currentUser = signal<User | null>(null);
    xtream = inject(XtreamService);
    db = inject(DbService);
    router = inject(Router);

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
                photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png'
            });
            return true;
        }
        return false;
    }

    login(url: string, user: string, pass: string, playlistName: string) {
        this.xtream.authenticate(url, user, pass).subscribe({
            next: async (res) => {
                if (res.user_info && res.user_info.auth === 1) {
                    const playlist = {
                        name: playlistName,
                        username: user,
                        password: pass,
                        url: url,
                        server_info: res.server_info,
                        isActive: false
                    };

                    // Save to DB
                    await this.db.addPlaylist(playlist);
                    this.router.navigate(['/profiles']);
                } else {
                    alert('Login failed: Invalid credentials');
                }
            },
            error: (err) => {
                console.error(err);
                alert('Login failed: Connectivity issue or invalid URL');
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
                photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png'
            });
            // Clear old data and sync new
            await this.syncData(selected.url, selected.username, selected.password);
            this.router.navigate(['/browse']);
        }
    }

    async syncData(url: string, user: string, pass: string) {
        // We use lastValueFrom or promises to ensure we wait for data
        // However, for UX speed, we might want to navigate immediately and let this run in background.
        // But user reported data not showing, so let's try to fetch at least some before giving up or relying on liveQuery.

        try {
            // Fetch Movies
            this.xtream.getVodStreams(url, user, pass).subscribe(async (movies: any[]) => {
                if (Array.isArray(movies)) {
                    await this.db.movies.clear(); // Clear old content for clean sync (or intelligent merge)
                    await this.db.movies.bulkPut(movies);
                    console.log(`Synced ${movies.length} movies`);
                }
            });

            // Fetch Series
            this.xtream.getSeries(url, user, pass).subscribe(async (series: any[]) => {
                if (Array.isArray(series)) {
                    await this.db.series.clear();
                    await this.db.series.bulkPut(series);
                    console.log(`Synced ${series.length} series`);
                }
            });

            // Fetch Live TV
            this.xtream.getLiveStreams(url, user, pass).subscribe(async (live: any[]) => {
                if (Array.isArray(live)) {
                    await this.db.live_tv.clear();
                    await this.db.live_tv.bulkPut(live);
                    console.log(`Synced ${live.length} live channels`);
                }
            });
        } catch (e) {
            console.error("Sync Error", e);
        }
    }

    logout() {
        this.currentUser.set(null);
        // Deactivate playlist or clear
        this.router.navigate(['/login']);
    }
}
