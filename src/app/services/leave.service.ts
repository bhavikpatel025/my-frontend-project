import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Leave, LeaveType, ApplyLeaveRequest, UpdateLeaveStatusRequest, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  exportLeavesToExcel() {
    throw new Error('Method not implemented.');
  }
  private readonly apiUrl = 'https://localhost:7084/api';

  constructor(private http: HttpClient) { }

  /**
   * Apply for leave
   */
  applyLeave(leaveRequest: ApplyLeaveRequest): Observable<ApiResponse<Leave>> {
    return this.http.post<ApiResponse<Leave>>(`${this.apiUrl}/leaves/apply`, leaveRequest);
  }

  /**
   * Get current user's leaves
   */
  getMyLeaves(): Observable<ApiResponse<Leave[]>> {
    return this.http.get<ApiResponse<Leave[]>>(`${this.apiUrl}/leaves/my-leaves`);
  }

  /**
   * Get all leaves (Admin only)
   */
  getAllLeaves(userId?: number): Observable<ApiResponse<Leave[]>> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('userId', userId.toString());
    }
    
    return this.http.get<ApiResponse<Leave[]>>(`${this.apiUrl}/leaves/all`, { params });
  }

  /**
   * Cancel leave application
   */
  cancelLeave(leaveId: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/leaves/${leaveId}/cancel`, {});
  }

  /**
   * Update leave status (Admin only)
   */
 updateLeaveStatus(request: UpdateLeaveStatusRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/leaves/update-status`, request);
  }

  /**
   * Get all leave types
   */
  getLeaveTypes(): Observable<ApiResponse<LeaveType[]>> {
    return this.http.get<ApiResponse<LeaveType[]>>(`${this.apiUrl}/leaves/types`);
  }

  /**
   * Export leaves to Excel (Admin only)
   */
  exportLeaves(userId?: number): Observable<Blob> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('userId', userId.toString());
    }
    
    return this.http.get(`${this.apiUrl}/leaves/export`, { 
      params,
      responseType: 'blob' 
    });
  }

  /**
   * Get leave statistics (Admin only)
   */
  getLeaveStatistics(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/leaves/statistics`);
  }

  /**
   * Get leaves by date range
   */
  getLeavesByDateRange(startDate: string, endDate: string, userId?: number): Observable<ApiResponse<Leave[]>> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    if (userId) {
      params = params.set('userId', userId.toString());
    }
    
    return this.http.get<ApiResponse<Leave[]>>(`${this.apiUrl}/leaves/date-range`, { params });
  }
}