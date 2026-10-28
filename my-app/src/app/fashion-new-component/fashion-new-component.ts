import { Component } from '@angular/core';
import { Fashion } from '../Classes/Fashion';
import { FashionAPIService } from '../services/fashion-apiservice';

@Component({
  selector: 'app-fashion-new-component',
  standalone: false,
  styleUrl: './fashion-new-component.css',
  templateUrl: './fashion-new-component.html',
})
export class FashionNewComponent {
  fashion = new Fashion();
  errMessage = '';

  constructor(private _service: FashionAPIService) {}

  postFashion() {
    this.errMessage = '';
    this._service.postFashion(this.fashion).subscribe({
      next: (data) => {
        this.fashion = Object.assign(new Fashion(), data);
      },
      error: (err) => {
        this.errMessage = err.message;
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        this.fashion.fashion_image = reader.result;
      } else {
        this.errMessage = 'Unable to read the selected image.';
      }
    };
    reader.onerror = () => {
      this.errMessage = reader.error?.message ?? 'Unable to read the selected image.';
    };
    reader.readAsDataURL(file);
  }
}
