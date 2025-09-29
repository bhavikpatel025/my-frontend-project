// All interface models for the Leave Management System

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  emailAddress: string;
  department: string;
  designation: string;
  contactNo: string;
  role: string;
  leaveBalances: LeaveBalance[];
  profilePictureUrl?: string;
}

export interface LeaveBalance {
  leaveTypeId: number;
  balance: number;
  leaveTypeName: string;
}

export interface LeaveType {
  id: number;
  type: string;
  description: string;
  validFrom: string;
  validTo: string;
}

export interface Leave {
  id: number;
  userId: number;
  userName: string;
  leaveTypeId: number;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  dateOfRequest: string;
  reasonForLeave: string;
  status: LeaveStatus;
  leaveDays: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  token: string;
  profilePicture?: string;
}

export interface RegisterUserRequest {
  firstName: string;
  lastName: string;
  emailAddress: string;
  department: string;
  designation: string;
  contactNo: string;
  password: string;
  leaveBalances: LeaveBalance[];
}

export interface ApplyLeaveRequest {
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reasonForLeave: string;
}

export interface UpdateLeaveStatusRequest {
  leaveId: number;
  status: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface DashboardStats {
  totalEmployees: number;
  pendingLeaves: number;
  approvedLeaves: number;
  rejectedLeaves: number;
}

//Edit User Request

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  emailAddress: string;
  department: string;
  designation: string;
  contactNo: string;
  leaveBalances: LeaveBalance[];
}

//Pagination interface
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationInfo;
  message?: string;
}

//Profile picture
export interface ProfilePicture {
  profilePictureUrl: string;
  defaultAvatarUrl: string;
}