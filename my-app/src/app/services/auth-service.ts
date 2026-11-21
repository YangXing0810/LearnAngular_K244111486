import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Signal to store user state after successful login
  currentUser = signal<any>(null);
  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  login(credentials: any): Observable<any> {
    return this.http.post("/user-login", credentials, { withCredentials: true }).pipe(
      tap((res: any) => {
        // 1. Save user info to Signal for global application use
        this.currentUser.set(res.user);
        // 2. If 'Remember Me' is checked, save the username to client-side Cookie
        if (credentials.rememberMe) {
          this.cookieService.set('remember_user', credentials.username, 30, '/');
        } else {
          // If not checked, remove the existing cookie
          this.cookieService.delete('remember_user');
        }
      })
    );
  }

  // Method to retrieve the remembered email/username for form initialization
  getRememberedEmail(): string {
    return this.cookieService.get('remember_user');
  }
}