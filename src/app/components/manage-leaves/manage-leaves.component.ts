import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../services/leave.service';
import { UserService } from '../../services/user.service';
import { Leave, User } from '../../models';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-manage-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  template: `
    <div class="container-fluid py-3">
      <div class="card shadow">
        <div
          class="card-header bg-secondary text-white d-flex justify-content-between align-items-center"
        >
          <h4 class="card-title mb-0">
            <i class="bi bi-list-check me-2"></i>Manage Leave Requests
          </h4>
          <button
            class="btn btn-light btn-sm"
            (click)="exportLeaves()"
            [disabled]="loading"
          >
            <i class="bi bi-download me-1"></i>Export Excel
          </button>
        </div>

        <div class="card-body">
          <!-- Filters Section -->
          <!-- Filters Section -->
          <div class="filters-section mb-3">
            <div class="row g-2 align-items-end">
              <!-- Employee Filter -->
              <div class="col-md-3">
                <label for="employeeFilter" class="form-label fw-bold mb-1">
                  <i class="bi bi-person me-2"></i>Employee
                </label>
                <select
                  id="employeeFilter"
                  class="form-select form-select-sm"
                  [(ngModel)]="selectedEmployeeId"
                  (change)="applyFilters()"
                >
                  <option [ngValue]="null">All Employees</option>
                  <option
                    *ngFor="let employee of employees"
                    [ngValue]="employee.id"
                  >
                    {{ employee.fullName }} - {{ employee.department }}
                  </option>
                </select>
              </div>

              <!-- Status Filter -->
              <div class="col-md-3">
                <label for="statusFilter" class="form-label fw-bold mb-1">
                  <i class="bi bi-funnel me-2"></i>Status
                </label>
                <select
                  id="statusFilter"
                  class="form-select form-select-sm"
                  [(ngModel)]="selectedStatus"
                  (change)="applyFilters()"
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <!-- Rows per page -->
              <div class="col-md-3">
                <label class="form-label fw-bold mb-1">
                  <i class="bi bi-list-ol me-2"></i>Rows per page
                </label>
                <select
                  [(ngModel)]="pageSize"
                  class="form-select form-select-sm"
                >
                  <option [value]="5">5</option>
                  <option [value]="10">10</option>
                  <option [value]="20">20</option>
                </select>
              </div>

              <!-- Clear Filters -->
              <div class="col-md-3 d-flex">
                <button
                  class="btn btn-outline-secondary w-100 mt-3"
                  (click)="clearFilters()"
                >
                  <i class="bi bi-x-circle me-1"></i>Clear All Filters
                </button>
              </div>
            </div>
          </div>

          <!-- Loading Spinner -->
          <div *ngIf="loading" class="loading-container">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Loading leave requests...</p>
          </div>

          <!-- No Data Message -->
          <div
            *ngIf="!loading && filteredLeaves.length === 0"
            class="empty-state"
          >
            <div class="empty-icon">
              <i class="bi bi-inbox display-1 text-muted"></i>
            </div>
            <h5 class="text-muted mt-3">No leave requests found</h5>
            <p class="text-muted">
              {{
                selectedEmployeeId || selectedStatus
                  ? 'Try adjusting your filters or check back later.'
                  : 'No employees have applied for leaves yet.'
              }}
            </p>
          </div>

          <!-- Results Section -->
          <div *ngIf="!loading && filteredLeaves.length > 0">
            <!-- Results Summary -->
            <div class="results-summary mb-4">
              <div class="row">
                <div class="col-md-8">
                  <div class="alert alert-info mb-0">
                    <i class="bi bi-info-circle me-2"></i>
                    <strong>{{ filteredLeaves.length }}</strong> leave
                    request(s) found
                    <span
                      *ngIf="selectedEmployeeId || selectedStatus"
                      class="ms-2"
                    >
                      (filtered from {{ leaves.length }} total)
                    </span>
                  </div>
                </div>
                <div class="col-md-4 text-end">
                  <div class="stats-badges">
                    <span class="badge bg-warning me-1"
                      >{{ getPendingCount() }} Pending</span
                    >
                    <span class="badge bg-success me-1"
                      >{{ getApprovedCount() }} Approved</span
                    >
                    <span class="badge bg-danger"
                      >{{ getRejectedCount() }} Rejected</span
                    >
                    <span class="badge bg-secondary ms-1"
                      >{{ getCancelledCount() }} Cancelled</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- Leaves Table -->
            <div class="table-responsive">
              <table
                class="table table-hover table-striped table-bordered text-center"
              >
                <thead class="table table-dark">
                  <tr>
                    <th scope="col">
                      <i class="bi bi-person me-1"></i>Employee
                    </th>
                    <th scope="col">
                      <i class="bi bi-tag me-1"></i>Leave Type
                    </th>
                    <th scope="col">
                      <i class="bi bi-calendar-range me-1"></i>Duration
                    </th>
                    <th scope="col">
                      <i class="bi bi-calendar-check me-1"></i>Days
                    </th>
                    <th scope="col">
                      <i class="bi bi-clock me-1"></i>Applied On
                    </th>
                    <th scope="col">
                      <i class="bi bi-chat-text me-1"></i>Reason
                    </th>
                    <th scope="col"><i class="bi bi-flag me-1"></i>Status</th>
                    <th scope="col"><i class="bi bi-gear me-1"></i>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    *ngFor="
                      let leave of filteredLeaves
                        | paginate
                          : {
                              itemsPerPage: pageSize,
                              currentPage: currentPage
                            };
                      trackBy: trackByLeaveId
                    "
                    [class]="getRowClass(leave.status)"
                    [attr.data-leave-id]="leave.id"
                  >
                    <td>
                      <div class="employee-cell">
                        <div class="employee-avatar">
                          {{ getEmployeeInitials(leave.userName) }}
                        </div>
                        <div class="employee-info">
                          <strong class="employee-name">{{
                            leave.userName
                          }}</strong>
                          <small class="text-muted employee-dept">
                            {{ getEmployeeDepartment(leave.userId) }}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="leave-type-badge">
                        {{ leave.leaveTypeName }}
                      </span>
                    </td>
                    <td>
                      <div class="duration-cell">
                        <div class="dates">
                          <small class="text-muted">
                            <i class="bi bi-calendar-event me-1"></i>
                            {{ leave.startDate | date : 'MMM dd' }} -
                            {{ leave.endDate | date : 'MMM dd, yyyy' }}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge bg-info days-badge">
                        {{ leave.leaveDays }}
                        {{ leave.leaveDays === 1 ? 'day' : 'days' }}
                      </span>
                    </td>
                    <td>
                      <span class="applied-date">
                        {{ leave.dateOfRequest | date : 'mediumDate' }}
                      </span>
                    </td>
                    <td>
                      <div class="reason-cell">
                        <span
                          class="reason-text d-inline-block text-truncate"
                          style="max-width: 200px;"
                          [title]="leave.reasonForLeave"
                          [class.expanded]="expandedReasons.has(leave.id)"
                          (click)="toggleReason(leave.id)"
                        >
                          {{ leave.reasonForLeave }}
                        </span>
                        <button
                          *ngIf="leave.reasonForLeave.length > 50"
                          class="btn btn-link btn-sm p-0 ms-1"
                          (click)="toggleReason(leave.id)"
                          [title]="
                            expandedReasons.has(leave.id)
                              ? 'Show less'
                              : 'Show more'
                          "
                        >
                          <i
                            class="bi"
                            [class.bi-chevron-down]="
                              !expandedReasons.has(leave.id)
                            "
                            [class.bi-chevron-up]="
                              expandedReasons.has(leave.id)
                            "
                          ></i>
                        </button>
                      </div>
                    </td>
                    <td>
                      <span [class]="getStatusBadgeClass(leave.status)">
                        <i
                          [class]="getStatusIcon(leave.status)"
                          class="me-1"
                        ></i>
                        {{ leave.status }}
                      </span>
                    </td>
                    <td>
                      <div class="actions-cell">
                        <div
                          *ngIf="canModifyLeave(leave.status); else noActions"
                          class="btn-group btn-group-sm"
                        >
                          <button
                            class="btn btn-outline-success"
                            (click)="approveLeave(leave)"
                            [disabled]="processingLeaves.has(leave.id)"
                            title="Approve Leave"
                          >
                            <span
                              *ngIf="
                                processingLeaves.has(leave.id) &&
                                pendingAction === 'approve'
                              "
                              class="spinner-border spinner-border-sm"
                            ></span>
                            <i
                              *ngIf="
                                !processingLeaves.has(leave.id) ||
                                pendingAction !== 'approve'
                              "
                              class="bi bi-check-circle"
                            ></i>
                          </button>
                          <button
                            class="btn btn-outline-danger"
                            (click)="rejectLeave(leave)"
                            [disabled]="processingLeaves.has(leave.id)"
                            title="Reject Leave"
                          >
                            <span
                              *ngIf="
                                processingLeaves.has(leave.id) &&
                                pendingAction === 'reject'
                              "
                              class="spinner-border spinner-border-sm"
                            ></span>
                            <i
                              *ngIf="
                                !processingLeaves.has(leave.id) ||
                                pendingAction !== 'reject'
                              "
                              class="bi bi-x-circle"
                            ></i>
                          </button>
                        </div>
                        <ng-template #noActions>
                          <span class="text-muted small">
                            <i class="bi bi-dash-circle me-1"></i>No actions
                          </span>
                        </ng-template>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination controls below the table -->
            <!-- <div class="d-flex justify-content-between align-items-center mt-3"> -->
            <!-- <div>
                    Rows per page:
                         <select [(ngModel)]="pageSize" class="form-select d-inline-block w-auto">
                          <option [value]="5">5</option>
                          <option [value]="10">10</option>
                          <option [value]="20">20</option>
                        </select>
                    </div> -->

            <pagination-controls class="mt-3 d-flex justify-content-end"
              (pageChange)="currentPage = $event"
              previousLabel="Prev"
              nextLabel="Next"
            >
            </pagination-controls>
          </div>
        </div>

        <!-- Guidelines Section -->
        <!-- <div *ngIf="!loading && filteredLeaves.length > 0" class="guidelines-section mt-4">
            <div class="alert alert-warning">
              <h6 class="alert-heading">
                <i class="bi bi-exclamation-triangle me-2"></i>Action Guidelines
              </h6>
              <ul class="mb-0">
                <li>Only <strong>pending</strong> leaves can be approved or rejected</li>
                <li>Approved leaves will automatically deduct from employee's leave balance</li>
                <li>Once approved or rejected, the status cannot be changed</li>
                <li>Use the export function to download leave data in Excel format</li>
                <li>Consider company policies and employee leave balance before approval</li>
              </ul>
            </div>
          </div> -->
      </div>
    </div>
    <!-- </div> -->
  `,
  styles: [
    `
      .filters-section {
        background-color: #f8f9fa;
        padding: 1.5rem;
        border-radius: 10px;
        border: 1px solid #e9ecef;
      }

      .loading-container {
        text-align: center;
        padding: 3rem 0;
      }

      .empty-state {
        text-align: center;
        padding: 4rem 0;
      }

      .empty-icon {
        margin-bottom: 1rem;
      }

      .results-summary {
        border-radius: 10px;
        overflow: hidden;
      }

      .stats-badges .badge {
        font-size: 0.75rem;
        padding: 0.4rem 0.6rem;
      }

      .table {
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .table thead th {
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.875rem;
        letter-spacing: 0.5px;
        border: none;
        padding: 1rem 0.75rem;
      }

      .table tbody tr {
        transition: all 0.2s ease;
      }

      .table tbody tr:hover {
        background-color: rgba(0, 123, 255, 0.05);
        transform: scale(1.01);
      }

      .employee-cell {
        display: flex;
        align-items: center;
      }

      .employee-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #007bff, #0056b3);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 0.875rem;
        margin-right: 0.75rem;
      }

      .employee-info {
        display: flex;
        flex-direction: column;
      }

      .employee-name {
        font-size: 0.925rem;
        color: #333;
        margin-bottom: 0.125rem;
      }

      .employee-dept {
        font-size: 0.75rem;
      }

      .leave-type-badge {
        background-color: #e7f3ff;
        color: #0066cc;
        padding: 0.25rem 0.5rem;
        border-radius: 6px;
        font-size: 0.875rem;
        font-weight: 500;
      }

      .duration-cell .dates {
        font-size: 0.875rem;
      }

      .days-badge {
        font-size: 0.85rem;
        padding: 0.4rem 0.6rem;
        border-radius: 8px;
      }

      .applied-date {
        font-size: 0.875rem;
        color: #6c757d;
      }

      .reason-cell {
        max-width: 200px;
      }

      .reason-text {
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .reason-text:hover {
        color: #007bff;
      }

      .reason-text.expanded {
        white-space: normal;
        max-width: none !important;
        background-color: #f8f9fa;
        padding: 0.5rem;
        border-radius: 6px;
        border-left: 3px solid #007bff;
      }

      .actions-cell {
        min-width: 120px;
      }

      .btn-group-sm .btn {
        padding: 0.375rem 0.5rem;
        font-size: 0.875rem;
      }

      .guidelines-section {
        border-top: 1px solid #e9ecef;
        padding-top: 1.5rem;
      }

      /* Status Badge Classes */
      .badge.bg-success {
        background: linear-gradient(135deg, #28a745, #20c997) !important;
      }

      .badge.bg-danger {
        background: linear-gradient(135deg, #dc3545, #e74c3c) !important;
      }

      .badge.bg-warning {
        background: linear-gradient(135deg, #ffc107, #f39c12) !important;
        color: #333 !important;
      }

      .badge.bg-secondary {
        background: linear-gradient(135deg, #6c757d, #5a6268) !important;
      }

      /* Row Classes */
      .table-secondary {
        background-color: rgba(108, 117, 125, 0.1) !important;
      }

      .table-danger {
        background-color: rgba(220, 53, 69, 0.1) !important;
      }

      .table-success {
        background-color: rgba(40, 167, 69, 0.1) !important;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .filters-section {
          padding: 1rem;
        }

        .results-summary .row {
          flex-direction: column;
        }

        .stats-badges {
          margin-top: 0.5rem;
        }

        .table-responsive {
          font-size: 0.875rem;
        }

        .employee-cell {
          flex-direction: column;
          align-items: flex-start;
        }

        .employee-avatar {
          margin-right: 0;
          margin-bottom: 0.5rem;
        }

        .reason-cell {
          max-width: 150px;
        }

        .actions-cell .btn-group {
          flex-direction: column;
        }
      }

      @media (max-width: 576px) {
        .container-fluid {
          padding: 0.5rem;
        }

        .card-body {
          padding: 1rem;
        }

        .table thead {
          display: none;
        }

        .table tbody tr {
          display: block;
          border: 1px solid #dee2e6;
          margin-bottom: 1rem;
          border-radius: 8px;
          padding: 1rem;
        }

        .table tbody td {
          display: block;
          text-align: left;
          padding: 0.5rem 0;
          border: none;
        }

        .table tbody td:before {
          content: attr(data-label) ': ';
          font-weight: bold;
          display: inline-block;
          width: 100px;
        }
      }
    `,
  ],
})
export class ManageLeavesComponent implements OnInit {
  currentPage = 1;
  pageSize = 5;

