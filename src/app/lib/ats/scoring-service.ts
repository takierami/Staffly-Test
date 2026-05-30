import type {
  ParsedCV,
  JobRequirement,
  CandidateMatch,
  CandidateMatch as MatchResult,
  Skill,
  WorkExperience,
  Education,
  ATSConfig,
  BulkMatchResult,
} from "./types";

export interface ScoringWeights {
  skills: number;
  experience: number;
  education: number;
  languages: number;
  certifications: number;
}

export interface ScoringThresholds {
  strongMatch: number;
  potentialMatch: number;
  autoReject: number;
}

export interface IScoringService {
  calculateMatch(candidateCV: ParsedCV, jobRequirements: JobRequirement): CandidateMatch;
  calculateBulkMatches(
    candidates: ParsedCV[],
    jobRequirements: JobRequirement
  ): BulkMatchResult;
  scoreSkills(candidateSkills: Skill[], requiredSkills: Skill[]): number;
  scoreExperience(yearsExperience: number, minimumRequired: number, preferred?: number): number;
  scoreEducation(candidateEducation: Education[], requiredEducation: Education[]): number;
}

export abstract class BaseScoringService implements IScoringService {
  protected weights: ScoringWeights;
  protected thresholds: ScoringThresholds;
  
  constructor(config?: Partial<{ weights: ScoringWeights; thresholds: ScoringThresholds }>) {
    this.weights = {
      skills: config?.weights?.skills ?? 0.35,
      experience: config?.weights?.experience ?? 0.25,
      education: config?.weights?.education ?? 0.15,
      languages: config?.weights?.languages ?? 0.10,
      certifications: config?.weights?.certifications ?? 0.15,
    };
    
    this.thresholds = {
      strongMatch: config?.thresholds?.strongMatch ?? 75,
      potentialMatch: config?.thresholds?.potentialMatch ?? 50,
      autoReject: config?.thresholds?.autoReject ?? 25,
    };
  }
  
  calculateMatch(candidateCV: ParsedCV, jobRequirements: JobRequirement): CandidateMatch {
    const skillsScore = this.scoreSkills(candidateCV.skills, jobRequirements.skills);
    const experienceScore = this.scoreExperience(
      candidateCV.totalYearsExperience || 0,
      jobRequirements.minimumYearsExperience,
      jobRequirements.preferredYearsExperience
    );
    const educationScore = this.scoreEducation(candidateCV.education, jobRequirements.requiredEducation);
    const languageScore = this.scoreLanguages(candidateCV.languages, jobRequirements.requiredLanguages);
    const certificationScore = this.scoreCertifications(
      candidateCV.certifications,
      jobRequirements.requiredCertifications
    );
    
    const overallScore = Math.round(
      (skillsScore * this.weights.skills) +
      (experienceScore * this.weights.experience) +
      (educationScore * this.weights.education) +
      (languageScore * this.weights.languages) +
      (certificationScore * this.weights.certifications)
    );
    
    const { strengths, weaknesses, missingRequirements, matchedPreferred } = this.analyzeMatchDetails(
      candidateCV,
      jobRequirements
    );
    
    const screeningNotes = this.generateScreeningNotes(
      candidateCV,
      jobRequirements,
      overallScore
    );
    
    const atsRecommendation = this.getRecommendation(overallScore);
    
    return {
      candidateId: candidateCV.candidateId,
      jobId: jobRequirements.jobId,
      overallScore,
      skillsScore,
      experienceScore,
      educationScore,
      languageScore,
      certificationScore,
      strengths,
      weaknesses,
      missingRequirements,
      matchedPreferred,
      screeningNotes,
      atsRecommendation,
      calculatedAt: new Date().toISOString(),
    };
  }
  
