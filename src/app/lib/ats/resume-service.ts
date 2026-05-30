import type {
  CVDocument,
  ParsedCV,
  CandidateMatch,
  ParsingResult,
  ResumeServiceOptions,
} from "./types";

import { createCVParser, type ICVParser } from "./cv-parser";
import { createScoringService, type IScoringService } from "./scoring-service";

export interface ResumeUploadOptions {
  maxFileSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
}

export interface ResumeServiceConfig {
  parser: {
    type: "rule-based" | "ai";
    apiKey?: string;
    model?: string;
  };
  scoring: {
    type: "rule-based" | "weighted";
  };
  upload: ResumeUploadOptions;
}

export interface UploadedResume {
  document: CVDocument;
  parsingResult: ParsingResult;
}

export interface CandidateAnalysis {
  candidateId: string;
  cvDocument: CVDocument;
  parsedCV: ParsedCV;
  match?: CandidateMatch;
  overallScore: number;
  recommendation: "strong_match" | "potential_match" | "needs_review" | "below_threshold";
}

export interface JobAnalysisSummary {
  jobId: string;
  jobTitle: string;
  totalCandidates: number;
  strongMatches: number;
  potentialMatches: number;
  belowThreshold: number;
  topCandidates: CandidateAnalysis[];
  averageScore: number;
  analyzedAt: string;
}

export class ResumeService {
  private cvParser: ICVParser;
  private scoringService: IScoringService;
  private config: ResumeServiceConfig;
  private uploadedResumes: Map<string, CVDocument> = new Map();
  private parsedCVs: Map<string, ParsedCV> = new Map();
  
  constructor(config?: Partial<ResumeServiceConfig>) {
    this.config = {
      parser: config?.parser || { type: "rule-based" },
      scoring: config?.scoring || { type: "rule-based" },
      upload: {
        maxFileSize: config?.upload?.maxFileSize || 10 * 1024 * 1024,
        allowedTypes: config?.upload?.allowedTypes || [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
        ],
        maxFiles: config?.upload?.maxFiles || 5,
      },
    };
    
    this.cvParser = createCVParser(this.config.parser.type, {
      apiKey: this.config.parser.apiKey,
      model: this.config.parser.model,
    });
    
    this.scoringService = createScoringService(this.config.scoring.type);
  }
  
