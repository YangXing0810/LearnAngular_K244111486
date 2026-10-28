import { Component, computed, signal } from '@angular/core';
import { FashionStoreService } from '../../services/fashion-store-service';
import { FashionItem } from '../../Classes/FashionItem';

@Component({
  selector: 'app-admin-fashion-list',
  standalone: false,
  templateUrl: './admin-fashion-list.html',
  styleUrl: './admin-fashion-list.css',
})
export class AdminFashionListComponent {
  fashions = signal<FashionItem[]>([])
  keyword = signal('')
  loading = signal(true)
  errMessage = signal('')
  message = signal('')
  deleting = signal<FashionItem | null>(null)   // Fashion waiting for delete confirmation

  // quick filter on the table (title or style)
  filtered = computed(() => {
    const k = this.keyword().trim().toLowerCase()
    if (!k) return this.fashions()
    return this.fashions().filter(f =>
      (f.fashion_subject || '').toLowerCase().includes(k) || (f.style || '').toLowerCase().includes(k))
  })
  styleCount = computed(() => new Set(this.fashions().map(f => f.style)).size)

  constructor(private _service: FashionStoreService) {
    this.loadFashions()
  }

  loadFashions() {
    this.loading.set(true)
    this._service.getFashions().subscribe({
      next: (data) => { this.fashions.set(data); this.loading.set(false) },
      error: (err) => { this.errMessage.set(err.message); this.loading.set(false) }
    })
  }

  askDelete(f: FashionItem) {
    this.deleting.set(f)
  }
  cancelDelete() {
    this.deleting.set(null)
  }
  confirmDelete() {
    const f = this.deleting()
    if (!f || !f._id) return
    this._service.deleteFashion(f._id).subscribe({
      next: () => {
        this.deleting.set(null)
        this.message.set('Deleted "' + f.fashion_subject + '" successfully')
        this.fashions.update(list => list.filter(x => x._id !== f._id))
        setTimeout(() => this.message.set(''), 3000)
      },
      error: (err) => { this.errMessage.set(err.message); this.deleting.set(null) }
    })
  }
}
