import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ContentService } from '../../core/services/content.service';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { MovieDialogComponent } from '../../shared/components/movie-dialog/movie-dialog.component';
import { VideoContent } from '../../core/models/content.model';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [CommonModule, HeaderComponent, MovieCardComponent, MovieDialogComponent],
  templateUrl: './browse.component.html',
  styleUrl: './browse.component.scss'
})
export class BrowseComponent implements OnInit {
  auth = inject(AuthService);
  contentService = inject(ContentService);

  popularMovies$: Observable<VideoContent[]> | null = null;
  topRatedMovies$: Observable<VideoContent[]> | null = null;
  trendingMovies$: Observable<VideoContent[]> | null = null;
  nowPlayingMovies$: Observable<VideoContent[]> | null = null;

  bannerMovie$: Observable<VideoContent | undefined> | null = null;
  selectedMovie: VideoContent | null = null;

  ngOnInit() {
    this.popularMovies$ = this.contentService.getPopular();
    this.topRatedMovies$ = this.contentService.getTopRated();
    this.trendingMovies$ = this.contentService.getTrending();
    this.nowPlayingMovies$ = this.contentService.getNowPlaying();

    // Pick the first popular movie as banner
    this.bannerMovie$ = this.popularMovies$.pipe(
      map(movies => movies[0])
    );
  }

  showDetails(movie: VideoContent) {
    this.selectedMovie = movie;
  }

  closeDetails() {
    this.selectedMovie = null;
  }
}
