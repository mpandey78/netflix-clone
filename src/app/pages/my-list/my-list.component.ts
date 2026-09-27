import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService } from '../../core/services/content.service';
import { VideoContent } from '../../core/models/content.model';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { MovieDialogComponent } from '../../shared/components/movie-dialog/movie-dialog.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-my-list',
  standalone: true,
  imports: [CommonModule, MovieCardComponent, MovieDialogComponent],
  templateUrl: './my-list.component.html',
  styleUrl: './my-list.component.scss'
})
export class MyListComponent implements OnInit {
  contentService = inject(ContentService);
  favorites$: Observable<VideoContent[]> | null = null;
  selectedMovie: VideoContent | null = null;

  ngOnInit() {
    this.favorites$ = this.contentService.getFavorites();
  }

  showDetails(movie: VideoContent) {
    this.selectedMovie = movie;
  }

  closeDetails() {
    this.selectedMovie = null;
    // Refresh list? Observables are liveQuery so it should auto-update if item removed.
  }

  trackByFn(index: number, item: VideoContent): number {
    return item.id;
  }
}
