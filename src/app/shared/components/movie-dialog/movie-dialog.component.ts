import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VideoContent } from '../../../core/models/content.model';
import { AuthService } from '../../../core/services/auth.service';
import { ContentService } from '../../../core/services/content.service';
import Hls from 'hls.js';

@Component({
  selector: 'app-movie-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-dialog.component.html',
  styleUrl: './movie-dialog.component.scss'
})
export class MovieDialogComponent implements OnInit {
  @Input() movie!: VideoContent;
  @Output() close = new EventEmitter<void>();

  router = inject(Router);

  auth = inject(AuthService);
  contentService = inject(ContentService);
  isFavorite = false;

  async ngOnInit() {
    this.isFavorite = await this.contentService.isFavorite(this.movie.id);
  }

  closeDialog() {
    this.close.emit();
  }

  playVideo() {
    this.closeDialog();
    this.router.navigate(['/watch', this.movie.type, this.movie.id]);
  }

  // Internal player logic removed in favor of full screen player

  async toggleFavorite() {
    await this.contentService.toggleFavorite(this.movie);
    this.isFavorite = !this.isFavorite;
  }
}
