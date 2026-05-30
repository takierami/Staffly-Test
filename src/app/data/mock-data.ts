export interface Employee {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: "active" | "on-leave" | "probation" | "terminated";
  hireDate: string;
  salary: number;
  avatar?: string;
  reportsTo?: string;
  employmentType: "full-time" | "part-time" | "contract";
  category?: string;
  grade?: string;
  currentRank?: number;
  skills?: string[];
  organizationId?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: number;
  status: "present" | "absent" | "late" | "half-day";
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "annual" | "sick" | "unpaid" | "maternity";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  requestDate: string;
  organizationId?: string;
}

export interface LeaveAdjustmentProposal {
  id: string;
  leaveRequestId: string;
  proposedStartDate: string;
  proposedEndDate: string;
  reason: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: "draft" | "processed" | "paid";
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewPeriod: string;
  rating: number;
  status: "pending" | "in-progress" | "completed";
  reviewer: string;
  goals: { title: string; progress: number }[];
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "contract";
  status: "open" | "closed" | "draft";
  applicants: number;
  postedDate: string;
  description?: string;
  requirements?: string;
  skills?: string[];
  experienceRequired?: number;
  educationRequired?: string;
  atsData?: {
    requirementId?: string;
    totalMatches?: number;
    strongMatches?: number;
    potentialMatches?: number;
    lastMatchedAt?: string;
  };
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  jobId: string;
  jobTitle: string;
  stage: "applied" | "screening" | "interview" | "offer" | "hired" | "rejected";
  appliedDate: string;
  rating: number;
  scorecard?: { technical: number; culture: number; communication: number };
  aiSummary?: string[];
  notes?: { author: string; text: string; date: string }[];
  organizationId?: string;
  atsData?: {
    cvDocumentId?: string;
    parsedCVId?: string;
    matchScore?: number;
    matchRecommendation?: "strong_match" | "potential_match" | "needs_review" | "below_threshold";
    parsedSkills?: string[];
    totalYearsExperience?: number;
    educationLevel?: string;
    parsedAt?: string;
    lastUpdated?: string;
  };
}

export interface TrainingProgram {
  id: string;
  title: string;
  category: string;
  instructor: string;
  startDate: string;
  endDate: string;
  enrolled: number;
  capacity: number;
  status: "upcoming" | "in-progress" | "completed";
}

export interface Document {
  id: string;
  name: string;
  type: string;
  employeeName: string;
  generatedDate: string;
  status: "generated" | "pending" | "signed";
}

export interface PromotionRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  category: string;
  previousPosition: string;
  newPosition: string;
  previousGrade: string;
  newGrade: string;
  previousSalary: number;
  newSalary: number;
  promotionDate: string;
  type: "automatic" | "manual";
  reason: string;
  approvedBy: string;
  status: "pending" | "approved" | "effective";
}

export interface PromotionRule {
  id: string;
  category: string;
  fromGrade: string;
  toGrade: string;
  requiredYears: number;
  salaryIncreasePercent: number;
  isActive: boolean;
}

export const employees: Employee[] = [
  { id: "EMP001", code: "EMP001", firstName: "Karim", lastName: "Benali", email: "admin@staffly.dz", phone: "+213555000001", department: "Executive", position: "CEO", status: "active", hireDate: "2024-01-01", salary: 250000, employmentType: "full-time", category: "ceo", grade: "G10", currentRank: 1, organizationId: "ORG001", skills: ["Leadership", "Strategy"] },
  { id: "EMP002", code: "EMP002", firstName: "Amira", lastName: "Taleb", email: "hr@staffly.dz", phone: "+213555000002", department: "Human Resources", position: "HR Manager", status: "active", hireDate: "2024-01-15", salary: 180000, employmentType: "full-time", category: "hr_manager", grade: "G5", currentRank: 2, organizationId: "ORG001", skills: ["Recruitment", "Employee Relations", "Payroll"] },
  { id: "EMP003", code: "EMP003", firstName: "Youcef", lastName: "Mammeri", email: "employee@staffly.dz", phone: "+213555000003", department: "Engineering", position: "Software Engineer", status: "active", hireDate: "2024-02-01", salary: 120000, employmentType: "full-time", category: "dev_mid", grade: "G3", currentRank: 3, organizationId: "ORG001", skills: ["React", "TypeScript", "Node.js"] },
  { id: "EMP004", code: "EMP004", firstName: "Sara", lastName: "Belaid", email: "sara@staffly.dz", phone: "+213555000004", department: "Engineering", position: "Senior Software Engineer", status: "active", hireDate: "2023-05-10", salary: 150000, employmentType: "full-time", category: "dev_senior", grade: "G4", currentRank: 3, organizationId: "ORG001", skills: ["React", "TypeScript", "System Design", "Node.js"] },
  { id: "EMP005", code: "EMP005", firstName: "Tarik", lastName: "Ziani", email: "tarik@staffly.dz", phone: "+213555000005", department: "Engineering", position: "Software Engineer", status: "active", hireDate: "2024-03-01", salary: 110000, employmentType: "full-time", category: "dev_mid", grade: "G3", currentRank: 4, organizationId: "ORG001", skills: ["React", "JavaScript", "CSS"] },
];

