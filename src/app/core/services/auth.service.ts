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
            // Ideally we re-verify or refresh data here background
        }
    }

    login(url: string, user: string, pass: string) {
        this.xtream.authenticate(url, user, pass).subscribe({
            next: async (res) => {
                if (res.user_info && res.user_info.auth === 1) {
                    // Auth success
                    const playlist = {
                        name: 'Main Playlist',
                        username: user,
                        password: pass,
                        url: url,
                        server_info: res.server_info,
                        isActive: true
                    };

                    // Save to DB
                    await this.db.addPlaylist(playlist);

                    this.currentUser.set({
                        id: 1,
                        name: res.user_info.username,
                        email: user,
                        photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png'
                    });

                    // Start Syncing Data
                    this.syncData(url, user, pass);

                    this.router.navigate(['/browse']);
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

    async syncData(url: string, user: string, pass: string) {
        // Fetch Movies
        this.xtream.getVodStreams(url, user, pass).subscribe(async (movies: any[]) => {
            if (Array.isArray(movies)) {
                await this.db.movies.bulkPut(movies);
                console.log(`Synced ${movies.length} movies`);
            }
        });

        // Fetch Series
        this.xtream.getSeries(url, user, pass).subscribe(async (series: any[]) => {
            if (Array.isArray(series)) {
                await this.db.series.bulkPut(series);
                console.log(`Synced ${series.length} series`);
            }
        });

        // Fetch Live TV
        this.xtream.getLiveStreams(url, user, pass).subscribe(async (live: any[]) => {
            if (Array.isArray(live)) {
                await this.db.live_tv.bulkPut(live);
                console.log(`Synced ${live.length} live channels`);
            }
        });
    }

    logout() {
        this.currentUser.set(null);
        // Deactivate playlist or clear
        this.router.navigate(['/login']);
    }
}
