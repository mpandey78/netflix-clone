import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { VideoContent } from '../models/content.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  constructor() { }

  private readonly HERO_MOVIE: VideoContent = {
    id: 100,
    title: 'The Witcher',
    description: 'Geralt of Rivia, a mutated monster-hunter for hire, journeys toward his destiny in a turbulent world where people often prove more wicked than beasts.',
    thumbnailUrl: 'https://image.tmdb.org/t/p/original/7vjaCdMw15FEbXyLQTVa04URsPm.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=ndl1W4ltcmg',
    duration: '',
    genre: ['Action', 'Fantasy'],
    isOriginal: true,
    type: 'series',
    releaseDate: new Date(),
    rating: 8.1
  };

  private readonly TRENDING: VideoContent[] = [
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
      description: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine...',
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
    }
  ];

  private readonly MOVIES: VideoContent[] = [
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
    },
    {
      id: 9,
      title: 'Avengers: Endgame',
      description: 'After the devastating events of Infinity War, the universe is in ruins...',
      thumbnailUrl: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
      duration: '',
      genre: ['Action', 'Sci-Fi'],
      isOriginal: false,
      type: 'movie',
      releaseDate: new Date(),
      rating: 8.4
    },
    {
      id: 10,
      title: 'Spider-Man: No Way Home',
      description: 'Peter Parker is unmasked and no longer able to separate his normal life from the high-stakes of being a super-hero.',
      thumbnailUrl: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1R80vFA1A0ZpM1.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=JfVOs4VSpmA',
      duration: '',
      genre: ['Action', 'Adventure'],
      isOriginal: false,
      type: 'movie',
      releaseDate: new Date(),
      rating: 8.2
    }
  ];

  private readonly SERIES: VideoContent[] = [
    {
      id: 11,
      title: 'Game of Thrones',
      description: 'Nine noble families fight for control over the lands of Westeros...',
      thumbnailUrl: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=gcTkNV5Vg1E',
      duration: '',
      genre: ['Action', 'Drama'],
      isOriginal: false,
      type: 'series',
      releaseDate: new Date(),
      rating: 9.3
    },
    {
      id: 12,
      title: 'The Boys',
      description: 'A group of vigilantes set out to take down corrupt superheroes...',
      thumbnailUrl: 'https://image.tmdb.org/t/p/w500/stTEycfG9928RWa4c3N0OqU10K9.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=tcrNsIaQkb4',
      duration: '',
      genre: ['Action', 'Comedy'],
      isOriginal: true,
      type: 'series',
      releaseDate: new Date(),
      rating: 8.7
    },
    {
      id: 13,
      title: 'Squid Game',
      description: 'Hundreds of cash-strapped players accept a strange invitation to compete in children\'s games.',
      thumbnailUrl: 'https://image.tmdb.org/t/p/w500/dDlEmu3EZ0PggZzN5Bv1Pdbz2r8.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=oqxAJKy0ii4',
      duration: '',
      genre: ['Drama', 'Mystery'],
      isOriginal: true,
      type: 'series',
      releaseDate: new Date(),
      rating: 8.0
    },
    {
      id: 14,
      title: 'Peaky Blinders',
      description: 'A gangster family epic set in 1919 Birmingham, England...',
      thumbnailUrl: 'https://image.tmdb.org/t/p/w500/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=oVzVdvGIC7U',
      duration: '',
      genre: ['Drama', 'Crime'],
      isOriginal: true,
      type: 'series',
      releaseDate: new Date(),
      rating: 8.8
    }
  ];

  private readonly LIVETV: VideoContent[] = [
    {
      id: 15,
      title: 'News 24/7',
      description: 'Breaking news and continuous coverage.',
      thumbnailUrl: 'https://placehold.co/400x400/333/FFF?text=News+24/7',
      videoUrl: '',
      duration: '',
      genre: ['News'],
      isOriginal: false,
      type: 'live',
      releaseDate: new Date(),
      rating: 0
    },
    {
      id: 16,
      title: 'Sports Network',
      description: 'Live sports coverage, highlights, and analysis.',
      thumbnailUrl: 'https://placehold.co/400x400/123/FFF?text=Sports+Network',
      videoUrl: '',
      duration: '',
      genre: ['Sports'],
      isOriginal: false,
      type: 'live',
      releaseDate: new Date(),
      rating: 0
    }
  ];

  getHeroMovie(): Observable<VideoContent> {
    return of(this.HERO_MOVIE);
  }

  getTrending(): Observable<VideoContent[]> {
    return of(this.TRENDING);
  }

  getMovies(): Observable<VideoContent[]> {
    return of(this.MOVIES);
  }

  getSeries(): Observable<VideoContent[]> {
    return of(this.SERIES);
  }

  getLiveTv(): Observable<VideoContent[]> {
    return of(this.LIVETV);
  }
}