export const attendanceRecords: AttendanceRecord[] = [];

export const leaveRequests: LeaveRequest[] = [];

export const leaveAdjustmentProposals: LeaveAdjustmentProposal[] = [];

export const payrollRecords: PayrollRecord[] = [];

export const performanceReviews: PerformanceReview[] = [];

export const jobPostings: JobPosting[] = [];

export const candidates: Candidate[] = [];

export const trainingPrograms: TrainingProgram[] = [];

export const documents: Document[] = [];

export const departments = ["Engineering", "HR", "Marketing", "Finance", "Operations", "Design", "Sales", "Product"];

export const recentActivities: { id: number; action: string; user: string; time: string; type: "leave" | "payroll" | "employee" | "performance" | "training" | "document" | "recruitment" | "attendance" }[] = [];

export const employeeCategories = [
  { id: "teacher_primary", name: "Primary School Teacher", nameAr: "أستاذ مدرسة ابتدائية", department: "Education" },
  { id: "teacher_middle", name: "Middle School Teacher", nameAr: "أستاذ متوسط", department: "Education" },
  { id: "teacher_secondary", name: "Secondary School Teacher", nameAr: "أستاذ ثانوي", department: "Education" },
  { id: "teacher_university", name: "University Lecturer", nameAr: "أستاذ جامعي", department: "Education" },
  { id: "professor", name: "University Professor", nameAr: "بروفيسور جامعي", department: "Education" },
  { id: "researcher", name: "Researcher", nameAr: "باحث", department: "Education" },
  { id: "lab_technician", name: "Lab Technician", nameAr: "تقني مخبر", department: "Education" },
  { id: "university_admin", name: "University Administrator", nameAr: "إداري جامعي", department: "Education" },
  { id: "librarian", name: "Librarian", nameAr: "أمين مكتبة", department: "Education" },
  { id: "hr_assistant", name: "HR Assistant", nameAr: "مساعد موارد بشرية", department: "HR" },
  { id: "hr_officer", name: "HR Officer", nameAr: "مسؤول موارد بشرية", department: "HR" },
  { id: "hr_manager", name: "HR Manager", nameAr: "مدير موارد بشرية", department: "HR" },
  { id: "hr_director", name: "HR Director", nameAr: "مدير عام الموارد البشرية", department: "HR" },
  { id: "accountant_junior", name: "Junior Accountant", nameAr: "محاسب مبتدئ", department: "Finance" },
  { id: "accountant_senior", name: "Senior Accountant", nameAr: "محاسب أول", department: "Finance" },
  { id: "financial_analyst", name: "Financial Analyst", nameAr: "محلل مالي", department: "Finance" },
  { id: "finance_manager", name: "Finance Manager", nameAr: "مدير مالي", department: "Finance" },
  { id: "auditor", name: "Auditor", nameAr: "مراجع حسابات", department: "Finance" },
  { id: "dev_junior", name: "Junior Developer", nameAr: "مطور مبتدئ", department: "Engineering" },
  { id: "dev_mid", name: "Mid-Level Developer", nameAr: "مطور متوسط", department: "Engineering" },
  { id: "dev_senior", name: "Senior Developer", nameAr: "مطور أول", department: "Engineering" },
  { id: "dev_lead", name: "Lead Developer", nameAr: "رئيس فريق التطوير", department: "Engineering" },
  { id: "dev_architect", name: "Software Architect", nameAr: "مهندس معماري برمجيات", department: "Engineering" },
  { id: "devops_engineer", name: "DevOps Engineer", nameAr: "مهندس DevOps", department: "Engineering" },
  { id: "qa_engineer", name: "QA Engineer", nameAr: "مهندس ضمان الجودة", department: "Engineering" },
  { id: "sysadmin", name: "System Administrator", nameAr: "مدي�� أنظمة", department: "Engineering" },
  { id: "network_engineer", name: "Network Engineer", nameAr: "مهندس شبكات", department: "Engineering" },
  { id: "data_analyst", name: "Data Analyst", nameAr: "محلل بيانات", department: "Engineering" },
  { id: "data_scientist", name: "Data Scientist", nameAr: "عالم بيانات", department: "Engineering" },
  { id: "ui_ux_junior", name: "Junior UI/UX Designer", nameAr: "مصمم واجهات مبتدئ", department: "Design" },
  { id: "ui_ux_senior", name: "Senior UI/UX Designer", nameAr: "مصمم واجهات أول", department: "Design" },
  { id: "graphic_designer", name: "Graphic Designer", nameAr: "مصمم جرافيك", department: "Design" },
  { id: "design_lead", name: "Design Lead", nameAr: "رئيس فريق التصميم", department: "Design" },
  { id: "marketing_assistant", name: "Marketing Assistant", nameAr: "مساعد تسويق", department: "Marketing" },
  { id: "marketing_specialist", name: "Marketing Specialist", nameAr: "أخصائي تسويق", department: "Marketing" },
  { id: "marketing_manager", name: "Marketing Manager", nameAr: "مدير تسويق", department: "Marketing" },
  { id: "content_writer", name: "Content Writer", nameAr: "كاتب محتوى", department: "Marketing" },
  { id: "seo_specialist", name: "SEO Specialist", nameAr: "أخصائي SEO", department: "Marketing" },
  { id: "sales_rep", name: "Sales Representative", nameAr: "مندوب مبيعات", department: "Sales" },
  { id: "sales_manager", name: "Sales Manager", nameAr: "مدير مبيعات", department: "Sales" },
  { id: "account_manager", name: "Account Manager", nameAr: "مدير حسابات العملاء", department: "Sales" },
  { id: "sales_director", name: "Sales Director", nameAr: "مدير عام المبيعات", department: "Sales" },
  { id: "ops_assistant", name: "Operations Assistant", nameAr: "مساعد عمليات", department: "Operations" },
  { id: "ops_coordinator", name: "Operations Coordinator", nameAr: "منسق عمليات", department: "Operations" },
  { id: "ops_manager", name: "Operations Manager", nameAr: "مدير عمليات", department: "Operations" },
  { id: "project_manager", name: "Project Manager", nameAr: "مدير مشروع", department: "Operations" },
  { id: "product_analyst", name: "Product Analyst", nameAr: "محلل منتجات", department: "Product" },
  { id: "product_manager", name: "Product Manager", nameAr: "مدير منتجات", department: "Product" },
  { id: "product_director", name: "Product Director", nameAr: "مدير عام المنتجات", department: "Product" },
  { id: "legal_assistant", name: "Legal Assistant", nameAr: "مساعد قانوني", department: "Legal" },
  { id: "legal_counsel", name: "Legal Counsel", nameAr: "مستشار قانوني", department: "Legal" },
  { id: "compliance_officer", name: "Compliance Officer", nameAr: "مسؤول الامتثال", department: "Legal" },
  { id: "secretary", name: "Secretary", nameAr: "سكرتير", department: "Administration" },
  { id: "receptionist", name: "Receptionist", nameAr: "موظف استقبال", department: "Administration" },
  { id: "office_manager", name: "Office Manager", nameAr: "مدير مكتب", department: "Administration" },
  { id: "driver", name: "Driver", nameAr: "سائق", department: "Support Services" },
  { id: "security_guard", name: "Security Guard", nameAr: "حارس أمن", department: "Support Services" },
  { id: "maintenance_worker", name: "Maintenance Worker", nameAr: "عامل صيانة", department: "Support Services" },
  { id: "janitor", name: "Janitor / Cleaner", nameAr: "عامل نظافة", department: "Support Services" },
  { id: "warehouse_worker", name: "Warehouse Worker", nameAr: "عامل مستودع", department: "Support Services" },
  { id: "nurse", name: "Nurse", nameAr: "ممرض", department: "Healthcare" },
  { id: "doctor", name: "Doctor", nameAr: "طبيب", department: "Healthcare" },
  { id: "pharmacist", name: "Pharmacist", nameAr: "صيدلي", department: "Healthcare" },
  { id: "medical_technician", name: "Medical Technician", nameAr: "تقني طبي", department: "Healthcare" },
  { id: "psychologist", name: "Psychologist", nameAr: "أخصائي نفسي", department: "Healthcare" },
  { id: "social_worker", name: "Social Worker", nameAr: "أخصائي اجتماعي", department: "Healthcare" },
  { id: "intern", name: "Intern / Trainee", nameAr: "متدرب", department: "Various" },
  { id: "consultant", name: "External Consultant", nameAr: "مستشار خارجي", department: "Various" },
  { id: "executive_director", name: "Executive Director", nameAr: "مدير تنفيذي", department: "Executive" },
  { id: "ceo", name: "CEO / General Manager", nameAr: "مدير عام / رئيس تنفيذي", department: "Executive" },
  { id: "cto", name: "CTO", nameAr: "مدير تقني", department: "Executive" },
  { id: "cfo", name: "CFO", nameAr: "مدير مالي عام", department: "Executive" },
] as const;

