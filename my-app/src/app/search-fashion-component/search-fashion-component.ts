import { Component, signal } from '@angular/core';
import { FashionAPIService } from '../services/fashion-apiservice';

@Component({
  selector: 'app-search-fashion-component',
  standalone: false,
  templateUrl: './search-fashion-component.html',
  styleUrl: './search-fashion-component.css',
})
export class SearchFashionComponent {
  // search criteria
  keyword = 'best street style photos fall 2023 shows paris'
  field = 'fashion_subject'
  metric = 'cosine'
  top = 5
  topOptions = [3, 5, 10, 20]

  // results
  fashions = signal<any[]>([])
  errMessage = signal('')
  searched = signal(false)
  loading = signal(false)

  constructor(private _service: FashionAPIService) { }

  search() {
    if (this.keyword.trim() === '') {
      this.errMessage.set('Please enter a keyword to search')
      return
    }
    this.errMessage.set('')
    this.loading.set(true)
    this._service.searchFashions(this.keyword, this.field, this.metric, this.top).subscribe({
      next: (data) => {
        this.fashions.set(data)
        this.searched.set(true)
        this.loading.set(false)
      },
      error: (err) => {
        this.errMessage.set(err.message)
        this.loading.set(false)
      }
    })
  }

  // CSS class by similarity: [0.75-1] high, [0.5-0.75) medium, < 0.5 low
  getLevel(similarity: number): string {
    if (similarity >= 0.75) return 'high'
    if (similarity >= 0.5) return 'medium'
    return 'low'
  }

  getImage(image: string): string {
    if (!image) return ''
    return image.startsWith('data:image') ? image : 'data:image/png;base64,' + image
  }

  get metricLabel(): string {
    return this.metric === 'cosine' ? 'Cosine Similarity' : 'Jaccard Similarity'
  }
}
