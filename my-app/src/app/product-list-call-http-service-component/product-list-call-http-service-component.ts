import { Component, signal } from '@angular/core';
import { Product } from '../Classes/IProduct';
import { ProductHttpService } from '../services/product-http-service';

@Component({
  selector: 'app-product-list-call-http-service-component',
  standalone: false,
  styleUrl: './product-list-call-http-service-component.css',
  templateUrl: './product-list-call-http-service-component.html',
})
export class ProductListCallHttpServiceComponent {
  products=signal<Product[]>([])
  constructor(private _service: ProductHttpService){}
  ngOnInit():void
  {
    this._service.getProductList().subscribe({
      next:(data: Product[])=>
      {
        this.products.set(data);
      },
      error:(err: unknown)=>
      {
        alert("ERROR:"+JSON.stringify(err))
      }
    })
  }
}
