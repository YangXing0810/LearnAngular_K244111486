import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginComponent } from './login-component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authValue: string | null;
  let navigateByUrl: ReturnType<typeof vi.fn>;
  let storage: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authValue = null;
    navigateByUrl = vi.fn();
    storage = {
      getItem: vi.fn(() => authValue),
      setItem: vi.fn((_key: string, value: string) => { authValue = value; }),
      removeItem: vi.fn(() => { authValue = null; }),
    };
    vi.stubGlobal('localStorage', storage);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [FormsModule],
      providers: [{ provide: Router, useValue: { navigateByUrl } }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('logs in with the admin credentials and navigates to search-product', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.user.username = 'admin';
    component.user.password = '123';
    component.onLogin();

    expect(storage.setItem).toHaveBeenCalledWith('isLoggedIn', 'true');
    expect(component.isLoggedIn).toBe(true);
    expect(alertSpy).toHaveBeenCalledWith('Login successful. Opening Search Product.');
    expect(navigateByUrl).toHaveBeenCalledWith('/search-product');
  });

  it('rejects invalid credentials without setting the auth state', () => {
    component.user.username = 'admin';
    component.user.password = 'wrong';
    component.onLogin();

    expect(storage.setItem).not.toHaveBeenCalled();
    expect(component.loginError).toBe('Username or password is incorrect.');
  });

  it('logs out by clearing the auth state used by the guard', () => {
    component.onLogin();
    component.onLogout();

    expect(storage.removeItem).toHaveBeenCalledWith('isLoggedIn');
    expect(component.isLoggedIn).toBe(false);
  });
});
