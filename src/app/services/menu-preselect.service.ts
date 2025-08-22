import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from '../../environments/environment';

const apiUrl = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class MenuPreselectService {
    private datosSource = new BehaviorSubject<any>(null);
    datos$ = this.datosSource.asObservable();

    constructor(private http: HttpClient) { }

    getHeaders(): HttpHeaders {
        const headers = new HttpHeaders({
            'Request-Source': 'Web'
            //'Authorization': localStorage.getItem('token')
        });
        return headers;
    }

    /* getData(idUser: any) {
        //GetListBar
        //this.currentData.isValidateSession();
        //let headers = this.getHeaders();
        let params = new HttpParams({ fromObject: { idUser } });

        return this.http.get(apiUrl + '/ListBar/GetListBar', { headers, params });
    } */

    getMenu(data: any): Observable<any> {
        return this.http.post(`${apiUrl}/menupreselect/v1/get`, data);
    }

    getMenuDetail(data: any): Observable<any> {
        return this.http.post(`${apiUrl}/menupreselect/v1/get-detail`, data);
    }

    addMenu(data: any): Observable<any> {
        return this.http.post(`${apiUrl}/menupreselect/v1/add`, data);
    }

    addMenuByFile(data: FormData): Observable<any> {
        let headers = this.getHeaders();
        return this.http.post(`${apiUrl}/menupreselect/v1/add-file`, data);
    }

    duplicateMenu(data: any): Observable<any> {
        let headers = this.getHeaders();
        return this.http.post(`${apiUrl}/menupreselect/v1/duplicate-menu`, data);
    }

    editMenu(data: any): Observable<any> {
        let headers = this.getHeaders();
        return this.http.put(`${apiUrl}/menupreselect/v1/edit`, data);
    }

    deleteSaucer(id: any): Observable<any> {
        let headers = this.getHeaders();
        let queryParams = new HttpParams();
        queryParams = queryParams.append("id",id);
        
        return this.http.delete(`${apiUrl}/menupreselect/v1/delete-saucer`,{params:queryParams, headers: headers});
        //return this.http.get(`${apiUrl}/menupreselect/v1/delete-saucer`,{params:queryParams});
        //return this.http.get(`${apiUrl}/menupreselect/v1/delete-saucer?id=${id}`, { headers });
    }

    deleteMenu(data: any): Observable<any> {
        let headers = this.getHeaders();
        return this.http.post(`${apiUrl}/menupreselect/v1/delete-menu`, data);
    }

    actualizarDatos(datos: any) {
        this.datosSource.next(datos);
    }

}