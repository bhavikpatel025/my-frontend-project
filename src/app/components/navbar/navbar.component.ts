import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ProfilePictureComponent } from '../profile-picture/profile-picture.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ProfilePictureComponent],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark sticky-top custom-navbar" *ngIf="authService.isAuthenticated">

      <div class="container-fluid">

        <!-- Brand -->
        <a class="navbar-brand" routerLink="/dashboard">
          <i class="bi bi-calendar-check me-2"></i>Leave Management
        </a>

        <!-- Toggler -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Navbar Links -->
        <div class="collapse navbar-collapse" id="navbarNav">

          <!-- Left-side Links -->
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
                <i class="bi bi-house me-1"></i>Dashboard
              </a>
            </li>

            <!-- Employee Menu -->
            <ng-container *ngIf="authService.isEmployee">
              <li class="nav-item">
                <a class="nav-link" routerLink="/apply-leave" routerLinkActive="active">
                  <i class="bi bi-plus-circle me-1"></i>Apply Leave
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/my-leaves" routerLinkActive="active">
                  <i class="bi bi-list-ul me-1"></i>My Leaves
                </a>
              </li>
            </ng-container>

            <!-- Admin Menu -->
            <ng-container *ngIf="authService.isAdmin">
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="employeeDropdown" role="button" data-bs-toggle="dropdown">
                  <i class="bi bi-people me-1"></i>Employees
                </a>
                <ul class="dropdown-menu" aria-labelledby="employeeDropdown">
                  <li>
                    <a class="dropdown-item" routerLink="/register-employee">
                      <i class="bi bi-person-plus me-2"></i>Register Employee
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" routerLink="/manage-employees">
                      <i class="bi bi-people me-2"></i>Manage Employees
                    </a>
                  </li>
                </ul>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/manage-leaves" routerLinkActive="active">
                  <i class="bi bi-list-check me-1"></i>Manage Leaves
                </a>
              </li>
            </ng-container>
          </ul>

          <!-- Right-side User Menu -->
          <ul class="navbar-nav ms-auto">
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">

                <!-- Profile Picture -->
                <div class="profile-container me-2">
                  <app-profile-picture 
                    [userId]="currentUser?.userId || 0"
                    [firstName]="currentUser?.firstName || ''"
                    [lastName]="currentUser?.lastName || ''"
                    [editable]="false"
                    (profilePictureUpdated)="authService.updateProfilePicture($event)"
                    size="sm">
                  </app-profile-picture>
                </div>

                <!-- Username & Role -->
                <div class="user-info">
                  <span class="user-name">{{ authService.getUserName() }}</span>
                  <span class="badge bg-secondary ms-1">{{ currentUser?.role }}</span>
                </div>
              </a>

              <ul class="dropdown-menu dropdown-menu-end">
                <li><h6 class="dropdown-header">Account</h6></li>
                <li>
                  <a class="dropdown-item" routerLink="/profile">
                    <i class="bi bi-person me-2"></i>My Profile
                  </a>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item text-danger" href="#" (click)="logout($event)">
                    <i class="bi bi-box-arrow-right me-2"></i>Logout
                  </a>
                </li>
              </ul>
            </li>
          </ul>

        </div>
      </div>
    </nav>
  `,
  styles: [`

    .navbar {
      background-color: #1a2946ff;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    /* Show dropdown menu on hover */
.navbar .dropdown:hover .dropdown-menu {
  display: block;
  margin-top: 0; /* optional: removes jump effect */
}

/* Optional: keep pointer style for parent link */
.navbar .dropdown-toggle::after {
  margin-left: .25rem;
}


    .navbar-brand {
      font-weight: 700;
      font-size: 1.4rem;
    }

    .nav-link {
      font-weight: 500;
      transition: all 0.3s ease;
      border-radius: 6px;
      margin: 0 2px;
    }

    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.1);
      transform: translateY(-1px);
    }

    .nav-link.active {
      background-color: rgba(255, 255, 255, 0.2);
    }

    /* Right-side profile & user info */
    .profile-container app-profile-picture {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.3);
    }

    .user-info {
      display: flex;
      flex-direction: column;
      line-height: 1;
    }

    .user-name {
      font-weight: 500;
    }

    .user-info .badge {
      font-size: 0.7rem;
      padding: 2px 6px;
    }

    .dropdown-menu {
      border-radius: 10px;
      border: none;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }

    .dropdown-item {
      border-radius: 6px;
      margin: 2px 6px;
      transition: all 0.2s ease;
    }

    .dropdown-item:hover {
      background-color: #f8f9fa;
      transform: translateX(2px);
    }

    @media (max-width: 991px) {
      .navbar-nav {
        margin-top: 1rem;
      }
      .nav-item {
        margin: 2px 0;
      }
    }


    /* Navbar brand text */
.custom-navbar .navbar-brand {
  color: #ffffff;
  font-weight: 700;
  font-size: 1.4rem;
}

/* Navbar links */
.custom-navbar .nav-link {
  color: #ffffff;
  font-weight: 500;
  transition: all 0.3s ease;
  border-radius: 6px;
  margin: 0 2px;
}

.custom-navbar .nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

/* Dropdown menu */
.custom-navbar .dropdown-menu {
   background-color: #ffffff; /* white background */
  border-radius: 8px;
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  min-width: 200px;
  padding: 0.5rem 0;
}

/* Dropdown items */
.custom-navbar .dropdown-item {
   color: #333333;
  font-weight: 500;
  padding: 8px 16px;
  transition: all 0.2s ease;
}

.custom-navbar .dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateX(2px);
}

/* Toggler (hamburger icon) */
.custom-navbar .navbar-toggler-icon {
  filter: invert(1); /* makes icon white */
}




  `]
})
export class NavbarComponent implements OnInit {
  currentUser: any;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onProfilePictureUpdated(newUrl: string) {
    if (this.currentUser) {
      this.currentUser.profilePicture = newUrl;
    }
  }
}
