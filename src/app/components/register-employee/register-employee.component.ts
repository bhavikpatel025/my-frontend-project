import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { LeaveService } from '../../services/leave.service';
import { LeaveType } from '../../models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <div class="card shadow">
            <div class="card-header bg-secondary text-white">
              <h4 class="card-title mb-0">
                <i class="bi bi-person-plus me-2"></i>Register New Employee
              </h4>
            </div>
            <div class="card-body p-4">
              <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                
                <!-- Personal Information Section -->
                <div class="section-header">
                  <h5 class="text-primary mb-3">Personal Information</h5>
                </div>
                <div class="row mb-4">
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">First Name *</label>
                    <input type="text" class="form-control" formControlName="firstName" 
                           [class.is-invalid]="f['firstName'].invalid && f['firstName'].touched">
                    <div class="invalid-feedback" *ngIf="f['firstName'].invalid && f['firstName'].touched">
                      First name is required
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Last Name *</label>
                    <input type="text" class="form-control" formControlName="lastName"
                           [class.is-invalid]="f['lastName'].invalid && f['lastName'].touched">
                    <div class="invalid-feedback" *ngIf="f['lastName'].invalid && f['lastName'].touched">
                      Last name is required
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Email Address *</label>
                    <input type="email" class="form-control" formControlName="emailAddress"
                           [class.is-invalid]="f['emailAddress'].invalid && f['emailAddress'].touched">
                    <div class="invalid-feedback" *ngIf="f['emailAddress'].invalid && f['emailAddress'].touched">
                      Valid email is required
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Contact Number *</label>
                    <input type="tel" class="form-control" formControlName="contactNo"
                           [class.is-invalid]="f['contactNo'].invalid && f['contactNo'].touched">
                    <div class="invalid-feedback" *ngIf="f['contactNo'].invalid && f['contactNo'].touched">
                      Valid 10-digit contact number is required
                    </div>
                  </div>
                </div>

                <!-- Professional Information Section -->
                <div class="section-header">
                  <h5 class="text-primary mb-3">Professional Information</h5>
                </div>
                <div class="row mb-4">
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Department *</label>
                    <input type="text" class="form-control" formControlName="department"
                           [class.is-invalid]="f['department'].invalid && f['department'].touched">
                    <div class="invalid-feedback" *ngIf="f['department'].invalid && f['department'].touched">
                      Department is required
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Designation *</label>
                    <input type="text" class="form-control" formControlName="designation"
                           [class.is-invalid]="f['designation'].invalid && f['designation'].touched">
                    <div class="invalid-feedback" *ngIf="f['designation'].invalid && f['designation'].touched">
                      Designation is required
                    </div>
                  </div>
                </div>

                <!-- Account Information Section -->
                <div class="section-header">
                  <h5 class="text-primary mb-3">Account Information</h5>
                </div>
                <div class="row mb-4">
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Password *</label>
                    <input type="password" class="form-control" formControlName="password"
                           [class.is-invalid]="f['password'].invalid && f['password'].touched">
                    <div class="invalid-feedback" *ngIf="f['password'].invalid && f['password'].touched">
                      Password must be at least 6 characters
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Confirm Password *</label>
                    <input type="password" class="form-control" formControlName="confirmPassword"
                           [class.is-invalid]="registerForm.hasError('passwordMismatch')">
                    <div class="invalid-feedback" *ngIf="registerForm.hasError('passwordMismatch')">
                      Passwords do not match
                    </div>
                  </div>
                </div>

                <!-- Leave Balances Section -->
                <div class="section-header">
                  <h5 class="text-primary mb-3">Leave Balances</h5>
                </div>
                <div class="row mb-4" formArrayName="leaveBalances">
                  <div *ngFor="let balance of leaveBalancesArray.controls; let i = index" 
                       class="col-md-4 mb-3" [formGroupName]="i">
                    <div class="card border-primary">
                      <div class="card-body">
                        <h6 class="card-title">{{ leaveTypes[i].type }}</h6>
                        <p class="card-text small text-muted">{{ leaveTypes[i].description }}</p>
                        <label class="form-label small fw-bold">Balance (Days)</label>
                        <input type="number" class="form-control form-control-sm" 
                               formControlName="balance" min="0" max="365">
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Submit Buttons -->
                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-secondary" routerLink="/manage-employees" [disabled]="loading">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-success" [disabled]="loading || registerForm.invalid">
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'Registering...' : 'Register Employee' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
  
    .section-header { border-bottom: 2px solid #e9ecef; margin-bottom: 1rem; padding-bottom: 0.5rem; }
    .card { border-radius: 15px; }
  `]
})
export class RegisterEmployeeComponent implements OnInit {
  registerForm!: FormGroup;
  leaveTypes: LeaveType[] = [];
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private leaveService: LeaveService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadLeaveTypes();
  }

  initializeForm(): void {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      emailAddress: ['', [Validators.required, Validators.email]],
      department: ['', [Validators.required, Validators.maxLength(100)]],
      designation: ['', [Validators.required, Validators.maxLength(100)]],
      contactNo: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      leaveBalances: this.formBuilder.array([])
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value ? { passwordMismatch: true } : null;
  }

  loadLeaveTypes(): void {
    this.leaveService.getLeaveTypes().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.leaveTypes = response.data;
          this.initializeLeaveBalances();
        }
      }
    });
  }

  initializeLeaveBalances(): void {
    const leaveBalancesArray = this.registerForm.get('leaveBalances') as FormArray;
    leaveBalancesArray.clear();
    
    this.leaveTypes.forEach(leaveType => {
      leaveBalancesArray.push(this.formBuilder.group({
        leaveTypeId: [leaveType.id],
        leaveTypeName: [leaveType.type],
        balance: [0, [Validators.required, Validators.min(0), Validators.max(365)]]
      }));
    });
  }

  get f() { return this.registerForm.controls; }
  get leaveBalancesArray() { return this.registerForm.get('leaveBalances') as FormArray; }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    const formValue = { ...this.registerForm.value };
    delete formValue.confirmPassword;
    
    formValue.leaveBalances = formValue.leaveBalances.map((balance: any) => ({
      leaveTypeId: balance.leaveTypeId,
      balance: parseInt(balance.balance),
      leaveTypeName: balance.leaveTypeName
    }));

    this.userService.registerUser(formValue).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success('Employee registered successfully!');
          this.router.navigate(['/manage-employees']);
        } else {
          this.toastr.error(response.message || 'Registration failed');
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.loading = false;
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
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
