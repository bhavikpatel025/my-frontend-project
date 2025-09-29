import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, RegisterUserRequest, LeaveBalance, ApiResponse, UpdateUserRequest, ProfilePicture } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
 
  private readonly apiUrl = 'https://localhost:7084/api';

  constructor(private http: HttpClient) { }

  /**
   * Register a new user (Admin only)
   */
  registerUser(user: RegisterUserRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.apiUrl}/auth/register`, user);
  }

  /**
   * Get all users (Admin only)
   */
  getAllUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/users`);
  }

  /**
   * Get user by ID
   */
  getUserById(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/users/${id}`);
  }

  /**
   * Update user leave balance (Admin only)
   */
  updateUserLeaveBalance(userId: number, balances: LeaveBalance[]): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/users/${userId}/leave-balance`, balances);
  }

  /**
   * Get current user profile
   */
  getCurrentUserProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/users/profile`);
  }

  /**
   * Search users by name or email (Admin only)
   */
  searchUsers(searchTerm: string): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/users/search?term=${encodeURIComponent(searchTerm)}`);
  }

  updateUser(userId: number, user: UpdateUserRequest): Observable<ApiResponse<User>> {
  return this.http.put<ApiResponse<User>>(`${this.apiUrl}/users/${userId}`, user);
}

deleteUser(userId: number): Observable<ApiResponse<any>> {
  return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/users/${userId}`);
}
uploadProfilePicture(userId: number, file: File): Observable<ApiResponse<ProfilePicture>> {
  const formData = new FormData();
  formData.append('File', file);
  
  return this.http.post<ApiResponse<ProfilePicture>>(`${this.apiUrl}/users/${userId}/profile-picture`, formData);
}

deleteProfilePicture(userId: number): Observable<ApiResponse<any>> {
  return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/users/${userId}/profile-picture`);
}

getProfilePicture(userId: number): Observable<ApiResponse<ProfilePicture>> {
  return this.http.get<ApiResponse<ProfilePicture>>(`${this.apiUrl}/users/${userId}/profile-picture`);
}
}