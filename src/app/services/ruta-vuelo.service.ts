import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

const apiUrl = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class RutaVueloService {

    constructor(private http: HttpClient) { }

    getHeaders(): HttpHeaders {
        const headers = new HttpHeaders({
            'Request-Source': 'Web'
            //'Authorization': localStorage.getItem('token')
        });
        return headers;
    }

    getFlightsByPreselect(): Observable<any> {
        let headers = this.getHeaders();
        return this.http.get(`${apiUrl}/catruta/v1/get-flights-by-preselect`, { headers });
    }

    getStationsByPreselect(): Observable<any> {
        let headers = this.getHeaders();
        return this.http.get(`${apiUrl}/catruta/v1/get-stations-by-preselect`, { headers });
    }

    getFlightByCode(): Observable<any> {
        let headers = this.getHeaders();
        return this.http.get(`${apiUrl}/catruta/v1/get-flight-by-code`, { headers });
    }

}