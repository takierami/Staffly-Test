// ============================================================
// Database Types - Auto-generated compatible types
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          subscription_plan: string
          status: string
          settings: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          health_score: number
          suspension_reason: string | null
          suspended_at: string | null
          max_users: number
        }
        Insert: {
          id?: string
          name: string
          slug: string
          subscription_plan?: string
          status?: string
          settings?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          health_score?: number
          suspension_reason?: string | null
          suspended_at?: string | null
          max_users?: number
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          subscription_plan?: string
          status?: string
          settings?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          health_score?: number
          suspension_reason?: string | null
          suspended_at?: string | null
          max_users?: number
        }
      }
      profiles: {
        Row: {
          id: string
          organization_id: string | null
          full_name: string
          full_name_ar: string | null
          email: string
          role: string
          status: string
          avatar_url: string | null
          department: string | null
          position: string | null
          employee_id: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_id?: string | null
          full_name: string
          full_name_ar?: string | null
          email: string
          role?: string
          status?: string
          avatar_url?: string | null
          department?: string | null
          position?: string | null
          employee_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          full_name?: string
          full_name_ar?: string | null
          email?: string
          role?: string
          status?: string
          avatar_url?: string | null
          department?: string | null
          position?: string | null
          employee_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          organization_id: string
          name: string
          name_ar: string | null
          code: string | null
          description: string | null
          parent_id: string | null
          manager_id: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          name_ar?: string | null
          code?: string | null
          description?: string | null
          parent_id?: string | null
          manager_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          name_ar?: string | null
          code?: string | null
          description?: string | null
          parent_id?: string | null
          manager_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      positions: {
        Row: {
          id: string
          organization_id: string
          department_id: string | null
          title: string
          title_ar: string | null
          code: string | null
          description: string | null
          requirements: string[] | null
          salary_range_min: number | null
          salary_range_max: number | null
          employment_type: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          department_id?: string | null
          title: string
          title_ar?: string | null
          code?: string | null
          description?: string | null
          requirements?: string[] | null
          salary_range_min?: number | null
          salary_range_max?: number | null
          employment_type?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          department_id?: string | null
          title?: string
          title_ar?: string | null
          code?: string | null
          description?: string | null
          requirements?: string[] | null
          salary_range_min?: number | null
          salary_range_max?: number | null
          employment_type?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      employee_categories: {
        Row: {
          id: string
          organization_id: string
          name: string
          name_ar: string | null
          code: string | null
          department: string | null
          description: string | null
          grade_level: string | null
          metadata: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          name_ar?: string | null
          code?: string | null
          department?: string | null
          description?: string | null
          grade_level?: string | null
          metadata?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          name_ar?: string | null
          code?: string | null
          department?: string | null
          description?: string | null
          grade_level?: string | null
          metadata?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      grades: {
        Row: {
          id: string
          organization_id: string
          name: string
          name_ar: string | null
          code: string
          level: number
          description: string | null
          min_salary: number | null
          max_salary: number | null
          metadata: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          name_ar?: string | null
          code: string
          level: number
          description?: string | null
          min_salary?: number | null
          max_salary?: number | null
          metadata?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          name_ar?: string | null
          code?: string
          level?: number
          description?: string | null
          min_salary?: number | null
          max_salary?: number | null
          metadata?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      leave_types: {
        Row: {
          id: string
          organization_id: string
          name: string
          name_ar: string | null
          code: string | null
          description: string | null
          default_days: number
          is_paid: boolean
          carry_over_max: number
          color: string | null
          icon: string | null
          metadata: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          name_ar?: string | null
          code?: string | null
          description?: string | null
          default_days?: number
          is_paid?: boolean
          carry_over_max?: number
          color?: string | null
          icon?: string | null
          metadata?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          name_ar?: string | null
          code?: string | null
          description?: string | null
          default_days?: number
          is_paid?: boolean
          carry_over_max?: number
          color?: string | null
          icon?: string | null
          metadata?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          organization_id: string
          user_id: string | null
          employee_code: string
          first_name: string
          last_name: string
          first_name_ar: string | null
          last_name_ar: string | null
          email: string
          phone: string | null
          personal_email: string | null
          date_of_birth: string | null
          gender: string | null
          national_id: string | null
          marital_status: string | null
          nationality: string | null
          address: string | null
          city: string | null
          state: string | null
          country: string | null
          postal_code: string | null
          department_id: string | null
          position_id: string | null
          category_id: string | null
          grade_id: string | null
          employment_type: string
          status: string
          hire_date: string
          termination_date: string | null
          probation_end_date: string | null
          reports_to: string | null
          basic_salary: number
          currency: string
          salary_type: string
          bank_name: string | null
          bank_account: string | null
          bank_rib: string | null
          skills: string[] | null
          education: Json
          certifications: Json
          avatar_url: string | null
          metadata: Json
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          user_id?: string | null
          employee_code: string
          first_name: string
          last_name: string
          first_name_ar?: string | null
          last_name_ar?: string | null
          email: string
          phone?: string | null
          personal_email?: string | null
          date_of_birth?: string | null
          gender?: string | null
          national_id?: string | null
          marital_status?: string | null
          nationality?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          postal_code?: string | null
          department_id?: string | null
          position_id?: string | null
          category_id?: string | null
          grade_id?: string | null
          employment_type?: string
          status?: string
          hire_date: string
          termination_date?: string | null
          probation_end_date?: string | null
          reports_to?: string | null
          basic_salary?: number
          currency?: string
          salary_type?: string
          bank_name?: string | null
          bank_account?: string | null
          bank_rib?: string | null
          skills?: string[] | null
          education?: Json
          certifications?: Json
          avatar_url?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string | null
          employee_code?: string
          first_name?: string
          last_name?: string
          first_name_ar?: string | null
          last_name_ar?: string | null
          email?: string
          phone?: string | null
          personal_email?: string | null
          date_of_birth?: string | null
          gender?: string | null
          national_id?: string | null
          marital_status?: string | null
          nationality?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          postal_code?: string | null
          department_id?: string | null
          position_id?: string | null
          category_id?: string | null
          grade_id?: string | null
          employment_type?: string
          status?: string
          hire_date?: string
          termination_date?: string | null
          probation_end_date?: string | null
          reports_to?: string | null
          basic_salary?: number
          currency?: string
          salary_type?: string
          bank_name?: string | null
          bank_account?: string | null
          bank_rib?: string | null
          skills?: string[] | null
          education?: Json
          certifications?: Json
          avatar_url?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      leave_requests: {
        Row: {
          id: string
          organization_id: string
          employee_id: string
          leave_type_id: string
          start_date: string
          end_date: string
          number_of_days: number
          day_type: string
          reason: string | null
          status: string
          requested_at: string
          approver_id: string | null
          approved_at: string | null
          approver_comments: string | null
          attachment_url: string | null
          replacement_id: string | null
          coverage_notes: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          employee_id: string
          leave_type_id: string
          start_date: string
          end_date: string
          number_of_days: number
          day_type?: string
          reason?: string | null
          status?: string
          requested_at?: string
          approver_id?: string | null
          approved_at?: string | null
          approver_comments?: string | null
          attachment_url?: string | null
          replacement_id?: string | null
          coverage_notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          employee_id?: string
          leave_type_id?: string
          start_date?: string
          end_date?: string
          number_of_days?: number
          day_type?: string
          reason?: string | null
          status?: string
          requested_at?: string
          approver_id?: string | null
          approved_at?: string | null
          approver_comments?: string | null
          attachment_url?: string | null
          replacement_id?: string | null
          coverage_notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      leave_balances: {
        Row: {
          id: string
          organization_id: string
          employee_id: string
          leave_type_id: string
          year: number
          total_days: number
          used_days: number
          pending_days: number
          remaining_days: number
          carry_over_days: number
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          employee_id: string
          leave_type_id: string
          year: number
          total_days?: number
          used_days?: number
          pending_days?: number
          remaining_days?: number
          carry_over_days?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          employee_id?: string
          leave_type_id?: string
          year?: number
          total_days?: number
          used_days?: number
          pending_days?: number
          remaining_days?: number
          carry_over_days?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      attendance_records: {
        Row: {
          id: string
          organization_id: string
          employee_id: string
          date: string
          check_in: string | null
          check_out: string | null
          hours_worked: number | null
          status: string
          location: string | null
          latitude: number | null
          longitude: number | null
          notes: string | null
          ip_address: string | null
          is_manual_entry: boolean
          approved_by: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          employee_id: string
          date: string
          check_in?: string | null
          check_out?: string | null
          hours_worked?: number | null
          status?: string
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          ip_address?: string | null
          is_manual_entry?: boolean
          approved_by?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          employee_id?: string
          date?: string
          check_in?: string | null
          check_out?: string | null
          hours_worked?: number | null
          status?: string
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          ip_address?: string | null
          is_manual_entry?: boolean
          approved_by?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      payroll_records: {
        Row: {
          id: string
          organization_id: string
          employee_id: string
          payroll_period: string
          pay_date: string | null
          basic_salary: number
          overtime_hours: number | null
          overtime_amount: number
          total_earnings: number
          total_deductions: number
          net_salary: number
          currency: string
          status: string
          processed_by: string | null
          processed_at: string | null
          paid_at: string | null
          notes: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          employee_id: string
          payroll_period: string
          pay_date?: string | null
          basic_salary?: number
          overtime_hours?: number | null
          overtime_amount?: number
          total_earnings?: number
          total_deductions?: number
          net_salary?: number
          currency?: string
          status?: string
          processed_by?: string | null
          processed_at?: string | null
          paid_at?: string | null
          notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          employee_id?: string
          payroll_period?: string
          pay_date?: string | null
          basic_salary?: number
          overtime_hours?: number | null
          overtime_amount?: number
          total_earnings?: number
          total_deductions?: number
          net_salary?: number
          currency?: string
          status?: string
          processed_by?: string | null
          processed_at?: string | null
          paid_at?: string | null
          notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      performance_reviews: {
        Row: {
          id: string
          organization_id: string
          employee_id: string
          review_period: string
          review_type: string
          rating: number | null
          status: string
          reviewer_id: string
          strengths: string[] | null
          improvements: string[] | null
          comments: string | null
          self_assessment: string | null
          self_submitted_at: string | null
          started_at: string | null
          completed_at: string | null
          due_date: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          employee_id: string
          review_period: string
          review_type?: string
          rating?: number | null
          status?: string
          reviewer_id: string
          strengths?: string[] | null
          improvements?: string[] | null
          comments?: string | null
          self_assessment?: string | null
          self_submitted_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          due_date?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          employee_id?: string
          review_period?: string
          review_type?: string
          rating?: number | null
          status?: string
          reviewer_id?: string
          strengths?: string[] | null
          improvements?: string[] | null
          comments?: string | null
          self_assessment?: string | null
          self_submitted_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          due_date?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      performance_goals: {
        Row: {
          id: string
          review_id: string
          title: string
          description: string | null
          progress: number
          status: string
          due_date: string | null
          completed_at: string | null
          weight: number
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          review_id: string
          title: string
          description?: string | null
          progress?: number
          status?: string
          due_date?: string | null
          completed_at?: string | null
          weight?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          title?: string
          description?: string | null
          progress?: number
          status?: string
          due_date?: string | null
          completed_at?: string | null
          weight?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      job_postings: {
        Row: {
          id: string
          organization_id: string
          department_id: string | null
          title: string
          title_ar: string | null
          code: string | null
          description: string | null
          requirements: string[] | null
          responsibilities: string[] | null
          location: string | null
          employment_type: string
          salary_min: number | null
          salary_max: number | null
          salary_currency: string
          salary_visible: boolean
          experience_min: number | null
          experience_max: number | null
          education_level: string | null
          skills: string[] | null
          status: string
          posted_at: string | null
          closes_at: string | null
          applicant_count: number
          posted_by: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          department_id?: string | null
          title: string
          title_ar?: string | null
          code?: string | null
          description?: string | null
          requirements?: string[] | null
          responsibilities?: string[] | null
          location?: string | null
          employment_type?: string
          salary_min?: number | null
          salary_max?: number | null
          salary_currency?: string
          salary_visible?: boolean
          experience_min?: number | null
          experience_max?: number | null
          education_level?: string | null
          skills?: string[] | null
          status?: string
          posted_at?: string | null
          closes_at?: string | null
          applicant_count?: number
          posted_by?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          department_id?: string | null
          title?: string
          title_ar?: string | null
          code?: string | null
          description?: string | null
          requirements?: string[] | null
          responsibilities?: string[] | null
          location?: string | null
          employment_type?: string
          salary_min?: number | null
          salary_max?: number | null
          salary_currency?: string
          salary_visible?: boolean
          experience_min?: number | null
          experience_max?: number | null
          education_level?: string | null
          skills?: string[] | null
          status?: string
          posted_at?: string | null
          closes_at?: string | null
          applicant_count?: number
          posted_by?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      candidates: {
        Row: {
          id: string
          organization_id: string
          job_id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          applied_at: string
          source: string | null
          resume_url: string | null
          cover_letter: string | null
          portfolio_url: string | null
          linkedin_url: string | null
          stage: string
          rating: number | null
          parsed_cv: Json
          skills: string[] | null
          experience_years: number | null
          education: Json
          match_score: number | null
          match_details: Json
          scorecard_technical: number | null
          scorecard_culture: number | null
          scorecard_communication: number | null
          rejected_reason: string | null
          rejected_at: string | null
          hired_at: string | null
          employee_id: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          job_id: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          applied_at?: string
          source?: string | null
          resume_url?: string | null
          cover_letter?: string | null
          portfolio_url?: string | null
          linkedin_url?: string | null
          stage?: string
          rating?: number | null
          parsed_cv?: Json
          skills?: string[] | null
          experience_years?: number | null
          education?: Json
          match_score?: number | null
          match_details?: Json
          scorecard_technical?: number | null
          scorecard_culture?: number | null
          scorecard_communication?: number | null
          rejected_reason?: string | null
          rejected_at?: string | null
          hired_at?: string | null
          employee_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          job_id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          applied_at?: string
          source?: string | null
          resume_url?: string | null
          cover_letter?: string | null
          portfolio_url?: string | null
          linkedin_url?: string | null
          stage?: string
          rating?: number | null
          parsed_cv?: Json
          skills?: string[] | null
          experience_years?: number | null
          education?: Json
          match_score?: number | null
          match_details?: Json
          scorecard_technical?: number | null
          scorecard_culture?: number | null
          scorecard_communication?: number | null
          rejected_reason?: string | null
          rejected_at?: string | null
          hired_at?: string | null
          employee_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      training_programs: {
        Row: {
          id: string
          organization_id: string
          title: string
          title_ar: string | null
          code: string | null
          description: string | null
          category: string | null
          instructor: string | null
          instructor_id: string | null
          start_date: string | null
          end_date: string | null
          location: string | null
          is_online: boolean
          meeting_url: string | null
          capacity: number
          enrolled_count: number
          status: string
          certificate_template: string | null
          cost: number
          currency: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          title: string
          title_ar?: string | null
          code?: string | null
          description?: string | null
          category?: string | null
          instructor?: string | null
          instructor_id?: string | null
          start_date?: string | null
          end_date?: string | null
          location?: string | null
          is_online?: boolean
          meeting_url?: string | null
          capacity?: number
          enrolled_count?: number
          status?: string
          certificate_template?: string | null
          cost?: number
          currency?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          title?: string
          title_ar?: string | null
          code?: string | null
          description?: string | null
          category?: string | null
          instructor?: string | null
          instructor_id?: string | null
          start_date?: string | null
          end_date?: string | null
          location?: string | null
          is_online?: boolean
          meeting_url?: string | null
          capacity?: number
          enrolled_count?: number
          status?: string
          certificate_template?: string | null
          cost?: number
          currency?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      training_enrollments: {
        Row: {
          id: string
          organization_id: string
          training_id: string
          employee_id: string
          enrolled_at: string
          enrolled_by: string | null
          status: string
          progress: number
          started_at: string | null
          completed_at: string | null
          score: number | null
          certificate_url: string | null
          notes: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          organization_id: string
          training_id: string
          employee_id: string
          enrolled_at?: string
          enrolled_by?: string | null
          status?: string
          progress?: number
          started_at?: string | null
          completed_at?: string | null
          score?: number | null
          certificate_url?: string | null
          notes?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          organization_id?: string
          training_id?: string
          employee_id?: string
          enrolled_at?: string
          enrolled_by?: string | null
          status?: string
          progress?: number
          started_at?: string | null
          completed_at?: string | null
          score?: number | null
          certificate_url?: string | null
          notes?: string | null
          metadata?: Json
        }
      }
      document_templates: {
        Row: {
          id: string
          organization_id: string
          name: string
          name_ar: string | null
          code: string | null
          description: string | null
          document_type: string
          content: string
          fields: string[] | null
          is_active: boolean
          is_system: boolean
          created_by: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          name_ar?: string | null
          code?: string | null
          description?: string | null
          document_type: string
          content: string
          fields?: string[] | null
          is_active?: boolean
          is_system?: boolean
          created_by?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          name_ar?: string | null
          code?: string | null
          description?: string | null
          document_type?: string
          content?: string
          fields?: string[] | null
          is_active?: boolean
          is_system?: boolean
          created_by?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          organization_id: string
          employee_id: string | null
          template_id: string | null
          document_type: string
          name: string
          content: string | null
          file_url: string | null
          file_size: number | null
          status: string
          generated_at: string | null
          generated_by: string | null
          signed_at: string | null
          signed_by: string | null
          expires_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          employee_id?: string | null
          template_id?: string | null
          document_type: string
          name: string
          content?: string | null
          file_url?: string | null
          file_size?: number | null
          status?: string
          generated_at?: string | null
          generated_by?: string | null
          signed_at?: string | null
          signed_by?: string | null
          expires_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          employee_id?: string | null
          template_id?: string | null
          document_type?: string
          name?: string
          content?: string | null
          file_url?: string | null
          file_size?: number | null
          status?: string
          generated_at?: string | null
          generated_by?: string | null
          signed_at?: string | null
          signed_by?: string | null
          expires_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      promotion_rules: {
        Row: {
          id: string
          organization_id: string
          category_id: string | null
          from_grade_id: string
          to_grade_id: string
          required_years: number
          required_performance_rating: number | null
          salary_increase_percent: number | null
          is_active: boolean
          auto_promote: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          category_id?: string | null
          from_grade_id: string
          to_grade_id: string
          required_years?: number
          required_performance_rating?: number | null
          salary_increase_percent?: number | null
          is_active?: boolean
          auto_promote?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          category_id?: string | null
          from_grade_id?: string
          to_grade_id?: string
          required_years?: number
          required_performance_rating?: number | null
          salary_increase_percent?: number | null
          is_active?: boolean
          auto_promote?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      promotion_records: {
        Row: {
          id: string
          organization_id: string
          employee_id: string
          rule_id: string | null
          previous_position_id: string | null
          new_position_id: string | null
          previous_grade_id: string | null
          new_grade_id: string | null
          previous_salary: number | null
          new_salary: number | null
          promotion_type: string
          effective_date: string
          reason: string | null
          status: string
          approved_by: string | null
          approved_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          employee_id: string
          rule_id?: string | null
          previous_position_id?: string | null
          new_position_id?: string | null
          previous_grade_id?: string | null
          new_grade_id?: string | null
          previous_salary?: number | null
          new_salary?: number | null
          promotion_type?: string
          effective_date: string
          reason?: string | null
          status?: string
          approved_by?: string | null
          approved_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          employee_id?: string
          rule_id?: string | null
          previous_position_id?: string | null
          new_position_id?: string | null
          previous_grade_id?: string | null
          new_grade_id?: string | null
          previous_salary?: number | null
          new_salary?: number | null
          promotion_type?: string
          effective_date?: string
          reason?: string | null
          status?: string
          approved_by?: string | null
          approved_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          organization_id: string | null
          user_id: string
          type: string
          title: string
          message: string | null
          data: Json
          is_read: boolean
          read_at: string | null
          action_url: string | null
          priority: string
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          user_id: string
          type: string
          title: string
          message?: string | null
          data?: Json
          is_read?: boolean
          read_at?: string | null
          action_url?: string | null
          priority?: string
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          user_id?: string
          type?: string
          title?: string
          message?: string | null
          data?: Json
          is_read?: boolean
          read_at?: string | null
          action_url?: string | null
          priority?: string
          expires_at?: string | null
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          organization_id: string | null
          actor_id: string | null
          action: string
          entity_type: string | null
          entity_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          actor_id?: string | null
          action: string
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          actor_id?: string | null
          action?: string
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          organization_id: string | null
          actor_id: string | null
          actor_email: string | null
          actor_name: string | null
          action: string
          entity_type: string
          entity_id: string | null
          old_values: Json
          new_values: Json
          ip_address: string | null
          user_agent: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          actor_id?: string | null
          actor_email?: string | null
          actor_name?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          old_values?: Json
          new_values?: Json
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          actor_id?: string | null
          actor_email?: string | null
          actor_name?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          old_values?: Json
          new_values?: Json
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      system_settings: {
        Row: {
          id: string
          organization_id: string
          company_name: string | null
          company_logo: string | null
          company_address: string | null
          company_phone: string | null
          company_email: string | null
          company_website: string | null
          default_language: string
          default_currency: string
          default_timezone: string
          date_format: string
          time_format: string
          work_start_time: string | null
          work_end_time: string | null
          work_days: number[] | null
          require_2fa: boolean
          session_timeout: number
          password_expiry_days: number
          require_strong_password: boolean
          email_notifications_enabled: boolean
          email_sender_name: string | null
          email_sender_address: string | null
          primary_color: string | null
          logo_url: string | null
          favicon_url: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          company_name?: string | null
          company_logo?: string | null
          company_address?: string | null
          company_phone?: string | null
          company_email?: string | null
          company_website?: string | null
          default_language?: string
          default_currency?: string
          default_timezone?: string
          date_format?: string
          time_format?: string
          work_start_time?: string | null
          work_end_time?: string | null
          work_days?: number[] | null
          require_2fa?: boolean
          session_timeout?: number
          password_expiry_days?: number
          require_strong_password?: boolean
          email_notifications_enabled?: boolean
          email_sender_name?: string | null
          email_sender_address?: string | null
          primary_color?: string | null
          logo_url?: string | null
          favicon_url?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          company_name?: string | null
          company_logo?: string | null
          company_address?: string | null
          company_phone?: string | null
          company_email?: string | null
          company_website?: string | null
          default_language?: string
          default_currency?: string
          default_timezone?: string
          date_format?: string
          time_format?: string
          work_start_time?: string | null
          work_end_time?: string | null
          work_days?: number[] | null
          require_2fa?: boolean
          session_timeout?: number
          password_expiry_days?: number
          require_strong_password?: boolean
          email_notifications_enabled?: boolean
          email_sender_name?: string | null
          email_sender_address?: string | null
          primary_color?: string | null
          logo_url?: string | null
          favicon_url?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_org_id: () => string | null
      is_super_admin: () => boolean
      is_hr_or_admin: () => boolean
      get_user_role: () => string | null
      user_belongs_to_org: (org_id: string) => boolean
      get_employee_name: (emp_id: string) => string | null
      count_working_days: (start_date: string, end_date: string, org_id: string) => number
      get_org_stats: (org_id: string) => Json
    }
  }
}

// Convenience type exports
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types
export type Organization = Tables<'organizations'>
export type Profile = Tables<'profiles'>
export type Department = Tables<'departments'>
export type Position = Tables<'positions'>
export type EmployeeCategory = Tables<'employee_categories'>
export type Grade = Tables<'grades'>
export type LeaveType = Tables<'leave_types'>
export type Employee = Tables<'employees'>
export type LeaveRequest = Tables<'leave_requests'>
export type LeaveBalance = Tables<'leave_balances'>
export type AttendanceRecord = Tables<'attendance_records'>
export type PayrollRecord = Tables<'payroll_records'>
export type PerformanceReview = Tables<'performance_reviews'>
export type PerformanceGoal = Tables<'performance_goals'>
export type JobPosting = Tables<'job_postings'>
export type Candidate = Tables<'candidates'>
export type TrainingProgram = Tables<'training_programs'>
export type TrainingEnrollment = Tables<'training_enrollments'>
export type DocumentTemplate = Tables<'document_templates'>
export type Document = Tables<'documents'>
export type PromotionRule = Tables<'promotion_rules'>
export type PromotionRecord = Tables<'promotion_records'>
export type Notification = Tables<'notifications'>
export type ActivityLog = Tables<'activity_logs'>
export type AuditLog = Tables<'audit_logs'>
export type SystemSettings = Tables<'system_settings'>
