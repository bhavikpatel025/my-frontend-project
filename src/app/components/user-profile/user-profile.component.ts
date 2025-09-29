import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models';
import { ToastrService } from 'ngx-toastr';
import { ProfilePictureComponent } from '../profile-picture/profile-picture.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProfilePictureComponent, RouterModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card shadow">
            <div class="card-header bg-secondary text-white">
              <h4 class="card-title mb-0">
                <i class="bi bi-person-circle me-2"></i>My Profile
              </h4>
            </div>
            
            <div class="card-body">
              <div *ngIf="loading" class="text-center py-5">
                <div class="spinner-border text-primary"></div>
                <p class="mt-2 text-muted">Loading profile...</p>
              </div>

              <div *ngIf="!loading && user" class="row">
                <!-- Profile Picture Section -->
                <div class="col-md-4 text-center mb-4">
                  <div class="profile-section">
                    <app-profile-picture
                      class="xl"
                      [userId]="user.id"
                      [firstName]="user.firstName"
                      [lastName]="user.lastName"
                      [editable]="true"
                      [showInfo]="true"
                      size="xl"
                      (pictureUpdated)="onProfilePictureUpdated($event)">
                    </app-profile-picture>
                    
                    <h5 class="mt-3 mb-1">{{ user.fullName }}</h5>
                    <p class="text-muted">{{ user.designation }}</p>
                    <span class="badge bg-info">{{ user.role }}</span>
                  </div>
                </div>

                <!-- Profile Information Section -->
                <div class="col-md-8">
                  <div class="profile-info">
                    <h6 class="section-title">
                      <i class="bi bi-info-circle me-2"></i>Personal Information
                    </h6>
                    
                    <div class="row mb-3">
                      <div class="col-sm-4 fw-bold">Full Name:</div>
                      <div class="col-sm-8">{{ user.fullName }}</div>
                    </div>
                    
                    <div class="row mb-3">
                      <div class="col-sm-4 fw-bold">Email:</div>
                      <div class="col-sm-8">{{ user.emailAddress }}</div>
                    </div>
                    
                    <div class="row mb-3">
                      <div class="col-sm-4 fw-bold">Contact:</div>
                      <div class="col-sm-8">{{ user.contactNo }}</div>
                    </div>
                    
                    <div class="row mb-3">
                      <div class="col-sm-4 fw-bold">Department:</div>
                      <div class="col-sm-8">{{ user.department }}</div>
                    </div>
                    
                    <div class="row mb-4">
                      <div class="col-sm-4 fw-bold">Designation:</div>
                      <div class="col-sm-8">{{ user.designation }}</div>
                    </div>

                    <!-- Leave Balances Section -->
                    <h6 class="section-title">
                      <i class="bi bi-calendar-check me-2"></i>Leave Balances
                    </h6>
                    
                    <div class="row">
                      <div class="col-12">
                        <div *ngIf="user.leaveBalances.length === 0" class="alert alert-info">
                          No leave balances configured
                        </div>
                        
                        <div *ngFor="let balance of user.leaveBalances" class="leave-balance-item">
                          <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="fw-semibold">{{ balance.leaveTypeName }}</span>
                            <span class="badge bg-success fs-6">{{ balance.balance }} days</span>
                          </div>
                          <div class="progress mb-3" style="height: 8px;">
                            <div class="progress-bar bg-success" 
                                 [style.width.%]="getBalancePercentage(balance.balance)"
                                 [title]="balance.balance + ' days available'">
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div *ngIf="!loading && user" class="row mt-4">
                <div class="col-12">
                  <div class="card bg-light">
                    <div class="card-body">
                      <h6 class="card-title">
                        <i class="bi bi-lightning me-2"></i>Quick Actions
                      </h6>
                      <div class="d-flex gap-2 flex-wrap">
                        <button class="btn btn-outline-secondary btn-sm" routerLink="/apply-leave" *ngIf="!authService.isAdmin">
                          <i class="bi bi-plus-circle me-1"></i>Apply Leave
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" routerLink="/my-leaves" *ngIf="!authService.isAdmin">
                          <i class="bi bi-list-ul me-1"></i>My Leaves
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" routerLink="/manage-leaves" *ngIf="authService.isAdmin">
                          <i class="bi bi-list-check me-1"></i>Manage Leaves
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" routerLink="/manage-employees" *ngIf="authService.isAdmin">
                          <i class="bi bi-people me-1"></i>Manage Employees
                        </button>
                      </div>
                    </div>
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
    .profile-section {
      padding: 2rem 1rem;
    }
    .section-title {
      color: #495057;
      border-bottom: 2px solid #e9ecef;
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .profile-info .row {
      margin-bottom: 0.5rem;
    }
    
    .leave-balance-item {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      border-left: 4px solid #28a745;
    }
    
    .progress {
      background-color: #e9ecef;
      border-radius: 4px;
    }
    
    .badge.fs-6 {
      font-size: 0.875rem !important;
      padding: 0.4rem 0.8rem;
    }
    
    @media (max-width: 768px) {
      .profile-section {
        padding: 1rem 0.5rem;
      }
      
      .d-flex.gap-2 {
        flex-direction: column;
      }
      
      .d-flex.gap-2 .btn {
        width: 100%;
      }
    }
  `]
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  loading = true;

  constructor(
    public authService: AuthService,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.toastr.error('User not authenticated');
      return;
    }

    this.loading = true;
    this.userService.getUserById(currentUser.userId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.user = response.data;
        } else {
          this.toastr.error('Failed to load profile');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.toastr.error('Failed to load profile');
        this.loading = false;
      }
    });
  }

  onProfilePictureUpdated(newPictureUrl: string): void {
    if (this.user) {
      this.user.profilePictureUrl = newPictureUrl;
    }
  }

  getBalancePercentage(balance: number): number {
    const maxBalance = 30; // Assuming 30 days as maximum
    return Math.min((balance / maxBalance) * 100, 100);
  }
}