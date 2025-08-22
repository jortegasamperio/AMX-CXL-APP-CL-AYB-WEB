import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

const apiUrl = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class CatEmailService {

    constructor(private http: HttpClient) { }

    getHeaders(): HttpHeaders {
        const headers = new HttpHeaders({
            'Request-Source': 'Web'
            //'Authorization': localStorage.getItem('token')
        });
        return headers;
    }

    getEmail(data: any): Observable<any> {
        let headers = this.getHeaders();
        return this.http.post(`${apiUrl}/catemail/v1/get`, data, { headers });
    }

    addEmail(data: any): Observable<any> {
        let headers = this.getHeaders();
        return this.http.post(`${apiUrl}/catemail/v1/add`, data, { headers });
    }

    editEmail(data: any): Observable<any> {
        let headers = this.getHeaders();
        return this.http.put(`${apiUrl}/catemail/v1/edit`, data, { headers });
    }
}