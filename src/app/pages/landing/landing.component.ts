import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { VideoContent } from '../../core/models/content.model';
import { Observable } from 'rxjs';
import { PromoPlayerComponent } from '../../shared/components/promo-player/promo-player.component';
import { environment } from '../../../environments/environment';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, PromoPlayerComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {
  router = inject(Router);
  mockDataService = inject(MockDataService);
  trendingMovies$: Observable<VideoContent[]> | null = null;
  env = environment;
  selectedMovie: VideoContent | null = null;

  ngOnInit() {
    this.trendingMovies$ = this.mockDataService.getTrending();
  }

  onGetStarted() {
    this.router.navigate(['/dashboard']);
  }

  openModal(movie: VideoContent) {
    this.selectedMovie = movie;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.selectedMovie = null;
    document.body.style.overflow = 'auto';
  }
}

