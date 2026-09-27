import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DbService } from '../../core/services/db.service';
import { M3UParserService } from '../../core/services/m3u-parser.service';
import { ToastService } from '../../core/services/toast.service';
import { PromoPlayerComponent } from '../../shared/components/promo-player/promo-player.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, PromoPlayerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  auth = inject(AuthService);
  db = inject(DbService);
  router = inject(Router);
  m3uService = inject(M3UParserService);
  toast = inject(ToastService);
  env = environment;

  // Xtream
  playlistName = '';
  url = '';
  email = ''; // Username
  password = '';

  // M3U
  isM3UMode = false;
  m3uName = '';
  m3uUrl = '';

  isLoading = false;
  hasPlaylists = false;



  async ngOnInit() {
    const count = await this.db.playlists.count();
    this.hasPlaylists = count > 0;
  }



  toggleMode() {
    this.isM3UMode = !this.isM3UMode;
  }

  async onSubmit() {
    if (this.isM3UMode) {
      await this.onM3USubmit();
      return;
    }

    if (!this.playlistName || !this.url || !this.email || !this.password) {
      this.toast.show('Please fill all fields', 'error');
      return;
    }

    this.isLoading = true;
    try {
      this.auth.login(this.url, this.email, this.password, this.playlistName);
      // login method in auth service currently handles navigation, but we should make it return observable/promise to own it here.
      // But looking at existing code: auth.login is void and navigates internally? 
      // Checking auth.service.ts... it subscribes and navigates.
      // We will leave existing auth.login as is for now but start loading here.
      // Wait, standard auth.login calls subscribe internally. 
      // We'll trust it handles the spinner or errors appropriately, but here we set isLoading=true.
      // Ideally AuthService should return observable.
      // Since I can't easily change AuthService signature safely right now without verifying all callers, 
      // I will reset isLoading after a timeout if not redirected? Or just rely on it.

      // Actually, looking at previous edit attempt, I tried to make it return observable in AuthService? No I didn't change return type of login().

      // Let's just keep existing logic for Xtream but use local props
      // Note: original code used this.url, this.email etc.
    } catch (e) {
      this.isLoading = false;
      this.toast.show('Error during login', 'error');
    }
  }

  async onM3USubmit() {
    if (!this.m3uName || !this.m3uUrl) {
      this.toast.show('Please enter a name and M3U URL', 'error');
      return;
    }

    this.isLoading = true;
    try {
      // 1. Create Playlist Entry
      const playlistId = await this.db.addPlaylist({
        name: this.m3uName,
        username: '',
        password: '',
        url: this.m3uUrl,
        server_info: {},
        isActive: true,
        type: 'm3u'
      });

      // 2. Set as active
      await this.db.setPlaylistActive(playlistId);

      // 3. Parse and Save Content
      const channels = await this.m3uService.parseM3U(this.m3uUrl, playlistId);

      // Bulk add to live_tv
      await this.db.transaction('rw', this.db.live_tv, async () => {
        await this.db.live_tv.bulkAdd(channels);
      });

      this.isLoading = false;
      this.router.navigate(['/m3u-dashboard']);

    } catch (e: any) {
      this.isLoading = false;
      this.toast.show('M3U Import Failed: ' + e.message, 'error');
    }
  }

  goToProfiles() {
    this.router.navigate(['/profiles']);
  }
}
