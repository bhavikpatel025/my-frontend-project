import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <i class="bi bi-calendar-check display-4 text-primary"></i>
          </div>
          <h2 class="login-title">Leave Management System</h2>
          <p class="login-subtitle">Sign in to your account</p>
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="email" class="form-label">
              <i class="bi bi-envelope me-2"></i>Email Address
            </label>
            <input 
              type="email" 
              class="form-control" 
              id="email" 
              formControlName="email"
              [class.is-invalid]="f['email'].invalid && f['email'].touched"
              placeholder="Enter your email address">
            <div class="invalid-feedback" *ngIf="f['email'].invalid && f['email'].touched">
              <div *ngIf="f['email'].errors?.['required']">Email is required</div>
              <div *ngIf="f['email'].errors?.['email']">Please enter a valid email address</div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="password" class="form-label">
              <i class="bi bi-lock me-2"></i>Password
            </label>
            <div class="password-input-group">
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                class="form-control" 
                id="password" 
                formControlName="password"
                [class.is-invalid]="f['password'].invalid && f['password'].touched"
                placeholder="Enter your password">
              <button 
                type="button" 
                class="password-toggle-btn" 
                (click)="togglePassword()"
                tabindex="-1">
                <i class="bi" [class.bi-eye]="!showPassword" [class.bi-eye-slash]="showPassword"></i>
              </button>
            </div>
            <div class="invalid-feedback" *ngIf="f['password'].invalid && f['password'].touched">
              <div *ngIf="f['password'].errors?.['required']">Password is required</div>
            </div>
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary login-btn" 
            [disabled]="loading || loginForm.invalid">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i *ngIf="!loading" class="bi bi-box-arrow-in-right me-2"></i>
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
        
        <!-- <div class="login-footer">
          <div class="demo-credentials">
            <h6>Demo Credentials:</h6>
            <div class="credential-item">
              <strong>Admin:</strong> admin&#64;company.com / admin123

            </div>
          </div>
        </div> -->
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }
    
    .login-card {
      background: white;
      border-radius: 20px;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      animation: slideUp 0.6s ease-out;
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .logo {
      margin-bottom: 1rem;
    }
    
    .login-title {
      color: #333;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }
    
    .login-subtitle {
      color: #6c757d;
      margin-bottom: 0;
    }
    
    .login-form {
      margin-bottom: 1.5rem;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    .form-label {
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.5rem;
    }
    
    .password-input-group {
      position: relative;
    }
    
    .password-toggle-btn {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #6c757d;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .password-toggle-btn:hover {
      color: #495057;
    }
    
    .login-btn {
      width: 100%;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      border-radius: 10px;
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      border: none;
      transition: all 0.3s ease;
    }
    
    .login-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0,123,255,0.3);
    }
    
    .login-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .login-footer {
      text-align: center;
      padding-top: 1.5rem;
      border-top: 1px solid #e9ecef;
    }
    
    .demo-credentials {
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 10px;
      text-align: left;
    }
    
    .demo-credentials h6 {
      margin-bottom: 0.5rem;
      color: #495057;
    }
    
    .credential-item {
      font-size: 0.875rem;
      color: #6c757d;
    }
    
    @media (max-width: 480px) {
      .login-card {
        padding: 2rem 1.5rem;
        margin: 0.5rem;
      }
      
      .login-title {
        font-size: 1.5rem;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  returnUrl!: string;
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    // Redirect to dashboard if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Get return url from route parameters or default to '/dashboard'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  // Convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.authService.login(this.loginForm.value)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.toastr.success(`Welcome back, ${response.data.firstName}!`, 'Login Successful');
            this.router.navigate([this.returnUrl]);
          } else {
            this.toastr.error(response.message || 'Login failed', 'Error');
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          this.toastr.error(error.error?.message || 'Login failed. Please try again.', 'Error');
          this.loading = false;
        }
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}