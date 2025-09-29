import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './services/auth.service';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent,FooterComponent],
  template: `
    <div class="app-container">
      <app-navbar></app-navbar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
        <app-footer *ngIf="authService.isAuthenticated"></app-footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .main-content {
      flex: 1;
      background-color: #f8f9fa;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'Leave Management System';

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    // Check if user session is still valid on app startup
    if (this.authService.isAuthenticated && this.authService.isTokenExpired()) {
      this.authService.logout();
    }
  }
}