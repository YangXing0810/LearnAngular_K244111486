import { Component, OnInit, signal } from '@angular/core';
import { IFakeProduct } from '../Classes/IFakeProduct';
import { FakeProductService } from '../services/fake-product-service';

@Component({
  selector: 'app-fake-product-component',
  standalone: false,
  templateUrl: './fake-product-component.html',
  styleUrl: './fake-product-component.css',
})
export class FakeProductComponent implements OnInit {
  products = signal<IFakeProduct[]>([]);
  errMessage = signal('');

  constructor(private _service: FakeProductService) {}

  ngOnInit(): void {
    this._service.getFakeProductData().subscribe({
      next: (data) => { this.products.set(data); },
      error: (err) => {
        this.errMessage.set(err);
      }
    });
  }
}