import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService } from '../../core/services/content.service';
import { VideoContent } from '../../core/models/content.model';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { MovieDialogComponent } from '../../shared/components/movie-dialog/movie-dialog.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-live-tv',
  standalone: true,
  imports: [CommonModule, MovieCardComponent, MovieDialogComponent],
  templateUrl: './live-tv.component.html',
  styleUrl: './live-tv.component.scss'
})
export class LiveTvComponent implements OnInit {
  contentService = inject(ContentService);
  liveTv$: Observable<VideoContent[]> | null = null;
  selectedMovie: VideoContent | null = null;

  ngOnInit() {
    this.liveTv$ = this.contentService.getAllLiveTv();
  }

  showDetails(movie: VideoContent) {
    this.selectedMovie = movie;
  }

  closeDetails() {
    this.selectedMovie = null;
  }

  trackByFn(index: number, item: VideoContent): number {
    return item.id;
  }
}