  calculateBulkMatches(
    candidates: ParsedCV[],
    jobRequirements: JobRequirement
  ): BulkMatchResult {
    const candidateMatches = candidates
      .map(candidate => this.calculateMatch(candidate, jobRequirements))
      .sort((a, b) => b.overallScore - a.overallScore);
    
    return {
      jobId: jobRequirements.jobId,
      candidateMatches,
      processedAt: new Date().toISOString(),
      totalCandidates: candidates.length,
      strongMatches: candidateMatches.filter(m => m.atsRecommendation === "strong_match").length,
      potentialMatches: candidateMatches.filter(m => m.atsRecommendation === "potential_match").length,
      belowThreshold: candidateMatches.filter(m => 
        m.atsRecommendation === "below_threshold" || m.atsRecommendation === "needs_review"
      ).length,
    };
  }
  
  abstract scoreSkills(candidateSkills: Skill[], requiredSkills: Skill[]): number;
  abstract scoreExperience(yearsExperience: number, minimumRequired: number, preferred?: number): number;
  abstract scoreEducation(candidateEducation: Education[], requiredEducation: Education[]): number;
  abstract scoreLanguages(candidateLanguages: { name: string }[], requiredLanguages: string[]): number;
  abstract scoreCertifications(candidateCerts: string[], requiredCerts: string[]): number;
  
  protected getRecommendation(score: number): CandidateMatch["atsRecommendation"] {
    if (score >= this.thresholds.strongMatch) return "strong_match";
    if (score >= this.thresholds.potentialMatch) return "potential_match";
    if (score >= this.thresholds.autoReject) return "needs_review";
    return "below_threshold";
  }
  
  protected analyzeMatchDetails(
    candidateCV: ParsedCV,
    jobRequirements: JobRequirement
  ): Pick<
    CandidateMatch,
    "strengths" | "weaknesses" | "missingRequirements" | "matchedPreferred"
  > {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const missingRequirements: string[] = [];
    const matchedPreferred: string[] = [];
    
    const candidateSkillNames = candidateCV.skills.map(s => s.name.toLowerCase());
    const requiredSkillNames = jobRequirements.skills.map(s => s.name.toLowerCase());
    const preferredSkillNames = jobRequirements.preferredSkills.map(s => s.name.toLowerCase());
    
    for (const skill of jobRequirements.skills) {
      if (candidateSkillNames.includes(skill.name.toLowerCase())) {
        strengths.push(`Has required skill: ${skill.name}`);
      } else {
        missingRequirements.push(`Missing required skill: ${skill.name}`);
      }
    }
    
    for (const skill of jobRequirements.preferredSkills) {
      if (candidateSkillNames.includes(skill.name.toLowerCase())) {
        matchedPreferred.push(`Matched preferred skill: ${skill.name}`);
      }
    }
    
    if (candidateCV.totalYearsExperience && candidateCV.totalYearsExperience >= jobRequirements.minimumYearsExperience) {
      strengths.push(
        `Meets experience requirement: ${candidateCV.totalYearsExperience} years (required: ${jobRequirements.minimumYearsExperience})`
      );
    } else {
      weaknesses.push(
        `Experience gap: ${candidateCV.totalYearsExperience || 0} years (required: ${jobRequirements.minimumYearsExperience})`
      );
    }
    
    if (candidateCV.certifications.length > 0) {
      const matchedCerts = candidateCV.certifications.filter(cert =>
        jobRequirements.requiredCertifications.some(rc => 
          cert.toLowerCase().includes(rc.toLowerCase())
        )
      );
      if (matchedCerts.length > 0) {
        strengths.push(`Has certifications: ${matchedCerts.join(", ")}`);
      }
    }
    
    return { strengths, weaknesses, missingRequirements, matchedPreferred };
  }
  
