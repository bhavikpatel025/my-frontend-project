import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { LeaveService } from '../../services/leave.service';
import { User, LeaveType, UpdateUserRequest } from '../../models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <div class="card shadow">
            <div class="card-header bg-warning text-dark">
              <h4 class="card-title mb-0">
                <i class="bi bi-person-gear me-2"></i>Edit Employee
              </h4>
            </div>
            <div class="card-body p-4">
              <div *ngIf="loading" class="text-center py-5">
                <div class="spinner-border text-primary"></div>
                <p class="mt-2 text-muted">Loading employee data...</p>
              </div>

              <form *ngIf="!loading && editForm" [formGroup]="editForm" (ngSubmit)="onSubmit()">
                
                <!-- Personal Information Section -->
                <div class="section-header">
                  <h5 class="text-primary mb-3">
                    <i class="bi bi-person me-2"></i>Personal Information
                  </h5>
                </div>
                <div class="row mb-4">
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">First Name *</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      formControlName="firstName" 
                      [class.is-invalid]="f['firstName'].invalid && f['firstName'].touched">
                    <div class="invalid-feedback" *ngIf="f['firstName'].invalid && f['firstName'].touched">
                      <div *ngIf="f['firstName'].errors?.['required']">First name is required</div>
                      <div *ngIf="f['firstName'].errors?.['maxlength']">First name cannot exceed 50 characters</div>
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Last Name *</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      formControlName="lastName"
                      [class.is-invalid]="f['lastName'].invalid && f['lastName'].touched">
                    <div class="invalid-feedback" *ngIf="f['lastName'].invalid && f['lastName'].touched">
                      <div *ngIf="f['lastName'].errors?.['required']">Last name is required</div>
                      <div *ngIf="f['lastName'].errors?.['maxlength']">Last name cannot exceed 50 characters</div>
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Email Address *</label>
                    <input 
                      type="email" 
                      class="form-control" 
                      formControlName="emailAddress"
                      [class.is-invalid]="f['emailAddress'].invalid && f['emailAddress'].touched">
                    <div class="invalid-feedback" *ngIf="f['emailAddress'].invalid && f['emailAddress'].touched">
                      <div *ngIf="f['emailAddress'].errors?.['required']">Email is required</div>
                      <div *ngIf="f['emailAddress'].errors?.['email']">Please enter a valid email</div>
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Contact Number *</label>
                    <input 
                      type="tel" 
                      class="form-control" 
                      formControlName="contactNo"
                      [class.is-invalid]="f['contactNo'].invalid && f['contactNo'].touched">
                    <div class="invalid-feedback" *ngIf="f['contactNo'].invalid && f['contactNo'].touched">
                      <div *ngIf="f['contactNo'].errors?.['required']">Contact number is required</div>
                      <div *ngIf="f['contactNo'].errors?.['pattern']">Please enter a valid 10-digit contact number</div>
                    </div>
                  </div>
                </div>

                <!-- Professional Information Section -->
                <div class="section-header">
                  <h5 class="text-primary mb-3">
                    <i class="bi bi-building me-2"></i>Professional Information
                  </h5>
                </div>
                <div class="row mb-4">
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Department *</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      formControlName="department"
                      [class.is-invalid]="f['department'].invalid && f['department'].touched">
                    <div class="invalid-feedback" *ngIf="f['department'].invalid && f['department'].touched">
                      Department is required
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Designation *</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      formControlName="designation"
                      [class.is-invalid]="f['designation'].invalid && f['designation'].touched">
                    <div class="invalid-feedback" *ngIf="f['designation'].invalid && f['designation'].touched">
                      Designation is required
                    </div>
                  </div>
                </div>

                <!-- Leave Balances Section -->
                <div class="section-header">
                  <h5 class="text-primary mb-3">
                    <i class="bi bi-calendar-check me-2"></i>Leave Balances
                  </h5>
                </div>
                <div class="row mb-4" formArrayName="leaveBalances">
                  <div 
                    *ngFor="let balance of leaveBalancesArray.controls; let i = index" 
                    class="col-md-4 mb-3"
                    [formGroupName]="i">
                    <div class="card border-warning">
                      <div class="card-body">
                        <h6 class="card-title">{{ leaveTypes[i].type }}</h6>
                        <p class="card-text small text-muted">{{ leaveTypes[i].description }}</p>
                        <label class="form-label small fw-bold">Balance (Days)</label>
                        <input 
                          type="number" 
                          class="form-control form-control-sm" 
                          formControlName="balance" 
                          min="0" 
                          max="365"
                          [class.is-invalid]="balance.get('balance')?.invalid && balance.get('balance')?.touched">
                        <div class="invalid-feedback" *ngIf="balance.get('balance')?.invalid && balance.get('balance')?.touched">
                          <div *ngIf="balance.get('balance')?.errors?.['required']">Balance is required</div>
                          <div *ngIf="balance.get('balance')?.errors?.['min']">Balance cannot be negative</div>
                          <div *ngIf="balance.get('balance')?.errors?.['max']">Balance cannot exceed 365 days</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="d-flex justify-content-between">
                  <button 
                    type="button" 
                    class="btn btn-secondary" 
                    routerLink="/manage-employees"
                    [disabled]="submitting">
                    <i class="bi bi-arrow-left me-2"></i>Back to Employees
                  </button>
                  <div class="d-flex gap-2">
                    <button 
                      type="button" 
                      class="btn btn-danger" 
                      (click)="confirmDelete()"
                      [disabled]="submitting">
                      <i class="bi bi-trash me-2"></i>Delete Employee
                    </button>
                    <button 
                      type="submit" 
                      class="btn btn-warning" 
                      [disabled]="submitting || editForm.invalid">
                      <span *ngIf="submitting" class="spinner-border spinner-border-sm me-2"></span>
                      <i *ngIf="!submitting" class="bi bi-save me-2"></i>
                      {{ submitting ? 'Updating...' : 'Update Employee' }}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true" *ngIf="showDeleteModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">
              <i class="bi bi-exclamation-triangle me-2"></i>Confirm Delete
            </h5>
            <button type="button" class="btn-close btn-close-white" (click)="cancelDelete()"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-warning">
              <strong>Warning:</strong> This action cannot be undone!
            </div>
            <p>Are you sure you want to delete <strong>{{ employee?.fullName }}</strong>?</p>
            <p class="text-muted small">
              This will permanently remove the employee and all associated data except approved leave records.
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="cancelDelete()" [disabled]="deleting">
              Cancel
            </button>
            <button type="button" class="btn btn-danger" (click)="deleteEmployee()" [disabled]="deleting">
              <span *ngIf="deleting" class="spinner-border spinner-border-sm me-2"></span>
              <i *ngIf="!deleting" class="bi bi-trash me-2"></i>
              {{ deleting ? 'Deleting...' : 'Delete Employee' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .section-header {
      border-bottom: 2px solid #e9ecef;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
    }
    
    .card {
      border-radius: 15px;
      transition: all 0.3s ease;
    }
    
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .form-control:focus {
      border-color: #ffc107;
      box-shadow: 0 0 0 0.2rem rgba(255,193,7,0.25);
    }
    
    .modal-backdrop {
      background-color: rgba(0,0,0,0.5);
    }
    
    .btn-warning {
      color: #000;
    }
    
    .btn-warning:hover {
      color: #000;
    }
    
    @media (max-width: 768px) {
      .d-flex.justify-content-between {
        flex-direction: column;
        gap: 1rem;
      }
      
      .d-flex.gap-2 {
        width: 100%;
      }
      
      .d-flex.gap-2 button {
        flex: 1;
      }
    }
  `]
})
export class EditEmployeeComponent implements OnInit {
  editForm!: FormGroup;
  leaveTypes: LeaveType[] = [];
  employee: User | null = null;
  loading = true;
  submitting = false;
  deleting = false;
  showDeleteModal = false;
  employeeId: number;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private leaveService: LeaveService,
    private toastr: ToastrService
  ) {
    this.employeeId = +this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.loadLeaveTypes();
    this.loadEmployee();
  }

  loadLeaveTypes(): void {
    this.leaveService.getLeaveTypes().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.leaveTypes = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading leave types:', error);
        this.toastr.error('Failed to load leave types');
      }
    });
  }

  loadEmployee(): void {
    this.userService.getUserById(this.employeeId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.employee = response.data;
          this.initializeForm();
        } else {
          this.toastr.error('Employee not found');
          this.router.navigate(['/manage-employees']);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employee:', error);
        this.toastr.error('Failed to load employee data');
        this.router.navigate(['/manage-employees']);
      }
    });
  }

  initializeForm(): void {
    if (!this.employee) return;

    this.editForm = this.formBuilder.group({
      firstName: [this.employee.firstName, [Validators.required, Validators.maxLength(50)]],
      lastName: [this.employee.lastName, [Validators.required, Validators.maxLength(50)]],
      emailAddress: [this.employee.emailAddress, [Validators.required, Validators.email]],
      department: [this.employee.department, [Validators.required, Validators.maxLength(100)]],
      designation: [this.employee.designation, [Validators.required, Validators.maxLength(100)]],
      contactNo: [this.employee.contactNo, [Validators.required, Validators.pattern(/^\d{10}$/)]],
      leaveBalances: this.formBuilder.array([])
    });

    this.initializeLeaveBalances();
  }

  initializeLeaveBalances(): void {
    const leaveBalancesArray = this.editForm.get('leaveBalances') as FormArray;
    leaveBalancesArray.clear();

    this.leaveTypes.forEach(leaveType => {
      const existingBalance = this.employee?.leaveBalances.find(b => b.leaveTypeId === leaveType.id);
      
      leaveBalancesArray.push(this.formBuilder.group({
        leaveTypeId: [leaveType.id],
        leaveTypeName: [leaveType.type],
        balance: [existingBalance?.balance || 0, [Validators.required, Validators.min(0), Validators.max(365)]]
      }));
    });
  }

  get f() { return this.editForm.controls; }
  get leaveBalancesArray() { return this.editForm.get('leaveBalances') as FormArray; }

  onSubmit(): void {
    if (this.editForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting = true;
    const formValue = { ...this.editForm.value };

    // Format leave balances for API
    formValue.leaveBalances = formValue.leaveBalances.map((balance: any) => ({
      leaveTypeId: balance.leaveTypeId,
      balance: parseInt(balance.balance),
      leaveTypeName: balance.leaveTypeName
    }));

    this.userService.updateUser(this.employeeId, formValue).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success('Employee updated successfully!', 'Success');
          this.router.navigate(['/manage-employees']);
        } else {
          this.toastr.error(response.message || 'Update failed', 'Error');
          this.submitting = false;
        }
      },
      error: (error) => {
        console.error('Update error:', error);
        this.toastr.error(error.error?.message || 'Failed to update employee', 'Error');
        this.submitting = false;
      }
    });
  }

  confirmDelete(): void {
    this.showDeleteModal = true;
    // Show modal using Bootstrap
    const modal = new (window as any).bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
    if (modal) {
      modal.hide();
    }
  }

  deleteEmployee(): void {
    this.deleting = true;

    this.userService.deleteUser(this.employeeId).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success('Employee deleted successfully!', 'Success');
          this.router.navigate(['/manage-employees']);
        } else {
          this.toastr.error(response.message || 'Delete failed', 'Error');
          this.deleting = false;
        }
      },
      error: (error) => {
        console.error('Delete error:', error);
        this.toastr.error(error.error?.message || 'Failed to delete employee', 'Error');
        this.deleting = false;
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          Object.keys(arrayControl.value).forEach(controlName => {
            arrayControl.get(controlName)?.markAsTouched();
          });
        });
      } else {
        control?.markAsTouched();
      }
    });
  }
}