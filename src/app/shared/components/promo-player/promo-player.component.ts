import { Component, Input, OnInit, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-promo-player',
    standalone: true,
    imports: [CommonModule],
    template: `
    <ng-container [ngSwitch]="videoType">
      <!-- YouTube -->
      <iframe *ngSwitchCase="'youtube'"
        [src]="safeUrl"
        frameborder="0" 
        allow="autoplay; encrypted-media" 
        allowfullscreen
        style="width: 100%; height: 100%; object-fit: cover; pointer-events: none;">
      </iframe>

      <!-- MP4 -->
      <video *ngSwitchCase="'mp4'" 
        [src]="url" 
        autoplay muted loop playsinline
        style="width: 100%; height: 100%; object-fit: cover;">
      </video>

      <!-- M3U (HLS) - Simplified for promo -->
      <!-- For a promo box, full HLS support might be heavy, but we can add a basic video tag 
           that works natively in Safari or use hls.js if needed. 
           For now, let's treat HLS as a standard video tag (works on Safari) 
           or show error/fallback. Detailed HLS impl requires hls.js setup similar to PlayerComponent. -->
      <video *ngSwitchCase="'m3u'" 
         #hlsVideo
         autoplay muted loop playsinline
         style="width: 100%; height: 100%; object-fit: cover;">
      </video>
    </ng-container>
  `
})
export class PromoPlayerComponent implements OnInit, OnChanges {
    @Input() url: string = '';

    sanitizer = inject(DomSanitizer);
    safeUrl: SafeResourceUrl | null = null;
    videoType: 'youtube' | 'mp4' | 'm3u' | 'unknown' = 'unknown';

    ngOnInit() {
        this.detectType();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['url']) {
            this.detectType();
        }
    }

    detectType() {
        if (!this.url) return;

        if (this.url.includes('youtube.com') || this.url.includes('youtu.be')) {
            this.videoType = 'youtube';
            const videoId = this.extractYouTubeId(this.url);
            // Construct embed URL with autoplay, mute, loop parameters
            const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3`;
            this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
        } else if (this.url.endsWith('.mp4')) {
            this.videoType = 'mp4';
            this.safeUrl = null; // direct src
        } else if (this.url.endsWith('.m3u') || this.url.endsWith('.m3u8')) {
            this.videoType = 'm3u';
            // HLS logic would go here. For now standard video tag.
            // If we need full HLS support for promo, we can refactor.
        } else {
            this.videoType = 'unknown';
        }
    }

    extractYouTubeId(url: string): string {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : '';
    }
}
