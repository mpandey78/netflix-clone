import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  auth = inject(AuthService);
  router = inject(Router);

  searchTerm = '';

  get navItems() {
    const user = this.auth.currentUser();
    const isM3U = user?.type === 'm3u';

    if (isM3U) {
      return [
        { label: 'Home', link: '/m3u-dashboard' },
        // { label: 'Playlist', link: '/live-tv' }, // Redundant if Home is Dashboard
        // Hide Movies and TV Shows for M3U
        { label: 'My List', link: '/mylist' }
      ];
    }

    return [
      { label: 'Home', link: '/browse' },
      { label: 'TV Shows', link: '/series' },
      { label: 'Movies', link: '/movies' },
      { label: 'Live TV', link: '/live-tv' },
      { label: 'My List', link: '/mylist' }
    ];
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchTerm } });
    }
  }

  logout() {
    this.auth.logout();
  }
}
