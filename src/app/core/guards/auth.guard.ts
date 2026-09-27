import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.currentUser()) {
        return true;
    } else {
        // Check session restoration
        const isActive = await authService.checkActiveSession();
        if (isActive) {
            return true;
        }
        return router.createUrlTree(['/login']);
    }
};
