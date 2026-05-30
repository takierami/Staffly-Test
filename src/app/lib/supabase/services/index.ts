// Re-export all services for convenient imports
export { employeeService, type EmployeeWithDetails, type EmployeeInsert, type EmployeeUpdate } from '../employeeService';
export { leaveService, type LeaveRequestWithDetails, type LeaveRequestInsert, type LeaveRequestUpdate } from '../leaveService';
export { attendanceService, type AttendanceRecordWithDetails, type AttendanceRecordInsert, type AttendanceRecordUpdate } from '../attendanceService';
export { recruitmentService, type JobPostingWithDetails, type CandidateWithDetails, type JobPostingInsert, type CandidateInsert } from '../recruitmentService';
export { performanceService, type PerformanceReviewWithDetails, type PerformanceGoalWithDetails, type PerformanceReviewInsert, type PerformanceGoalInsert } from '../performanceService';
export { documentService, type DocumentTemplateWithDetails, type DocumentWithDetails, type DocumentTemplateInsert, type DocumentInsert } from '../documentService';
export { trainingService, type TrainingProgramWithDetails, type TrainingEnrollmentWithDetails, type TrainingProgramInsert, type TrainingEnrollmentInsert } from '../trainingService';
export { notificationService, type NotificationInsert, type NotificationUpdate } from '../notificationService';
export { payrollService, type PayrollRecordWithDetails, type PayrollRecordInsert, type PayrollEarningInsert, type PayrollDeductionInsert } from '../payrollService';
export { departmentService, positionService, gradeService, employeeCategoryService, type DepartmentWithDetails, type PositionWithDetails, type DepartmentInsert, type PositionInsert, type GradeInsert } from '../departmentService';
export { promotionService, type PromotionRecordWithDetails, type PromotionRuleInsert, type PromotionRecordInsert } from '../promotionService';
export { auditService, systemSettingService, sessionService, type AuditLogInsert, type AuditLogWithDetails, type SystemSettingInsert } from '../auditService';

// Import types from migrations
export type {
  Database,
  Tables,
  Organization,
  Profile,
  Employee,
  Department,
  Position,
  Grade,
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  AttendanceRecord,
  PayrollRecord,
  PerformanceReview,
  PerformanceGoal,
  JobPosting,
  Candidate,
  TrainingProgram,
  TrainingEnrollment,
  DocumentTemplate,
  Document,
  Notification,
  AuditLog,
  SystemSetting
} from '../db';
