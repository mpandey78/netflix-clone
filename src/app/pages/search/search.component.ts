import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { VideoContent } from '../../core/models/content.model';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { MovieDialogComponent } from '../../shared/components/movie-dialog/movie-dialog.component';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, MovieCardComponent, MovieDialogComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit {
  route = inject(ActivatedRoute);
  contentService = inject(ContentService);

  searchResults$: Observable<VideoContent[]> | null = null;
  searchQuery: string = '';
  selectedMovie: VideoContent | null = null;

  ngOnInit() {
    this.searchResults$ = this.route.queryParams.pipe(
      switchMap(params => {
        this.searchQuery = params['q'] || '';
        return this.contentService.searchContent(this.searchQuery);
      })
    );
  }

  showDetails(movie: VideoContent) {
    this.selectedMovie = movie;
  }

  closeDetails() {
    this.selectedMovie = null;
  }
}
