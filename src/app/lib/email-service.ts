/**
 * Web3Forms Email Service for Staffly AI
 * 
 * Uses Web3Forms (https://web3forms.com) as the email delivery endpoint.
 * Get a free access key at: https://web3forms.com
 * 
 * The access key is stored in localStorage for persistence.
 * In production, consider storing it server-side for security.
 */

const WEB3FORMS_URL = "https://api.web3forms.com/submit";

export interface EmailPayload {
  to: string;
  subject: string;
  message: string;
  from_name?: string;
}

export interface EmailResult {
  success: boolean;
  message: string;
}

/** Get the stored Web3Forms access key */
export function getWeb3FormsKey(): string {
  return localStorage.getItem("staffly-web3forms-key") || "";
}

/** Save the Web3Forms access key */
export function setWeb3FormsKey(key: string): void {
  localStorage.setItem("staffly-web3forms-key", key);
}

/** Get the stored notification email */
export function getNotificationEmail(): string {
  return localStorage.getItem("staffly-notification-email") || "";
}

/** Save the notification email */
export function setNotificationEmail(email: string): void {
  localStorage.setItem("staffly-notification-email", email);
}

/** Get stored notification preferences (which types are enabled) */
export function getNotificationPrefs(): Record<string, boolean> {
  try {
    const stored = localStorage.getItem("staffly-notification-prefs");
    return stored ? JSON.parse(stored) : {
      leaveApproval: true,
      payroll: true,
      onboarding: true,
      performance: true,
      training: true,
      promotions: true,
    };
  } catch {
    return { leaveApproval: true, payroll: true, onboarding: true, performance: true, training: true, promotions: true };
  }
}

/** Save notification preferences */
export function setNotificationPrefs(prefs: Record<string, boolean>): void {
  localStorage.setItem("staffly-notification-prefs", JSON.stringify(prefs));
}

/**
 * Send an email via Web3Forms
 */
export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  const accessKey = getWeb3FormsKey();
  
  if (!accessKey) {
    return { success: false, message: "Web3Forms access key not configured. Please set it in Settings > Notifications." };
  }

  if (!payload.to) {
    return { success: false, message: "No recipient email address configured." };
  }

  try {
    const response = await fetch(WEB3FORMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        to: payload.to,
        from_name: payload.from_name || "Staffly AI HRMS",
        subject: payload.subject,
        message: payload.message,
        // Disable captcha for API calls
        botcheck: "",
      }),
    });

    const data = await response.json();

    if (data.success) {
      return { success: true, message: "Email sent successfully!" };
    } else {
      return { success: false, message: data.message || "Failed to send email." };
    }
  } catch (error: any) {
    return { success: false, message: error?.message || "Network error while sending email." };
  }
}

/**
 * Send a promotion notification email
 */
export async function sendPromotionNotificationEmail(params: {
  employeeName: string;
  category: string;
  currentGrade: string;
  nextGrade: string;
  urgency: "overdue" | "due_soon" | "upcoming";
  detail: string;
}): Promise<EmailResult> {
  const email = getNotificationEmail();
  const prefs = getNotificationPrefs();

  if (!prefs.promotions) {
    return { success: false, message: "Promotion notifications are disabled." };
  }

  const urgencyLabels = { overdue: "🔴 OVERDUE", due_soon: "🟡 DUE SOON", upcoming: "🟢 UPCOMING" };

  const subject = `[Staffly AI] Promotion ${urgencyLabels[params.urgency]} — ${params.employeeName}`;
  const message = [
    `Promotion Notification — ${urgencyLabels[params.urgency]}`,
    ``,
    `Employee: ${params.employeeName}`,
    `Category: ${params.category}`,
    `Current Grade: ${params.currentGrade}`,
    `Next Grade: ${params.nextGrade}`,
    `Detail: ${params.detail}`,
    ``,
    `— Staffly AI HRMS`,
  ].join("\n");

  return sendEmail({ to: email, subject, message });
}

/**
 * Send a test email to verify configuration
 */
export async function sendTestEmail(): Promise<EmailResult> {
  const email = getNotificationEmail();
  return sendEmail({
    to: email,
    subject: "[Staffly AI] Test Notification",
    message: "This is a test email from Staffly AI HRMS.\n\nIf you received this, your email notification settings are configured correctly!\n\n— Staffly AI HRMS",
  });
}