  leaves: Leave[] = [];
  filteredLeaves: Leave[] = [];
  employees: User[] = [];
  loading = true;
  selectedEmployeeId: number | null = null;
  selectedStatus: string = '';
  expandedReasons = new Set<number>();
  processingLeaves = new Set<number>();
  pendingAction: 'approve' | 'reject' | null = null;

  constructor(
    private leaveService: LeaveService,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadAllLeaves();
  }

  loadEmployees(): void {
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.employees = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.toastr.error('Failed to load employees');
      },
    });
  }

  loadAllLeaves(): void {
    this.loading = true;
    this.leaveService.getAllLeaves().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.leaves = response.data;
          this.applyFilters();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading leaves:', error);
        this.toastr.error('Failed to load leave requests');
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    this.filteredLeaves = this.leaves.filter((leave) => {
      let matchesEmployee = true;
      let matchesStatus = true;

      if (this.selectedEmployeeId) {
        matchesEmployee = leave.userId === this.selectedEmployeeId;
      }

      if (this.selectedStatus) {
        matchesStatus = leave.status === this.selectedStatus;
      }

      return matchesEmployee && matchesStatus;
    });

    // Sort by date of request (newest first)
    this.filteredLeaves.sort(
      (a, b) =>
        new Date(b.dateOfRequest).getTime() -
        new Date(a.dateOfRequest).getTime()
    );
  }

  clearFilters(): void {
    this.selectedEmployeeId = null;
    this.selectedStatus = '';
    this.applyFilters();
    this.toastr.info('Filters cleared');
  }

  approveLeave(leave: Leave): void {
    if (leave.status !== 'Pending') {
      this.toastr.error('Only pending leaves can be approved');
      return;
    }

    const confirmMessage = `Are you sure you want to approve ${
      leave.userName
    }'s leave request for ${leave.leaveDays} day(s) from ${new Date(
      leave.startDate
    ).toLocaleDateString()} to ${new Date(
      leave.endDate
    ).toLocaleDateString()}?`;

    if (confirm(confirmMessage)) {
      this.updateLeaveStatus(leave.id, 'Approved', 'approve');
    }
  }

  rejectLeave(leave: Leave): void {
    if (leave.status !== 'Pending') {
      this.toastr.error('Only pending leaves can be rejected');
      return;
    }

    const confirmMessage = `Are you sure you want to reject ${
      leave.userName
    }'s leave request from ${new Date(
      leave.startDate
    ).toLocaleDateString()} to ${new Date(
      leave.endDate
    ).toLocaleDateString()}?`;

    if (confirm(confirmMessage)) {
      this.updateLeaveStatus(leave.id, 'Rejected', 'reject');
    }
  }

  private updateLeaveStatus(
    leaveId: number,
    status: 'Approved' | 'Rejected',
    action: 'approve' | 'reject'
  ): void {
    this.processingLeaves.add(leaveId);
    this.pendingAction = action;

    this.leaveService.updateLeaveStatus({ leaveId, status }).subscribe({
      next: (response) => {
        if (response.success) {
          const actionText = status.toLowerCase();
          this.toastr.success(`Leave ${actionText} successfully!`, 'Success');
          this.loadAllLeaves(); // Reload to get updated data
        } else {
          this.toastr.error(
            response.message || `Failed to ${action} leave`,
            'Error'
          );
        }
      },
      error: (error) => {
        console.error(`Error ${action}ing leave:`, error);
        this.toastr.error(
          error.error?.message || `Failed to ${action} leave`,
          'Error'
        );
      },
      complete: () => {
        this.processingLeaves.delete(leaveId);
        this.pendingAction = null;
      },
    });
  }

  exportLeaves(): void {
    const userId = this.selectedEmployeeId || undefined;

    this.leaveService.exportLeaves(userId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const fileName = userId
          ? `Leaves_${this.getEmployeeName(userId)}_${
              new Date().toISOString().split('T')[0]
            }.xlsx`
          : `All_Leaves_${new Date().toISOString().split('T')[0]}.xlsx`;

        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.toastr.success(
          'Leave data exported successfully!',
          'Export Complete'
        );
      },
      error: (error) => {
        console.error('Export error:', error);
        this.toastr.error('Failed to export leave data', 'Export Failed');
      },
    });
  }

  toggleReason(leaveId: number): void {
    if (this.expandedReasons.has(leaveId)) {
      this.expandedReasons.delete(leaveId);
    } else {
      this.expandedReasons.add(leaveId);
    }
  }

  // Utility methods
  trackByLeaveId(index: number, leave: Leave): number {
    return leave.id;
  }

  getEmployeeName(userId: number): string {
    const employee = this.employees.find((emp) => emp.id === userId);
    return employee ? employee.fullName.replace(' ', '_') : 'Unknown';
  }

  getEmployeeDepartment(userId: number): string {
    const employee = this.employees.find((emp) => emp.id === userId);
    return employee?.department || 'Unknown Department';
  }

  getEmployeeInitials(fullName: string): string {
    const names = fullName.split(' ');
    return names.length >= 2
      ? `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
      : fullName.substring(0, 2).toUpperCase();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Approved':
        return 'badge bg-success';
      case 'Rejected':
        return 'badge bg-danger';
      case 'Cancelled':
        return 'badge bg-secondary';
      default:
        return 'badge bg-warning';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Approved':
        return 'bi bi-check-circle';
      case 'Rejected':
        return 'bi bi-x-circle';
      case 'Cancelled':
        return 'bi bi-slash-circle';
      default:
        return 'bi bi-clock';
    }
  }

  getRowClass(status: string): string {
    switch (status) {
      case 'Cancelled':
        return 'table-secondary';
      case 'Rejected':
        return 'table-danger';
      case 'Approved':
        return 'table-success';
      default:
        return '';
    }
  }

  canModifyLeave(status: string): boolean {
    return status === 'Pending';
  }

  // Statistics methods
  getPendingCount(): number {
    return this.filteredLeaves.filter((leave) => leave.status === 'Pending')
      .length;
  }

  getApprovedCount(): number {
    return this.filteredLeaves.filter((leave) => leave.status === 'Approved')
      .length;
  }

  getRejectedCount(): number {
    return this.filteredLeaves.filter((leave) => leave.status === 'Rejected')
      .length;
  }

  getCancelledCount(): number {
    return this.filteredLeaves.filter((leave) => leave.status === 'Cancelled')
      .length;
  }
}
