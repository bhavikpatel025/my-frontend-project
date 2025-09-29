import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LeaveService } from '../../services/leave.service';
import { UserService } from '../../services/user.service';
import { Leave, User, LeaveBalance } from '../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="welcome-section mb-4">
            <!-- <h2 class="dashboard-title">
              <i class="bi bi-house me-2"></i>Dashboard
            </h2> -->
            <p class="welcome-text">
              Welcome back, <strong>{{ currentUser?.firstName }}!</strong> 
              <span class="badge bg-secondary ms-2">{{ currentUser?.role }}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div *ngIf="loading" class="loading-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 text-muted">Loading dashboard data...</p>
      </div>

      <!-- Admin Dashboard -->
      <div *ngIf="!loading && authService.isAdmin" class="admin-dashboard">
        <!-- Stats Cards -->
        <div class="row mb-4">
          <div class="col-md-3 mb-3">
            <div class="stats-card card bg-primary text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="card-title">Total Employees</h6>
                    <h3 class="stats-number">{{ totalEmployees }}</h3>
                  </div>
                  <div class="stats-icon">
                    <i class="bi bi-people fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="stats-card card bg-warning text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="card-title">Pending Leaves</h6>
                    <h3 class="stats-number">{{ pendingLeaves }}</h3>
                  </div>
                  <div class="stats-icon">
                    <i class="bi bi-clock fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="stats-card card bg-success text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="card-title">Approved Leaves</h6>
                    <h3 class="stats-number">{{ approvedLeaves }}</h3>
                  </div>
                  <div class="stats-icon">
                    <i class="bi bi-check-circle fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>          

          <div class="col-md-3 mb-3">
            <div class="stats-card card bg-info text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="card-title">Total Requests</h6>
                    <h3 class="stats-number">{{ totalLeaves }}</h3>
                  </div>
                  <div class="stats-icon">
                    <i class="bi bi-calendar-check fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Leave Requests -->
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">
                  <i class="bi bi-clock-history me-2"></i>Recent Leave Requests
                </h5>
                <a routerLink="/manage-leaves" class="btn btn-outline-secondary btn-sm">
                  View All <i class="bi bi-arrow-right ms-1"></i>
                </a>
              </div>
              <div class="card-body">
                <div *ngIf="recentLeaves.length === 0" class="empty-state">
                  <i class="bi bi-inbox display-1 text-muted"></i>
                  <h5 class="text-muted mt-3">No recent leave requests</h5>
                  <p class="text-muted">Leave requests will appear here once employees start applying.</p>
                </div>
                
                <div *ngIf="recentLeaves.length > 0" class="table-responsive">
                  <table class="table table-hover  text-center table-bordered">
                    <thead class="table-success">
                      <tr>
                        <th>Employee</th>
                        <th>Leave Type</th>
                        <th>Duration</th>
                        <th>Days</th>
                        <th>Applied On</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let leave of recentLeaves">
                        <td>
                          <div class="employee-info">
                            <strong>{{ leave.userName }}</strong>
                          </div>
                        </td>
                        <td>{{ leave.leaveTypeName }}</td>
                        <td>
                          <small class="text-muted">
                            {{ leave.startDate | date:'mediumDate' }} - 
                            {{ leave.endDate | date:'mediumDate' }}
                          </small>
                        </td>
                        <td>
                          <span class="badge bg-info">{{ leave.leaveDays }} days</span>
                        </td>
                        <td>{{ leave.dateOfRequest | date:'shortDate' }}</td>
                        <td>
                          <span [class]="getStatusBadgeClass(leave.status)">
                            {{ leave.status }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Employee Dashboard -->
      <div *ngIf="!loading && authService.isEmployee" class="employee-dashboard">
        <div class="row">
          <!-- Leave Balances -->
          <div class="col-lg-6 mb-4">
            <div class="card h-80">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="bi bi-wallet2 me-2"></i>My Leave Balances
                </h5>
              </div>
              <div class="card-body">
                <div *ngIf="leaveBalances.length === 0" class="empty-state-small">
                  <i class="bi bi-exclamation-circle text-warning"></i>
                  <p class="text-muted mb-0">No leave balances configured</p>
                </div>
                
                <div *ngFor="let balance of leaveBalances" class="balance-item">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h6 class="mb-1">{{ balance.leaveTypeName }}</h6>
                      <small class="text-muted">Available Days</small>
                    </div>
                    <div class="text-end">
                      <span class="badge bg-primary fs-6">{{ balance.balance }} days</span>
                    </div>
                  </div>
                  <div class="progress mb-3" style="height: 6px;">
                    <div class="progress-bar" 
                         [style.width.%]="getBalancePercentage(balance.balance)" 
                         [class]="getProgressBarClass(balance.balance)">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="col-lg-6 mb-4">
            <div class="card h-80">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="bi bi-lightning me-2"></i>Quick Actions
                </h5>
              </div>
              <div class="card-body d-flex flex-column">
                <div class="d-grid gap-3 flex-grow-1">
                  <a routerLink="/apply-leave" class="btn btn-secondary btn-lg">
                    <i class="bi bi-plus-circle me-2"></i>Apply for Leave
                  </a>
                  <a routerLink="/my-leaves" class="btn btn-outline-secondary btn-lg">
                    <i class="bi bi-list-ul me-2"></i>View My Leaves
                  </a>
                </div>
                
                <div class="mt-4 p-3 bg-light rounded">
                  <small class="text-muted">
                    <i class="bi bi-info-circle me-1"></i>
                    Remember: Leave requests should be submitted at least 3 days in advance.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Leave Applications -->
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">
                  <i class="bi bi-calendar-event me-2"></i>My Recent Leave Applications
                </h5>
                <a routerLink="/my-leaves" class="btn btn-outline-secondary btn-sm">
                  View All <i class="bi bi-arrow-right ms-1"></i>
                </a>
              </div>
              <div class="card-body">
                <div *ngIf="recentLeaves.length === 0" class="empty-state">
                  <i class="bi bi-calendar-x display-1 text-muted"></i>
                  <h5 class="text-muted mt-3">No leave applications yet</h5>
                  <p class="text-muted">Your leave applications will appear here once you apply.</p>
                  <a routerLink="/apply-leave" class="btn btn-primary">
                    <i class="bi bi-plus-circle me-2"></i>Apply for Leave
                  </a>
                </div>
                
                <div *ngIf="recentLeaves.length > 0" class="table-responsive">
                  <table class="table table-hover text-center table-bordered">
                    <thead class="table-success">
                      <tr>
                        <th>Leave Type</th>
                        <th>Duration</th>
                        <th>Days</th>
                        <th>Applied On</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let leave of recentLeaves">
                        <td>
                          <strong>{{ leave.leaveTypeName }}</strong>
                        </td>
                        <td>
                          <small class="text-muted">
                            {{ leave.startDate | date:'mediumDate' }} - 
                            {{ leave.endDate | date:'mediumDate' }}
                          </small>
                        </td>
                        <td>
                          <span class="badge bg-info">{{ leave.leaveDays }} days</span>
                        </td>
                        <td>{{ leave.dateOfRequest | date:'shortDate' }}</td>
                        <td>
                          <span [class]="getStatusBadgeClass(leave.status)">
                            {{ leave.status }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-title {
      color: #333;
      font-weight: 600;
      margin-bottom: 0;
    }
    
    .welcome-section {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 2rem;
      border-radius: 15px;
      border-left: 5px solid #007bff;
    }
    
    .welcome-text {
      margin-bottom: 0;
      color: #6c757d;
      font-size: 1.1rem;
    }
    
    .loading-container {
      text-align: center;
      padding: 3rem 0;
    }
    
    .stats-card {
      transition: all 0.3s ease;
      border: none;
    }
    
    .stats-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    }
    
    .stats-number {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0;
    }
    
    .stats-icon {
      opacity: 0.7;
    }
    
    .empty-state {
      text-align: center;
      padding: 3rem 0;
    }
    
    .empty-state-small {
      text-align: center;
      padding: 2rem 0;
    }
    
    .employee-info strong {
      color: #333;
    }
    
    .balance-item {
      padding: 0.5rem 0;
    }
    
    .badge {
      font-size: 0.85rem;
      padding: 0.4rem 0.8rem;
    }
    
    .progress {
      border-radius: 10px;
    }
    
    .progress-bar {
      border-radius: 10px;
    }
    
    .btn-lg {
      padding: 0.75rem 1.5rem;
      font-weight: 600;
    }
    
    .card {
      transition: all 0.3s ease;
    }
    
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }
    
    @media (max-width: 768px) {
      .welcome-section {
        padding: 1.5rem;
      }
      
      .stats-number {
        font-size: 2rem;
      }
      
      .table-responsive {
        font-size: 0.875rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  recentLeaves: Leave[] = [];
  leaveBalances: LeaveBalance[] = [];
  totalEmployees = 0;
  pendingLeaves = 0;
  approvedLeaves = 0;
  totalLeaves = 0;
  loading = true;

  constructor(
    public authService: AuthService,
    private leaveService: LeaveService,
    private userService: UserService
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    if (this.authService.isAdmin) {
      this.loadAdminDashboard();
    } else {
      this.loadEmployeeDashboard();
    }
  }

  loadAdminDashboard(): void {
    // Load all leaves for admin
    this.leaveService.getAllLeaves().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const leaves = response.data;
          this.recentLeaves = leaves.slice(0, 5);
          this.totalLeaves = leaves.length;
          this.pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
          this.approvedLeaves = leaves.filter(l => l.status === 'Approved').length;
        }
      },
      error: (error) => {
        console.error('Error loading leaves:', error);
      }
    });

    // Load total employees
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.totalEmployees = response.data.length;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
      }
    });
  }

  loadEmployeeDashboard(): void {
    // Load user's leaves
    this.leaveService.getMyLeaves().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.recentLeaves = response.data.slice(0, 5);
        }
      },
      error: (error) => {
        console.error('Error loading my leaves:', error);
      }
    });

    // Load user's leave balances
    if (this.currentUser?.userId) {
      this.userService.getUserById(this.currentUser.userId).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.leaveBalances = response.data.leaveBalances || [];
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading user data:', error);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
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

  getBalancePercentage(balance: number): number {
    // Assuming max balance is 30 days for percentage calculation
    const maxBalance = 30;
    return Math.min((balance / maxBalance) * 100, 100);
  }

  getProgressBarClass(balance: number): string {
    if (balance <= 5) return 'bg-danger';
    if (balance <= 10) return 'bg-warning';
    return 'bg-success';
  }
}