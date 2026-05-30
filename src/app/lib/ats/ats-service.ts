import type {
  JobRequirement,
  CandidateMatch,
  ATSCandidate,
  ATSJobPosting,
  ATSConfig,
  ATSActivity,
  ATSEventType,
  ATSFilterCriteria,
  ATSSortOption,
  ATSListResponse,
  Skill,
  Education,
  ScreeningCriterion,
  BulkMatchResult,
} from "./types";

import { createCVParser, type ICVParser } from "./cv-parser";
import { createScoringService, createScoringService as createScoring, type IScoringService } from "./scoring-service";
import { createResumeService, type ResumeService } from "./resume-service";

export interface ATSServiceConfig {
  organizationId?: string;
  cvParser?: {
    type: "rule-based" | "ai";
    apiKey?: string;
    model?: string;
  };
  scoring?: {
    type: "rule-based" | "weighted";
    weights?: {
      skills?: number;
      experience?: number;
      education?: number;
      languages?: number;
      certifications?: number;
    };
    thresholds?: {
      strongMatch?: number;
      potentialMatch?: number;
      autoReject?: number;
    };
  };
}

export class ATSService {
  private organizationId?: string;
  private cvParser: ICVParser;
  private scoringService: IScoringService;
  private resumeService: ResumeService;
  private jobRequirements: Map<string, JobRequirement> = new Map();
  private candidateMatches: Map<string, CandidateMatch> = new Map();
  private activities: ATSActivity[] = [];
  private config: ATSConfig;
  
  constructor(config?: ATSServiceConfig) {
    this.organizationId = config?.organizationId;
    
    this.config = {
      weights: {
        skills: config?.scoring?.weights?.skills ?? 0.35,
        experience: config?.scoring?.weights?.experience ?? 0.25,
        education: config?.scoring?.weights?.education ?? 0.15,
        languages: config?.scoring?.weights?.languages ?? 0.10,
        certifications: config?.scoring?.weights?.certifications ?? 0.15,
      },
      thresholds: {
        strongMatch: config?.scoring?.thresholds?.strongMatch ?? 75,
        potentialMatch: config?.scoring?.thresholds?.potentialMatch ?? 50,
        autoReject: config?.scoring?.thresholds?.autoReject ?? 25,
      },
      cvParser: {
        provider: config?.cvParser?.type ?? "system",
        model: config?.cvParser?.model,
        apiKey: config?.cvParser?.apiKey,
        enabled: true,
      },
    };
    
    this.cvParser = createCVParser(config?.cvParser?.type ?? "rule-based", {
      apiKey: config?.cvParser?.apiKey,
      model: config?.cvParser?.model,
    });
    
    this.scoringService = createScoringService(config?.scoring?.type ?? "rule-based", {
      weights: this.config.weights,
      thresholds: this.config.thresholds,
    });
    
    this.resumeService = createResumeService({
      parser: { type: config?.cvParser?.type ?? "rule-based" },
      scoring: { type: config?.scoring?.type ?? "rule-based" },
    });
  }
  
