import { Component } from '@angular/core';
import { Product } from '../Classes/IProduct';
import { ProductService } from '../services/product-service';

@Component({
  selector: 'app-product-list-call-service-component',
  standalone: false,
  styleUrl: './product-list-call-service-component.css',
  templateUrl: './product-list-call-service-component.html',
})
export class ProductListCallServiceComponent {
  products: Product[] = [];
  minPrice: number = 0;
  maxPrice: number = Infinity;
  constructor(private ps:ProductService){
    //this.products=ps.getProductList()
  }
  ngOnInit():void
  {
    this.products=this.ps.getProductList()
  }
  callFilterProductListByPrice()
  {
    this.products=this.ps.filterProductListByPrice(this.minPrice,this.maxPrice)
  }
}



