import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FashionStoreService } from '../../services/fashion-store-service';
import { FashionItem } from '../../Classes/FashionItem';

@Component({
  selector: 'app-admin-fashion-view',
  standalone: false,
  templateUrl: './admin-fashion-view.html',
  styleUrl: './admin-fashion-view.css',
})
export class AdminFashionViewComponent {
  fashion = signal<FashionItem | null>(null)
  errMessage = signal('')

  constructor(private _service: FashionStoreService, private route: ActivatedRoute) {
    const id = this.route.snapshot.paramMap.get('id')!
    this._service.getFashion(id).subscribe({
      next: (f) => f ? this.fashion.set(f) : this.errMessage.set('Fashion not found'),
      error: (err) => this.errMessage.set(err.message)
    })
  }
}
