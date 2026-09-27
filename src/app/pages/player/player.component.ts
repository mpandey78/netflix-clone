import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { AuthService } from '../../core/services/auth.service';
import { VideoContent } from '../../core/models/content.model';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import Hls from 'hls.js';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss'
})
export class PlayerComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  router = inject(Router);
  location = inject(Location);
  contentService = inject(ContentService);
  auth = inject(AuthService);

  @ViewChild('videoPlayer') videoElement!: ElementRef<HTMLVideoElement>;

  content: VideoContent | null = null;
  hls: Hls | null = null;

  // State
  isLoading = true;
  isPlaying = false;
  isMuted = false;
  volume = 1;
  currentTime = 0;
  duration = 0;
  showControls = true;
  controlsTimeout: any;

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const type = params.get('type') as 'movie' | 'series' | 'live';
        const id = Number(params.get('id'));
        if (type && id) {
          return this.contentService.getContentById(id, type);
        }
        return of(null);
      })
    ).subscribe(content => {
      if (content) {
        this.content = content;
        // Schedule init after view check
        setTimeout(() => this.initPlayer(), 100);
      } else {
        // Handle error provided content not found
        this.isLoading = false;
      }
    });

    // Activity listener for controls
    document.addEventListener('mousemove', this.resetControlsTimer.bind(this));
    document.addEventListener('click', this.resetControlsTimer.bind(this));
  }

  ngOnDestroy() {
    if (this.hls) {
      this.hls.destroy();
    }
    document.removeEventListener('mousemove', this.resetControlsTimer.bind(this));
    document.removeEventListener('click', this.resetControlsTimer.bind(this));
    clearTimeout(this.controlsTimeout);
  }

  async initPlayer() {
    if (!this.content || !this.videoElement) return;

    const active = await this.auth.db.getActivePlaylist();
    if (!active) return; // Should redirect to profiles

    const username = active.username;
    const password = active.password;
    const host = active.url;

    let streamUrl = '';

    if (this.content.videoUrl) {
      streamUrl = this.content.videoUrl;
    } else if (this.content.type === 'live') {
      streamUrl = `${host}/live/${username}/${password}/${this.content.id}.m3u8`;
    } else if (this.content.type === 'series') {
      streamUrl = `${host}/series/${username}/${password}/${this.content.id}.mp4`;
    } else {
      streamUrl = `${host}/movie/${username}/${password}/${this.content.id}.mp4`;
    }

    const video = this.videoElement.nativeElement;

    if (Hls.isSupported()) {
      this.hls = new Hls();
      this.hls.loadSource(streamUrl);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.isLoading = false;
        video.play().catch(e => console.error("Autoplay failed", e));
        this.isPlaying = true;
      });
      this.hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error("Fatal error", data);
          this.isLoading = false; // Show error UI?
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        this.isLoading = false;
        video.play();
        this.isPlaying = true;
      });
    }

    this.resetControlsTimer();
  }

  // --- Controls ---

  togglePlay() {
    const video = this.videoElement.nativeElement;
    if (video.paused) {
      video.play();
      this.isPlaying = true;
    } else {
      video.pause();
      this.isPlaying = false;
    }
    this.resetControlsTimer();
  }

  onTimeUpdate() {
    const video = this.videoElement.nativeElement;
    this.currentTime = video.currentTime;
    this.duration = video.duration || 0;
  }

  seek(event: any) {
    const video = this.videoElement.nativeElement;
    video.currentTime = event.target.value;
    this.currentTime = video.currentTime;
    this.resetControlsTimer();
  }

  toggleMute() {
    const video = this.videoElement.nativeElement;
    this.isMuted = !this.isMuted;
    video.muted = this.isMuted;
  }

  onVolumeChange(event: any) {
    const video = this.videoElement.nativeElement;
    this.volume = event.target.value;
    video.volume = this.volume;
    this.isMuted = this.volume === 0;
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  goBack() {
    this.location.back();
  }

  resetControlsTimer() {
    this.showControls = true;
    clearTimeout(this.controlsTimeout);
    this.controlsTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.showControls = false;
      }
    }, 3000); // Hide after 3s
  }

  formatTime(seconds: number): string {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }
}
