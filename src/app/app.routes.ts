import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { BrowseComponent } from './pages/browse/browse.component';
import { LandingComponent } from './pages/landing/landing.component';
import { authGuard } from './core/guards/auth.guard';
import { ProfilesComponent } from './pages/profiles/profiles.component';

export const routes: Routes = [
    { path: '', component: LandingComponent },
    { path: 'login', component: LoginComponent },
    { path: 'profiles', component: ProfilesComponent },
    { path: 'browse', component: BrowseComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '' }
];
