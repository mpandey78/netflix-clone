import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Router } from '@angular/router';
import { MessageModalComponent } from '../../shared/components/message-modal/message-modal.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, MessageModalComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  auth = inject(AuthService);
  router = inject(Router);
  toast = inject(ToastService);
  isLoading = false;
  showConfirmModal = false;

  goBack() {
    this.router.navigate(['/browse']);
  }

  async refreshData() {
    this.showConfirmModal = true;
  }

  async onConfirmRefresh() {
    this.showConfirmModal = false;

    const user = this.auth.currentUser();
    if (!user) return;

    const active = await this.auth.db.getActivePlaylist();
    if (!active || !active.id) return;

    this.isLoading = true;
    (await this.auth.syncData(active.url, active.username, active.password, active.id)).subscribe({
      next: (status) => {
        if (status.status === 'error') {
          this.toast.show(`Error syncing ${status.category}`, 'error');
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });

    // Quick workaround for feedback since syncData is long running
    setTimeout(() => {
      this.isLoading = false;
      this.toast.show('Data refresh process started in background.', 'info');
    }, 1000);
  }

  async logout() {
    this.auth.currentUser.set(null);
    const count = await this.auth.db.playlists.count();
    if (count > 0) {
      this.router.navigate(['/profiles']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
