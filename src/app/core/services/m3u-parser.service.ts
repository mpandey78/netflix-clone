import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LiveTV } from './db.service';

@Injectable({
    providedIn: 'root'
})
export class M3UParserService {
    http = inject(HttpClient);

    async parseM3U(url: string, playlistId: number): Promise<LiveTV[]> {
        try {
            const content = await firstValueFrom(this.http.get(url, { responseType: 'text' }));
            return this.parseContent(content, playlistId);
        } catch (error) {
            console.error('Error fetching M3U:', error);
            throw new Error('Failed to fetch M3U playlist');
        }
    }

    private parseContent(content: string, playlistId: number): LiveTV[] {
        const lines = content.split('\n');
        const channels: LiveTV[] = [];
        let currentChannel: Partial<LiveTV> = {};

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            if (line.startsWith('#EXTINF:')) {
                // Parse info
                // Example: #EXTINF:-1 tvg-id="" tvg-name="US: HBO" tvg-logo="http://..." group-title="Movies",US: HBO
                const info = line.substring(8);

                // Extract attributes
                const logoMatch = info.match(/tvg-logo="([^"]*)"/);
                const groupMatch = info.match(/group-title="([^"]*)"/);
                const commaIndex = info.lastIndexOf(',');
                const name = info.substring(commaIndex + 1).trim();

                currentChannel = {
                    playlist_id: playlistId,
                    name: name || 'Unknown Channel',
                    stream_icon: logoMatch ? logoMatch[1] : '',
                    category_id: groupMatch ? groupMatch[1] : 'Uncategorized',
                    epg_channel_id: '',
                    // Generate a pseudo-stream_id based on index or hash, but index is safer for simple lists
                    // We'll assign it when adding to DB or here if we trust sequence
                    stream_id: Date.now() + i // Simple unique ID generation strategy
                };
            } else if (!line.startsWith('#')) {
                // It's a URL
                if (currentChannel.name) {
                    // In M3U, the URL IS the stream. 
                    // However, our DB/Player structure expects a construction or specific storage.
                    // For M3U, we might need a way to store the full URL.
                    // Our LiveTV interface has `stream_id` but not `stream_url`.
                    // We usually construct URL from host/user/pass/id.
                    // For M3U, we should probably store the URL in a way we can retrieve.

                    // Hack: We can store the full URL in `direct_source` if we had it, or 
                    // we assume we will modify DbService or Player to handle this.
                    // Let's check DbService LiveTV interface again.
                    // It has: playlist_id, stream_id, name, stream_icon, category_id, epg_channel_id.

                    // We are missing a 'url' field for LiveTV in the DB if we want to support direct M3U urls!
                    // The current player constructs URL: `${host}/live/${username}/${password}/${this.content.id}.m3u8`

                    // Strategy: We need to store the direct URL. 
                    // We should update DbService LiveTV to have an optional `direct_source` or `url` field.
                    // For now, let's assume we will add that field.

                    (currentChannel as any).direct_source = line;

                    channels.push(currentChannel as LiveTV);
                    currentChannel = {};
                }
            }
        }
        return channels;
    }
}
