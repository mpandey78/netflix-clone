import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbService, Playlist } from '../../core/services/db.service';
import { AuthService } from '../../core/services/auth.service';
import { M3UParserService } from '../../core/services/m3u-parser.service';
import { ToastService } from '../../core/services/toast.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MessageModalComponent } from '../../shared/components/message-modal/message-modal.component';

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [CommonModule, FormsModule, MessageModalComponent],
  templateUrl: './profiles.component.html',
  styleUrl: './profiles.component.scss'
})
export class ProfilesComponent implements OnInit {
  db = inject(DbService);
  auth = inject(AuthService);
  router = inject(Router);
  m3uService = inject(M3UParserService);
  toast = inject(ToastService);

  playlists: Playlist[] = [];
  isLoading = false;
  loadingId: number | null = null;

  // Loading states
  moviesStatus: 'pending' | 'loading' | 'completed' | 'error' = 'pending';
  seriesStatus: 'pending' | 'loading' | 'completed' | 'error' = 'pending';
  liveStatus: 'pending' | 'loading' | 'completed' | 'error' = 'pending';

  showLoadingOverlay = false;
  overlayPlaylist: Playlist | null = null;

  async ngOnInit() {
    this.playlists = await this.db.getAllPlaylists();
  }

  async selectProfile(playlist: Playlist) {
    if (playlist.id) {
      this.showLoadingOverlay = true;
      this.overlayPlaylist = playlist;

      // Just set the active user context in AuthService (no nav)
      await this.auth.selectProfile(playlist.id);

      // If M3U, no need to sync movies/series
      if (playlist.type === 'm3u') {
        this.moviesStatus = 'completed';
        this.seriesStatus = 'completed';
        this.liveStatus = 'completed'; // Already imported
        this.checkCompletion();
        return;
      }

      this.moviesStatus = 'loading';
      this.seriesStatus = 'loading';
      this.liveStatus = 'loading';

      // Check if data exists fully
      // We'll run parallel checks
      const [movies, series, live] = await Promise.all([
        this.db.movies.where('playlist_id').equals(playlist.id!).count(),
        this.db.series.where('playlist_id').equals(playlist.id!).count(),
        this.db.live_tv.where('playlist_id').equals(playlist.id!).count()
      ]);

      if (movies > 0 && series > 0 && live > 0) {
        // All data exists, simulate check delay for UX then redirect
        setTimeout(() => {
          this.moviesStatus = 'completed';
          this.seriesStatus = 'completed';
          this.liveStatus = 'completed';
          this.checkCompletion();
        }, 800);
      } else {
        // Data missing, start sync
        this.startSync(playlist);
      }
    }
  }

  async refreshProfile(event: Event, playlist: Playlist) {
    event.stopPropagation();
    this.startSync(playlist);
  }

  async startSync(playlist: Playlist) {
    if (!playlist.id) return;

    this.isLoading = true;
    this.showLoadingOverlay = true;
    this.overlayPlaylist = playlist;
    this.moviesStatus = 'loading';
    this.seriesStatus = 'loading';
    this.liveStatus = 'loading';

    // Set active profile first so we have credentials in state if needed, 
    // but AuthService.syncData accesses raw credentials passed to it, so strictly not needed for sync 
    // but good for "selected" state.
    // However, we don't want to navigate yet.
    // We manually call syncData.

    (await this.auth.syncData(playlist.url, playlist.username, playlist.password, playlist.id)).subscribe({
      next: (status) => {
        if (status.category === 'movies') this.moviesStatus = status.status;
        if (status.category === 'series') this.seriesStatus = status.status;
        if (status.category === 'live') this.liveStatus = status.status;

        this.checkCompletion();
      },
      error: (err) => console.error(err)
    });
  }

  checkCompletion() {
    if (this.moviesStatus === 'completed' && this.seriesStatus === 'completed' && this.liveStatus === 'completed') {
      setTimeout(() => {
        this.completeLoading();
      }, 500); // Small delay for UX
    }
  }

  completeLoading() {
    if (this.overlayPlaylist?.id) {
      // AuthService.selectProfile already called in selectProfile logic, 
      // but redundant call doesn't hurt. However, we MUST navigate.
      if (this.overlayPlaylist.type === 'm3u') {
        this.router.navigate(['/m3u-dashboard']);
      } else {
        this.router.navigate(['/browse']);
      }
    }
  }

  skipLoading() {
    this.completeLoading();
  }

  // Delete logic
  showDeleteModal = false;
  profileToDelete: Playlist | null = null;

  async deleteProfile(event: Event, playlist: Playlist) {
    event.stopPropagation();
    if (!playlist.id || this.isLoading) return;
    this.profileToDelete = playlist;
    this.showDeleteModal = true;
  }

  async confirmDelete() {
    if (!this.profileToDelete || !this.profileToDelete.id) return;

    try {
      await this.db.deletePlaylist(this.profileToDelete.id);
      this.playlists = await this.db.getAllPlaylists();
      this.toast.show('Profile deleted', 'success');
    } catch (e) {
      console.error(e);
      this.toast.show('Failed to delete profile', 'error');
    } finally {
      this.showDeleteModal = false;
      this.profileToDelete = null;
    }
  }

  addProfile() {
    this.router.navigate(['/login']);
  }

  // Edit logic
  showEditModal = false;
  editData: any = {};

  editProfile(event: Event, playlist: Playlist) {
    event.stopPropagation();
    this.editData = { ...playlist }; // clone
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editData = {};
  }

  async saveProfile() {
    if (!this.editData.id) return;

    try {
      const original = await this.db.playlists.get(this.editData.id);
      const urlChanged = original && original.url !== this.editData.url;

      await this.db.updatePlaylist(this.editData.id, this.editData);

      if (urlChanged) {
        // Clear old data
        await this.db.clearPlaylistContent(this.editData.id);

        if (this.editData.type === 'm3u') {
          // Re-import M3U immediately
          this.isLoading = true; // Block UI or show spinner? The modal is closing.
          // Better to keep modal or show overlay.
          // Let's use the loading overlay concept from selectProfile
          this.showEditModal = false;
          this.showLoadingOverlay = true;
          this.overlayPlaylist = this.editData;

          try {
            const channels = await this.m3uService.parseM3U(this.editData.url, this.editData.id);
            await this.db.transaction('rw', this.db.live_tv, async () => {
              await this.db.live_tv.bulkAdd(channels);
            });
            this.showLoadingOverlay = false;
          } catch (err) {
            console.error(err);
            this.showLoadingOverlay = false;
            this.toast.show('Failed to reload M3U playlist. Please check the URL.', 'error');
          }
        } else {
          // For Xtream, we just cleared data. 
          // The next time they click, selectProfile will see 0 items and trigger sync.
          this.closeEditModal();
        }
      } else {
        this.closeEditModal();
      }

      this.playlists = await this.db.getAllPlaylists();

      this.toast.show('Profile updated successfully', 'success');
    } catch (e) {
      console.error(e);
      this.toast.show('Failed to update profile', 'error');
    }
  }
}
