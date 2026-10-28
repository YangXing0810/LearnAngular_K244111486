import { Component } from '@angular/core';

@Component({
  selector: 'app-binding-class-component',
  standalone: false,
  templateUrl: './binding-class-component.html',
  styleUrl: './binding-class-component.css',
})
export class BindingClassComponent {
  // Logic state
  isSaved: boolean = false;
  isActive: boolean = true;

  // Event handler method
  toggleSaveState() {
    this.isSaved = !this.isSaved;
  }
}