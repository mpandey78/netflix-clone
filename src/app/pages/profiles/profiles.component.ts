import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbService, Playlist } from '../../core/services/db.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profiles.component.html',
  styleUrl: './profiles.component.scss'
})
export class ProfilesComponent implements OnInit {
  db = inject(DbService);
  auth = inject(AuthService);
  router = inject(Router);

  playlists: Playlist[] = [];

  async ngOnInit() {
    this.playlists = await this.db.getAllPlaylists();
  }

  selectProfile(playlist: Playlist) {
    if (playlist.id) {
      this.auth.selectProfile(playlist.id);
    }
  }

  addProfile() {
    this.router.navigate(['/login']);
  }
}
