export * from "./types";
export * from "./cv-parser";
export * from "./scoring-service";
export * from "./resume-service";
export * from "./ats-service";

import { ATSService, createATSService, getATSService, resetATSService } from "./ats-service";
import { ResumeService, createResumeService, getResumeService, resetResumeService } from "./resume-service";
import { RuleBasedCVParser, AICVParser, createCVParser, type ICVParser } from "./cv-parser";
import { RuleBasedScoringService, WeightedScoringService, createScoringService, type IScoringService } from "./scoring-service";

export const atsServices = {
  createATSService,
  getATSService,
  resetATSService,
  
  createResumeService,
  getResumeService,
  resetResumeService,
  
  createCVParser,
  
  createScoringService,
  
  RuleBasedCVParser,
  AICVParser,
  RuleBasedScoringService,
  WeightedScoringService,
};

export type {
  ATSService,
  ResumeService,
  ICVParser,
  IScoringService,
};

export default {
  atsService: getATSService,
  resumeService: getResumeService,
  cvParser: () => createCVParser("rule-based"),
  scoringService: () => createScoringService("rule-based"),
};