export const gradeSystem = [
  { id: "G1", name: "Grade 1 - Entry", nameAr: "الرتبة 1 - مبتدئ" },
  { id: "G2", name: "Grade 2 - Junior", nameAr: "الرتب�� 2 - مساعد" },
  { id: "G3", name: "Grade 3 - Intermediate", nameAr: "الرتبة 3 - متوسط" },
  { id: "G4", name: "Grade 4 - Senior", nameAr: "الرتبة 4 - أول" },
  { id: "G5", name: "Grade 5 - Lead", nameAr: "الرتبة 5 - رئيس" },
  { id: "G6", name: "Grade 6 - Principal", nameAr: "الرتبة 6 - رئيسي" },
  { id: "G7", name: "Grade 7 - Manager", nameAr: "الرتبة 7 - مدير" },
  { id: "G8", name: "Grade 8 - Director", nameAr: "الرتبة 8 - مدير عام" },
  { id: "G9", name: "Grade 9 - VP", nameAr: "الرتبة 9 - نائب رئيس" },
  { id: "G10", name: "Grade 10 - Executive", nameAr: "الرتبة 10 - تنفيذي" },
] as const;

export const promotionRules: PromotionRule[] = [
  { id: "PR001", category: "teacher_primary", fromGrade: "G1", toGrade: "G2", requiredYears: 3, salaryIncreasePercent: 10, isActive: true },
  { id: "PR002", category: "teacher_primary", fromGrade: "G2", toGrade: "G3", requiredYears: 5, salaryIncreasePercent: 12, isActive: true },
  { id: "PR003", category: "teacher_primary", fromGrade: "G3", toGrade: "G4", requiredYears: 7, salaryIncreasePercent: 15, isActive: true },
  { id: "PR004", category: "teacher_university", fromGrade: "G3", toGrade: "G4", requiredYears: 4, salaryIncreasePercent: 12, isActive: true },
  { id: "PR005", category: "teacher_university", fromGrade: "G4", toGrade: "G5", requiredYears: 5, salaryIncreasePercent: 15, isActive: true },
  { id: "PR006", category: "professor", fromGrade: "G5", toGrade: "G6", requiredYears: 6, salaryIncreasePercent: 18, isActive: true },
  { id: "PR007", category: "dev_junior", fromGrade: "G1", toGrade: "G2", requiredYears: 2, salaryIncreasePercent: 15, isActive: true },
  { id: "PR008", category: "dev_mid", fromGrade: "G2", toGrade: "G3", requiredYears: 2, salaryIncreasePercent: 15, isActive: true },
  { id: "PR009", category: "dev_senior", fromGrade: "G3", toGrade: "G4", requiredYears: 3, salaryIncreasePercent: 18, isActive: true },
  { id: "PR010", category: "hr_assistant", fromGrade: "G1", toGrade: "G2", requiredYears: 2, salaryIncreasePercent: 10, isActive: true },
  { id: "PR011", category: "hr_officer", fromGrade: "G2", toGrade: "G3", requiredYears: 3, salaryIncreasePercent: 12, isActive: true },
  { id: "PR012", category: "hr_manager", fromGrade: "G3", toGrade: "G4", requiredYears: 4, salaryIncreasePercent: 15, isActive: true },
  { id: "PR013", category: "accountant_junior", fromGrade: "G1", toGrade: "G2", requiredYears: 2, salaryIncreasePercent: 10, isActive: true },
  { id: "PR014", category: "accountant_senior", fromGrade: "G2", toGrade: "G3", requiredYears: 3, salaryIncreasePercent: 12, isActive: true },
  { id: "PR015", category: "nurse", fromGrade: "G2", toGrade: "G3", requiredYears: 3, salaryIncreasePercent: 10, isActive: true },
  { id: "PR016", category: "doctor", fromGrade: "G4", toGrade: "G5", requiredYears: 5, salaryIncreasePercent: 18, isActive: true },
  { id: "PR017", category: "sales_rep", fromGrade: "G1", toGrade: "G2", requiredYears: 2, salaryIncreasePercent: 12, isActive: true },
  { id: "PR018", category: "sales_manager", fromGrade: "G3", toGrade: "G4", requiredYears: 3, salaryIncreasePercent: 15, isActive: true },
];

export const promotionHistory: PromotionRecord[] = [];