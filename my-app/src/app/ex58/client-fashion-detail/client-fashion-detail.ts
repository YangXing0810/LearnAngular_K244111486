import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FashionStoreService } from '../../services/fashion-store-service';
import { FashionItem } from '../../Classes/FashionItem';

@Component({
  selector: 'app-client-fashion-detail',
  standalone: false,
  templateUrl: './client-fashion-detail.html',
  styleUrl: './client-fashion-detail.css',
})
export class ClientFashionDetailComponent {
  fashion = signal<FashionItem | null>(null)
  related = signal<FashionItem[]>([])   // other Fashions of the same Style
  errMessage = signal('')

  constructor(private _service: FashionStoreService, private route: ActivatedRoute) {
    // reload when moving between fashions on the same screen
    this.route.paramMap.subscribe(p => this.load(p.get('id')!))
  }

  load(id: string) {
    this._service.getFashion(id).subscribe({
      next: (f) => {
        if (!f) { this.errMessage.set('Fashion not found'); return }
        this.fashion.set(f)
        window.scrollTo(0, 0)
        this._service.getFashionsByStyle(f.style).subscribe({
          next: (list) => this.related.set(list.filter(x => x._id !== f._id).slice(0, 3))
        })
      },
      error: (err) => this.errMessage.set(err.message)
    })
  }
}
