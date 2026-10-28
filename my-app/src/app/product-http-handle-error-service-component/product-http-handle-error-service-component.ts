import { Component, signal } from '@angular/core';
import { ProductHttpHandleErrorService } from '../services/product-http-handle-error-service';
import { Product } from '../Classes/IProduct';
import { Observable, catchError, map } from 'rxjs';

@Component({
  selector: 'app-product-http-handle-error-service-component',
  standalone: false,
  styleUrl: './product-http-handle-error-service-component.css',
  templateUrl: './product-http-handle-error-service-component.html',
})
export class ProductHttpHandleErrorServiceComponent {
  products = signal<Product[]>([]);
  errMessage = signal('');

  constructor(private _service: ProductHttpHandleErrorService) {}

  ngOnInit(): void {
    this._service.getProductList().subscribe({
      next: (data) => {
        this.products.set(data);
      },
      error: (err) => {
        this.errMessage.set(err.message ?? err);
      },
    });
  }

  getProductById(id: number): Observable<Product | undefined> {
    return this._service.getProductList().pipe(
      map((products: Product[]) => products.find((p) => p.id === id)),
      catchError((error) => this._service.handleError(error))
    );
  }
}