  protected generateScreeningNotes(
    candidateCV: ParsedCV,
    jobRequirements: JobRequirement,
    overallScore: number
  ): string[] {
    const notes: string[] = [];
    
    if (overallScore >= this.thresholds.strongMatch) {
      notes.push("Strong match - recommend proceeding to interview stage");
    } else if (overallScore >= this.thresholds.potentialMatch) {
      notes.push("Potential match - consider for next review round");
    } else {
      notes.push("Below threshold - requires manual review before rejection");
    }
    
    if (candidateCV.parseConfidence < 70) {
      notes.push("Low parsing confidence - manual verification of CV data recommended");
    }
    
    if (missingRequirements.length > 3) {
      notes.push("Multiple missing requirements - evaluate if trainable skills are acceptable");
    }
    
    return notes;
  }
  
  protected fuzzyMatch(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (s1 === s2) return 100;
    if (s1.includes(s2) || s2.includes(s1)) return 85;
    
    const distance = this.levenshteinDistance(s1, s2);
    const maxLen = Math.max(s1.length, s2.length);
    const similarity = ((maxLen - distance) / maxLen) * 100;
    
    return Math.round(similarity);
  }
  
  protected levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));
    
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }
    
    return dp[m][n];
  }
}

export class RuleBasedScoringService extends BaseScoringService {
  scoreSkills(candidateSkills: Skill[], requiredSkills: Skill[]): number {
    if (requiredSkills.length === 0) return 100;
    
    const candidateSkillNames = new Set(
      candidateSkills.map(s => s.name.toLowerCase())
    );
    
    let matchedRequired = 0;
    let matchedPreferred = 0;
    let totalWeight = 0;
    
    for (const skill of requiredSkills) {
      const found = candidateSkills.find(
        cs => this.fuzzyMatch(cs.name, skill.name) >= 70
      );
      if (found) {
        matchedRequired++;
        totalWeight += 100;
      } else {
        totalWeight += 0;
      }
    }
    
    if (requiredSkills.length > 0) {
      const requiredScore = (matchedRequired / requiredSkills.length) * 100;
      return Math.round(requiredScore);
    }
    
    return 0;
  }
  
  scoreExperience(yearsExperience: number, minimumRequired: number, preferred?: number): number {
    if (minimumRequired === 0) return 100;
    
    if (yearsExperience < minimumRequired) {
      const deficitRatio = yearsExperience / minimumRequired;
      return Math.round(deficitRatio * 50);
    }
    
    if (preferred && yearsExperience >= preferred) {
      return 100;
    }
    
    if (preferred && yearsExperience >= minimumRequired) {
      const extra = yearsExperience - minimumRequired;
      const range = preferred - minimumRequired;
      const bonus = (extra / range) * 15;
      return Math.min(Math.round(85 + bonus), 100);
    }
    
    const ratio = yearsExperience / minimumRequired;
    if (ratio >= 1.5) return 90;
    if (ratio >= 1.2) return 80;
    return 70 + Math.round((ratio - 1) * 50);
  }
  
  scoreEducation(candidateEducation: Education[], requiredEducation: Education[]): number {
    if (requiredEducation.length === 0) return 100;
    
    if (candidateEducation.length === 0) return 0;
    
    const educationLevelScores: Record<string, number> = {
      "high school": 20,
      "associate": 40,
      "bachelor's": 70,
      "master's": 90,
      "doctorate": 100,
    };
    
    let bestMatchScore = 0;
    
    for (const candEdu of candidateEducation) {
      for (const reqEdu of requiredEducation) {
        const candDegree = candEdu.degree.toLowerCase();
        const reqDegree = reqEdu.degree.toLowerCase();
        
        const degreeMatch = this.fuzzyMatch(candDegree, reqDegree);
        
        if (degreeMatch >= 70) {
          let score = educationLevelScores[candDegree] || 50;
          
          if (reqEdu.field && candEdu.field) {
            const fieldMatch = this.fuzzyMatch(candEdu.field, reqEdu.field);
            if (fieldMatch >= 70) {
              score = Math.min(score + 10, 100);
            }
          }
          
          bestMatchScore = Math.max(bestMatchScore, score);
        }
      }
    }
    
    return bestMatchScore;
  }
  
