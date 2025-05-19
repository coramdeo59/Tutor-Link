import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import axios from 'axios';
import emailConfig from '../config/email.config';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  private readonly logger = new Logger(MailerService.name);

  constructor(
    @Inject(emailConfig.KEY)
    private readonly emailConfiguration: ConfigType<typeof emailConfig>,
  ) {
    // Create a transporter using Mailtrap's SMTP settings
    this.transporter = nodemailer.createTransport({
      host: this.emailConfiguration.host,
      port: this.emailConfiguration.port,
      auth: {
        user: this.emailConfiguration.auth.user,
        pass: this.emailConfiguration.auth.pass,
      },
    });

    // Log the email configuration for debugging
    this.logger.log(`Email configuration initialized with host: ${this.emailConfiguration.host}`);
  }

  async sendPasswordResetEmail(email: string, token: string, frontendUrl: string): Promise<void> {
    try {
      const resetLink = `${frontendUrl}/auth/reset-password?token=${token}`;
      this.logger.log(`Sending password reset email to ${email} with reset link: ${resetLink}`);

      // First try using the Mailtrap API
      try {
        await this.sendViaMailtrapApi(email, token, resetLink);
        this.logger.log(`Password reset email sent via Mailtrap API to ${email}`);
        return;
      } catch (apiError) {
        this.logger.error(`Failed to send via Mailtrap API: ${apiError.message}`);
        this.logger.log('Falling back to SMTP transport...');
      }

      // Fallback to SMTP if API fails
      const mailOptions = {
        from: this.emailConfiguration.from,
        to: email,
        subject: 'Reset Your Tutor-Link Password',
        html: this.getPasswordResetEmailTemplate(resetLink),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent via SMTP to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email: ${error.message}`);
      throw error;
    }
  }

  private async sendViaMailtrapApi(email: string, token: string, resetLink: string): Promise<void> {
    const apiKey = this.emailConfiguration.auth.pass;
    const apiUrl = `https://${this.emailConfiguration.host}/api/send`;
    
    const payload = {
      to: [{ email }],
      from: { email: this.emailConfiguration.from },
      subject: 'Reset Your Tutor-Link Password',
      html: this.getPasswordResetEmailTemplate(resetLink),
      category: 'Password Reset'
    };

    await axios.post(apiUrl, payload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  private getPasswordResetEmailTemplate(resetLink: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f4e5; padding: 20px; text-align: center;">
          <h1 style="color: #f59e0b;">Tutor-Link</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #1f2937;">Password Reset Request</h2>
          <p style="color: #4b5563; line-height: 1.5;">
            We received a request to reset your password for your Tutor-Link account. 
            Click the button below to create a new password. This link will expire in 1 hour.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #4b5563; line-height: 1.5;">
            If you didn't request a password reset, you can safely ignore this email.
          </p>
          <p style="color: #4b5563; line-height: 1.5;">
            If the button above doesn't work, copy and paste this link into your browser:
          </p>
          <p style="background-color: #f3f4f6; padding: 10px; word-break: break-all;">
            ${resetLink}
          </p>
        </div>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; color: #6b7280; font-size: 14px;">
          &copy; ${new Date().getFullYear()} Tutor-Link. All rights reserved.
        </div>
      </div>
    `;
  }
}
