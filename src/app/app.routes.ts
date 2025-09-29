import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

// Lazy load components for better performance
export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'apply-leave', 
    loadComponent: () => import('./components/apply-leave/apply-leave.component').then(m => m.ApplyLeaveComponent),
    canActivate: [AuthGuard],
    data: { expectedRoles: ['Employee'] }
  },
  { 
    path: 'my-leaves', 
    loadComponent: () => import('./components/my-leaves/my-leaves.component').then(m => m.MyLeavesComponent),
    canActivate: [AuthGuard],
    data: { expectedRoles: ['Employee'] }
  },
  { 
    path: 'register-employee', 
    loadComponent: () => import('./components/register-employee/register-employee.component').then(m => m.RegisterEmployeeComponent),
    canActivate: [AuthGuard],
    data: { expectedRoles: ['Admin'] }
  },
  { 
    path: 'manage-employees', 
    loadComponent: () => import('./components/manage-employees/manage-employees.component').then(m => m.ManageEmployeesComponent),
    canActivate: [AuthGuard],
    data: { expectedRoles: ['Admin'] }
  },
  { 
    path: 'manage-leaves', 
    loadComponent: () => import('./components/manage-leaves/manage-leaves.component').then(m => m.ManageLeavesComponent),
    canActivate: [AuthGuard],
    data: { expectedRoles: ['Admin'] }
  },
  { 
  path: 'edit-employee/:id', 
  loadComponent: () => import('./components/edit/edit.component').then(m => m.EditEmployeeComponent),
  canActivate: [AuthGuard],
  data: { expectedRoles: ['Admin'] }
},
{
  path: 'profile',
  loadComponent: () => import('./components/user-profile/user-profile.component').then(m => m.UserProfileComponent),
  canActivate: [AuthGuard]
},
  { 
    path: '**', 
    redirectTo: '/dashboard' 
  }
];