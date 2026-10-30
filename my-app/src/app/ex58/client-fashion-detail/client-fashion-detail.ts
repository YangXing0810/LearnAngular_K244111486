import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { FashionStoreService } from '../../services/fashion-store-service';
import { FashionItem } from '../../Classes/FashionItem';
import { fashionSlug } from '../../Classes/SlugHelper';

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
  loading = signal(true)
  copied = signal(false)

  constructor(private _service: FashionStoreService, private route: ActivatedRoute, private router: Router) {
    // reload when moving between fashions on the same screen
    this.route.paramMap.subscribe(p => this.load(p.get('slug')!))
  }

  // [Slug] automatically resolve the slug in the URL to a Fashion
  //   /client-fashion/street-style-look-p3  -> IdF = 3
  //   /client-fashion/3                     -> IdF = 3
  //   /client-fashion/street-style-look     -> match by title
  //   /client-fashion/<24-char ObjectId>    -> old links still work
  load(slug: string) {
    this.loading.set(true)
    this.errMessage.set('')
    this.fashion.set(null)
    const isObjectId = /^[a-f0-9]{24}$/i.test(slug)
    const request: Observable<FashionItem> = isObjectId
      ? this._service.getFashion(slug)
      : this._service.getFashionBySlug(slug)

    request.subscribe({
      next: (f) => {
        this.loading.set(false)
        if (!f) { this.errMessage.set('Fashion not found'); return }
        this.fashion.set(f)
        window.scrollTo(0, 0)
        // if the URL is not the official slug (old title, id, ...) -> replace it
        const canonical = this.slugOf(f)
        if (slug !== canonical) {
          this.router.navigate(['/client-fashion', canonical], { replaceUrl: true })
        }
        this._service.getFashionsByStyle(f.style).subscribe({
          next: (list) => this.related.set(list.filter(x => x._id !== f._id).slice(0, 3))
        })
      },
      error: () => {
        this.loading.set(false)
        this.errMessage.set(`No fashion matches the slug "${slug}".`)
      }
    })
  }

  slugOf(f: FashionItem): string {
    return fashionSlug(f)
  }

  copyLink() {
    navigator.clipboard?.writeText(window.location.href)
    this.copied.set(true)
    setTimeout(() => this.copied.set(false), 1500)
  }
}
