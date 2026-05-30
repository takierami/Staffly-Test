import type { ParsedCV, ParsingResult, Skill, WorkExperience, Education, Language } from "./types";

export interface ICVParser {
  readonly name: string;
  readonly version: string;
  parse(cvContent: string | File): Promise<ParsingResult>;
  parseBatch(cvContents: (string | File)[]): Promise<ParsingResult[]>;
  isSupported(fileType: string): boolean;
  extractContactInfo(text: string): ParsedCV["contactInfo"];
  extractSkills(text: string): Skill[];
  extractExperience(text: string): WorkExperience[];
  extractEducation(text: string): Education[];
  extractLanguages(text: string): Language[];
  extractSummary(text: string): string | undefined;
  extractCertifications(text: string): string[];
  getSupportedFormats(): string[];
}

export abstract class BaseCVParser implements ICVParser {
  abstract readonly name: string;
  abstract readonly version: string;
  abstract parse(cvContent: string | File): Promise<ParsingResult>;
  
  async parseBatch(cvContents: (string | File)[]): Promise<ParsingResult[]> {
    return Promise.all(cvContents.map(content => this.parse(content)));
  }

  abstract isSupported(fileType: string): boolean;
  abstract extractContactInfo(text: string): ParsedCV["contactInfo"];
  abstract extractSkills(text: string): Skill[];
  abstract extractExperience(text: string): WorkExperience[];
  abstract extractEducation(text: string): Education[];
  abstract extractLanguages(text: string): Language[];
  abstract extractSummary(text: string): string | undefined;
  abstract extractCertifications(text: string): string[];

  getSupportedFormats(): string[] {
    return [".pdf", ".doc", ".docx", ".txt"];
  }

  protected calculateParseConfidence(
    hasContact: boolean,
    hasSkills: boolean,
    hasExperience: boolean,
    hasEducation: boolean,
    totalFieldsFound: number,
    totalFieldsExpected: number
  ): number {
    let score = 0;
    if (hasContact) score += 0.2;
    if (hasSkills) score += 0.2;
    if (hasExperience) score += 0.25;
    if (hasEducation) score += 0.2;
    score += (totalFieldsFound / totalFieldsExpected) * 0.15;
    return Math.min(Math.round(score * 100), 100);
  }

  protected normalizeText(text: string): string {
    return text
      .replace(/\s+/g, " ")
      .replace(/[\r\n]+/g, "\n")
      .trim();
  }

