import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'https://localhost:7084/api';
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load stored user if exists
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      }
    }
  }

  /**
   * Login user
   */
  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            localStorage.setItem('currentUser', JSON.stringify(response.data));
            localStorage.setItem('token', response.data.token);
            this.currentUserSubject.next(response.data);
          }
        })
      );
  }

  /**
   * Logout
   */
  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  /**
   * Get current user value
   */
  get currentUserValue(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  /**
   * Update profile picture in current user
   */
  updateProfilePicture(url: string): void {
    const currentUser = this.currentUserValue;
    if (!currentUser) return;

    const user: LoginResponse = {
      userId: currentUser.userId!,
      firstName: currentUser.firstName!,
      lastName: currentUser.lastName!,
      email: currentUser.email!,
      role: currentUser.role!,
      token: currentUser.token!,
      profilePicture: url
    };

    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  /**
   * Authentication checks
   */
  get isAuthenticated(): boolean {
    return !!this.currentUserValue && !!this.getToken();
  }

  get isAdmin(): boolean {
    return this.currentUserValue?.role === 'Admin';
  }

  get isEmployee(): boolean {
    return this.currentUserValue?.role === 'Employee';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  getUserRole(): string | null {
    return this.currentUserValue?.role || null;
  }

  getUserId(): number | null {
    return this.currentUserValue?.userId || null;
  }

  getUserName(): string {
    const user = this.currentUserValue;
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }
}
