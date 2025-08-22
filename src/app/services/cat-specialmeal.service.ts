import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

const apiUrl = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class CatSpecialmealService {

    constructor(private http: HttpClient) { }

    getSpecialMeal(data: any): Observable<any> {
        return this.http.post(`${apiUrl}/catsml/v1/get-all`, data);
    }

    getImageSm(id: number): Observable<any> {
        return this.http.get(`${apiUrl}/catsml/v1/get-file?id=${id}`);
    }

}