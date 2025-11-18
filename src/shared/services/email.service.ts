import sgMail from '@sendgrid/mail';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { supabase } from '../utils/database.js';
import { buildIdeasEmailHtml, buildIdeasEmailText, EmailIdea } from '../templates/ideas-notification.template.js';

sgMail.setApiKey(env.SENDGRID_API_KEY);

export type { EmailIdea };

class EmailService {
  private readonly fromEmail = 'noreply@product-ideas-generator.com';

  async sendIdeasNotification(
    email: string,
    ideas: EmailIdea[],
  ): Promise<boolean> {
    try {
      const msg = {
        to: email,
        from: this.fromEmail,
        subject: `${ideas.length} New Product Ideas for You!`,
        html: buildIdeasEmailHtml(ideas),
        text: buildIdeasEmailText(ideas),
      };

      await sgMail.send(msg);

      logger.info('Email sent successfully', { email, ideasCount: ideas.length });

      return true;
    } catch (error) {
      logger.error('Failed to send email', { error, email });
      return false;
    }
  }

  async logEmailDelivery(
    subscriptionId: string,
    ideaIds: string[],
    status: string
  ): Promise<void> {
    const { error } = await supabase.from('email_logs').insert({
      subscription_id: subscriptionId,
      status,
      sent_at: new Date().toISOString(),
      ideas_sent: ideaIds,
    });

    if (error) {
      logger.error('Failed to log email delivery', { error });
    }
  }
}

export const emailService = new EmailService();
