import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { VideoContent } from '../../core/models/content.model';
import { Observable, of } from 'rxjs';
import { PromoPlayerComponent } from '../../shared/components/promo-player/promo-player.component';
import { environment } from '../../../environments/environment';

const MOCK_MOVIES: VideoContent[] = [
  {
    id: 1,
    title: 'Stranger Things',
    description: 'When a young boy vanishes, a small town uncovers a mystery...',
    thumbnailUrl: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8SQvdcybc.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=b9EkMc79ZSU',
    duration: '',
    genre: ['Sci-Fi', 'Drama'],
    isOriginal: true,
    type: 'series',
    releaseDate: new Date(),
    rating: 8.6
  },
  {
    id: 2,
    title: 'The Witcher',
    description: 'Geralt of Rivia, a mutated monster-hunter for hire...',
    thumbnailUrl: 'https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=ndl1W4ltcmg',
    duration: '',
    genre: ['Action', 'Fantasy'],
    isOriginal: true,
    type: 'series',
    releaseDate: new Date(),
    rating: 8.1
  },
  {
    id: 3,
    title: 'Money Heist',
    description: 'To carry out the biggest heist in history, a mysterious man called The Professor...',
    thumbnailUrl: 'https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=_InqQJRqGW4',
    duration: '',
    genre: ['Action', 'Crime'],
    isOriginal: true,
    type: 'series',
    releaseDate: new Date(),
    rating: 8.2
  },
  {
    id: 4,
    title: 'Dark',
    description: 'A family saga with a supernatural twist...',
    thumbnailUrl: 'https://image.tmdb.org/t/p/w500/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=rrwycJ08PSA',
    duration: '',
    genre: ['Sci-Fi', 'Mystery'],
    isOriginal: true,
    type: 'series',
    releaseDate: new Date(),
    rating: 8.7
  },
  {
    id: 5,
    title: 'Breaking Bad',
    description: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family\'s future.',
    thumbnailUrl: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=HhesaQXLuRY',
    duration: '',
    genre: ['Drama', 'Crime'],
    isOriginal: false,
    type: 'series',
    releaseDate: new Date(),
    rating: 9.5
  },
  {
    id: 6,
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology...',
    thumbnailUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    duration: '',
    genre: ['Action', 'Sci-Fi'],
    isOriginal: false,
    type: 'movie',
    releaseDate: new Date(),
    rating: 8.8
  },
  {
    id: 7,
    title: 'Interstellar',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    thumbnailUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    duration: '',
    genre: ['Adventure', 'Sci-Fi'],
    isOriginal: false,
    type: 'movie',
    releaseDate: new Date(),
    rating: 8.6
  },
  {
    id: 8,
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham...',
    thumbnailUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
    duration: '',
    genre: ['Action', 'Crime'],
    isOriginal: false,
    type: 'movie',
    releaseDate: new Date(),
    rating: 9.0
  }
];

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
  selectedMovie: VideoContent | null = null;

  ngOnInit() {
    this.trendingMovies$ = of(MOCK_MOVIES);
  }

  onGetStarted() {
    this.router.navigate(['/login']);
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

