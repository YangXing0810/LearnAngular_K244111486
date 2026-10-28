import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FashionStoreService } from '../../services/fashion-store-service';
import { FashionItem } from '../../Classes/FashionItem';

// Add new / Edit a Fashion (same screen)
@Component({
  selector: 'app-admin-fashion-form',
  standalone: false,
  templateUrl: './admin-fashion-form.html',
  styleUrl: './admin-fashion-form.css',
})
export class AdminFashionFormComponent {
  id = signal<string | null>(null)
  title = signal('')
  style = signal('')
  image = signal('')
  detail = signal('')
  createdDate = signal<string | undefined>(undefined)
  styles = signal<string[]>([])
  saving = signal(false)
  loading = signal(false)
  errMessage = signal('')
  submitted = signal(false)

  constructor(private _service: FashionStoreService, private route: ActivatedRoute, private router: Router) {
    this._service.getStyles().subscribe({ next: (s) => this.styles.set(s) })
    const id = this.route.snapshot.paramMap.get('id')
    if (id) {
      this.id.set(id)
      this.loading.set(true)
      this._service.getFashion(id).subscribe({
        next: (f) => {
          if (!f) { this.errMessage.set('Fashion not found'); this.loading.set(false); return }
          this.title.set(f.fashion_subject)
          this.style.set(f.style)
          this.image.set(f.fashion_image)
          this.detail.set(f.fashion_detail)
          this.createdDate.set(f.created_date)
          this.loading.set(false)
        },
        error: (err) => { this.errMessage.set(err.message); this.loading.set(false) }
      })
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => this.image.set(reader.result!.toString())
    reader.readAsDataURL(file)
  }

  isValid(): boolean {
    return this.title().trim() !== '' && this.style().trim() !== '' && this.image() !== ''
  }

  save() {
    this.submitted.set(true)
    if (!this.isValid()) {
      this.errMessage.set('Please enter Title, Style and choose a Thumbnail')
      return
    }
    this.errMessage.set('')
    this.saving.set(true)
    const fashion: FashionItem = {
      fashion_subject: this.title().trim(),
      style: this.style().trim(),
      fashion_image: this.image(),
      fashion_detail: this.detail(),
    }
    const request = this.id()
      ? this._service.putFashion({ ...fashion, _id: this.id()! })
      : this._service.postFashion(fashion)
    request.subscribe({
      // after saving successfully, return to the Fashion list
      next: () => this.router.navigate(['/admin-fashion']),
      error: (err) => { this.errMessage.set(err.message); this.saving.set(false) }
    })
  }
}