  protected extractFieldValue(text: string, fieldName: string): string | undefined {
    const patterns = [
      new RegExp(`${fieldName}[:\\s]+([^\\n]+)`, "i"),
      new RegExp(`${fieldName}[\\s]*[-–—]?\\s*([^\\n]+)`, "i"),
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return undefined;
  }

  protected findSection(text: string, sectionName: string): string {
    const sectionPatterns = [
      new RegExp(`${sectionName}[\\s]*[:\\-\\n]([\\s\\S]*?)(?=\\n[A-Z][a-z]+[\\s]*[:\\-\\n]|\\n\\n|$)`, "i"),
      new RegExp(`${sectionName}`, "gi"),
    ];
    
    for (const pattern of sectionPatterns) {
      const match = text.match(pattern);
      if (match) {
        const startIndex = text.indexOf(match[0]);
        const endIndex = text.indexOf("\n\n", startIndex);
        if (endIndex !== -1) {
          return text.substring(startIndex, endIndex);
        }
        return text.substring(startIndex);
      }
    }
    return "";
  }

  protected parseYearsFromDate(dateStr: string): number {
    if (!dateStr) return 0;
    
    const currentYear = new Date().getFullYear();
    const yearMatch = dateStr.match(/\d{4}/);
    
    if (yearMatch) {
      const year = parseInt(yearMatch[0], 10);
      if (dateStr.toLowerCase().includes("present") || dateStr.toLowerCase().includes("current")) {
        return currentYear - year;
      }
      return currentYear - year;
    }
    
    const monthYearMatch = dateStr.match(/(\d{4})/);
    if (monthYearMatch) {
      return currentYear - parseInt(monthYearMatch[1], 10);
    }
    
    return 0;
  }

  protected deduplicateSkills(skills: Skill[]): Skill[] {
    const seen = new Set<string>();
    return skills.filter(skill => {
      const key = skill.name.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  protected calculateTotalYearsExperience(experiences: WorkExperience[]): number {
    if (!experiences || experiences.length === 0) return 0;
    
    let totalMonths = 0;
    
    for (const exp of experiences) {
      if (!exp.startDate && !exp.endDate) continue;
      
      const startYear = this.parseYearsFromDate(exp.startDate || "");
      const endYear = exp.current 
        ? new Date().getFullYear() 
        : this.parseYearsFromDate(exp.endDate || "");
      
      totalMonths += (endYear - startYear) * 12;
    }
    
    return Math.round(totalMonths / 12);
  }
}

export class RuleBasedCVParser extends BaseCVParser {
  readonly name = "RuleBasedCVParser";
  readonly version = "1.0.0";
  
  private readonly SKILL_KEYWORDS = [
    "javascript", "typescript", "python", "java", "c++", "c#", "ruby", "go", "rust", "php",
    "react", "angular", "vue", "node.js", "nodejs", "express", "django", "flask", "spring",
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "aws", "azure", "gcp",
    "docker", "kubernetes", "jenkins", "ci/cd", "git", "agile", "scrum", "jira",
    "html", "css", "sass", "tailwind", "bootstrap", "figma", "sketch",
    "machine learning", "deep learning", "tensorflow", "pytorch", "nlp",
    "data analysis", "data science", "pandas", "numpy", "tableau", "power bi",
    "project management", "team leadership", "communication", "problem solving",
    "html5", "css3", "rest api", "graphql", "microservices", "devops",
  ];
  
  private readonly LANGUAGE_LEVELS = [
    { pattern: /native|native speaker|bilingual/i, level: "native" as const },
    { pattern: /fluent|professional|proficient/i, level: "professional" as const },
    { pattern: /conversational|intermediate|working proficiency/i, level: "conversational" as const },
    { pattern: /basic|beginner|elementary/i, level: "basic" as const },
  ];
  
  private readonly DEGREE_PATTERNS = [
    { pattern: /phd|ph\.d|doctorate/i, level: "Doctorate" },
    { pattern: /master|mba|msc|ma|ms|m\.a\.|m\.s\.|mba/i, level: "Master's" },
    { pattern: /bachelor|bsc|bs|ba|b\.s\.|b\.a\.|undergraduate/i, level: "Bachelor's" },
    { pattern: /associate|diploma|certificate/i, level: "Associate" },
    { pattern: /high school|secondary|ged/i, level: "High School" },
  ];
  
  private readonly CERTIFICATION_PATTERNS = [
    /aws certified|azure certified|google cloud certified/i,
    /pmp|cpm/i,
    /cpa|cfa|acca/i,
    /scrum master|certified scrum master|psm/i,
    /itil|Prince2/i,
    /comptia|security\+|network\+/i,
  ];

  async parse(cvContent: string | File): Promise<ParsingResult> {
    try {
      let text: string;
      
      if (typeof cvContent === "string") {
        text = this.normalizeText(cvContent);
      } else {
        text = await this.extractTextFromFile(cvContent);
      }
      
      const contactInfo = this.extractContactInfo(text);
      const skills = this.extractSkills(text);
      const experience = this.extractExperience(text);
      const education = this.extractEducation(text);
      const languages = this.extractLanguages(text);
      const certifications = this.extractCertifications(text);
      const summary = this.extractSummary(text);
      
      const totalFieldsFound = 
        (contactInfo.name ? 1 : 0) +
        (contactInfo.email ? 1 : 0) +
        (skills.length > 0 ? 1 : 0) +
        (experience.length > 0 ? 1 : 0) +
        (education.length > 0 ? 1 : 0) +
        (languages.length > 0 ? 1 : 0);
      
      const parsedCV: ParsedCV = {
        id: `PARSED_${Date.now()}`,
        candidateId: "",
        rawText: text,
        parsedAt: new Date().toISOString(),
        contactInfo,
        summary,
        skills: this.deduplicateSkills(skills),
        experience,
        education,
        languages,
        certifications,
        achievements: [],
        totalYearsExperience: this.calculateTotalYearsExperience(experience),
        parseConfidence: this.calculateParseConfidence(
          !!contactInfo.name,
          skills.length > 0,
          experience.length > 0,
          education.length > 0,
          totalFieldsFound,
          6
        ),
        parseErrors: [],
      };
      
      return {
        success: true,
        parsedCV,
        confidence: parsedCV.parseConfidence,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown parsing error",
        confidence: 0,
      };
    }
  }

  isSupported(fileType: string): boolean {
    const supported = [".pdf", ".doc", ".docx", ".txt", "text/plain", "application/pdf"];
    return supported.includes(fileType.toLowerCase());
  }

  extractContactInfo(text: string): ParsedCV["contactInfo"] {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex = /[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}/g;
    
    const emails = text.match(emailRegex);
    const phones = text.match(phoneRegex);
    
    const name = this.extractName(text);
    const location = this.extractLocation(text);
    
    return {
      name: name || undefined,
      email: emails?.[0],
      phone: phones?.[0],
      location: location || undefined,
      linkedIn: this.extractLinkedIn(text),
      website: this.extractWebsite(text),
    };
  }

  extractSkills(text: string): Skill[] {
    const foundSkills: Skill[] = [];
    const textLower = text.toLowerCase();
    
    for (const skillName of this.SKILL_KEYWORDS) {
      if (textLower.includes(skillName)) {
        const level = this.estimateSkillLevel(text, skillName);
        foundSkills.push({
          name: skillName,
          level,
          verified: false,
        });
      }
    }
    
    const softwareMatch = text.match(/(?:software|tools|technologies)[:\s]+([^\n]+)/i);
    if (softwareMatch) {
      const tools = softwareMatch[1].split(/[,;•|]/).map(t => t.trim()).filter(t => t.length > 1);
      for (const tool of tools) {
        if (!foundSkills.some(s => s.name.toLowerCase() === tool.toLowerCase())) {
          foundSkills.push({
            name: tool,
            level: this.estimateSkillLevel(text, tool),
            verified: false,
          });
        }
      }
    }
    
    return foundSkills;
  }

  extractExperience(text: string): WorkExperience[] {
    const experiences: WorkExperience[] = [];
    const experienceSection = this.findSection(text, "experience");
    
    if (!experienceSection) return experiences;
    
    const expBlocks = experienceSection.split(/\n(?=[A-Z])/);
    
    for (const block of expBlocks) {
      if (block.length < 20) continue;
      
      const titleMatch = block.match(/^([A-Z][^\n]+)/);
      const companyMatch = block.match(/at\s+([^\n,]+)|company[:\s]+([^\n,]+)/i);
      const dateMatch = block.match(/(?:\w+\s+)?\d{4}\s*[-–—]\s*(?:\w+\s+)?\d{4}|present|current|\d{4}\s*[-–—]\s*present/i);
      
      if (titleMatch) {
        experiences.push({
          company: companyMatch?.[1] || companyMatch?.[2] || "Unknown Company",
          title: titleMatch[1].trim(),
          location: this.extractLocation(block),
          startDate: dateMatch ? this.extractDateRange(dateMatch[0])?.start : undefined,
          endDate: dateMatch ? this.extractDateRange(dateMatch[0])?.end : undefined,
          current: /present|current/i.test(block),
          description: block.substring(0, 200),
          skills: this.extractSkills(block).map(s => s.name),
        });
      }
    }
    
    return experiences;
  }

  extractEducation(text: string): Education[] {
    const education: Education[] = [];
    const educationSection = this.findSection(text, "education");
    
    if (!educationSection) return education;
    
    const degree = this.detectDegree(educationSection);
    const institution = this.extractInstitution(educationSection);
    const field = this.extractField(educationSection);
    const yearMatch = educationSection.match(/\b(19|20)\d{2}\b/);
    
    if (degree || institution) {
      education.push({
        institution: institution || "Unknown Institution",
        degree: degree || "Not specified",
        field: field || "Not specified",
        graduationYear: yearMatch ? parseInt(yearMatch[0], 10) : undefined,
      });
    }
    
    return education;
  }

  extractLanguages(text: string): Language[] {
    const languages: Language[] = [];
    const languageSection = this.findSection(text, "language");
    
    if (!languageSection) return languages;
    
    const commonLanguages = [
      "english", "french", "arabic", "spanish", "german", "italian", "portuguese",
      "chinese", "japanese", "korean", "russian", "hindi", "urdu",
    ];
    
    for (const lang of commonLanguages) {
      if (languageSection.toLowerCase().includes(lang)) {
        let level: Language["level"] = "basic";
        
        for (const { pattern, level: lvl } of this.LANGUAGE_LEVELS) {
          if (pattern.test(languageSection)) {
            level = lvl;
            break;
          }
        }
        
        languages.push({
          name: lang.charAt(0).toUpperCase() + lang.slice(1),
          level,
        });
      }
    }
    
    return languages;
  }

  extractCertifications(text: string): string[] {
    const certifications: string[] = [];
    
    for (const pattern of this.CERTIFICATION_PATTERNS) {
      const matches = text.match(pattern);
      if (matches) {
        certifications.push(...matches);
      }
    }
    
    const certSection = this.findSection(text, "certification");
    if (certSection) {
      const certs = certSection.split(/[,;\n]/).map(c => c.trim()).filter(c => c.length > 3);
      certifications.push(...certs);
    }
    
    return [...new Set(certifications)];
  }

  extractSummary(text: string): string | undefined {
    const summarySection = this.findSection(text, "summary");
    if (summarySection && summarySection.length > 50) {
      return summarySection.substring(0, 300).trim();
    }
    
    const objectiveSection = this.findSection(text, "objective");
    if (objectiveSection && objectiveSection.length > 30) {
      return objectiveSection.substring(0, 300).trim();
    }
    
    return undefined;
  }

  private async extractTextFromFile(file: File): Promise<string> {
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      return await file.text();
    }
    
    return `[CV file: ${file.name}]\n${file.name} content would be parsed by a document parsing library in production.`;
  }

  private extractName(text: string): string | undefined {
    const lines = text.split("\n").filter(line => line.trim().length > 0);
    
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      if (firstLine.length > 2 && firstLine.length < 50 && !firstLine.includes("@")) {
        const words = firstLine.split(/\s+/);
        if (words.length >= 2 && words.length <= 4) {
          const hasEmail = words.some(w => w.includes("@"));
          const hasNumber = words.some(w => /\d{3}/.test(w));
          if (!hasEmail && !hasNumber) {
            return firstLine;
          }
        }
      }
    }
    
    return undefined;
  }

  private extractLocation(text: string): string | undefined {
    const locationPatterns = [
      /(?:location|address|city|based in)[:\s]+([^\n,]+)/i,
      /([A-Za-z\s]+,\s*[A-Z]{2})\s*\d{5}/,
    ];
    
    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return undefined;
  }

  private extractLinkedIn(text: string): string | undefined {
    const linkedInRegex = /(?:linkedin\.com\/in\/|linkedin:?\s*)([a-zA-Z0-9-]+)/i;
    const match = text.match(linkedInRegex);
    return match ? `linkedin.com/in/${match[1]}` : undefined;
  }

  private extractWebsite(text: string): string | undefined {
    const websiteRegex = /(?:website|portfolio|site)[:\s]+([^\s]+)/i;
    const match = text.match(websiteRegex);
    return match ? match[1] : undefined;
  }

  private extractDateRange(dateStr: string): { start?: string; end?: string } | null {
    const years = dateStr.match(/\d{4}/g);
    if (!years || years.length === 0) return null;
    
    const result: { start?: string; end?: string } = {};
    
    if (years.length === 1) {
      if (/present|current/i.test(dateStr)) {
        result.start = years[0];
        result.end = undefined;
      } else {
        result.start = years[0];
        result.end = years[0];
      }
    } else if (years.length === 2) {
      result.start = years[0];
      result.end = years[1];
    }
    
    return result;
  }

  private detectDegree(text: string): string | undefined {
    for (const { pattern, level } of this.DEGREE_PATTERNS) {
      if (pattern.test(text)) {
        return level;
      }
    }
    return undefined;
  }

  private extractInstitution(text: string): string | undefined {
    const institutions = [
      "university", "college", "institute", "school", "academy",
      "MIT", "Harvard", "Stanford", "Oxford", "Cambridge", "Yale",
      "MIT", "UCLA", "NYU", "Columbia", "Princeton",
    ];
    
    const textLower = text.toLowerCase();
    
    for (const inst of institutions) {
      const pattern = new RegExp(`${inst}[\\w\\s-]*`, "i");
      const match = text.match(pattern);
      if (match) {
        return match[0].trim();
      }
    }
    
    return undefined;
  }

  private extractField(text: string): string | undefined {
    const fieldMatch = text.match(/(?:study|field|major|concentration)[:\s]+([^\n,]+)/i);
    return fieldMatch ? fieldMatch[1].trim() : undefined;
  }

  private estimateSkillLevel(text: string, skill: string): Skill["level"] {
    const textLower = text.toLowerCase();
    const skillIndex = textLower.indexOf(skill.toLowerCase());
    
    if (skillIndex === -1) return "intermediate";
    
    const context = textLower.substring(
      Math.max(0, skillIndex - 50),
      Math.min(textLower.length, skillIndex + skill.length + 50)
    );
    
    if (/senior|expert|lead|principal|staff/i.test(context)) {
      return "expert";
    }
    if (/advanced|proficient|strong/i.test(context)) {
      return "advanced";
    }
    if (/basic|fundamental|familiar/i.test(context)) {
      return "beginner";
    }
    
    return "intermediate";
  }
}

export class AICVParser extends BaseCVParser {
  readonly name = "AICVParser";
  readonly version = "1.0.0";
  
  private ruleBasedParser: RuleBasedCVParser;
  private apiKey?: string;
  private model?: string;
  
  constructor(apiKey?: string, model?: string) {
    super();
    this.ruleBasedParser = new RuleBasedCVParser();
    this.apiKey = apiKey;
    this.model = model || "gpt-4";
  }
  
  async parse(cvContent: string | File): Promise<ParsingResult> {
    const baseResult = await this.ruleBasedParser.parse(cvContent);
    
    if (!this.apiKey) {
      return baseResult;
    }
    
    try {
      const text = typeof cvContent === "string" 
        ? cvContent 
        : await this.extractTextFromFile(cvContent);
      
      const aiEnhancedCV = await this.enhanceWithAI(text, baseResult.parsedCV);
      
      return {
        success: true,
        parsedCV: aiEnhancedCV,
        confidence: Math.min(baseResult.confidence + 15, 100),
      };
    } catch (error) {
      console.warn("AI enhancement failed, using rule-based result:", error);
      return baseResult;
    }
  }
  
  isSupported(fileType: string): boolean {
    return this.ruleBasedParser.isSupported(fileType);
  }
  
  extractContactInfo(text: string): ParsedCV["contactInfo"] {
    return this.ruleBasedParser.extractContactInfo(text);
  }
  
  extractSkills(text: string): Skill[] {
    return this.ruleBasedParser.extractSkills(text);
  }
  
  extractExperience(text: string): WorkExperience[] {
    return this.ruleBasedParser.extractExperience(text);
  }
  
  extractEducation(text: string): Education[] {
    return this.ruleBasedParser.extractEducation(text);
  }
  
  extractLanguages(text: string): Language[] {
    return this.ruleBasedParser.extractLanguages(text);
  }
  
  extractSummary(text: string): string | undefined {
    return this.ruleBasedParser.extractSummary(text);
  }
  
  extractCertifications(text: string): string[] {
    return this.ruleBasedParser.extractCertifications(text);
  }
  
  private async enhanceWithAI(text: string, baseCV?: ParsedCV): Promise<ParsedCV> {
    const prompt = `
You are an expert HR recruiter analyzing a CV/resume. Extract and enhance the following information:

CV Content:
${text.substring(0, 4000)}

Return a JSON object with the following structure:
{
  "summary": "2-3 sentence professional summary",
  "keyStrengths": ["strength1", "strength2", "strength3"],
  "careerHighlights": ["achievement1", "achievement2"],
  "overallAssessment": "Brief assessment of candidate fit"
}

Only return valid JSON, no markdown or additional text.
`;
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content || !baseCV) {
      return baseCV!;
    }
    
    try {
      const aiData = JSON.parse(content);
      
      return {
        ...baseCV,
        summary: aiData.summary || baseCV.summary,
        achievements: [...(baseCV.achievements || []), ...(aiData.careerHighlights || [])],
      };
    } catch {
      return baseCV;
    }
  }
  
  private async extractTextFromFile(file: File): Promise<string> {
    return this.ruleBasedParser.parse(file).then(r => r.parsedCV?.rawText || "");
  }
}

export function createCVParser(
  type: "rule-based" | "ai",
  options?: { apiKey?: string; model?: string }
): ICVParser {
  switch (type) {
    case "ai":
      return new AICVParser(options?.apiKey, options?.model);
    case "rule-based":
    default:
      return new RuleBasedCVParser();
  }
}