  createJobRequirement(
    jobId: string,
    options: {
      skills?: Skill[];
      preferredSkills?: Skill[];
      minimumYearsExperience?: number;
      preferredYearsExperience?: number;
      requiredEducation?: Education[];
      preferredEducation?: Education[];
      requiredLanguages?: string[];
      preferredLanguages?: string[];
      requiredCertifications?: string[];
      preferredCertifications?: string[];
      description?: string;
      responsibilities?: string[];
      screeningCriteria?: Omit<ScreeningCriterion, "id">[];
    } = {}
  ): JobRequirement {
    const requirement: JobRequirement = {
      id: `REQ_${Date.now()}`,
      jobId,
      skills: options.skills || [],
      preferredSkills: options.preferredSkills || [],
      minimumYearsExperience: options.minimumYearsExperience ?? 0,
      preferredYearsExperience: options.preferredYearsExperience,
      requiredEducation: options.requiredEducation || [],
      preferredEducation: options.preferredEducation || [],
      requiredLanguages: options.requiredLanguages || [],
      preferredLanguages: options.preferredLanguages || [],
      requiredCertifications: options.requiredCertifications || [],
      preferredCertifications: options.preferredCertifications || [],
      description: options.description || "",
      responsibilities: options.responsibilities || [],
      ScreeningCriteria: (options.screeningCriteria || []).map((c, i) => ({
        ...c,
        id: `CRIT_${Date.now()}_${i}`,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.jobRequirements.set(requirement.id, requirement);
    
    this.logActivity({
      type: "cv_parsed",
      candidateId: "",
      jobId,
      description: `Job requirements created for job ${jobId}`,
    });
    
    return requirement;
  }
  
  updateJobRequirement(requirementId: string, updates: Partial<JobRequirement>): JobRequirement | null {
    const existing = this.jobRequirements.get(requirementId);
    if (!existing) return null;
    
    const updated: JobRequirement = {
      ...existing,
      ...updates,
      id: existing.id,
      jobId: existing.jobId,
      updatedAt: new Date().toISOString(),
    };
    
    this.jobRequirements.set(requirementId, updated);
    return updated;
  }
  
  getJobRequirement(requirementId: string): JobRequirement | undefined {
    return this.jobRequirements.get(requirementId);
  }
  
  getJobRequirementByJobId(jobId: string): JobRequirement | undefined {
    for (const req of this.jobRequirements.values()) {
      if (req.jobId === jobId) return req;
    }
    return undefined;
  }
  
  deleteJobRequirement(requirementId: string): boolean {
    return this.jobRequirements.delete(requirementId);
  }
  
  calculateCandidateMatch(
    candidate: ATSCandidate,
    jobPosting: ATSJobPosting
  ): CandidateMatch {
    const jobRequirement = this.getJobRequirementByJobId(jobPosting.id);
    
    if (!jobRequirement) {
      const autoRequirement = this.createJobRequirement(jobPosting.id, {
        description: jobPosting.description,
      });
      return this.scoringService.calculateMatch(
        this.candidateToParsedCV(candidate),
        autoRequirement
      );
    }
    
    const match = this.scoringService.calculateMatch(
      this.candidateToParsedCV(candidate),
      jobRequirement
    );
    
    this.candidateMatches.set(`${candidate.id}_${jobPosting.id}`, match);
    
    this.logActivity({
      type: "match_calculated",
      candidateId: candidate.id,
      jobId: jobPosting.id,
      description: `Match calculated for ${candidate.name}: ${match.overallScore}%`,
      metadata: { score: match.overallScore, recommendation: match.atsRecommendation },
    });
    
    return match;
  }
  
  calculateBulkMatches(candidates: ATSCandidate[], jobPosting: ATSJobPosting): BulkMatchResult {
    const jobRequirement = this.getJobRequirementByJobId(jobPosting.id);
    
    let requirement: JobRequirement;
    
    if (!jobRequirement) {
      requirement = this.createJobRequirement(jobPosting.id, {
        description: jobPosting.description,
      });
    } else {
      requirement = jobRequirement;
    }
    
    const parsedCVs = candidates.map(c => this.candidateToParsedCV(c));
    const result = this.scoringService.calculateBulkMatches(parsedCVs, requirement);
    
    for (const match of result.candidateMatches) {
      this.candidateMatches.set(`${match.candidateId}_${jobPosting.id}`, match);
    }
    
    this.logActivity({
      type: "match_calculated",
      candidateId: "",
      jobId: jobPosting.id,
      description: `Bulk match calculated: ${result.strongMatches} strong, ${result.potentialMatches} potential, ${result.belowThreshold} below threshold`,
      metadata: { result },
    });
    
    return result;
  }
  
  getCandidateMatch(candidateId: string, jobId: string): CandidateMatch | undefined {
    return this.candidateMatches.get(`${candidateId}_${jobId}`);
  }
  
  getCandidateMatchesForJob(jobId: string): CandidateMatch[] {
    const matches: CandidateMatch[] = [];
    
    for (const [key, match] of this.candidateMatches.entries()) {
      if (match.jobId === jobId) {
        matches.push(match);
      }
    }
    
    return matches.sort((a, b) => b.overallScore - a.overallScore);
  }
  
  filterAndSortCandidates(
    candidates: ATSCandidate[],
    filters: ATSFilterCriteria,
    sort?: ATSSortOption
  ): ATSCandidate[] {
    let filtered = [...candidates];
    
    if (filters.minScore !== undefined) {
      filtered = filtered.filter(c => {
        const match = c.match;
        return match && match.overallScore >= filters.minScore!;
      });
    }
    
    if (filters.maxScore !== undefined) {
      filtered = filtered.filter(c => {
        const match = c.match;
        return match && match.overallScore <= filters.maxScore!;
      });
    }
    
    if (filters.stages && filters.stages.length > 0) {
      filtered = filtered.filter(c => filters.stages!.includes(c.stage));
    }
    
    if (filters.skills && filters.skills.length > 0) {
      filtered = filtered.filter(c => {
        const cv = c.parsedCV;
        if (!cv) return false;
        return filters.skills!.some(skill =>
          cv.skills?.some(cs => cs.name.toLowerCase().includes(skill.toLowerCase()))
        );
      });
    }
    
    if (filters.minYearsExperience !== undefined) {
      filtered = filtered.filter(c => {
        const cv = c.parsedCV;
        return cv && (cv.totalYearsExperience || 0) >= filters.minYearsExperience!;
      });
    }
    
    if (filters.hasCV !== undefined) {
      filtered = filtered.filter(c => {
        const hasCV = !!c.cvDocument && c.cvDocument.status === "completed";
        return filters.hasCV ? hasCV : !hasCV;
      });
    }
    
    if (sort) {
      filtered.sort((a, b) => {
        let comparison = 0;
        
        switch (sort.field) {
          case "score":
            comparison = (b.match?.overallScore || 0) - (a.match?.overallScore || 0);
            break;
          case "rating":
            comparison = b.rating - a.rating;
            break;
          case "name":
            comparison = a.name.localeCompare(b.name);
            break;
          case "appliedDate":
          default:
            comparison = new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
            break;
        }
        
        return sort.direction === "desc" ? comparison : -comparison;
      });
    }
    
    return filtered;
  }
  
  paginateCandidates(
    candidates: ATSCandidate[],
    page: number = 1,
    limit: number = 20
  ): ATSListResponse<ATSCandidate> {
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      data: candidates.slice(start, end),
      pagination: {
        page,
        limit,
        total: candidates.length,
      },
    };
  }
  
  getTopCandidates(
    jobId: string,
    count: number = 10,
    recommendation?: CandidateMatch["atsRecommendation"]
  ): CandidateMatch[] {
    const matches = this.getCandidateMatchesForJob(jobId);
    
    let filtered = matches;
    
    if (recommendation) {
      filtered = matches.filter(m => m.atsRecommendation === recommendation);
    }
    
    return filtered.slice(0, count);
  }
  
  getMatchStatistics(jobId: string): {
    total: number;
    strong: number;
    potential: number;
    needsReview: number;
    belowThreshold: number;
    averageScore: number;
    scoreDistribution: { range: string; count: number }[];
  } {
    const matches = this.getCandidateMatchesForJob(jobId);
    
    if (matches.length === 0) {
      return {
        total: 0,
        strong: 0,
        potential: 0,
        needsReview: 0,
        belowThreshold: 0,
        averageScore: 0,
        scoreDistribution: [],
      };
    }
    
    const strong = matches.filter(m => m.atsRecommendation === "strong_match").length;
    const potential = matches.filter(m => m.atsRecommendation === "potential_match").length;
    const needsReview = matches.filter(m => m.atsRecommendation === "needs_review").length;
    const belowThreshold = matches.filter(m => m.atsRecommendation === "below_threshold").length;
    
    const totalScore = matches.reduce((sum, m) => sum + m.overallScore, 0);
    const averageScore = Math.round(totalScore / matches.length);
    
    const ranges = [
      { min: 0, max: 25, label: "0-25" },
      { min: 25, max: 50, label: "25-50" },
      { min: 50, max: 75, label: "50-75" },
      { min: 75, max: 100, label: "75-100" },
    ];
    
    const scoreDistribution = ranges.map(range => ({
      range: range.label,
      count: matches.filter(m => m.overallScore >= range.min && m.overallScore < range.max).length,
    }));
    
    return {
      total: matches.length,
      strong,
      potential,
      needsReview,
      belowThreshold,
      averageScore,
      scoreDistribution,
    };
  }
  
  getResumeService(): ResumeService {
    return this.resumeService;
  }
  
  getConfig(): ATSConfig {
    return { ...this.config };
  }
  
  updateConfig(updates: Partial<ATSConfig>): void {
    this.config = { ...this.config, ...updates };
  }
  
  getActivities(limit: number = 50): ATSActivity[] {
    return this.activities.slice(0, limit);
  }
  
  clearActivities(): void {
    this.activities = [];
  }
  
  private candidateToParsedCV(candidate: ATSCandidate) {
    if (candidate.parsedCV) {
      return candidate.parsedCV;
    }
    
    return {
      id: `CV_${candidate.id}`,
      candidateId: candidate.id,
      rawText: "",
      parsedAt: new Date().toISOString(),
      contactInfo: {
        name: candidate.name,
        email: candidate.email,
      },
      skills: [],
      experience: [],
      education: [],
      languages: [],
      certifications: [],
      achievements: [],
      parseConfidence: 0,
      parseErrors: ["No CV parsed - using basic candidate data"],
    };
  }
  
  private logActivity(event: {
    type: ATSEventType;
    candidateId: string;
    jobId: string;
    description: string;
    metadata?: Record<string, any>;
  }): void {
    const activity: ATSActivity = {
      id: `ACT_${Date.now()}`,
      type: event.type,
      candidateId: event.candidateId,
      jobId: event.jobId,
      description: event.description,
      metadata: event.metadata,
      timestamp: new Date().toISOString(),
    };
    
    this.activities.unshift(activity);
    
    if (this.activities.length > 1000) {
      this.activities = this.activities.slice(0, 1000);
    }
  }
}

let atsServiceInstance: ATSService | null = null;

export function createATSService(config?: ATSServiceConfig): ATSService {
  return new ATSService(config);
}

export function getATSService(config?: ATSServiceConfig): ATSService {
  if (!atsServiceInstance) {
    atsServiceInstance = createATSService(config);
  }
  
  if (config) {
    atsServiceInstance.updateConfig(config as any);
  }
  
  return atsServiceInstance;
}

export function resetATSService(): void {
  atsServiceInstance = null;
}

export { type ATSServiceConfig as ATSServiceOptions };