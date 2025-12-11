import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  url = 'https://main.vpnconnection.net';
  playlistName = '';
  auth = inject(AuthService);
  router = inject(Router);

  onSubmit() {
    if (this.email && this.password && this.url && this.playlistName) {
      this.auth.login(this.url, this.email, this.password, this.playlistName);
      // navigation handles in auth service (to profiles)
    }
  }
}
