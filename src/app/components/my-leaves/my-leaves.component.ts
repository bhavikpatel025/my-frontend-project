import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LeaveService } from '../../services/leave.service';
import { Leave } from '../../models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-my-leaves',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow">
        <div class="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
          <h4 class="card-title mb-0">
            <i class="bi bi-list-ul me-2"></i>My Leave Applications
          </h4>
          <button class="btn btn-light btn-sm" routerLink="/apply-leave">
            <i class="bi bi-plus-circle me-1"></i>Apply Leave
          </button>
        </div>
        
        <div class="card-body">
          <div *ngIf="loading" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
            <p class="mt-2 text-muted">Loading your leaves...</p>
          </div>

          <div *ngIf="!loading && leaves.length === 0" class="empty-state">
            <i class="bi bi-inbox display-1 text-muted"></i>
            <h5 class="text-muted">No leave applications found</h5>
            <p class="text-muted">You haven't applied for any leaves yet.</p>
            <button class="btn btn-primary" routerLink="/apply-leave">
              <i class="bi bi-plus-circle me-2"></i>Apply for Leave
            </button>
          </div>

          <div *ngIf="!loading && leaves.length > 0" class="table-responsive">
            <table class="table table-hover">
              <thead class="table-dark">
                <tr>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Days</th>
                  <th>Applied On</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let leave of leaves" [class]="getRowClass(leave.status)">
                  <td><strong>{{ leave.leaveTypeName }}</strong></td>
                  <td>
                    <small>{{ leave.startDate | date:'mediumDate' }} - {{ leave.endDate | date:'mediumDate' }}</small>
                  </td>
                  <td><span class="badge bg-info">{{ leave.leaveDays }} days</span></td>
                  <td>{{ leave.dateOfRequest | date:'shortDate' }}</td>
                  <td>
                    <span class="d-inline-block text-truncate" style="max-width: 200px;" [title]="leave.reasonForLeave">
                      {{ leave.reasonForLeave }}
                    </span>
                  </td>
                  <td><span [class]="getStatusBadgeClass(leave.status)">{{ leave.status }}</span></td>
                  <td>
                    <button *ngIf="canCancelLeave(leave)" class="btn btn-outline-danger btn-sm" (click)="cancelLeave(leave)">
                      <i class="bi bi-x-circle"></i> Cancel
                    </button>
                    <span *ngIf="!canCancelLeave(leave)" class="text-muted small">
                      {{ leave.status === 'Pending' ? 'Cannot cancel' : 'No actions' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .empty-state { text-align: center; padding: 3rem 0; }
    .table thead th { font-weight: 600; }
  `]
})
export class MyLeavesComponent implements OnInit {
  leaves: Leave[] = [];
  loading = true;

  constructor(private leaveService: LeaveService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.loadMyLeaves();
  }

  loadMyLeaves(): void {
    this.loading = true;
    this.leaveService.getMyLeaves().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.leaves = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading leaves:', error);
        this.loading = false;
      }
    });
  }

  canCancelLeave(leave: Leave): boolean {
    if (leave.status !== 'Pending') return false;
    const startDate = new Date(leave.startDate);
    const today = new Date();
    const daysDiff = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysDiff >= 3;
  }

  cancelLeave(leave: Leave): void {
    if (confirm(`Are you sure you want to cancel leave from ${leave.startDate} to ${leave.endDate}?`)) {
      this.leaveService.cancelLeave(leave.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success('Leave cancelled successfully');
            this.loadMyLeaves();
          }
        },
        error: (error) => {
          this.toastr.error('Failed to cancel leave');
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Approved': return 'badge bg-success';
      case 'Rejected': return 'badge bg-danger';
      case 'Cancelled': return 'badge bg-secondary';
      default: return 'badge bg-warning';
    }
  }

  getRowClass(status: string): string {
    switch (status) {
      case 'Cancelled': return 'table-secondary';
      case 'Rejected': return 'table-danger';
      case 'Approved': return 'table-success';
      default: return '';
    }
  }
}