  async uploadAndParse(
    file: File,
    candidateId: string,
    organizationId?: string
  ): Promise<UploadedResume> {
    this.validateFile(file);
    
    const cvDocument: CVDocument = {
      id: `CVDOC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      candidateId,
      fileName: file.name,
      fileType: this.getFileType(file),
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      parsed: false,
      parsedBy: this.config.parser.type === "ai" ? "ai" : "system",
      status: "processing",
    };
    
    this.uploadedResumes.set(cvDocument.id, cvDocument);
    
    try {
      const parsingResult = await this.cvParser.parse(file);
      
      if (parsingResult.success && parsingResult.parsedCV) {
        const parsedCV = {
          ...parsingResult.parsedCV,
          candidateId,
        };
        
        this.parsedCVs.set(cvDocument.id, parsedCV);
        
        cvDocument.parsed = true;
        cvDocument.parsedCVId = parsedCV.id;
        cvDocument.status = "completed";
        
        this.uploadedResumes.set(cvDocument.id, cvDocument);
        
        return { document: cvDocument, parsingResult };
      } else {
        cvDocument.status = "failed";
        cvDocument.errorMessage = parsingResult.error || "Parsing failed";
        this.uploadedResumes.set(cvDocument.id, cvDocument);
        
        return { document: cvDocument, parsingResult };
      }
    } catch (error) {
      cvDocument.status = "failed";
      cvDocument.errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.uploadedResumes.set(cvDocument.id, cvDocument);
      
      return {
        document: cvDocument,
        parsingResult: {
          success: false,
          error: cvDocument.errorMessage,
          confidence: 0,
        },
      };
    }
  }
  
  async uploadMultiple(
    files: File[],
    candidateId: string,
    organizationId?: string
  ): Promise<UploadedResume[]> {
    if (files.length > (this.config.upload?.maxFiles || 5)) {
      throw new Error(`Maximum ${this.config.upload?.maxFiles || 5} files allowed per upload`);
    }
    
    return Promise.all(
      files.map(file => this.uploadAndParse(file, candidateId, organizationId))
    );
  }
  
  async reparse(documentId: string, parserType?: "rule-based" | "ai"): Promise<ParsingResult> {
    const document = this.uploadedResumes.get(documentId);
    if (!document) {
      return { success: false, error: "Document not found", confidence: 0 };
    }
    
    const parsedCV = this.parsedCVs.get(documentId);
    if (!parsedCV) {
      return { success: false, error: "Parsed CV not found", confidence: 0 };
    }
    
    document.status = "processing";
    this.uploadedResumes.set(documentId, document);
    
    try {
      const parser = parserType 
        ? createCVParser(parserType)
        : this.cvParser;
      
      const result = await parser.parse(parsedCV.rawText);
      
      if (result.success && result.parsedCV) {
        const updatedCV = { ...result.parsedCV, candidateId: parsedCV.candidateId };
        this.parsedCVs.set(documentId, updatedCV);
        document.status = "completed";
        document.parsedBy = parserType === "ai" ? "ai" : "system";
      } else {
        document.status = "failed";
        document.errorMessage = result.error;
      }
      
      this.uploadedResumes.set(documentId, document);
      
      return result;
    } catch (error) {
      document.status = "failed";
      document.errorMessage = error instanceof Error ? error.message : "Reparsing failed";
      this.uploadedResumes.set(documentId, document);
      
      return {
        success: false,
        error: document.errorMessage,
        confidence: 0,
      };
    }
  }
  
  getCVDocument(documentId: string): CVDocument | undefined {
    return this.uploadedResumes.get(documentId);
  }
  
  getParsedCV(documentId: string): ParsedCV | undefined {
    return this.parsedCVs.get(documentId);
  }
  
  getParsedCVByCandidateId(candidateId: string): ParsedCV | undefined {
    for (const cv of this.parsedCVs.values()) {
      if (cv.candidateId === candidateId) {
        return cv;
      }
    }
    return undefined;
  }
  
  getAllCVDocuments(): CVDocument[] {
    return Array.from(this.uploadedResumes.values());
  }
  
  getAllParsedCVs(): ParsedCV[] {
    return Array.from(this.parsedCVs.values());
  }
  
  deleteResume(documentId: string): boolean {
    this.parsedCVs.delete(documentId);
    return this.uploadedResumes.delete(documentId);
  }
  
  getServiceInfo(): {
    parserName: string;
    parserVersion: string;
    scoringServiceType: string;
    supportedFormats: string[];
  } {
    return {
      parserName: this.cvParser.name,
      parserVersion: this.cvParser.version,
      scoringServiceType: this.config.scoring.type,
      supportedFormats: this.cvParser.getSupportedFormats(),
    };
  }
  
  updateConfig(newConfig: Partial<ResumeServiceConfig>): void {
    if (newConfig.parser) {
      this.config.parser = { ...this.config.parser, ...newConfig.parser };
      this.cvParser = createCVParser(this.config.parser.type, {
        apiKey: this.config.parser.apiKey,
        model: this.config.parser.model,
      });
    }
    
    if (newConfig.scoring) {
      this.config.scoring = { ...this.config.scoring, ...newConfig.scoring };
      this.scoringService = createScoringService(this.config.scoring.type);
    }
    
    if (newConfig.upload) {
      this.config.upload = { ...this.config.upload, ...newConfig.upload };
    }
  }
  
  private validateFile(file: File): void {
    if (file.size > (this.config.upload?.maxFileSize || 10 * 1024 * 1024)) {
      throw new Error(
        `File too large. Maximum size is ${Math.round((this.config.upload?.maxFileSize || 10 * 1024 * 1024) / 1024 / 1024)}MB`
      );
    }
    
    const allowedTypes = this.config.upload?.allowedTypes || [];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt)$/i)) {
      throw new Error(
        `Invalid file type. Allowed types: ${allowedTypes.map(t => t.split("/").pop()).join(", ")}`
      );
    }
  }
  
  private getFileType(file: File): CVDocument["fileType"] {
    const ext = file.name.split(".").pop()?.toLowerCase();
    
    switch (ext) {
      case "pdf":
        return "pdf";
      case "doc":
        return "doc";
      case "docx":
        return "docx";
      case "txt":
        return "txt";
      default:
        if (file.type === "application/pdf") return "pdf";
        if (file.type === "application/msword") return "doc";
        if (file.type.includes("wordprocessingml")) return "docx";
        return "txt";
    }
  }
}

export function createResumeService(config?: Partial<ResumeServiceConfig>): ResumeService {
  return new ResumeService(config);
}

let resumeServiceInstance: ResumeService | null = null;

export function getResumeService(config?: Partial<ResumeServiceConfig>): ResumeService {
  if (!resumeServiceInstance) {
    resumeServiceInstance = createResumeService(config);
  }
  
  if (config) {
    resumeServiceInstance.updateConfig(config);
  }
  
  return resumeServiceInstance;
}

export function resetResumeService(): void {
  resumeServiceInstance = null;
}