import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

const apiUrl = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class CatRutasVueloService {

    constructor(private http: HttpClient) { }

    getHeaders(): HttpHeaders {
        const headers = new HttpHeaders({
            'Request-Source': 'Web'
            //'Authorization': localStorage.getItem('token')
        });
        return headers;
    }

    addRuta(data: any): Observable<any> {
        let headers = this.getHeaders();
        return this.http.post(`${apiUrl}/catruta/v1/add`, data, { headers });
    }

    editRutaVuelo(data: any): Observable<any> {
        let headers = this.getHeaders();
        return this.http.put(`${apiUrl}/catruta/v1/edit`, data, { headers });
    }

    getRutasVuelo(data: any): Observable<any> {
        let headers = this.getHeaders();
        return this.http.post(`${apiUrl}/catruta/v1/get-all`, data, { headers });
    }

    addRutaByFile(data: any): Observable<any> {
        let headers = this.getHeaders();
        return this.http.post(`${apiUrl}/catruta/v1/add-file`, data, { headers });
    }

    getRutaVueloDetails(id: number): Observable<any> {
        let headers = this.getHeaders();
        return this.http.get(`${apiUrl}/catruta/v1/get-detail/?id=${id}`, { headers });
    }

    deleteRutaVuelo(id: number): Observable<any> {
        let headers = this.getHeaders();
        return this.http.delete(`${apiUrl}/catruta/v1/delete/?id=${id}`, { headers });
    }

}