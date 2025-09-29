import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Add footer component

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer mt-auto">
      <div class="container py-5">
        <div class="row">
          <!-- Brand -->
          <div class="col-md-4 mb-4">
            <h5 class="text-uppercase fw-bold mb-2">
              <i class="bi bi-calendar-check me-1"></i> Leave Management
            </h5>
            <p class="text-muted small">
              A modern leave & attendance platform for employees and HR.
            </p>
          </div>

          <!-- Quick Links -->
          <div class="col-md-4 mb-4">
            <h6 class="text-uppercase fw-bold mb-2">Quick Links</h6>
            <ul class="list-unstyled small">
              <li><a routerLink="/dashboard" class="footer-link">Dashboard</a></li>
              <li><a routerLink="/apply-leave" class="footer-link">Apply Leave</a></li>
              <li><a routerLink="/my-leaves" class="footer-link">My Leaves</a></li>
              <li><a routerLink="/profile" class="footer-link">My Profile</a></li>
            </ul>
          </div>

          <!-- Contact -->
          <div class="col-md-4 mb-4">
            <h6 class="text-uppercase fw-bold mb-2">Contact</h6>
            <p class="text-muted small mb-1">
              <i class="bi bi-envelope me-1"></i>
              <a href="mailto:pb3721700@gmail.com" class="footer-link">{{'pb3721700@gmail.com'}}</a>
            </p>
            <p class="text-muted small mb-1">
              <i class="bi bi-telephone me-1"></i> +91 9327199315
            </p>
            <p class="text-muted small">
              <i class="bi bi-geo-alt me-1"></i> Ahmedabad, Gujarat, India
            </p>
          </div>
        </div>

        <hr class="my-4">

        <div class="d-flex flex-column flex-md-row justify-content-between align-items-center small text-muted">
          <div>© {{ currentYear }} Leave Management. All rights reserved.</div>
          <div class="mt-2 mt-md-0 footer-social">
            <a href="#" class="footer-link me-2"><i class="bi bi-facebook"></i></a>
            <a href="#" class="footer-link me-2"><i class="bi bi-twitter"></i></a>
             <a href="https://www.linkedin.com/in/bhavik-patel-217a402a5?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"class="social-link linkedin"
     target="_blank"
     rel="noopener"
     class="footer-link me-2">
    <i class="bi bi-linkedin"></i>
  </a>          
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: #1a2946ff;
      color: #fff;
    }
    .footer h5, .footer h6 {
      color: #ffffff;
    }
    .footer-link {
      color: #adb5bd;
      text-decoration: none;
    }
    .footer-link:hover {
      color: #ffffff;
      text-decoration: underline;
    }
    hr {
      border-color: rgba(255,255,255,0.1);
    }
    .text-muted {
      color: #adb5bd !important;
    }
    @media (max-width: 768px) {
      .footer {
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
