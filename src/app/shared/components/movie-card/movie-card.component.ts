import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoContent } from '../../../core/models/content.model';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss',
  host: {
    '[class.landscape]': 'layout === "landscape"',
    '[class.portrait]': 'layout === "portrait"',
    '[class.square]': 'layout === "square"'
  }
})
export class MovieCardComponent {
  @Input() content!: VideoContent;
  @Input() layout: 'landscape' | 'portrait' | 'square' = 'landscape';
  @Output() movieClick = new EventEmitter<VideoContent>();

  handleClick() {
    this.movieClick.emit(this.content);
  }
}
