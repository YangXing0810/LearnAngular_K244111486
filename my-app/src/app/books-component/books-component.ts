import { Component, signal } from '@angular/core';
import { IBook } from '../Classes/Book';
import { BookAPIService } from '../services/book-apiservice';

@Component({
  selector: 'app-books-component',
  standalone: false,
  styleUrl: './books-component.css',
  templateUrl: './books-component.html',
})
export class BooksComponent {
  books=signal<IBook[]>([]);
  errMessage=signal('')
  server_images_link="http://localhost:3000/images/"
  constructor(private _service: BookAPIService){
    this._service.getBooks().subscribe({
      next:(data)=>{this.books.set(data)},
      error:(err)=>{this.errMessage.set(err)}
    })
  }
}