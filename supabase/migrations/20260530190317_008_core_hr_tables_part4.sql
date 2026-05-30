/*
  # Core HR Tables - Part 4: Performance & Recruitment
  
  ## New Tables:
  - `performance_reviews` - Employee performance reviews
  - `performance_goals` - Goals within performance reviews
  - `job_postings` - Open job positions
  - `candidates` - Job applicants
  - `candidate_notes` - Notes on candidates
*/

-- ============================================================
-- PERFORMANCE REVIEWS
-- ============================================================
CREATE TABLE public.performance_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id     UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  
  review_period   TEXT NOT NULL,
  review_type     TEXT DEFAULT 'quarterly' CHECK (review_type IN ('quarterly', 'annual', 'probation', 'project', 'custom')),
  
  -- Overall Rating
  rating          DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
  
  -- Status
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
  
  -- Reviewer
  reviewer_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Content
  strengths       TEXT[],
  improvements    TEXT[],
  comments        TEXT,
  
  -- Self Assessment
  self_assessment TEXT,
  self_submitted_at TIMESTAMPTZ,
  
  -- Dates
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  due_date        DATE,
  
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PERFORMANCE GOALS
-- ============================================================
CREATE TABLE public.performance_goals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id       UUID NOT NULL REFERENCES public.performance_reviews(id) ON DELETE CASCADE,
  
  title           TEXT NOT NULL,
  description     TEXT,
  
  progress        INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status          TEXT DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed', 'cancelled')),
  
  due_date        DATE,
  completed_at    TIMESTAMPTZ,
  
  weight          INTEGER DEFAULT 1,
  
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- JOB POSTINGS
-- ============================================================
CREATE TABLE public.job_postings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  department_id   UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  
  title           TEXT NOT NULL,
  title_ar        TEXT,
  code            TEXT,
  
  description     TEXT,
  requirements    TEXT[],
  responsibilities TEXT[],
  
  location        TEXT,
  employment_type TEXT DEFAULT 'full-time' CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'intern')),
  
  salary_min      INTEGER,
  salary_max      INTEGER,
  salary_currency TEXT DEFAULT 'DZD',
  salary_visible  BOOLEAN DEFAULT false,
  
  experience_min  INTEGER,
  experience_max  INTEGER,
  education_level TEXT,
  
  skills          TEXT[],
  
  status          TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed', 'archived')),
  
  posted_at       TIMESTAMPTZ,
  closes_at       TIMESTAMPTZ,
  
  applicant_count INTEGER DEFAULT 0,
  
  posted_by       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CANDIDATES
-- ============================================================
CREATE TABLE public.candidates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  job_id          UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  
  -- Personal Info
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  
  -- Application
  applied_at      TIMESTAMPTZ DEFAULT now(),
  source          TEXT,
  resume_url      TEXT,
  cover_letter    TEXT,
  portfolio_url   TEXT,
  linkedin_url    TEXT,
  
  -- Status
  stage           TEXT DEFAULT 'applied' CHECK (stage IN ('applied', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn')),
  
  -- Evaluation
  rating          DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
  
  -- ATS Data
  parsed_cv       JSONB,
  skills          TEXT[],
  experience_years INTEGER,
  education       JSONB,
  
  match_score     DECIMAL(5,2),
  match_details   JSONB,
  
  -- Scorecard
  scorecard_technical INTEGER CHECK (scorecard_technical >= 0 AND scorecard_technical <= 5),
  scorecard_culture    INTEGER CHECK (scorecard_culture >= 0 AND scorecard_culture <= 5),
  scorecard_communication INTEGER CHECK (scorecard_communication >= 0 AND scorecard_communication <= 5),
  
  -- Decision
  rejected_reason TEXT,
  rejected_at    TIMESTAMPTZ,
  hired_at       TIMESTAMPTZ,
  
  -- If hired, link to employee record
  employee_id    UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CANDIDATE NOTES
-- ============================================================
CREATE TABLE public.candidate_notes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id    UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  
  author_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  content         TEXT NOT NULL,
  
  is_private     BOOLEAN DEFAULT false,
  
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES FOR PART 4
-- ============================================================
CREATE INDEX idx_performance_reviews_org ON public.performance_reviews(organization_id);
CREATE INDEX idx_performance_reviews_employee ON public.performance_reviews(employee_id);
CREATE INDEX idx_performance_reviews_reviewer ON public.performance_reviews(reviewer_id);
CREATE INDEX idx_performance_reviews_status ON public.performance_reviews(status);
CREATE INDEX idx_performance_reviews_period ON public.performance_reviews(review_period);

CREATE INDEX idx_performance_goals_review ON public.performance_goals(review_id);

CREATE INDEX idx_job_postings_org ON public.job_postings(organization_id);
CREATE INDEX idx_job_postings_department ON public.job_postings(department_id);
CREATE INDEX idx_job_postings_status ON public.job_postings(status);
CREATE INDEX idx_job_postings_posted ON public.job_postings(posted_at DESC);

CREATE INDEX idx_candidates_org ON public.candidates(organization_id);
CREATE INDEX idx_candidates_job ON public.candidates(job_id);
CREATE INDEX idx_candidates_email ON public.candidates(email);
CREATE INDEX idx_candidates_stage ON public.candidates(stage);
CREATE INDEX idx_candidates_employee ON public.candidates(employee_id);

CREATE INDEX idx_candidate_notes_candidate ON public.candidate_notes(candidate_id);
CREATE INDEX idx_candidate_notes_author ON public.candidate_notes(author_id);
