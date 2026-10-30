import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { FashionItem } from '../Classes/FashionItem';

// Exercise 58 - calls the RESTful APIs of my-server-mongodb
@Injectable({
  providedIn: 'root',
})
export class FashionStoreService {
  constructor(private _http: HttpClient) { }

  // all Fashions, sorted by creation date descending
  getFashions(): Observable<FashionItem[]> {
    return this._http.get<FashionItem[]>("/fashions").pipe(catchError(this.handleError))
  }
  // list of Styles
  getStyles(): Observable<string[]> {
    return this._http.get<string[]>("/fashions/styles").pipe(catchError(this.handleError))
  }
  // Fashions of a certain Style
  getFashionsByStyle(style: string): Observable<FashionItem[]> {
    return this._http.get<FashionItem[]>("/fashions/style/" + encodeURIComponent(style)).pipe(catchError(this.handleError))
  }
  // one Fashion by id
  getFashion(id: string): Observable<FashionItem> {
    return this._http.get<FashionItem>("/fashions/" + id).pipe(catchError(this.handleError))
  }
  // [Slug] resolve a slug ("street-style-p3", "3" or "street-style") to one Fashion
  getFashionBySlug(slug: string): Observable<FashionItem> {
    return this._http.get<FashionItem>("/fashions/slug/" + encodeURIComponent(slug)).pipe(catchError(this.handleError))
  }
  // one Fashion by the numeric IdF
  getFashionByIdF(idf: number): Observable<FashionItem> {
    return this._http.get<FashionItem>("/fashions/idf/" + idf).pipe(catchError(this.handleError))
  }
  // add new Fashion
  postFashion(f: FashionItem): Observable<FashionItem> {
    return this._http.post<FashionItem>("/fashions", f).pipe(catchError(this.handleError))
  }
  // edit Fashion
  putFashion(f: FashionItem): Observable<FashionItem> {
    return this._http.put<FashionItem>("/fashions", f).pipe(catchError(this.handleError))
  }
  // delete Fashion by id
  deleteFashion(id: string): Observable<FashionItem> {
    return this._http.delete<FashionItem>("/fashions/" + id).pipe(catchError(this.handleError))
  }

  handleError(error: HttpErrorResponse) {
    return throwError(() => new Error(error.message))
  }
}
