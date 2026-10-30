import { Component, computed, signal } from '@angular/core';
import { FashionAPIService } from '../services/fashion-apiservice';
import { Fashion } from '../Classes/Fashion';

@Component({
  selector: 'app-fashion-component',
  standalone: false,
  templateUrl: './fashion-component.html',
  styleUrl: './fashion-component.css',
})
export class FashionComponent {
  fashions = signal<Fashion[]>([]);
  errMessage = signal('')
  keyword = signal('')
  loading = signal(true)

  // filter by IdF, title, style or slug
  filtered = computed(() => {
    const k = this.keyword().trim().toLowerCase()
    if (!k) return this.fashions()
    return this.fashions().filter(f =>
      String(f.IdF) === k.replace('#', '') ||
      f.fashion_subject.toLowerCase().includes(k) ||
      (f.style || '').toLowerCase().includes(k) ||
      f.getSlug().includes(k))
  })

  constructor(public _service: FashionAPIService) {
    this._service.getFashions().subscribe({
      next: (data) => {
        // restore Fashion objects (to use getSlug(), getBase64String()), sorted by IdF
        const list = (data as any[]).map(d => Object.assign(new Fashion(), d))
        list.sort((a, b) => a.IdF - b.IdF)
        this.fashions.set(list)
        this.loading.set(false)
      },
      error: (err) => { this.errMessage.set(err.message); this.loading.set(false) }
    })
  }

  excerpt(html: string): string {
    const text = (html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
    return text.length > 100 ? text.substring(0, 100) + '...' : text
  }
}
