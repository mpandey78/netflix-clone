import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService } from '../../core/services/content.service';
import { VideoContent } from '../../core/models/content.model';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { MovieDialogComponent } from '../../shared/components/movie-dialog/movie-dialog.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-m3u-dashboard',
    standalone: true,
    imports: [CommonModule, MovieCardComponent, MovieDialogComponent, HeaderComponent],
    templateUrl: './m3u-dashboard.component.html',
    styleUrl: './m3u-dashboard.component.scss'
})
export class M3uDashboardComponent implements OnInit {
    contentService = inject(ContentService);
    channels$: Observable<VideoContent[]> | null = null;
    selectedMovie: VideoContent | null = null;

    ngOnInit() {
        // M3U content is stored in live_tv table
        this.channels$ = this.contentService.getAllLiveTv();
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
