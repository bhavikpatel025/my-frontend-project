import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile-picture',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-picture-wrapper" [class]="'size-' + size">
      <div class="profile-picture-container" 
           [class.editable]="editable && !uploading"
           [class.uploading]="uploading"
           (click)="onContainerClick()">
        
        <!-- Profile Image or Default Avatar -->
        <div class="profile-picture">
          <img 
            *ngIf="profileImageUrl && !uploading" 
            [src]="profileImageUrl" 
            [alt]="getAltText()"
            class="profile-image"
            (error)="onImageError()"
            (load)="onImageLoad()">
          
          <div *ngIf="!profileImageUrl || uploading" 
               class="default-avatar"
               [style.background]="getBackgroundColor()">
            <div *ngIf="!uploading" class="initials">
              {{ getInitials() }}
            </div>
            <div *ngIf="uploading" class="spinner">
              <div class="spinner-border text-white" [class]="getSpinnerSize()"></div>
            </div>
          </div>
        </div>

        <!-- Edit Overlay -->
        <div *ngIf="editable && !uploading" class="edit-overlay">
          <div class="edit-buttons">
            <div class="btn btn-primary btn-sm edit-btn" title="Upload Photo" (click)="triggerFileInput()">
              <i class="bi bi-camera-fill"></i>
            </div>
            <div *ngIf="profileImageUrl" 
                 class="btn btn-danger btn-sm edit-btn ms-1" 
                 (click)="onDeleteClick($event)"
                 title="Delete Photo">
              <i class="bi bi-trash-fill"></i>
            </div>
          </div>
        </div>

        <!-- Upload Progress -->
        <div *ngIf="uploading" class="upload-progress">
          <div class="progress-text">Uploading...</div>
        </div>
      </div>

      <!-- Hidden File Input -->
      <input #fileInput
             type="file"
             class="d-none"
             accept="image/jpeg,image/jpg,image/png,image/gif"
             (change)="onFileSelected($event)">

      <!-- Error Message -->
      <div *ngIf="errorMessage" class="error-message mt-2">
        <div class="alert alert-danger alert-sm">
          <small>{{ errorMessage }}</small>
          <button type="button" class="btn-close btn-sm" (click)="clearError()"></button>
        </div>
      </div>

      <!-- Info Text -->
      <div *ngIf="showInfo && !uploading" class="info-text mt-2">
        <small class="text-muted">
          <i class="bi bi-info-circle me-1"></i>
          Click to upload. Max 5MB. JPG, PNG, GIF supported.
        </small>
      </div>
    </div>
  `,
  styles: [`
    /* Container Styles */
    .profile-picture-wrapper {
      display: inline-block;
      text-align: center;
    }

    .profile-picture-container {
      position: relative;
      display: inline-block;
      border-radius: 50%;
      overflow: hidden;
      transition: all 0.3s ease;
      border: 3px solid #dee2e6;
      background: #f8f9fa;
    }

    .profile-picture-container.editable {
      cursor: pointer;
      border-color: #007bff;
    }

    .profile-picture-container.editable:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 15px rgba(0,123,255,0.3);
      border-color: #0056b3;
    }

    .profile-picture-container.uploading {
      opacity: 0.8;
      cursor: wait;
    }

    .profile-picture {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      overflow: hidden;
    }

    /* Image Styles */
    .profile-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      border-radius: 50%;
    }

    /* Default Avatar */
    .default-avatar {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .initials {
      color: white;
      font-weight: 700;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }

    .spinner {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Edit Overlay */
    .edit-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      border-radius: 50%;
    }

    .profile-picture-container.editable:hover .edit-overlay {
      opacity: 1;
    }

    .edit-buttons {
      display: flex;
      gap: 4px;
    }

    .edit-btn {
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      font-size: 0.8rem;
    }

    /* Upload Progress */
    .upload-progress {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-weight: 600;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    }

    .progress-text {
      font-size: 0.75rem;
      margin-top: 4px;
    }

    /* Error Message */
    .error-message .alert {
      margin-bottom: 0;
      padding: 0.5rem;
      position: relative;
    }

    .error-message .btn-close {
      position: absolute;
      top: 0.25rem;
      right: 0.25rem;
      padding: 0.25rem;
    }

    /* Info Text */
    .info-text {
      max-width: 200px;
      margin: 0 auto;
    }

    /* Size Variants */
    .size-xs {
      --size: 32px;
      --font-size: 0.7rem;
      --spinner-size: spinner-border-sm;
    }

    .size-sm {
      --size: 48px;
      --font-size: 0.9rem;
      --spinner-size: spinner-border-sm;
    }

    .size-md {
      --size: 64px;
      --font-size: 1.1rem;
      --spinner-size: '';
    }

    .size-lg {
      --size: 96px;
      --font-size: 1.8rem;
      --spinner-size: '';
    }

    .size-xl {
      --size: 128px;
      --font-size: 2.5rem;
      --spinner-size: '';
    }

    .profile-picture-container {
      width: var(--size);
      height: var(--size);
    }

    .initials {
      font-size: var(--font-size);
    }

    /* Responsive */
    @media (max-width: 576px) {
      .size-xl {
        --size: 96px;
        --font-size: 2rem;
      }
      
      .size-lg {
        --size: 80px;
        --font-size: 1.5rem;
      }
    }
  `]
})
export class ProfilePictureComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  @Input() userId: number = 0;
  @Input() firstName: string = '';
  @Input() lastName: string = '';
  @Input() currentProfilePictureUrl: string = '';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() editable: boolean = false;
  @Input() showInfo: boolean = false;
  @Output() pictureUpdated = new EventEmitter<string>();
  @Output() uploadStarted = new EventEmitter<void>();
  @Output() uploadCompleted = new EventEmitter<boolean>();
    @Output() profilePictureUpdated = new EventEmitter<string>();


  profileImageUrl: string = '';
  uploading: boolean = false;
  errorMessage: string = '';

  constructor(
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.profileImageUrl = this.currentProfilePictureUrl;
    this.loadProfilePicture();
  }

  private loadProfilePicture(): void {
    if (!this.userId) return;

    this.userService.getProfilePicture(this.userId).subscribe({
      next: (response) => {
        if (response.success && response.data?.profilePictureUrl) {
          this.profileImageUrl = this.buildImageUrl(response.data.profilePictureUrl);
        }
      },
      error: (error) => {
        console.warn('Could not load profile picture:', error);
      }
    });
  }

  onContainerClick(): void {
    if (!this.editable || this.uploading) return;
    
    this.triggerFileInput();
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation();
    
    if (!confirm('Remove profile picture?')) return;

    this.deleteProfilePicture();
  }

  triggerFileInput(): void {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    
    if (!file) return;

    this.clearError();
    
    if (this.validateFile(file)) {
      this.uploadFile(file);
    }
  }

  private validateFile(file: File): boolean {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];

    if (file.size > maxSize) {
      this.showError('File must be smaller than 5MB');
      return false;
    }

    const extension = file.name.toLowerCase().split('.').pop() || '';
    if (!allowedTypes.includes(`image/${extension}`) && !allowedTypes.includes(extension)) {
      this.showError('Only JPG, PNG and GIF files are allowed');
      return false;
    }

    if (!allowedMimes.includes(file.type.toLowerCase())) {
      this.showError('Invalid file type');
      return false;
    }

    return true;
  }

  private uploadFile(file: File): void {
    this.uploading = true;
    this.uploadStarted.emit();

    this.userService.uploadProfilePicture(this.userId, file).subscribe({
      next: (response) => {
        if (response.success && response.data?.profilePictureUrl) {
          this.profileImageUrl = this.buildImageUrl(response.data.profilePictureUrl);
          this.pictureUpdated.emit(this.profileImageUrl);
          this.toastr.success('Profile picture updated successfully!');
          this.uploadCompleted.emit(true);
        } else {
          this.showError('Upload failed - invalid response');
          this.uploadCompleted.emit(false);
        }
        this.uploading = false;
      },
      error: (error) => {
        const message = error.error?.message || 'Upload failed';
        this.showError(message);
        this.toastr.error(message);
        this.uploading = false;
        this.uploadCompleted.emit(false);
      }
    });
  }

  private deleteProfilePicture(): void {
    this.uploading = true;

    this.userService.deleteProfilePicture(this.userId).subscribe({
      next: (response) => {
        if (response.success) {
          this.profileImageUrl = '';
          this.pictureUpdated.emit('');
          this.toastr.success('Profile picture removed successfully!');
        } else {
          this.showError('Failed to remove profile picture');
        }
        this.uploading = false;
      },
      error: (error) => {
        const message = error.error?.message || 'Failed to remove profile picture';
        this.showError(message);
        this.toastr.error(message);
        this.uploading = false;
      }
    });
  }

  private buildImageUrl(url: string): string {
    if (!url) return '';
    
    if (url.startsWith('http') || url.startsWith('data:')) {
      return url;
    }
    
    return `https://localhost:7084${url}`;
  }

  onImageError(): void {
    this.profileImageUrl = '';
  }

  onImageLoad(): void {
    // Image loaded successfully
  }

  getInitials(): string {
    const first = this.firstName?.charAt(0)?.toUpperCase() || '';
    const last = this.lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || 'U';
  }

  getAltText(): string {
    return `${this.firstName} ${this.lastName}`.trim() || 'Profile Picture';
  }

  getBackgroundColor(): string {
    const colors = [
      '#e74c3c', '#9b59b6', '#3498db', '#1abc9c', '#f39c12',
      '#2ecc71', '#e67e22', '#34495e', '#16a085', '#27ae60',
      '#2980b9', '#8e44ad', '#c0392b', '#d35400', '#7f8c8d'
    ];

    const initials = this.getInitials();
    let hash = 0;
    for (let i = 0; i < initials.length; i++) {
      hash = initials.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  getSpinnerSize(): string {
    return this.size === 'xs' || this.size === 'sm' ? 'spinner-border-sm' : '';
  }

  private showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.clearError(), 5000);
  }

  clearError(): void {
    this.errorMessage = '';
  }
}