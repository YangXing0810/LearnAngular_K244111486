import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductHttpHandleErrorService } from '../services/product-http-handle-error-service';
import { Product } from '../Classes/IProduct';
import { extractIdFromSlug, getIdentityType } from '../Classes/SlugHelper';

@Component({
  selector: 'app-product-detail-component',
  standalone: false,
  styleUrl: './product-detail-component.css',
  templateUrl: './product-detail-component.html',
})
export class ProductDetailComponent {
  product = signal<Product | null>(null);
  errMessage = signal('');
  checkIdentityType=getIdentityType
  getIdFromSlug=extractIdFromSlug

  constructor(
    private _service: ProductHttpHandleErrorService,
    private router: Router,
    private activateRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activateRoute.paramMap.subscribe((param) => {
      let idParam = param.get('id');
      if (idParam != null) {
        const type = this.checkIdentityType(idParam);
        let id: any = -1;
        switch (type) {
          case 'ID':
            // Case where it is a pure number (e.g., product/1)
            id = parseInt(idParam);
            break;
          case 'SLUG_WITH_ID':
            // Case where it is an SEO-friendly Slug (e.g., product/iphone-69-pro-max-p1)
            id = this.getIdFromSlug(idParam);
            break;
          case 'PURE_SLUG':
            id = -1;
            break;
        }
        this._service.getProductById(id).subscribe({
          next: (data) => {
            this.product.set(data ?? null);
          },
          error: (err) => {
            this.errMessage.set(err);
          },
        });
      }
    });
  }
  goBack()
  {
    this.router.navigate(["products"])
  }
}