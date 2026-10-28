import { Component } from '@angular/core';

@Component({
  selector: 'app-binding-property-component',
  standalone: false,
  styleUrl: './binding-property-component.css',
  templateUrl: './binding-property-component.html',
})
export class BindingPropertyComponent {
  public name: string = 'Skibidi Toilet';
  public email: string = 'Skibdi@gmail.com';
  public nameid: string = 'nameid';
  public emailid: string = 'emailid';
  public isDisabled: boolean = false;
  public hello: string = 'Welcome to gen Alpha Brainrot';
  public red_color: string = 'red';
  public advanced_message: string = '<font color="blue">This is an advanced message</font>';
}