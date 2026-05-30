export interface Skill {
  name: string;
  level?: "beginner" | "intermediate" | "advanced" | "expert";
  yearsOfExperience?: number;
  verified?: boolean;
}

export interface WorkExperience {
  company: string;
  title: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current: boolean;
  description?: string;
  skills: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationYear?: number;
  gpa?: string;
}

export interface Language {
  name: string;
  level: "basic" | "conversational" | "professional" | "native";
}

export interface ParsedCV {
  id: string;
  candidateId: string;
  rawText: string;
  parsedAt: string;
  contactInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedIn?: string;
    website?: string;
  };
  summary?: string;
  skills: Skill[];
  experience: WorkExperience[];
  education: Education[];
  languages: Language[];
  certifications: string[];
  achievements: string[];
  totalYearsExperience?: number;
  parseConfidence: number;
  parseErrors: string[];
}

export interface JobRequirement {
  id: string;
  jobId: string;
  skills: Skill[];
  preferredSkills: Skill[];
  minimumYearsExperience: number;
  preferredYearsExperience?: number;
  requiredEducation: Education[];
  preferredEducation: Education[];
  requiredLanguages: string[];
  preferredLanguages: string[];
  requiredCertifications: string[];
  preferredCertifications: string[];
  description: string;
  responsibilities: string[];
  ScreeningCriteria: ScreeningCriterion[];
  createdAt: string;
  updatedAt: string;
}

export interface ScreeningCriterion {
  id: string;
  name: string;
  description: string;
  type: "required" | "preferred" | "bonus";
  weight: number;
  keywords: string[];
  automatedScore: boolean;
}

export interface CandidateMatch {
  candidateId: string;
  jobId: string;
  overallScore: number;
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  languageScore: number;
  certificationScore: number;
  strengths: string[];
  weaknesses: string[];
  missingRequirements: string[];
  matchedPreferred: string[];
  screeningNotes: string[];
  atsRecommendation: "strong_match" | "potential_match" | "needs_review" | "below_threshold";
  calculatedAt: string;
}

export interface CVDocument {
  id: string;
  candidateId: string;
  fileName: string;
  fileType: "pdf" | "doc" | "docx" | "txt";
  fileSize: number;
  uploadedAt: string;
  parsed: boolean;
  parsedCVId?: string;
  parsedBy: "system" | "ai" | "manual";
  status: "pending" | "processing" | "completed" | "failed";
  errorMessage?: string;
}

export interface ATSCandidate extends Partial<ParsedCV> {
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
  cvDocument?: CVDocument;
  parsedCV?: ParsedCV;
  match?: CandidateMatch;
  organizationId?: string;
}

export interface ATSJobPosting extends JobRequirement {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "contract";
  status: "open" | "closed" | "draft";
  applicants: number;
  postedDate: string;
  description: string;
  organizationId?: string;
}

export interface ATSConfig {
  weights: {
    skills: number;
    experience: number;
    education: number;
    languages: number;
    certifications: number;
  };
  thresholds: {
    strongMatch: number;
    potentialMatch: number;
    autoReject: number;
  };
  cvParser: {
    provider: "system" | "openai" | "anthropic" | "custom";
    model?: string;
    apiKey?: string;
    enabled: boolean;
  };
}

export type ATSEventType = 
  | "candidate_applied"
  | "candidate_stage_changed"
  | "cv_parsed"
  | "match_calculated"
  | "candidate_rejected"
  | "candidate_hired";

export interface ATSActivity {
  id: string;
  type: ATSEventType;
  candidateId: string;
  jobId: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
  userId?: string;
}

export interface ATSFilterCriteria {
  minScore?: number;
  maxScore?: number;
  stages?: string[];
  skills?: string[];
  minYearsExperience?: number;
  educationLevel?: string;
  hasCV?: boolean;
  dateRange?: { start: string; end: string };
}

export interface ATSSortOption {
  field: "score" | "appliedDate" | "rating" | "name";
  direction: "asc" | "desc";
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
}

export interface ATSListResponse<T> {
  data: T[];
  pagination: PaginationOptions;
}

export interface ParsingResult {
  success: boolean;
  parsedCV?: ParsedCV;
  error?: string;
  confidence: number;
}

export interface MatchResult {
  success: boolean;
  match?: CandidateMatch;
  error?: string;
}

export interface BulkMatchResult {
  jobId: string;
  candidateMatches: CandidateMatch[];
  processedAt: string;
  totalCandidates: number;
  strongMatches: number;
  potentialMatches: number;
  belowThreshold: number;
}