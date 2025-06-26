import {
  createNotification,
  getUserNotificationPreferences,
} from "@/lib/db/notifications";
import { sendEmail } from "@/lib/email/nodemailer";
import { findUserById } from "@/lib/db/users";
import {
  NotificationType,
  NotificationCategory,
  NotificationPriority,
  EmailNotification,
} from "@/models/notification";

interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  priority?: NotificationPriority;
  data?: any;
  actionUrl?: string;
  expiresAt?: Date;
}

export class NotificationService {
  static async sendNotification(
    notificationData: NotificationData
  ): Promise<boolean> {
    try {
      // Get user and their preferences
      const user = await findUserById(notificationData.userId);
      if (!user) {
        return false;
      }

      const preferences = await getUserNotificationPreferences(
        notificationData.userId
      );

      // Create web notification
      const webNotificationId = await createNotification({
        userId: notificationData.userId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        category: notificationData.category,
        priority: notificationData.priority || NotificationPriority.MEDIUM,
        read: false,
        emailSent: false,
        data: notificationData.data,
        actionUrl: notificationData.actionUrl,
        expiresAt: notificationData.expiresAt,
      });

      // Send email if user has email notifications enabled
      let emailSent = false;
      if (
        preferences?.email &&
        this.shouldSendEmailForCategory(preferences, notificationData.category)
      ) {
        const emailData: EmailNotification = {
          to: user.email,
          subject: notificationData.title,
          html: this.generateEmailHTML(notificationData, user),
          text: this.generateEmailText(notificationData, user),
          priority: notificationData.priority || NotificationPriority.MEDIUM,
          category: notificationData.category,
        };

        emailSent = await sendEmail(emailData);

        // Update notification with email status
        if (emailSent) {
          // Update the notification to mark email as sent
          // This would require another database update function
        }
      }

      return true;
    } catch (error) {
      console.error("Error in notification service:", error);
      return false;
    }
  }

  static async sendBulkNotification(
    userIds: string[],
    notificationData: Omit<NotificationData, "userId">
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const userId of userIds) {
      try {
        const success = await this.sendNotification({
          ...notificationData,
          userId,
        });

        if (success) {
          sent++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(
          "Error sending bulk notification to user:",
          userId,
          error
        );
        failed++;
      }
    }

    return { sent, failed };
  }

  static async sendSystemNotification(
    title: string,
    message: string,
    priority: NotificationPriority = NotificationPriority.MEDIUM
  ): Promise<void> {
    
  }

  private static shouldSendEmailForCategory(
    preferences: any,
    category: NotificationCategory
  ): boolean {
    switch (category) {
      case NotificationCategory.STUDENT:
        return preferences.student !== false;
      case NotificationCategory.TRAINING:
        return preferences.training !== false;
      case NotificationCategory.CLUB:
        return preferences.club !== false;
      case NotificationCategory.DOCUMENT:
        return preferences.document !== false;
      case NotificationCategory.ISO:
        return preferences.iso !== false;
      case NotificationCategory.SECURITY:
        return preferences.security !== false;
      case NotificationCategory.SYSTEM:
        return preferences.updates !== false;
      default:
        return true;
    }
  }

  private static generateEmailHTML(
    notificationData: NotificationData,
    user: any
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notificationData.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .priority-high { border-left: 4px solid #ef4444; }
          .priority-medium { border-left: 4px solid #f59e0b; }
          .priority-low { border-left: 4px solid #10b981; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${notificationData.title}</h1>
          </div>
          <div class="content priority-${
            notificationData.priority || "medium"
          }">
            <p>Hello ${user.name},</p>
            <p>${notificationData.message}</p>
            ${
              notificationData.actionUrl
                ? `<a href="${notificationData.actionUrl}" class="button">View Details</a>`
                : ""
            }
            <p>Best regards,<br>School ERP System</p>
          </div>
          <div class="footer">
            <p>You received this email because you have notifications enabled in your account settings.</p>
            <p>To change your notification preferences, please visit your account settings.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateEmailText(
    notificationData: NotificationData,
    user: any
  ): string {
    return `
Hello ${user.name},

${notificationData.title}

${notificationData.message}

${
  notificationData.actionUrl
    ? `View Details: ${notificationData.actionUrl}`
    : ""
}

Best regards,
School ERP System

---
You received this email because you have notifications enabled in your account settings.
To change your notification preferences, please visit your account settings.
    `.trim();
  }
}

// Convenience functions for common notification types
export async function notifyStudentPromotion(
  userId: string,
  studentName: string,
  fromClass: string,
  toClass: string
) {
  return NotificationService.sendNotification({
    userId,
    title: "Student Promoted",
    message: `${studentName} has been successfully promoted from ${fromClass} to ${toClass}.`,
    type: NotificationType.SUCCESS,
    category: NotificationCategory.STUDENT,
    priority: NotificationPriority.MEDIUM,
    actionUrl: "/dashboard/students",
  });
}

export async function notifyTrainingRegistration(
  userId: string,
  trainingTitle: string,
  trainingDate: string
) {
  return NotificationService.sendNotification({
    userId,
    title: "Training Registration Confirmed",
    message: `Your registration for "${trainingTitle}" scheduled on ${trainingDate} has been confirmed.`,
    type: NotificationType.SUCCESS,
    category: NotificationCategory.TRAINING,
    priority: NotificationPriority.MEDIUM,
    actionUrl: "/dashboard/trainings",
  });
}

export async function notifyDocumentUpload(
  userId: string,
  documentName: string,
  uploaderName: string
) {
  return NotificationService.sendNotification({
    userId,
    title: "New Document Uploaded",
    message: `${uploaderName} has uploaded a new document: "${documentName}".`,
    type: NotificationType.INFO,
    category: NotificationCategory.DOCUMENT,
    priority: NotificationPriority.LOW,
    actionUrl: "/dashboard/documents",
  });
}

export async function notifySystemMaintenance(
  userId: string,
  maintenanceDate: string
) {
  return NotificationService.sendNotification({
    userId,
    title: "Scheduled System Maintenance",
    message: `System maintenance is scheduled for ${maintenanceDate}. Some features may be temporarily unavailable.`,
    type: NotificationType.WARNING,
    category: NotificationCategory.SYSTEM,
    priority: NotificationPriority.HIGH,
  });
}