  scoreLanguages(
    candidateLanguages: { name: string; level?: string }[],
    requiredLanguages: string[]
  ): number {
    if (requiredLanguages.length === 0) return 100;
    
    const levelScores: Record<string, number> = {
      native: 100,
      professional: 85,
      conversational: 50,
      basic: 25,
    };
    
    let totalScore = 0;
    let matchedCount = 0;
    
    for (const required of requiredLanguages) {
      const found = candidateLanguages.find(
        cl => cl.name.toLowerCase() === required.toLowerCase()
      );
      
      if (found) {
        matchedCount++;
        totalScore += levelScores[found.level || "basic"] || 50;
      }
    }
    
    if (matchedCount === 0) return 0;
    if (matchedCount === requiredLanguages.length) return Math.round(totalScore / matchedCount);
    
    return Math.round((totalScore / matchedCount) * (matchedCount / requiredLanguages.length));
  }
  
  scoreCertifications(candidateCerts: string[], requiredCerts: string[]): number {
    if (requiredCerts.length === 0) return 100;
    if (candidateCerts.length === 0) return 0;
    
    let matched = 0;
    
    for (const required of requiredCerts) {
      const found = candidateCerts.some(
        cert => cert.toLowerCase().includes(required.toLowerCase())
      );
      if (found) matched++;
    }
    
    return Math.round((matched / requiredCerts.length) * 100);
  }
}

export class WeightedScoringService extends BaseScoringService {
  private customWeights: boolean;
  
  constructor(config?: {
    weights?: ScoringWeights;
    thresholds?: ScoringThresholds;
    customWeights?: boolean;
  }) {
    super(config);
    this.customWeights = config?.customWeights ?? false;
  }
  
  scoreSkills(candidateSkills: Skill[], requiredSkills: Skill[]): number {
    if (requiredSkills.length === 0) return 100;
    
    let score = 0;
    let maxPossible = 0;
    let matchedCount = 0;
    
    for (const skill of requiredSkills) {
      const found = candidateSkills.find(
        cs => this.fuzzyMatch(cs.name, skill.name) >= 70
      );
      
      maxPossible += 100;
      
      if (found) {
        matchedCount++;
        
        let skillScore = 100;
        
        if (skill.yearsOfExperience && found.level) {
          const levelMap = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
          const requiredLevel = skill.yearsOfExperience > 5 ? "advanced" : "intermediate";
          const candidateLevel = found.level || "intermediate";
          
          if (levelMap[candidateLevel] >= levelMap[requiredLevel]) {
            skillScore = 100;
          } else if (levelMap[candidateLevel] >= levelMap[requiredLevel] - 1) {
            skillScore = 70;
          } else {
            skillScore = 40;
          }
        }
        
        score += skillScore;
      } else {
        score += 0;
      }
    }
    
    const baseScore = maxPossible > 0 ? (score / maxPossible) * 100 : 0;
    
    if (matchedCount === requiredSkills.length) {
      return Math.min(Math.round(baseScore + 10), 100);
    }
    
    return Math.round(baseScore);
  }
  
  scoreExperience(yearsExperience: number, minimumRequired: number, preferred?: number): number {
    if (minimumRequired === 0) return 100;
    
    const shortfall = minimumRequired - yearsExperience;
    
    if (shortfall <= 0) {
      let score = 80;
      
      if (preferred && yearsExperience >= preferred) {
        score = 100;
      } else if (preferred) {
        const excess = yearsExperience - minimumRequired;
        const range = preferred - minimumRequired;
        score = Math.min(80 + Math.round((excess / range) * 20), 100);
      } else {
        score = Math.min(80 + Math.round(yearsExperience * 2), 100);
      }
      
      return score;
    }
    
    if (shortfall <= 1) return 60;
    if (shortfall <= 2) return 40;
    if (shortfall <= 3) return 20;
    
    return Math.max(0, 100 - shortfall * 10);
  }
  
