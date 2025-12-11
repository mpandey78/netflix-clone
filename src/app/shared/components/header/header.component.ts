import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  auth = inject(AuthService);
  navItems = [
    { label: 'Home', link: '/browse' },
    { label: 'TV Shows', link: '/browse' },
    { label: 'Movies', link: '/browse' },
    { label: 'New & Popular', link: '/browse' }
  ];
}
