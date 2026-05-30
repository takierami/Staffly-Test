import { useState, useEffect, useMemo, useCallback } from "react";
import { Briefcase, Plus, MapPin, Users, Star, ArrowRight, Edit, Trash2, X, Save, Search, Filter, Mail, Phone, FileText, CheckCircle2, MessageSquare, List, Upload, Brain, Zap, Target, TrendingUp, AlertCircle, Sparkles, ChevronDown, ChevronUp, Eye, RefreshCw, XCircle, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import type { Candidate, JobPosting } from "../data/mock-data";
import { getATSService } from "../lib/ats";
import type { CandidateMatch, ParsedCV } from "../lib/ats/types";

const stages = ["applied", "screening", "interview", "offer", "hired"];

const getRecommendationConfig = (recommendation?: CandidateMatch["atsRecommendation"]) => {
  switch (recommendation) {
    case "strong_match":
      return { label: "Strong Match", color: "#059669", bg: "bg-green-100", icon: CheckCircle2 };
    case "potential_match":
      return { label: "Potential Match", color: "#D97706", bg: "bg-amber-100", icon: Target };
    case "needs_review":
      return { label: "Needs Review", color: "#7C3AED", bg: "bg-purple-100", icon: AlertCircle };
    case "below_threshold":
    default:
      return { label: "Below Threshold", color: "#DC2626", bg: "bg-red-100", icon: XCircle };
  }
};

export function Recruitment() {
  const { t, theme, jobPostings, candidates, addJobPosting, updateJobPosting, deleteJobPosting, addCandidate, updateCandidate, deleteCandidate, customDepartments } = useApp();
  const [tab, setTab] = useState<"jobs" | "pipeline" | "list">("jobs");
  const [showJobForm, setShowJobForm] = useState(false);
  const [showCandForm, setShowCandForm] = useState(false);
  const [editJobId, setEditJobId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "job" | "candidate"; id: string } | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState<string>("all");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [scorecardTab, setScorecardTab] = useState<"ai" | "scorecard" | "notes">("ai");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [parsingCV, setParsingCV] = useState(false);
  const [showJobRequirements, setShowJobRequirements] = useState(false);
  const [jobRequirements, setJobRequirements] = useState<{ skills: string[]; minExperience: number; education: string }>({ skills: [], minExperience: 0, education: "" });
  const [skillsInput, setSkillsInput] = useState("");

  const atsService = useMemo(() => getATSService(), []);
  const [candidateMatches, setCandidateMatches] = useState<Map<string, CandidateMatch>>(new Map());
  const [parsedCVs, setParsedCVs] = useState<Map<string, ParsedCV>>(new Map());
  
  const [jobForm, setJobForm] = useState({ 
    title: "", 
    department: "", 
    location: "", 
    type: "full-time" as "full-time" | "part-time" | "contract", 
    status: "open" as "open" | "closed" | "draft",
    description: "",
    requirements: "",
    skills: [] as string[],
    experienceRequired: 0,
    educationRequired: "",
  });
  
  const [candForm, setCandForm] = useState({ 
    name: "", 
    email: "", 
    jobId: "", 
    stage: "applied" as any, 
    rating: 0,
    cvDocumentId: "",
    parsedCVId: "",
  });

  const isDark = theme === "dark";
  const cardBg = isDark ? "#1F2937" : "#ffffff";
  const borderColor = isDark ? "#374151" : "#F3F4F6";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const textMuted = isDark ? "#6B7280" : "#9CA3AF";
  const inputBg = isDark ? "#374151" : "#F9FAFB";
  const inputBorder = isDark ? "#4B5563" : "#E5E7EB";

  const stageLabels: Record<string, string> = { applied: t("rec.applied"), screening: t("rec.screening"), interview: t("rec.interview"), offer: t("rec.offer"), hired: t("rec.hired") };
  const stageColors: Record<string, { bg: string; text: string; border: string }> = {
    applied: { bg: isDark ? "bg-[#374151]" : "bg-[#F3F4F6]", text: isDark ? "text-[#D1D5DB]" : "text-[#6B7280]", border: isDark ? "border-[#4B5563]" : "border-[#E5E7EB]" },
    screening: { bg: isDark ? "bg-[#78350F]" : "bg-[#FEF3C7]", text: "text-[#D97706]", border: isDark ? "border-[#92400E]" : "border-[#FDE68A]" },
    interview: { bg: isDark ? "bg-[#1E3A5F]" : "bg-[#DBEAFE]", text: "text-[var(--acc-primary-strong)]", border: isDark ? "border-[#1E40AF]" : "border-[#93C5FD]" },
    offer: { bg: isDark ? "bg-[var(--acc-tint-dark)]" : "bg-[var(--acc-tint-light)]", text: "text-[var(--acc-primary-strong)]", border: isDark ? "border-[var(--acc-primary)]" : "border-[#93C5FD]" },
    hired: { bg: isDark ? "bg-[#064E3B]" : "bg-[#D1FAE5]", text: "text-[#059669]", border: isDark ? "border-[#065F46]" : "border-[#6EE7B7]" },
  };

  useEffect(() => {
    candidates.forEach(candidate => {
      if (candidate.atsData?.parsedCVId) {
        const job = jobPostings.find(j => j.id === candidate.jobId);
        if (job) {
          const match = atsService.calculateCandidateMatch(
            { ...candidate, parsedCV: parsedCVs.get(candidate.atsData!.parsedCVId!) },
            { ...job, description: job.description || "", responsibilities: [] }
          );
          setCandidateMatches(prev => new Map(prev).set(candidate.id, match));
        }
      }
    });
  }, [candidates, jobPostings, atsService, parsedCVs]);

  const handleParseCV = useCallback(async (file: File, candidateId: string) => {
    setParsingCV(true);
    try {
      const resumeService = atsService.getResumeService();
      const result = await resumeService.uploadAndParse(file, candidateId);
      
      if (result.parsingResult.success && result.parsingResult.parsedCV) {
        setParsedCVs(prev => new Map(prev).set(result.parsingResult.parsedCV!.id, result.parsingResult.parsedCV!));
        toast.success(t("rec.parseComplete"));
        return result.parsingResult.parsedCV;
      } else {
        toast.error(result.parsingResult.error || t("rec.parseFailed"));
        return null;
      }
    } catch (error) {
      toast.error(t("rec.parseFailed"));
      return null;
    } finally {
      setParsingCV(false);
    }
  }, [atsService, t]);

  const handleRecalculateMatches = useCallback(() => {
    let matchCount = 0;
    candidates.forEach(candidate => {
      const job = jobPostings.find(j => j.id === candidate.jobId);
      if (job && candidate.atsData?.parsedCVId) {
        const parsedCV = parsedCVs.get(candidate.atsData.parsedCVId!);
        if (parsedCV) {
          atsService.createJobRequirement(job.id, {
            skills: job.skills?.map(s => ({ name: s })) || [],
            minimumYearsExperience: job.experienceRequired || 0,
            requiredEducation: job.educationRequired ? [{ institution: "", degree: job.educationRequired, field: "" }] : [],
            description: job.description,
          });
          
          const match = atsService.calculateCandidateMatch(
            { ...candidate, parsedCV },
            { ...job, description: job.description || "", responsibilities: [], skills: [], requiredEducation: [] }
          );
          
          setCandidateMatches(prev => new Map(prev).set(candidate.id, match));
          matchCount++;
        }
      }
    });
    toast.success(`Recalculated ${matchCount} matches`);
  }, [candidates, jobPostings, atsService, parsedCVs]);

  const addSkill = () => {
    if (skillsInput.trim() && !jobRequirements.skills.includes(skillsInput.trim())) {
      setJobRequirements(prev => ({ ...prev, skills: [...prev.skills, skillsInput.trim()] }));
      setSkillsInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setJobRequirements(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const moveCandidate = (id: string, newStage: string) => {
    updateCandidate(id, { stage: newStage as any });
    if (selectedCandidate?.id === id) {
      setSelectedCandidate({ ...selectedCandidate, stage: newStage as any });
    }
    toast.success(t("rec.moveToNext") + " " + stageLabels[newStage]);
  };

  const updateScorecard = (id: string, field: string, value: number) => {
    const c = candidates.find(can => can.id === id);
    if (!c) return;
    const newScorecard = { ...(c.scorecard || { technical: 0, culture: 0, communication: 0 }), [field]: value };
    updateCandidate(id, { scorecard: newScorecard });
    if (selectedCandidate?.id === id) setSelectedCandidate({ ...selectedCandidate, scorecard: newScorecard });
  };

  const handleJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const jobData = { 
      ...jobForm, 
      skills: jobRequirements.skills,
      experienceRequired: jobRequirements.minExperience,
      educationRequired: jobRequirements.education,
    };
    
    if (editJobId) {
      updateJobPosting(editJobId, jobData);
      toast.success("Job posting updated");
    } else {
      const newJob = { 
        id: `JOB${String(Date.now()).slice(-6)}`, 
        ...jobData, 
        applicants: 0, 
        postedDate: new Date().toISOString().split("T")[0] 
      };
      addJobPosting(newJob);
      
      atsService.createJobRequirement(newJob.id, {
        skills: jobRequirements.skills.map(s => ({ name: s })),
        minimumYearsExperience: jobRequirements.minExperience,
        requiredEducation: jobRequirements.education ? [{ institution: "", degree: jobRequirements.education, field: "" }] : [],
        description: jobForm.description,
      });
      
      toast.success("Job posting created");
    }
    setShowJobForm(false);
    setEditJobId(null);
    setJobForm({ title: "", department: "", location: "", type: "full-time", status: "open", description: "", requirements: "", skills: [], experienceRequired: 0, educationRequired: "" });
    setJobRequirements({ skills: [], minExperience: 0, education: "" });
  };

  const handleCandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const job = jobPostings.find((j) => j.id === candForm.jobId);
    
    let atsData: Candidate["atsData"] = {};
    
    if (cvFile) {
      const tempId = `CAN${String(Date.now()).slice(-6)}`;
      const parsedCV = await handleParseCV(cvFile, tempId);
      if (parsedCV) {
        atsData = {
          cvDocumentId: parsedCV.id,
          parsedCVId: parsedCV.id,
          parsedSkills: parsedCV.skills?.map(s => s.name) || [],
          totalYearsExperience: parsedCV.totalYearsExperience,
          educationLevel: parsedCV.education?.[0]?.degree,
          parsedAt: new Date().toISOString(),
        };
      }
    }
    
    const newCandidate: Candidate = { 
      id: `CAN${String(Date.now()).slice(-6)}`, 
      ...candForm, 
      jobTitle: job?.title || "", 
      appliedDate: new Date().toISOString().split("T")[0],
      aiSummary: [],
      scorecard: { technical: 0, culture: 0, communication: 0 },
      notes: [],
      atsData,
    };
    
    addCandidate(newCandidate);
    
    if (cvFile) {
      setCvFile(null);
    }
    
    toast.success("Candidate added");
    setShowCandForm(false);
    setCandForm({ name: "", email: "", jobId: "", stage: "applied", rating: 0, cvDocumentId: "", parsedCVId: "" });
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === "job") { deleteJobPosting(deleteConfirm.id); toast.success("Job deleted"); }
    else { 
      deleteCandidate(deleteConfirm.id); 
      if (selectedCandidate?.id === deleteConfirm.id) setSelectedCandidate(null);
      toast.success("Candidate removed"); 
    }
    setDeleteConfirm(null);
  };

  const editJob = (id: string) => {
    const job = jobPostings.find((j) => j.id === id);
    if (!job) return;
    setJobForm({ 
      title: job.title, 
      department: job.department, 
      location: job.location, 
      type: job.type, 
      status: job.status,
      description: job.description || "",
      requirements: job.requirements || "",
      skills: job.skills || [],
      experienceRequired: job.experienceRequired || 0,
      educationRequired: job.educationRequired || "",
    });
    setJobRequirements({
      skills: job.skills || [],
      minExperience: job.experienceRequired || 0,
      education: job.educationRequired || "",
    });
    setEditJobId(id);
    setShowJobForm(true);
  };

  const inputClass = "w-full px-3 py-2.5 rounded-lg outline-none focus:border-[var(--acc-primary-strong)] focus:ring-2 focus:ring-[var(--acc-primary-strong)]/10 transition-all";

  const filteredCandidates = candidates.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStage = filterStage === "all" || c.stage === filterStage;
    return matchSearch && matchStage;
  });

  const getCandidateMatch = (candidateId: string) => candidateMatches.get(candidateId);
  const getCandidateParsedCV = (candidateId: string) => {
    const c = candidates.find(can => can.id === candidateId);
    if (c?.atsData?.parsedCVId) {
      return parsedCVs.get(c.atsData.parsedCVId!);
    }
    return null;
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 style={{ fontSize: 24, fontWeight: 700, color: textPrimary }}>{t("rec.title")}</h2>
        <div className="flex gap-2">
          {(tab === "pipeline" || tab === "list") && (
            <button onClick={() => setShowCandForm(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg" style={{ fontSize: 13, fontWeight: 600, backgroundColor: isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)", color: "var(--acc-primary-strong)" }}>
              <Plus className="w-4 h-4" /> Add Candidate
            </button>
          )}
          <button onClick={() => { setEditJobId(null); setJobForm({ title: "", department: "", location: "", type: "full-time", status: "open" }); setShowJobForm(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg" style={{ fontSize: 13, fontWeight: 600 }}>
            <Plus className="w-4 h-4" /> {t("rec.postNewJob")}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
        <div className="flex gap-2 pb-0">
          {(["jobs", "pipeline", "list"] as const).map((tKey) => (
            <button key={tKey} onClick={() => setTab(tKey)} className="-mb-px border-b-2 px-4 py-2.5 transition-colors" style={{ fontSize: 14, fontWeight: tab === tKey ? 600 : 400, borderColor: tab === tKey ? "var(--acc-primary-strong)" : "transparent", color: tab === tKey ? "var(--acc-primary-strong)" : textSecondary }}>
              {tKey === "jobs" ? t("rec.jobPostings") : tKey === "pipeline" ? t("rec.candidatePipeline") : "List View"}
            </button>
          ))}
        </div>
        
        {(tab === "pipeline" || tab === "list") && (
          <div className="flex gap-2 mb-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: textMuted }} />
              <input type="text" placeholder="Search candidates..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 pr-3 py-2 rounded-lg outline-none" style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary, width: 200 }} />
            </div>
            <select value={filterStage} onChange={e => setFilterStage(e.target.value)} className="px-3 py-2 rounded-lg outline-none" style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}>
              <option value="all">All Stages</option>
              {stages.map(s => <option key={s} value={s}>{stageLabels[s]}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Forms */}
      {showJobForm && (
        <form onSubmit={handleJobSubmit} className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: cardBg, borderColor }}>
          <div className="flex items-center justify-between">
            <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }}>{editJobId ? "Edit Job Posting" : "New Job Posting"}</h3>
            <button type="button" onClick={() => { setShowJobForm(false); setEditJobId(null); setJobRequirements({ skills: [], minExperience: 0, education: "" }); }}><X className="w-4 h-4" style={{ color: textSecondary }} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="sm:col-span-2"><label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Job Title</label><input required value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} /></div>
            <div><label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Department</label><select value={jobForm.department} onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}><option value="">Select</option>{customDepartments.map((d) => <option key={d} value={d}>{d}</option>)}</select></div>
            <div><label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Location</label><input value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} /></div>
            <div><label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Type</label><select value={jobForm.type} onChange={(e) => setJobForm({ ...jobForm, type: e.target.value as any })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}><option value="full-time">Full-time</option><option value="part-time">Part-time</option><option value="contract">Contract</option></select></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Description</label>
              <textarea value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} className={inputClass} rows={3} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary, resize: "vertical" }} placeholder="Job description..." />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Requirements</label>
              <textarea value={jobForm.requirements} onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })} className={inputClass} rows={3} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary, resize: "vertical" }} placeholder="Job requirements..." />
            </div>
          </div>
          
          <div className="border-t pt-4" style={{ borderColor }}>
            <button 
              type="button" 
              onClick={() => setShowJobRequirements(!showJobRequirements)}
              className="flex items-center gap-2 text-sm font-medium mb-3"
              style={{ color: "var(--acc-primary-strong)" }}
            >
              <Brain className="w-4 h-4" />
              ATS Job Requirements (Optional)
              {showJobRequirements ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {showJobRequirements && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Minimum Experience (years)</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={jobRequirements.minExperience} 
                    onChange={(e) => setJobRequirements({ ...jobRequirements, minExperience: parseInt(e.target.value) || 0 })}
                    className={inputClass}
                    style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
                  />
                </div>
                <div>
                  <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Education Level</label>
                  <select 
                    value={jobRequirements.education} 
                    onChange={(e) => setJobRequirements({ ...jobRequirements, education: e.target.value })}
                    className={inputClass}
                    style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
                  >
                    <option value="">Any</option>
                    <option value="high school">High School</option>
                    <option value="associate">Associate Degree</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>
                <div className="sm:col-span-1">
                  <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Required Skills</label>
                  <div className="flex gap-2 mb-2">
                    <input 
                      type="text" 
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      className={inputClass}
                      style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
                      placeholder="Add skill..."
                    />
                    <button type="button" onClick={addSkill} className="px-3 py-2 rounded-lg" style={{ backgroundColor: "var(--acc-primary)", color: "white", fontSize: 13 }}><Plus className="w-4 h-4" /></button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {jobRequirements.skills.map(skill => (
                      <span key={skill} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ backgroundColor: isDark ? "#374151" : "#E5E7EB", color: textPrimary }}>
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg" style={{ fontSize: 13, fontWeight: 600 }}><Save className="w-4 h-4" /> {editJobId ? "Update" : "Post Job"}</button>
            <button type="button" onClick={() => { setShowJobForm(false); setEditJobId(null); setJobRequirements({ skills: [], minExperience: 0, education: "" }); }} className="px-5 py-2.5 rounded-lg" style={{ fontSize: 13, fontWeight: 500, backgroundColor: isDark ? "#374151" : "#F3F4F6", color: textPrimary }}>Cancel</button>
          </div>
        </form>
      )}

      {showCandForm && (
        <form onSubmit={handleCandSubmit} className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: cardBg, borderColor }}>
          <div className="flex items-center justify-between">
            <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }}>Add Candidate</h3>
            <button type="button" onClick={() => setShowCandForm(false)}><X className="w-4 h-4" style={{ color: textSecondary }} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div><label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Name</label><input required value={candForm.name} onChange={(e) => setCandForm({ ...candForm, name: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} /></div>
            <div><label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Email</label><input type="email" required value={candForm.email} onChange={(e) => setCandForm({ ...candForm, email: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} /></div>
            <div><label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Job</label><select required value={candForm.jobId} onChange={(e) => setCandForm({ ...candForm, jobId: e.target.value })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}><option value="">Select</option>{jobPostings.filter((j) => j.status === "open").map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}</select></div>
            <div><label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Rating (0-5)</label><input type="number" min="0" max="5" value={candForm.rating} onChange={(e) => setCandForm({ ...candForm, rating: parseInt(e.target.value) || 0 })} className={inputClass} style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} /></div>
          </div>
          
          <div>
            <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload CV/Resume (Optional)
              </span>
            </label>
            <div 
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-[var(--acc-primary-strong)] transition-colors"
              style={{ borderColor: cvFile ? "var(--acc-primary)" : inputBorder }}
              onClick={() => document.getElementById("cv-upload")?.click()}
            >
              <input 
                id="cv-upload"
                type="file" 
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setCvFile(file);
                }}
                className="hidden"
              />
              {cvFile ? (
                <div className="flex items-center justify-center gap-2" style={{ color: "var(--acc-primary-strong)" }}>
                  <FileText className="w-5 h-5" />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{cvFile.name}</span>
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); setCvFile(null); }}
                    className="ml-2 p-1 rounded hover:bg-black/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div style={{ color: textMuted }}>
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <p style={{ fontSize: 13 }}>Click to upload or drag and drop</p>
                  <p style={{ fontSize: 11 }}>PDF, DOC, DOCX, or TXT</p>
                </div>
              )}
            </div>
            {cvFile && (
              <p className="mt-1 flex items-center gap-1" style={{ fontSize: 11, color: "var(--acc-primary-strong)" }}>
                <Sparkles className="w-3 h-3" />
                CV will be automatically parsed for skills and experience
              </p>
            )}
          </div>
          
          <div className="flex gap-3">
            <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg" style={{ fontSize: 13, fontWeight: 600 }}>
              {parsingCV ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
              {parsingCV ? "Parsing..." : "Add"}
            </button>
            <button type="button" onClick={() => { setShowCandForm(false); setCvFile(null); }} className="px-5 py-2.5 rounded-lg" style={{ fontSize: 13, fontWeight: 500, backgroundColor: isDark ? "#374151" : "#F3F4F6", color: textPrimary }}>Cancel</button>
          </div>
        </form>
      )}

      {tab === "jobs" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {jobPostings.map((job) => (
            <div key={job.id} className="rounded-xl border p-5 hover:shadow-md transition-all" style={{ backgroundColor: cardBg, borderColor }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }}>{job.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1" style={{ fontSize: 12, color: textSecondary }}><Briefcase className="w-3.5 h-3.5" />{job.department}</span>
                    <span className="flex items-center gap-1" style={{ fontSize: 12, color: textSecondary }}><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md" style={{ fontSize: 11, fontWeight: 600, backgroundColor: job.status === "open" ? (isDark ? "#064E3B" : "#D1FAE5") : (isDark ? "#374151" : "#F3F4F6"), color: job.status === "open" ? "#059669" : textSecondary }}>{job.status}</span>
                  <button onClick={() => editJob(job.id)} className="p-1.5 rounded hover:bg-[var(--acc-tint-light)]" style={{ color: textSecondary }}><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteConfirm({ type: "job", id: job.id })} className="p-1.5 rounded hover:bg-[#FEE2E2]" style={{ color: textSecondary }}><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${borderColor}` }}>
                <span className="flex items-center gap-1.5" style={{ fontSize: 12, color: textSecondary }}><Users className="w-3.5 h-3.5" />{candidates.filter((c) => c.jobId === job.id).length} {t("rec.applicants")}</span>
                <span style={{ fontSize: 12, color: textMuted }}>{t("rec.posted")} {job.postedDate}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "pipeline" && (
        <div className="mb-4 flex justify-end">
          <button 
            onClick={handleRecalculateMatches}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white"
            style={{ fontSize: 12, fontWeight: 600, backgroundColor: "var(--acc-primary)" }}
          >
            <RefreshCw className="w-4 h-4" />
            Recalculate Matches
          </button>
        </div>
      )}
      
      {tab === "pipeline" && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[900px]">
            {stages.map((stage) => {
              const sc = stageColors[stage];
              const stageCandidates = filteredCandidates.filter((c) => c.stage === stage);
              return (
                <div key={stage} className="flex-1 min-w-[200px]">
                  <div className={`${sc.bg} ${sc.text} px-3 py-2 rounded-lg mb-3 flex items-center justify-between`}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{stageLabels[stage]}</span>
                    <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center" style={{ fontSize: 12, fontWeight: 600 }}>{stageCandidates.length}</span>
                  </div>
                  <div className="space-y-3">
                    {stageCandidates.map((c) => {
                      const match = getCandidateMatch(c.id);
                      const hasMatch = match && match.overallScore > 0;
                      
                      return (
                        <div key={c.id} onClick={() => setSelectedCandidate(c)} className={`rounded-lg border ${sc.border} p-4 cursor-pointer hover:shadow-md transition-shadow`} style={{ backgroundColor: selectedCandidate?.id === c.id ? (isDark ? "#374151" : "#F9FAFB") : cardBg }}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--acc-primary-strong)] to-[#EC4899] flex items-center justify-center text-white shrink-0" style={{ fontSize: 11, fontWeight: 600 }}>{c.name.split(" ").map((n) => n[0]).join("")}</div>
                            <div className="flex-1 min-w-0"><div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }} className="truncate">{c.name}</div><div style={{ fontSize: 11, color: textMuted }} className="truncate">{c.jobTitle}</div></div>
                          </div>
                          
                          {hasMatch && (
                            <div className="mb-2 p-2 rounded-lg" style={{ backgroundColor: isDark ? "#1F2937" : "#F9FAFB" }}>
                              <div className="flex items-center justify-between mb-1">
                                <span style={{ fontSize: 10, color: textMuted }}>ATS Match</span>
                                <span className="font-bold" style={{ fontSize: 12, color: getRecommendationConfig(match.atsRecommendation).color }}>
                                  {match.overallScore}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: isDark ? "#374151" : "#E5E7EB" }}>
                                <div 
                                  className="h-full rounded-full" 
                                  style={{ 
                                    width: `${match.overallScore}%`,
                                    backgroundColor: getRecommendationConfig(match.atsRecommendation).color 
                                  }} 
                                />
                              </div>
                            </div>
                          )}
                          
                          {c.rating > 0 && <div className="flex gap-0.5 mb-2">{[1,2,3,4,5].map((s) => <Star key={s} className={`w-3 h-3 ${s <= c.rating ? "text-[#F59E0B] fill-[#F59E0B]" : "text-[#E5E7EB]"}`} />)}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "list" && (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: cardBg, borderColor }}>
          <table className="w-full text-left">
            <thead style={{ backgroundColor: isDark ? "#374151" : "#F9FAFB", borderBottom: `1px solid ${borderColor}` }}>
              <tr>
                <th className="px-4 py-3" style={{ fontSize: 12, fontWeight: 600, color: textSecondary }}>Candidate Name</th>
                <th className="px-4 py-3" style={{ fontSize: 12, fontWeight: 600, color: textSecondary }}>Job Role</th>
                <th className="px-4 py-3" style={{ fontSize: 12, fontWeight: 600, color: textSecondary }}>Stage</th>
                <th className="px-4 py-3" style={{ fontSize: 12, fontWeight: 600, color: textSecondary }}>Applied</th>
                <th className="px-4 py-3" style={{ fontSize: 12, fontWeight: 600, color: textSecondary }}>ATS Score</th>
                <th className="px-4 py-3" style={{ fontSize: 12, fontWeight: 600, color: textSecondary }}>Rating</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map(c => {
                const match = getCandidateMatch(c.id);
                const hasMatch = match && match.overallScore > 0;
                const recConfig = hasMatch ? getRecommendationConfig(match.atsRecommendation) : null;
                
                return (
                  <tr key={c.id} onClick={() => setSelectedCandidate(c)} className="cursor-pointer transition-colors" style={{ borderBottom: `1px solid ${borderColor}`, backgroundColor: selectedCandidate?.id === c.id ? (isDark ? "#374151" : "#F9FAFB") : "transparent" }}>
                    <td className="px-4 py-3 font-medium" style={{ fontSize: 13, color: textPrimary }}>{c.name}</td>
                    <td className="px-4 py-3" style={{ fontSize: 13, color: textSecondary }}>{c.jobTitle}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md ${stageColors[c.stage].bg} ${stageColors[c.stage].text}`} style={{ fontSize: 11, fontWeight: 600 }}>{stageLabels[c.stage]}</span>
                    </td>
                    <td className="px-4 py-3" style={{ fontSize: 13, color: textSecondary }}>{c.appliedDate}</td>
                    <td className="px-4 py-3">
                      {hasMatch ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold" style={{ fontSize: 13, color: recConfig?.color }}>{match.overallScore}%</span>
                          <span className={`px-1.5 py-0.5 rounded text-xs ${recConfig?.bg}`} style={{ color: recConfig?.color }}>
                            {recConfig?.label}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: textMuted }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">{[1,2,3,4,5].map((s) => <Star key={s} className={`w-3 h-3 ${s <= c.rating ? "text-[#F59E0B] fill-[#F59E0B]" : "text-[#E5E7EB]"}`} />)}</div>
                    </td>
                  </tr>
                );
              })}
              {filteredCandidates.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8" style={{ color: textSecondary, fontSize: 13 }}>No candidates found matching criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Split-View Candidate Drawer */}
      {selectedCandidate && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] z-[60] shadow-2xl flex flex-col transform transition-transform duration-300" style={{ backgroundColor: cardBg, borderLeft: `1px solid ${borderColor}` }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--acc-primary-strong)] to-[#EC4899] flex items-center justify-center text-white" style={{ fontSize: 14, fontWeight: 600 }}>{selectedCandidate.name.split(" ").map((n) => n[0]).join("")}</div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }}>{selectedCandidate.name}</h3>
                <p style={{ fontSize: 12, color: textMuted }}>{selectedCandidate.jobTitle}</p>
              </div>
            </div>
            <button onClick={() => setSelectedCandidate(null)} className="p-2 rounded hover:bg-black/5" style={{ color: textSecondary }}><X className="w-5 h-5" /></button>
          </div>

          <div className="px-6 py-4 flex gap-2 overflow-x-auto" style={{ borderBottom: `1px solid ${borderColor}` }}>
            {stages.map((stage) => (
              <button 
                key={stage} 
                onClick={() => moveCandidate(selectedCandidate.id, stage)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${selectedCandidate.stage === stage ? stageColors[stage].bg + ' ' + stageColors[stage].text : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'}`}
              >
                {stageLabels[stage]}
              </button>
            ))}
          </div>

          <div className="flex px-6 pt-2" style={{ borderBottom: `1px solid ${borderColor}` }}>
            <button onClick={() => setScorecardTab("ai")} className={`pb-2 px-2 border-b-2 mr-4 ${scorecardTab === "ai" ? "border-[var(--acc-primary-strong)] text-[var(--acc-primary-strong)] font-semibold" : "border-transparent text-gray-500 font-medium"}`} style={{ fontSize: 13 }}>
              <span className="flex items-center gap-1"><Brain className="w-3.5 h-3.5" /> ATS</span>
            </button>
            <button onClick={() => setScorecardTab("scorecard")} className={`pb-2 px-2 border-b-2 mr-4 ${scorecardTab === "scorecard" ? "border-[var(--acc-primary-strong)] text-[var(--acc-primary-strong)] font-semibold" : "border-transparent text-gray-500 font-medium"}`} style={{ fontSize: 13 }}>Scorecard</button>
            <button onClick={() => setScorecardTab("notes")} className={`pb-2 px-2 border-b-2 ${scorecardTab === "notes" ? "border-[var(--acc-primary-strong)] text-[var(--acc-primary-strong)] font-semibold" : "border-transparent text-gray-500 font-medium"}`} style={{ fontSize: 13 }}>Notes</button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {scorecardTab === "ai" && (() => {
              const match = selectedCandidate ? getCandidateMatch(selectedCandidate.id) : null;
              const parsedCV = selectedCandidate ? getCandidateParsedCV(selectedCandidate.id) : null;
              const recConfig = match ? getRecommendationConfig(match.atsRecommendation) : null;
              const RecommendationIcon = recConfig?.icon || CheckCircle2;
              
              return (
                <div className="space-y-4">
                  {match ? (
                    <>
                      <div className="p-4 rounded-xl border" style={{ borderColor: recConfig?.color, backgroundColor: isDark ? `${recConfig?.color}20` : `${recConfig?.color}10` }}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <RecommendationIcon className="w-5 h-5" style={{ color: recConfig?.color }} />
                            <h4 className="font-semibold" style={{ fontSize: 14, color: textPrimary }}>
                              ATS Candidate Match: {match.overallScore}%
                            </h4>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${recConfig?.bg}`} style={{ color: recConfig?.color }}>
                            {recConfig?.label}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: isDark ? "#1F2937" : "#F9FAFB" }}>
                            <div className="text-xs" style={{ color: textMuted }}>Skills Match</div>
                            <div className="font-semibold" style={{ color: "var(--acc-primary-strong)" }}>{match.skillsScore}%</div>
                          </div>
                          <div className="p-2 rounded-lg" style={{ backgroundColor: isDark ? "#1F2937" : "#F9FAFB" }}>
                            <div className="text-xs" style={{ color: textMuted }}>Experience</div>
                            <div className="font-semibold" style={{ color: "var(--acc-primary-strong)" }}>{match.experienceScore}%</div>
                          </div>
                          <div className="p-2 rounded-lg" style={{ backgroundColor: isDark ? "#1F2937" : "#F9FAFB" }}>
                            <div className="text-xs" style={{ color: textMuted }}>Education</div>
                            <div className="font-semibold" style={{ color: "var(--acc-primary-strong)" }}>{match.educationScore}%</div>
                          </div>
                          <div className="p-2 rounded-lg" style={{ backgroundColor: isDark ? "#1F2937" : "#F9FAFB" }}>
                            <div className="text-xs" style={{ color: textMuted }}>Certifications</div>
                            <div className="font-semibold" style={{ color: "var(--acc-primary-strong)" }}>{match.certificationScore}%</div>
                          </div>
                        </div>
                        
                        {match.strengths.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs font-medium mb-1.5" style={{ color: "#059669" }}>{t("rec.strengths")}</div>
                            <ul className="space-y-1">
                              {match.strengths.slice(0, 3).map((s, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-xs" style={{ color: textPrimary }}>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                                  <span className="truncate">{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {match.missingRequirements.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs font-medium mb-1.5" style={{ color: "#DC2626" }}>{t("rec.missingRequirements")}</div>
                            <ul className="space-y-1">
                              {match.missingRequirements.slice(0, 3).map((r, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-xs" style={{ color: textPrimary }}>
                                  <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                                  <span className="truncate">{r}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {match.screeningNotes.length > 0 && (
                          <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${borderColor}` }}>
                            <div className="text-xs font-medium mb-1.5" style={{ color: textMuted }}>{t("rec.screeningNotes")}</div>
                            {match.screeningNotes.map((note, i) => (
                              <p key={i} className="text-xs" style={{ color: textSecondary }}>{note}</p>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {parsedCV && (
                        <>
                          <div>
                            <h4 className="flex items-center gap-2 font-semibold mb-2" style={{ fontSize: 14, color: textPrimary }}>
                              <FileText className="w-4 h-4" /> Parsed CV Data
                            </h4>
                            <div className="p-3 rounded-lg" style={{ backgroundColor: isDark ? "#374151" : "#F9FAFB" }}>
                              <div className="grid grid-cols-2 gap-3 text-xs">
                                {parsedCV.totalYearsExperience !== undefined && (
                                  <div>
                                    <span style={{ color: textMuted }}>Experience:</span>
                                    <span className="ml-1 font-medium" style={{ color: textPrimary }}>{parsedCV.totalYearsExperience} years</span>
                                  </div>
                                )}
                                {parsedCV.education?.[0] && (
                                  <div>
                                    <span style={{ color: textMuted }}>Education:</span>
                                    <span className="ml-1 font-medium" style={{ color: textPrimary }}>{parsedCV.education[0].degree}</span>
                                  </div>
                                )}
                              </div>
                              
                              {parsedCV.skills && parsedCV.skills.length > 0 && (
                                <div className="mt-3">
                                  <span style={{ fontSize: 11, color: textMuted }}>{t("rec.skillsFound")}:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {parsedCV.skills.slice(0, 8).map((skill, i) => (
                                      <span key={i} className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "var(--acc-tint-light)", color: "var(--acc-primary-strong)" }}>
                                        {skill.name}
                                      </span>
                                    ))}
                                    {parsedCV.skills.length > 8 && (
                                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: isDark ? "#374151" : "#E5E7EB", color: textMuted }}>
                                        +{parsedCV.skills.length - 8} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {parsedCV.certifications && parsedCV.certifications.length > 0 && (
                                <div className="mt-3">
                                  <span style={{ fontSize: 11, color: textMuted }}>{t("rec.certifications")}:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {parsedCV.certifications.slice(0, 4).map((cert, i) => (
                                      <span key={i} className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: isDark ? "#374151" : "#E5E7EB", color: textSecondary }}>
                                        {cert}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${borderColor}` }}>
                                <span style={{ fontSize: 10, color: textMuted }}>{t("rec.confidence")}: {parsedCV.parseConfidence}%</span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="p-6 text-center rounded-xl border" style={{ borderColor, backgroundColor: isDark ? "#374151" : "#F9FAFB" }}>
                      <Brain className="w-10 h-10 mx-auto mb-3" style={{ color: textMuted }} />
                      <h4 className="font-semibold mb-2" style={{ color: textPrimary }}>No ATS Analysis Yet</h4>
                      <p className="text-sm mb-4" style={{ color: textSecondary }}>
                        Upload a CV and the system will automatically analyze this candidate.
                      </p>
                      <div className="text-left p-3 rounded-lg" style={{ backgroundColor: isDark ? "#1F2937" : "#F3F4F6" }}>
                        <h5 className="text-xs font-semibold mb-2" style={{ color: textPrimary }}>What ATS Analysis includes:</h5>
                        <ul className="text-xs space-y-1" style={{ color: textSecondary }}>
                          <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-green-500" /> Skills matching score</li>
                          <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-green-500" /> Experience evaluation</li>
                          <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-green-500" /> Education verification</li>
                          <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-green-500" /> Missing requirements</li>
                          <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-green-500" /> Candidate recommendation</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold mb-2" style={{ fontSize: 14, color: textPrimary }}>Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2" style={{ fontSize: 13, color: textSecondary }}><Mail className="w-4 h-4" /> {selectedCandidate?.email}</div>
                      <div className="flex items-center gap-2" style={{ fontSize: 13, color: textSecondary }}><Phone className="w-4 h-4" /> +1 234 567 890</div>
                    </div>
                  </div>
                  
                  <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border hover:bg-black/5 transition-colors" style={{ fontSize: 13, fontWeight: 500, borderColor, color: textPrimary }}>
                    <FileText className="w-4 h-4" /> View Full Resume PDF
                  </button>
                </div>
              );
            })()}

            {scorecardTab === "scorecard" && (
              <div className="space-y-6">
                {[{ key: "technical", label: "Technical Skills" }, { key: "culture", label: "Culture Fit" }, { key: "communication", label: "Communication" }].map(skill => (
                  <div key={skill.key}>
                    <div className="flex justify-between mb-2">
                      <label style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{skill.label}</label>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--acc-primary-strong)" }}>{selectedCandidate.scorecard?.[skill.key as keyof typeof selectedCandidate.scorecard] || 0} / 5</span>
                    </div>
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map(v => (
                        <button 
                          key={v}
                          onClick={() => updateScorecard(selectedCandidate.id, skill.key, v)}
                          className={`flex-1 h-8 rounded border ${v <= (selectedCandidate.scorecard?.[skill.key as keyof typeof selectedCandidate.scorecard] || 0) ? "bg-[var(--acc-primary-strong)] border-[var(--acc-primary-strong)] text-white" : "border-gray-300 dark:border-gray-600 hover:border-[var(--acc-primary-strong)]"} transition-colors`}
                          style={{ fontSize: 13, fontWeight: 600 }}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {scorecardTab === "notes" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: isDark ? "#374151" : "#F9FAFB" }}>
                  <textarea placeholder="Add a note or @mention a team member..." className="w-full bg-transparent outline-none resize-none" rows={3} style={{ fontSize: 13, color: textPrimary }}></textarea>
                  <div className="flex justify-between items-center mt-2">
                    <span style={{ fontSize: 12, color: textMuted }}>Markdown supported</span>
                    <button className="px-3 py-1.5 rounded bg-[var(--acc-primary)] text-white" style={{ fontSize: 12, fontWeight: 500 }}>Post</button>
                  </div>
                </div>
                <div className="space-y-3">
                  {(selectedCandidate.notes || [{ author: "Amira Taleb", text: "Candidate has great communication skills. Recommending for next round.", date: "2 days ago" }]).map((note, i) => (
                    <div key={i} className="pb-3 border-b" style={{ borderColor }}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">{note.author.charAt(0)}</div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{note.author}</span>
                        <span style={{ fontSize: 11, color: textMuted }}>{note.date}</span>
                      </div>
                      <p style={{ fontSize: 13, color: textSecondary, paddingLeft: "32px" }}>{note.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4" style={{ borderTop: `1px solid ${borderColor}` }}>
            <button onClick={() => setDeleteConfirm({ type: "candidate", id: selectedCandidate.id })} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors" style={{ fontSize: 13, fontWeight: 500 }}>
              <Trash2 className="w-4 h-4" /> Reject & Remove Candidate
            </button>
          </div>
        </div>
      )}
      
      {/* Background overlay for drawer */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/20 z-50 backdrop-blur-sm transition-opacity" onClick={() => setSelectedCandidate(null)}></div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="rounded-2xl border shadow-2xl w-full max-w-sm p-6" style={{ backgroundColor: cardBg, borderColor }} onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2" }}><Trash2 className="w-6 h-6 text-[#DC2626]" /></div>
            <h3 className="text-center mb-2" style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>Delete {deleteConfirm.type === "job" ? "Job Posting" : "Candidate"}?</h3>
            <p className="text-center mb-6" style={{ fontSize: 13, color: textSecondary }}>This will be permanently removed.</p>
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2.5 rounded-lg" style={{ fontSize: 13, fontWeight: 500, backgroundColor: isDark ? "#374151" : "#F3F4F6", color: textPrimary }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="flex-1 px-4 py-2.5 rounded-lg bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-colors" style={{ fontSize: 13, fontWeight: 600 }} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
