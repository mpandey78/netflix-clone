import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoContent } from '../../../core/models/content.model';

@Component({
  selector: 'app-movie-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-dialog.component.html',
  styleUrl: './movie-dialog.component.scss'
})
export class MovieDialogComponent implements OnInit {
  @Input() movie!: VideoContent;
  @Output() close = new EventEmitter<void>();

  ngOnInit() {
    // In a real app, you might fetch more details here using movie.id
  }

  closeDialog() {
    this.close.emit();
  }
}
