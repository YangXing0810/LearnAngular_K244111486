import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: false,
  styleUrl: './contact.css',
  templateUrl: './contact.html',
})
export class Contact {
  sayHello() {
    alert('Hello from Contact Component!');
  }
  sayHello2(mydiv:HTMLElement)
  {
    mydiv.innerHTML='Nguyễn Văn A';
  }
}