  scoreEducation(candidateEducation: Education[], requiredEducation: Education[]): number {
    if (requiredEducation.length === 0) return 100;
    if (candidateEducation.length === 0) return 0;
    
    const levelHierarchy = ["high school", "associate", "bachelor's", "master's", "doctorate"];
    
    const getLevelIndex = (degree: string): number => {
      const d = degree.toLowerCase();
      for (let i = 0; i < levelHierarchy.length; i++) {
        if (d.includes(levelHierarchy[i])) return i;
      }
      return -1;
    };
    
    let totalScore = 0;
    let evaluatedCount = 0;
    
    for (const reqEdu of requiredEducation) {
      const reqLevel = getLevelIndex(reqEdu.degree);
      let bestMatch = 0;
      
      for (const candEdu of candidateEducation) {
        const candLevel = getLevelIndex(candEdu.degree);
        
        if (candLevel >= reqLevel) {
          const score = 100 - (candLevel - reqLevel) * 10;
          bestMatch = Math.max(bestMatch, score);
        } else {
          bestMatch = Math.max(bestMatch, candLevel >= 0 ? 30 : 0);
        }
      }
      
      totalScore += bestMatch;
      evaluatedCount++;
    }
    
    return evaluatedCount > 0 ? Math.round(totalScore / evaluatedCount) : 0;
  }
  
  scoreLanguages(
    candidateLanguages: { name: string; level?: string }[],
    requiredLanguages: string[]
  ): number {
    if (requiredLanguages.length === 0) return 100;
    
    const levelWeight = { native: 100, professional: 80, conversational: 50, basic: 20 };
    
    let totalScore = 0;
    let matchedCount = 0;
    
    for (const required of requiredLanguages) {
      const found = candidateLanguages.find(
        cl => cl.name.toLowerCase().includes(required.toLowerCase())
      );
      
      if (found) {
        matchedCount++;
        totalScore += levelWeight[found.level || "basic"];
      }
    }
    
    if (matchedCount === 0) return 0;
    
    const avgMatchScore = totalScore / matchedCount;
    const coverageBonus = (matchedCount / requiredLanguages.length) * 20;
    
    return Math.min(Math.round(avgMatchScore + coverageBonus), 100);
  }
  
  scoreCertifications(candidateCerts: string[], requiredCerts: string[]): number {
    if (requiredCerts.length === 0) return 100;
    
    const normalizedCerts = candidateCerts.map(c => c.toLowerCase());
    let matched = 0;
    
    for (const required of requiredCerts) {
      const found = normalizedCerts.some(cert => cert.includes(required.toLowerCase()));
      if (found) matched++;
    }
    
    const matchRatio = matched / requiredCerts.length;
    
    if (matchRatio === 1) return 100;
    if (matchRatio >= 0.75) return 80;
    if (matchRatio >= 0.5) return 60;
    if (matchRatio >= 0.25) return 40;
    
    return matchRatio * 100;
  }
}

export function createScoringService(
  type: "rule-based" | "weighted" = "rule-based",
  config?: {
    weights?: ScoringWeights;
    thresholds?: ScoringThresholds;
  }
): IScoringService {
  switch (type) {
    case "weighted":
      return new WeightedScoringService(config);
    case "rule-based":
    default:
      return new RuleBasedScoringService(config);
  }
}

export function getDefaultATSConfig(): ATSConfig {
  return {
    weights: {
      skills: 0.35,
      experience: 0.25,
      education: 0.15,
      languages: 0.10,
      certifications: 0.15,
    },
    thresholds: {
      strongMatch: 75,
      potentialMatch: 50,
      autoReject: 25,
    },
    cvParser: {
      provider: "system",
      enabled: true,
    },
  };
}