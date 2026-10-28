import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../Classes/IProduct';
import { Observable, catchError, map, retry, throwError } from 'rxjs';

@Injectable({
    providedIn:'root',
})
export class ProductHttpHandleErrorService {
    private _url:string="/datasets/products.json"
    constructor(private _http:HttpClient){}
    getProductList():Observable<Product[]>{
        return this._http.get<Product[]>(this._url)
                .pipe(
                    retry(3),
                    catchError(this.handleError)
              )         
    }

    getProductById(id: number): Observable<Product | undefined> {
        return this.getProductList().pipe(
            map((products: Product[]) => products.find((product) => product.id === id)),
            catchError((error) => this.handleError(error))
        );
    }

    handleError(error:HttpErrorResponse)
    {
        return throwError(()=>new Error(error.message))
    }
}

