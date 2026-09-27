import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
    private handlers: { [key: string]: DetachedRouteHandle } = {};

    // Routes we want to cache
    private acceptedRoutes = ['browse', 'movies', 'series', 'live-tv', 'mylist', 'search']; // basenames

    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        const path = this.getPath(route);
        return this.acceptedRoutes.includes(path);
    }

    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        const path = this.getPath(route);
        this.handlers[path] = handle;
    }

    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        const path = this.getPath(route);
        return !!this.handlers[path];
    }

    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
        const path = this.getPath(route);
        return this.handlers[path];
    }

    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        return future.routeConfig === curr.routeConfig;
    }

    private getPath(route: ActivatedRouteSnapshot): string {
        if (route.routeConfig && route.routeConfig.path) {
            return route.routeConfig.path;
        }
        return '';
    }
}
