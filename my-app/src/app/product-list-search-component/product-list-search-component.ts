import { Component, signal } from '@angular/core';
import { Product } from '../Classes/IProduct';
import { createSlug } from '../Classes/SlugHelper';
import { ProductHttpHandleErrorService } from '../services/product-http-handle-error-service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-product-list-search-component',
  standalone: false,
  styleUrl: './product-list-search-component.css',
  templateUrl: './product-list-search-component.html',
})
export class ProductListSearchComponent {
  // All products from the server
  products=signal<Product[]>([]);
  //check error
  errMessage=signal("")
  // Products after being filtered
  filteredProducts = signal<Product[]>([]);
  // Variable storing the filter value to display on the UI
  minPrice = signal<number>(0);
  maxPrice = signal<number>(100000000);
  public generateSlug = createSlug;
  constructor(private _service:ProductHttpHandleErrorService,
    private router:Router,
    private activateRoute:ActivatedRoute){
  }
  ngOnInit(): void {
    // 1. Get all products first
    this._service.getProductList().subscribe({
      next: (data) => {
        this.products.set(data);
        this.watchQueryParams();
      },error: (err) => {
        this.errMessage.set(err)
      }
    });
  }
  private watchQueryParams() {
    this.activateRoute.queryParamMap.subscribe(params => {
      const min = Number(params.get('min')) || 0;
      const max = Number(params.get('max')) || 100000000;
      this.minPrice.set(min);
      this.maxPrice.set(max);
      // Execute filtering logic
      const result = this.products().filter(p => p.price >= min && p.price <= max);
      this.filteredProducts.set(result);
    });
  }
// Function called when the "Filter" button is clicked
  onFilter() {
    this.router.navigate([], {
      relativeTo: this.activateRoute,
      queryParams: {
        min: this.minPrice(),
        max: this.maxPrice()
      },
      queryParamsHandling: 'merge' // Retain other params if any
    });
  }
  viewDetail(id:number)
  {
    this.router.navigate(["/products",id])
  }
  viewDetailSlug(p:Product)
  {
    let slug=this.generateSlug(p.name,p.id)
    this.router.navigate(["/products",slug])
  }

  onLogout(): void {
    localStorage.removeItem('isLoggedIn');
    void this.router.navigateByUrl('/login');
  }
}