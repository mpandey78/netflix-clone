import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class XtreamService {
    http = inject(HttpClient);

    authenticate(url: string, user: string, pass: string): Observable<any> {
        // Construct the API URL for authentication
        // Usually logic is: GET http://url/player_api.php?username=X&password=Y
        const apiUrl = `${url}/player_api.php?username=${user}&password=${pass}`;
        return this.http.get(apiUrl);
    }

    getLiveStreams(url: string, user: string, pass: string): Observable<any> {
        const apiUrl = `${url}/player_api.php?username=${user}&password=${pass}&action=get_live_streams`;
        return this.http.get(apiUrl);
    }

    getVodStreams(url: string, user: string, pass: string): Observable<any> {
        const apiUrl = `${url}/player_api.php?username=${user}&password=${pass}&action=get_vod_streams`;
        return this.http.get(apiUrl);
    }

    getSeries(url: string, user: string, pass: string): Observable<any> {
        const apiUrl = `${url}/player_api.php?username=${user}&password=${pass}&action=get_series`;
        return this.http.get(apiUrl);
    }
}
