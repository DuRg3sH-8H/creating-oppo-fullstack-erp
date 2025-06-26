import nodemailer from "nodemailer"
import type { EmailNotification } from "@/models/notification"

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendEmail(emailData: EmailNotification): Promise<boolean> {
  try {
  

    const transporter = createTransporter()

    // Verify connection
    await transporter.verify()

    const mailOptions = {
      from: {
        name: process.env.SMTP_FROM_NAME || "School ERP System",
        address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "",
      },
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
      priority: emailData.priority === "urgent" ? "high" : "normal" as "high" | "normal" | "low",
    }

    const result = await transporter.sendMail(mailOptions)

    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

export async function sendBulkEmails(emails: EmailNotification[]): Promise<{ sent: number; failed: number }> {
  let sent = 0
  let failed = 0

  for (const email of emails) {
    try {
      const success = await sendEmail(email)
      if (success) {
        sent++
      } else {
        failed++
      }
    } catch (error) {
      console.error("Error sending bulk email:", error)
      failed++
    }
  }

  return { sent, failed }
}

export function generateEmailTemplate(
  template: string,
  variables: Record<string, any>,
): { html: string; text: string } {
  let html = template
  let text = template.replace(/<[^>]*>/g, "") // Strip HTML tags for text version

  // Replace variables in both HTML and text
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    html = html.replace(new RegExp(placeholder, "g"), String(value))
    text = text.replace(new RegExp(placeholder, "g"), String(value))
  })

  return { html, text }
}
