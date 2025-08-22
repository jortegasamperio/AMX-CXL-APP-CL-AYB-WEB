import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

const apiUrl = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class CatCodePreselectService {

    constructor(private http: HttpClient) { }

    validateCodPreselect(data: any): Observable<any> {
        return this.http.post(`${apiUrl}/catpreselect/v1/validate`, data);
    }

    addCodPreselect(data: any): Observable<any> {
        return this.http.post(`${apiUrl}/catpreselect/v1/add`, data);
    }

    editCodPreselect(data: any): Observable<any> {
        return this.http.put(`${apiUrl}/catpreselect/v1/edit`, data);
    }

    getPreselect(data: any): Observable<any> {
        return this.http.post(`${apiUrl}/catpreselect/v1/get`, data);
    }

    addPreselectByFile(data: any): Observable<any> {
        return this.http.post(`${apiUrl}/catpreselect/v1/add-file`, data);
    }

    getPreselectDetails(id: number): Observable<any> {
        return this.http.get(`${apiUrl}/catpreselect/v1/get-detail/?id=${id}`);
    }

    deletePreselect(id: number): Observable<any> {
        return this.http.delete(`${apiUrl}/catpreselect/v1/delete/?id=${id}`);
    }

}