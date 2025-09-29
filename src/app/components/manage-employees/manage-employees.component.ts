import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models';
import { ToastrService } from 'ngx-toastr';
import { ProfilePictureComponent } from '../profile-picture/profile-picture.component';

@Component({
  selector: 'app-manage-employees',
  standalone: true,
  imports: [CommonModule, RouterModule,ProfilePictureComponent],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow">
        <div class="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
          <h4 class="card-title mb-0">
            <i class="bi bi-people me-2"></i>Manage Employees
          </h4>
          <button class="btn btn-light btn-sm" routerLink="/register-employee">
            <i class="bi bi-person-plus me-1"></i>Add Employee
          </button>
        </div>

        <div class="card-body">
          <div *ngIf="loading" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
            <p class="mt-2 text-muted">Loading employees...</p>
          </div>

          <div *ngIf="!loading && employees.length === 0" class="empty-state">
            <i class="bi bi-people display-1 text-muted"></i>
            <h5 class="text-muted">No employees found</h5>
            <p class="text-muted">Start by registering your first employee.</p>
            <button class="btn btn-primary" routerLink="/register-employee">
              <i class="bi bi-person-plus me-2"></i>Register Employee
            </button>
          </div>

          <div *ngIf="!loading && employees.length > 0">
            <div class="alert alert-info mb-4">
              <strong>Total Employees:</strong> {{ employees.length }}
            </div>

            <div class="row">
              <div class="col-lg-4 col-md-6 mb-4" *ngFor="let employee of employees">
                <div class="card h-100 border-primary employee-card">
                  <div class="card-header bg-light">
                    <div class="d-flex align-items-center">
                      <app-profile-picture
                          class="sm me-3"
                          [userId]="employee.id"
                          [firstName]="employee.firstName"
                          [lastName]="employee.lastName"
                          [editable]="false"
                          size="sm">
                      </app-profile-picture>

                      <div>
                        <h6 class="card-title mb-0">{{ employee.fullName }}</h6>
                        <small class="text-muted">{{ employee.designation }}</small>
                      </div>
                    </div>
                  </div>

                  <div class="card-body">
                    <div class="contact-info mb-3">
                      <small class="text-muted fw-bold">Contact Information</small>
                      <div class="mt-2">
                        <div class="info-item">
                          <i class="bi bi-envelope text-primary me-2"></i>
                          <span>{{ employee.emailAddress }}</span>
                        </div>
                        <div class="info-item">
                          <i class="bi bi-telephone text-primary me-2"></i>
                          <span>{{ employee.contactNo }}</span>
                        </div>
                        <div class="info-item">
                          <i class="bi bi-building text-primary me-2"></i>
                          <span>{{ employee.department }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="leave-balances">
                      <small class="text-muted fw-bold">Leave Balances</small>
                      <div class="mt-2">
                        <div *ngIf="employee.leaveBalances.length === 0" class="text-muted small">
                          No leave balances set
                        </div>
                        <div *ngFor="let balance of employee.leaveBalances" class="balance-row">
                          <span class="small">{{ balance.leaveTypeName }}:</span>
                          <span class="badge bg-info ms-auto">{{ balance.balance }} days</span>
                        </div>
                        <hr class="my-2">
                        <div class="balance-row fw-bold">
                          <span class="small">Total:</span>
                          <span class="badge bg-success ms-auto">{{ getTotalLeaveBalance(employee) }} days</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="card-footer bg-light d-flex gap-2">
                    <button class="btn btn-outline-primary btn-sm w-50" (click)="editEmployee(employee.id)">
                      <i class="bi bi-pencil me-1"></i>Edit
                    </button>
                    <button class="btn btn-outline-danger btn-sm w-50" (click)="deleteEmployee(employee)">
                      <i class="bi bi-trash me-1"></i>Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
  .card-header{
    background-color: #rgb(132 145 157)!important;
  }
    .empty-state { text-align: center; padding: 3rem 0; }
    .employee-card { transition: all 0.3s ease; }
    .employee-card:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
    .user-avatar { width: 48px; height: 48px; font-weight: bold; }
    .info-item { display: flex; align-items: center; margin-bottom: 0.5rem; font-size: 0.875rem; }
    .balance-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; }
  `]
})
export class ManageEmployeesComponent implements OnInit {
  employees: User[] = [];
  loading = true;

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.employees = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.toastr.error('Failed to load employees');
        this.loading = false;
      }
    });
  }

  getTotalLeaveBalance(employee: User): number {
    return employee.leaveBalances.reduce((total, balance) => total + balance.balance, 0);
  }

  editEmployee(id: number): void {
    this.router.navigate(['/edit-employee', id]);
  }

  deleteEmployee(employee: User): void {
    if (!confirm(`Are you sure you want to delete ${employee.fullName}?`)) return;

    this.userService.deleteUser(employee.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success('Employee deleted successfully');
          this.loadEmployees();
        } else {
          this.toastr.error(response.message || 'Failed to delete employee');
        }
      },
      error: (error) => {
        console.error('Error deleting employee:', error);
        this.toastr.error(error.error?.message || 'Failed to delete employee');
      }
    });
  }
}
