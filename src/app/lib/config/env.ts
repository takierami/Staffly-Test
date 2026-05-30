// ============================================================
// Environment Configuration for Staffly AI
// Maps to .env / .env.example from the migration plan
// ============================================================

export const ENV = {
  // Supabase Configuration
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co",
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key",

  // JWT
  JWT_SECRET: import.meta.env.VITE_JWT_SECRET || "your-secret-key-change-in-production",

  // Application
  APP_NAME: import.meta.env.VITE_APP_NAME || "Staffly AI",
  APP_URL: import.meta.env.VITE_APP_URL || "http://localhost:5173",
  NODE_ENV: import.meta.env.MODE || "development",

  // API Base URL (points to backend when deployed)
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "/api",

  // Email (optional)
  SMTP_HOST: import.meta.env.VITE_SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: parseInt(import.meta.env.VITE_SMTP_PORT || "587"),
  SMTP_USER: import.meta.env.VITE_SMTP_USER || "noreply@stafflyai.com",

  // File Upload
  MAX_FILE_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || "5242880"),
  ALLOWED_FILE_TYPES: (import.meta.env.VITE_ALLOWED_FILE_TYPES || ".pdf,.doc,.docx,.jpg,.jpeg,.png").split(","),
} as const;

