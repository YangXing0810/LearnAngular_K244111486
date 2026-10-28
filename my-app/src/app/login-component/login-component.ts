import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserLogin } from '../Classes/UserLogin';

@Component({
  selector: 'app-login-component',
  standalone: false,
  styleUrl: './login-component.css',
  templateUrl: './login-component.html',
})
export class LoginComponent {
  user = new UserLogin();
  isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  loginError = '';

  constructor(private router: Router) {}

  onLogin(): void {
    if (this.user.username !== 'admin' || this.user.password !== '123') {
      this.loginError = 'Username or password is incorrect.';
      return;
    }

    this.loginError = '';
    localStorage.setItem('isLoggedIn', 'true');
    this.isLoggedIn = true;
    window.alert('Login successful. Opening Search Product.');
    void this.router.navigateByUrl('/search-product');
  }

  onLogout(): void {
    localStorage.removeItem('isLoggedIn');
    this.isLoggedIn = false;
    this.user = new UserLogin();
    this.loginError = '';
  }
}
