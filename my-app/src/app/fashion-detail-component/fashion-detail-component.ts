import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Fashion } from '../Classes/Fashion';
import { FashionAPIService } from '../services/fashion-apiservice';

@Component({
  selector: 'app-fashion-detail-component',
  standalone: false,
  templateUrl: './fashion-detail-component.html',
  styleUrl: './fashion-detail-component.css',
})
export class FashionDetailComponent {
  fashion = signal<Fashion | null>(null);
  fashions = signal<Fashion[]>([]);   // all items -> slug dropdown
  errMessage = signal("")
  loading = signal(false)

  constructor(private _service: FashionAPIService, private route: ActivatedRoute, private router: Router) {
    this._service.getFashions().subscribe({
      next: (data) => this.fashions.set((data as any[])
        .map(d => Object.assign(new Fashion(), d))
        .sort((a, b) => a.IdF - b.IdF))
    })
    // [Slug] /fashion-detail/<slug> -> resolve automatically
    this.route.paramMap.subscribe(p => {
      const slug = p.get('slug')
      if (slug) this.resolve(slug)
    })
  }

  // user selects a slug (dropdown) or types IdF / slug / _id -> go to its slug URL
  searchFashion(value: string) {
    value = (value || '').trim().replace(/^#/, '')
    if (!value) return
    this.router.navigate(['/fashion-detail', value])
  }

  resolve(slug: string) {
    this.fashion.set(null)
    this.errMessage.set("")
    this.loading.set(true)
    this._service.getFashionBySlug(slug).subscribe({
      next: (data) => {
        this.loading.set(false)
        if (!data) { this.errMessage.set(`No fashion matches "${slug}"`); return }
        //restore object model from json
        const f = Object.assign(new Fashion(), data);
        this.fashion.set(f);
        // show the official slug in the URL
        if (slug !== f.getSlug()) this.router.navigate(['/fashion-detail', f.getSlug()], { replaceUrl: true })
      },
      error: () => { this.loading.set(false); this.errMessage.set(`No fashion matches "${slug}"`) }
    })
  }
}
