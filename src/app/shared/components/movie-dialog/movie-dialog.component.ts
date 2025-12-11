import { Component, Input, Output, EventEmitter, OnInit, inject, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoContent } from '../../../core/models/content.model';
import { AuthService } from '../../../core/services/auth.service';
import Hls from 'hls.js';

@Component({
  selector: 'app-movie-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-dialog.component.html',
  styleUrl: './movie-dialog.component.scss'
})
export class MovieDialogComponent implements OnInit, OnDestroy {
  @Input() movie!: VideoContent;
  @Output() close = new EventEmitter<void>();

  @ViewChild('videoPlayer') videoElement!: ElementRef<HTMLVideoElement>;

  auth = inject(AuthService);
  isPlaying = false;
  hls: Hls | null = null;

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.hls) {
      this.hls.destroy();
    }
  }

  closeDialog() {
    this.close.emit();
  }

  playVideo() {
    this.isPlaying = true;
    setTimeout(() => {
      this.initPlayer();
    }, 100);
  }

  initPlayer() {
    const user = this.auth.currentUser();
    if (!user) return;

    // Credentials (this is a bit hacky, normally we'd store plain creds securely or in state)
    // We need the raw password. Currently AuthService stores 'email' as email, but we need the password.
    // The playlist in DB has the password. We need to fetch it.
    // For now, let's assume we can get it from the user object or we need to fetch the active playlist again.
    // OPTION: We'll fetch the active playlist from DB to get the password.

    this.startPlayback();
  }

  async startPlayback() {
    const active = await this.auth.db.getActivePlaylist();
    if (!active) return;

    const username = active.username;
    const password = active.password;
    const host = active.url;

    let streamUrl = '';

    // DETERMINE TYPE
    // We need a way to distinguish Live TV vs VOD.
    // In ContentService, we set description='Live TV Channel' or isOriginal=true (Series).

    if (this.movie.description === 'Live TV Channel') {
      // Live TV: http://url/live/user/pass/id.m3u8
      streamUrl = `${host}/live/${username}/${password}/${this.movie.id}.m3u8`;
    } else if (this.movie.isOriginal) {
      // Series: http://url/series/user/pass/id.mp4 (Usually)
      streamUrl = `${host}/series/${username}/${password}/${this.movie.id}.mp4`;
    } else {
      // Movie: http://url/movie/user/pass/id.mp4
      streamUrl = `${host}/movie/${username}/${password}/${this.movie.id}.mp4`;
    }

    console.log('Playing URL:', streamUrl);

    const video = this.videoElement.nativeElement;

    if (Hls.isSupported()) {
      this.hls = new Hls();
      this.hls.loadSource(streamUrl);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play();
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play();
      });
    }
  }
}
