import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../core/services/mock-data.service';
import { VideoContent } from '../../core/models/content.model';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { MovieDialogComponent } from '../../shared/components/movie-dialog/movie-dialog.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HeaderComponent, MovieCardComponent, MovieDialogComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  mockDataService = inject(MockDataService);

  heroMovie$: Observable<VideoContent> | null = null;
  trendingMovies$: Observable<VideoContent[]> | null = null;
  movies$: Observable<VideoContent[]> | null = null;
  series$: Observable<VideoContent[]> | null = null;
  liveTv$: Observable<VideoContent[]> | null = null;

  selectedMovie: VideoContent | null = null;

  ngOnInit() {
    this.heroMovie$ = this.mockDataService.getHeroMovie();
    this.trendingMovies$ = this.mockDataService.getTrending();
    this.movies$ = this.mockDataService.getMovies();
    this.series$ = this.mockDataService.getSeries();
    this.liveTv$ = this.mockDataService.getLiveTv();
  }

  showDetails(movie: VideoContent) {
    this.selectedMovie = movie;
    document.body.style.overflow = 'hidden';
  }

  closeDetails() {
    this.selectedMovie = null;
    document.body.style.overflow = 'auto';
  }
}
