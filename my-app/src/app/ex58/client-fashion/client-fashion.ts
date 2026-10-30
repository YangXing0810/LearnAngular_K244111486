import { Component, computed, signal } from '@angular/core';
import { FashionStoreService } from '../../services/fashion-store-service';
import { Router } from '@angular/router';
import { FashionItem } from '../../Classes/FashionItem';
import { fashionSlug } from '../../Classes/SlugHelper';

// Client: show Fashions grouped by Style + search by Style
@Component({
  selector: 'app-client-fashion',
  standalone: false,
  templateUrl: './client-fashion.html',
  styleUrl: './client-fashion.css',
})
export class ClientFashionComponent {
  fashions = signal<FashionItem[]>([])
  styles = signal<string[]>([])
  styleText = signal('')        // style typed by user
  selectedStyle = signal('')    // style currently filtered ('' = all)
  loading = signal(true)
  errMessage = signal('')
  allFashions = signal<FashionItem[]>([])  // used by the "Go to slug" box
  slugText = signal('')                    // slug selected / typed by user

  // group Fashions by Style
  groups = computed(() => {
    const map = new Map<string, FashionItem[]>()
    for (const f of this.fashions()) {
      if (!map.has(f.style)) map.set(f.style, [])
      map.get(f.style)!.push(f)
    }
    return Array.from(map, ([style, items]) => ({ style, items }))
  })

  constructor(private _service: FashionStoreService, private router: Router) {
    this._service.getStyles().subscribe({ next: (s) => this.styles.set(s) })
    this.loadAll()
  }

  loadAll() {
    this.loading.set(true)
    this.selectedStyle.set('')
    this.styleText.set('')
    this._service.getFashions().subscribe({
      next: (data) => { this.fashions.set(data); this.allFashions.set(data); this.loading.set(false) },
      error: (err) => { this.errMessage.set(err.message); this.loading.set(false) }
    })
  }

  // filter Fashions of the selected / typed Style
  searchByStyle(style: string) {
    style = (style || '').trim()
    if (!style) { this.loadAll(); return }
    this.styleText.set(style)
    this.selectedStyle.set(style)
    this.loading.set(true)
    this._service.getFashionsByStyle(style).subscribe({
      next: (data) => { this.fashions.set(data); this.loading.set(false) },
      error: (err) => { this.errMessage.set(err.message); this.loading.set(false) }
    })
  }

  // slug of one Fashion (used in [routerLink])
  slugOf(f: FashionItem): string {
    return fashionSlug(f)
  }

  // [Slug] user selects / types a slug -> open the detail page,
  // the detail page resolves the slug automatically
  goToSlug(slug: string) {
    slug = (slug || '').trim()
    if (!slug) return
    this.router.navigate(['/client-fashion', slug])
  }

  // short text from the HTML detail
  excerpt(html: string): string {
    const text = (html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
    return text.length > 110 ? text.substring(0, 110) + '...' : text
  }
}
