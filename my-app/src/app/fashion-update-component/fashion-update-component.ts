import { Component } from '@angular/core';
import { Fashion } from '../Classes/Fashion';
import { FashionAPIService } from '../services/fashion-apiservice';

@Component({
  selector: 'app-fashion-update-component',
  standalone: false,
  templateUrl: './fashion-update-component.html',
  styleUrl: './fashion-update-component.css',
})
export class FashionUpdateComponent {
  fashion = new Fashion();
  errMessage: string = ""
  constructor(private _service: FashionAPIService) {
  }

  // Load the old Fashion when an Id is entered, so the form is filled automatically
  loadFashion() {
    const id = (this.fashion._id || "").toString().trim()
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      this.errMessage = "Id must be 24 hex characters"
      return
    }
    this._service.getFashion(id).subscribe({
      next: (data) => {
        if (data == null) {
          this.errMessage = "Fashion not found"
          return
        }
        this.errMessage = ""
        this.fashion = Object.assign(new Fashion(), data)
      },
      error: (err) => { this.errMessage = err }
    })
  }

  onFileSelected(event: any, fashion: Fashion) {
    let file = event.target.files[0];
    if (!file) return
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      fashion.fashion_image = reader.result!.toString()
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
  }

  putFashion() {
    this._service.putFashion(this.fashion).subscribe({
      next: (data) => { this.fashion = Object.assign(new Fashion(), data) },
      error: (err) => { this.errMessage = err }
    })
  }
}
