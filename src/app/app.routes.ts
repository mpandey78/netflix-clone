import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { BrowseComponent } from './pages/browse/browse.component';
import { LandingComponent } from './pages/landing/landing.component';
import { authGuard } from './core/guards/auth.guard';
import { ProfilesComponent } from './pages/profiles/profiles.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { MoviesComponent } from './pages/movies/movies.component';
import { SeriesComponent } from './pages/series/series.component';
import { LiveTvComponent } from './pages/live-tv/live-tv.component';
import { SearchComponent } from './pages/search/search.component';
import { PlayerComponent } from './pages/player/player.component';
import { MyListComponent } from './pages/my-list/my-list.component';

export const routes: Routes = [
    { path: '', component: LandingComponent },
    { path: 'login', component: LoginComponent },
    { path: 'profiles', component: ProfilesComponent },
    { path: 'browse', component: BrowseComponent, canActivate: [authGuard] },
    { path: 'movies', component: MoviesComponent, canActivate: [authGuard] },
    { path: 'series', component: SeriesComponent, canActivate: [authGuard] },
    { path: 'live-tv', loadComponent: () => import('./pages/m3u-dashboard/m3u-dashboard.component').then(a => a.M3uDashboardComponent), canActivate: [authGuard] },
    { path: 'search', component: SearchComponent, canActivate: [authGuard] },
    { path: 'watch/:type/:id', component: PlayerComponent, canActivate: [authGuard] },
    { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
    { path: 'mylist', component: MyListComponent, canActivate: [authGuard] },
    { path: 'm3u-dashboard', loadComponent: () => import('./pages/m3u-dashboard/m3u-dashboard.component').then(a => a.M3uDashboardComponent), canActivate: [authGuard] },
    { path: '**', redirectTo: '' }
];
