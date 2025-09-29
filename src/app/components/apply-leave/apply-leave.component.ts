import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LeaveService } from '../../services/leave.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { LeaveType, LeaveBalance } from '../../models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-apply-leave',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card shadow-lg">
            <div class="card-header bg-secondary text-white">
              <h4 class="card-title mb-0">
                <i class="bi bi-calendar-plus me-2"></i>Apply for Leave
              </h4>
            </div>
            <div class="card-body p-4">
              <form [formGroup]="applyLeaveForm" (ngSubmit)="onSubmit()">
                <div class="row">
                  <!-- Leave Type -->
                  <div class="col-md-6 mb-3">
                    <label for="leaveTypeId" class="form-label fw-bold">
                      <i class="bi bi-tag me-2"></i>Leave Type *
                    </label>
                    <select 
                      class="form-select" 
                      id="leaveTypeId" 
                      formControlName="leaveTypeId"
                      [class.is-invalid]="f['leaveTypeId'].invalid && f['leaveTypeId'].touched">
                      <option value="">Select Leave Type</option>
                      <option *ngFor="let type of leaveTypes" [value]="type.id">
                        {{ type.type }} - {{ type.description }}
                      </option>
                    </select>
                    <div class="invalid-feedback" *ngIf="f['leaveTypeId'].invalid && f['leaveTypeId'].touched">
                      Leave type is required
                    </div>
                  </div>

                  <!-- Available Balance -->
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">
                      <i class="bi bi-wallet2 me-2"></i>Available Balance
                    </label>
                    <div class="balance-display">
                      <span class="badge bg-success fs-6 p-2">
                        <i class="bi bi-calendar-check me-1"></i>
                        {{ getAvailableBalance() }} days
                      </span>
                    </div>
                  </div>

                  <!-- Start Date -->
                  <div class="col-md-6 mb-3">
                    <label for="startDate" class="form-label fw-bold">
                      <i class="bi bi-calendar-event me-2"></i>Start Date *
                    </label>
                    <input 
                      type="date" 
                      class="form-control" 
                      id="startDate" 
                      formControlName="startDate"
                      [min]="minDate"
                      [class.is-invalid]="(f['startDate'].invalid && f['startDate'].touched) || applyLeaveForm.hasError('pastDate') || applyLeaveForm.hasError('invalidDateRange')">
                    <div class="invalid-feedback" *ngIf="f['startDate'].invalid && f['startDate'].touched">
                      Start date is required
                    </div>
                    <div class="invalid-feedback" *ngIf="applyLeaveForm.hasError('pastDate')">
                      Start date cannot be in the past
                    </div>
                  </div>

                  <!-- End Date -->
                  <div class="col-md-6 mb-3">
                    <label for="endDate" class="form-label fw-bold">
                      <i class="bi bi-calendar-x me-2"></i>End Date *
                    </label>
                    <input 
                      type="date" 
                      class="form-control" 
                      id="endDate" 
                      formControlName="endDate"
                      [min]="f['startDate'].value || minDate"
                      [class.is-invalid]="(f['endDate'].invalid && f['endDate'].touched) || applyLeaveForm.hasError('invalidDateRange')">
                    <div class="invalid-feedback" *ngIf="f['endDate'].invalid && f['endDate'].touched">
                      End date is required
                    </div>
                    <div class="invalid-feedback" *ngIf="applyLeaveForm.hasError('invalidDateRange')">
                      End date must be after start date
                    </div>
                  </div>

                  <!-- Leave Days Preview -->
                  <div class="col-12 mb-3" *ngIf="f['startDate'].value && f['endDate'].value && !applyLeaveForm.hasError('invalidDateRange')">
                    <div class="alert alert-info">
                      <div class="d-flex align-items-center">
                        <i class="bi bi-info-circle me-2"></i>
                        <strong>Total Leave Days: {{ getLeaveDays() }}</strong>
                        <span class="ms-auto">
                          <span *ngIf="getLeaveDays() <= getAvailableBalance()" class="text-success">
                            <i class="bi bi-check-circle me-1"></i>Sufficient balance
                          </span>
                          <span *ngIf="getLeaveDays() > getAvailableBalance()" class="text-danger">
                            <i class="bi bi-exclamation-triangle me-1"></i>Insufficient balance
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Reason for Leave -->
                  <div class="col-12 mb-4">
                    <label for="reasonForLeave" class="form-label fw-bold">
                      <i class="bi bi-chat-text me-2"></i>Reason for Leave *
                    </label>
                    <textarea 
                      class="form-control" 
                      id="reasonForLeave" 
                      rows="4" 
                      formControlName="reasonForLeave"
                      [class.is-invalid]="f['reasonForLeave'].invalid && f['reasonForLeave'].touched"
                      placeholder="Please provide a detailed reason for your leave request..."
                      maxlength="1000"></textarea>
                    <div class="invalid-feedback" *ngIf="f['reasonForLeave'].invalid && f['reasonForLeave'].touched">
                      <div *ngIf="f['reasonForLeave'].errors?.['required']">Reason is required</div>
                      <div *ngIf="f['reasonForLeave'].errors?.['maxlength']">Reason cannot exceed 1000 characters</div>
                    </div>
                    <div class="form-text">
                      {{ f['reasonForLeave'].value?.length || 0 }}/1000 characters
                    </div>
                  </div>

                  <!-- Important Guidelines -->
                  <!-- <div class="col-12 mb-4">
                    <div class="alert alert-warning">
                      <h6><i class="bi bi-exclamation-triangle me-2"></i>Important Guidelines:</h6>
                      <ul class="mb-0">
                        <li>Leave requests should be submitted at least 3 days in advance</li>
                        <li>Once submitted, leave applications cannot be edited</li>
                        <li>You can cancel pending leaves up to 3 days before the start date</li>
                        <li>Ensure you have sufficient leave balance before applying</li>
                      </ul>
                    </div>
                  </div> -->

                  <!-- Submit Buttons -->
                  <div class="col-12">
                    <div class="d-flex justify-content-end gap-3">
                      <button 
                        type="button" 
                        class="btn btn-secondary" 
                        routerLink="/dashboard"
                        [disabled]="loading">
                        <i class="bi bi-x-circle me-2"></i>Cancel
                      </button>
                      <button 
                        type="submit" 
                        class="btn btn-primary btn-lg" 
                        [disabled]="loading || applyLeaveForm.invalid || getLeaveDays() > getAvailableBalance()">
                        <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                        <i *ngIf="!loading" class="bi bi-send me-2"></i>
                        {{ loading ? 'Submitting...' : 'Apply Leave' }}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border-radius: 15px;
    }
    
    .card-header {
      border-radius: 15px 15px 0 0 !important;
    }
    
    .balance-display {
      padding: 0.6rem 0;
    }
    
    .form-label {
      color: #495057;
      font-weight: 600;
    }
    
    .form-control,
    .form-select {
      border-radius: 10px;
      border: 2px solid #e9ecef;
      transition: all 0.3s ease;
    }
    
    .form-control:focus,
    .form-select:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.15);
    }
    
    .btn {
      border-radius: 10px;
      font-weight: 600;
      padding: 0.6rem 1.5rem;
    }
    
    .btn-lg {
      padding: 0.8rem 2rem;
    }
    
    .alert {
      border-radius: 10px;
      border: none;
    }
    
    .alert-info {
      background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
      color: #0c5460;
    }
    
    .alert-warning {
      background: linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%);
      color: #856404;
    }
    
    .badge {
      border-radius: 8px;
    }
    
    textarea {
      resize: vertical;
      min-height: 100px;
    }
    
    .form-text {
      text-align: right;
      font-size: 0.875rem;
      color: #6c757d;
    }
    
    @media (max-width: 768px) {
      .container-fluid {
        padding: 1rem;
      }
      
      .card-body {
        padding: 1.5rem !important;
      }
      
      .btn {
        width: 100%;
        margin-bottom: 0.5rem;
      }
      
      .d-flex.justify-content-end {
        flex-direction: column;
      }
    }
  `]
})
export class ApplyLeaveComponent implements OnInit {
  applyLeaveForm!: FormGroup;
  leaveTypes: LeaveType[] = [];
  leaveBalances: LeaveBalance[] = [];
  loading = false;
  currentUser: any;
  minDate: string;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private leaveService: LeaveService,
    private userService: UserService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.currentUser = this.authService.currentUserValue;
    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.minDate = tomorrow.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadLeaveTypes();
    this.loadUserLeaveBalances();
  }

  initializeForm(): void {
    this.applyLeaveForm = this.formBuilder.group({
      leaveTypeId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reasonForLeave: ['', [Validators.required, Validators.maxLength(1000)]]
    },
      { validators: this.dateRangeValidator }
  );

    // Add custom validator for date range
    this.applyLeaveForm.addValidators(this.dateRangeValidator.bind(this));
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

  loadUserLeaveBalances(): void {
    if (this.currentUser?.userId) {
      this.userService.getUserById(this.currentUser.userId).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.leaveBalances = response.data.leaveBalances || [];
          }
        },
        error: (error) => {
          console.error('Error loading leave balances:', error);
          this.toastr.error('Failed to load leave balances');
        }
      });
    }
  }

  dateRangeValidator(control: AbstractControl): { [key: string]: any } | null {
  const group = control as FormGroup;
  const startDate = group.get('startDate')?.value;
  const endDate = group.get('endDate')?.value;

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return { pastDate: true };
    }

    if (end < start) {
      return { invalidDateRange: true };
    }
  }

  return null;
}


  get f() { return this.applyLeaveForm.controls; }

  getLeaveDays(): number {
    const startDate = this.f['startDate'].value;
    const endDate = this.f['endDate'].value;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const timeDiff = end.getTime() - start.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    }

    return 0;
  }

  getAvailableBalance(): number {
    const leaveTypeId = parseInt(this.f['leaveTypeId'].value);
    if (leaveTypeId) {
      const balance = this.leaveBalances.find(b => b.leaveTypeId === leaveTypeId);
      return balance?.balance || 0;
    }
    return 0;
  }

  onSubmit(): void {
    if (this.applyLeaveForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    // Check if sufficient balance
    const requestedDays = this.getLeaveDays();
    const availableBalance = this.getAvailableBalance();

    if (requestedDays > availableBalance) {
      this.toastr.error(
        `Insufficient leave balance. Available: ${availableBalance} days, Requested: ${requestedDays} days`,
        'Insufficient Balance'
      );
      return;
    }

    this.loading = true;
    const formValue = this.applyLeaveForm.value;

    this.leaveService.applyLeave(formValue).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success('Leave application submitted successfully!', 'Success');
          this.router.navigate(['/my-leaves']);
        } else {
          this.toastr.error(response.message || 'Failed to apply leave', 'Error');
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error applying leave:', error);
        this.toastr.error(error.error?.message || 'Failed to apply leave', 'Error');
        this.loading = false;
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.applyLeaveForm.controls).forEach(key => {
      const control = this.applyLeaveForm.get(key);
      control?.markAsTouched();
    });
  }
}