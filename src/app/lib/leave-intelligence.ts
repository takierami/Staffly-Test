import type { Employee, LeaveRequest } from "../data/mock-data";

export interface ReplacementRecommendation {
  candidateId: string;
  employee: Employee;
  score: number;
  matchDetails: {
    titleMatch: boolean;
    departmentMatch: boolean;
    skillOverlap: number;
    gradeMatch: boolean;
  };
  availabilityType: "full" | "partial" | "none";
  availableDays: number;
  totalRequestedDays: number;
  proposedStartDate?: string;
  proposedEndDate?: string;
}

export function analyzeLeaveCoverage(
  requesterId: string,
  requestStartDate: string,
  requestEndDate: string,
  allEmployees: Employee[],
  allLeaves: LeaveRequest[],
  organizationId: string = "ORG001" // Mock current org
): ReplacementRecommendation[] {
  const requester = allEmployees.find(e => e.id === requesterId);
  if (!requester) return [];

  const start = new Date(requestStartDate);
  const end = new Date(requestEndDate);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;

  // Filter candidates from the same organization and active status
  const candidates = allEmployees.filter(e => 
    e.id !== requesterId && 
    e.status === "active" && 
    (e.organizationId === organizationId || !e.organizationId) // Fallback for older mock data
  );

  const recommendations = candidates.map(candidate => {
    let score = 0;
    const matchDetails = {
      titleMatch: false,
      departmentMatch: false,
      skillOverlap: 0,
      gradeMatch: false
    };

    // 1. Title Match (40 points)
    if (candidate.position === requester.position || candidate.category === requester.category) {
      score += 40;
      matchDetails.titleMatch = true;
    }

    // 2. Department Match (20 points)
    if (candidate.department === requester.department) {
      score += 20;
      matchDetails.departmentMatch = true;
    }

    // 3. Grade/Seniority Similarity (15 points)
    if (candidate.grade && requester.grade) {
      const cGrade = parseInt(candidate.grade.replace(/\D/g, '')) || 0;
      const rGrade = parseInt(requester.grade.replace(/\D/g, '')) || 0;
      if (Math.abs(cGrade - rGrade) <= 1) {
        score += 15;
        matchDetails.gradeMatch = true;
      }
    }

    // 4. Skills Overlap (25 points)
    const reqSkills = requester.skills || [];
    const canSkills = candidate.skills || [];
    if (reqSkills.length > 0 && canSkills.length > 0) {
      const overlap = reqSkills.filter(s => canSkills.includes(s)).length;
      const overlapPercent = overlap / reqSkills.length;
      const skillScore = Math.round(overlapPercent * 25);
      score += skillScore;
      matchDetails.skillOverlap = Math.round(overlapPercent * 100);
    } else {
      // If no skills data, distribute points to title/dept
      if (matchDetails.titleMatch) score += 15;
      if (matchDetails.departmentMatch) score += 10;
    }

    // Determine Availability
    let availabilityType: "full" | "partial" | "none" = "full";
    let availableDays = totalDays;
    let proposedStartDate = requestStartDate;
    let proposedEndDate = requestEndDate;

    const candidateLeaves = allLeaves.filter(l => l.employeeId === candidate.id && l.status === "approved");
    let unavailableDays = 0;
    let earliestConflictStart: Date | null = null;

    candidateLeaves.forEach(l => {
      const ls = new Date(l.startDate);
      const le = new Date(l.endDate);
      
      // Check overlap
      if (ls <= end && le >= start) {
        const overlapStart = ls < start ? start : ls;
        const overlapEnd = le > end ? end : le;
        const overlapDays = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / 86400000) + 1;
        unavailableDays += overlapDays;
        
        if (!earliestConflictStart || overlapStart < earliestConflictStart) {
          earliestConflictStart = overlapStart;
        }
      }
    });

    if (unavailableDays >= totalDays) {
      availabilityType = "none";
      availableDays = 0;
    } else if (unavailableDays > 0) {
      availabilityType = "partial";
      availableDays = totalDays - unavailableDays;
      
      // Suggest adjusted dates (e.g., end before the conflict starts)
      if (earliestConflictStart) {
        const newEnd = new Date(earliestConflictStart.getTime() - 86400000);
        if (newEnd >= start) {
          proposedEndDate = newEnd.toISOString().split("T")[0];
        }
      }
      
      score -= 10; // Penalty for partial coverage
    }

    return {
      candidateId: candidate.id,
      employee: candidate,
      score: Math.min(Math.max(score, 0), 100),
      matchDetails,
      availabilityType,
      availableDays,
      totalRequestedDays: totalDays,
      proposedStartDate: availabilityType === "partial" ? proposedStartDate : undefined,
      proposedEndDate: availabilityType === "partial" ? proposedEndDate : undefined
    };
  });

  return recommendations
    .filter(r => r.score > 30 && r.availabilityType !== "none") // Only sensible matches
    .sort((a, b) => {
      // Prioritize full availability over score if score difference is small
      if (a.availabilityType === "full" && b.availabilityType !== "full" && a.score >= b.score - 20) return -1;
      if (b.availabilityType === "full" && a.availabilityType !== "full" && b.score >= a.score - 20) return 1;
      return b.score - a.score;
    })
    .slice(0, 5);
}
