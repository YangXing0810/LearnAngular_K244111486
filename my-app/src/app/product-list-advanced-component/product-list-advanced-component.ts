import { Component, signal } from '@angular/core';
import { Product } from '../Classes/IProduct';
import { ProductHttpHandleErrorService } from '../services/product-http-handle-error-service';
import { ActivatedRoute, Router } from '@angular/router';
import { createSlug } from '../Classes/SlugHelper';

@Component({
  selector: 'app-product-list-advanced-component',
  standalone: false,
  styleUrl: './product-list-advanced-component.css',
  templateUrl: './product-list-advanced-component.html',
})
export class ProductListAdvancedComponent {
  products=signal<Product[]>([]);
  errMessage=signal("")
  public generateSlug=createSlug;
  constructor(private _service:ProductHttpHandleErrorService,
    private router:Router, 
    private activateRoute:ActivatedRoute){
} //3 dòng 15-17 phải luôn có
ngOnInit(): void{
    this._service.getProductList().subscribe({
      next:(data)=>{
        this.products.set(data);
      },
      error: (err) => {
        this.errMessage.set(err)
      }
    }
    )
  }
  viewDetail(id:number)
  {
    this.router.navigate(["/products", id])
  }

  viewDetailSlug(p: Product): void {
    const slug = this.generateSlug(p.name, p.id);
    this.router.navigate(["/products", slug]);
  }
}