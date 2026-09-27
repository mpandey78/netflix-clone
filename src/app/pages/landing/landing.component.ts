import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { VideoContent } from '../../core/models/content.model';
import { Observable } from 'rxjs';
import { PromoPlayerComponent } from '../../shared/components/promo-player/promo-player.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, PromoPlayerComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {
  router = inject(Router);
  contentService = inject(ContentService);
  trendingMovies$: Observable<VideoContent[]> | null = null;
  env = environment;

  ngOnInit() {
    this.trendingMovies$ = this.contentService.getTrending();
  }

  onGetStarted() {
    this.router.navigate(['/login']);
  }
}
