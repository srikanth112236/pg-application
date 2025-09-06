const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter based on environment
   */
  async initializeTransporter() {
    try {
      if (process.env.NODE_ENV === 'production') {
        // Production: Use AWS SES or other email service
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
      } else {
        // Development: Use Gmail or local testing
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER || 'your-email@gmail.com',
            pass: process.env.EMAIL_PASS || 'your-app-password'
          }
        });
      }
    } catch (error) {
      console.error('Email transporter initialization failed:', error);
    }
  }

  /**
   * Load email template
   * @param {string} templateName - Name of the template file
   * @param {Object} data - Data to replace in template
   * @returns {string} - HTML content
   */
  async loadTemplate(templateName, data) {
    try {
      const templatePath = path.join(__dirname, '../../templates', templateName);
      console.log('Loading email template from:', templatePath);
      
      let template = await fs.readFile(templatePath, 'utf8');
      console.log('Template loaded successfully, length:', template.length);
      
      // Replace placeholders with actual data
      Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, data[key]);
      });
      
      console.log('Template processed with data keys:', Object.keys(data));
      return template;
    } catch (error) {
      console.error('Error loading email template:', error);
      console.error('Template path attempted:', path.join(__dirname, '../../templates', templateName));
      
      // Return a basic HTML template as fallback
      return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>PG Maintenance System</title>
            <style>
                body { font-family: "Inter", sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .credentials { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0; border-radius: 5px; }
                .button { display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏠 PG Maintenance System</h1>
                    <h2>Welcome Admin!</h2>
                </div>
                <div class="content">
                    <p>Dear ${data.firstName || 'Admin'} ${data.lastName || ''},</p>
                    
                    <p>Your PG <strong>"${data.pgName || 'Property'}"</strong> has been successfully registered in our system.</p>
                    
                    <div class="credentials">
                        <h3>🔑 Your Admin Login Credentials</h3>
                        <p><strong>Email:</strong> ${data.email || 'N/A'}</p>
                        <p><strong>Password:</strong> ${data.password || 'Admin@123'}</p>
                        <p><strong>Role:</strong> Admin</p>
                    </div>
                    
                    <p>
                        <a href="${data.loginUrl || 'http://localhost:3000/admin/login'}" class="button">
                            🚀 Login to Admin Dashboard
                        </a>
                    </p>
                    
                    <p><strong>Important:</strong> Please login and change your password immediately for security.</p>
                    
                    <p>Best regards,<br>
                    <strong>PG Maintenance Team</strong></p>
                </div>
            </div>
        </body>
        </html>
      `;
    }
  }

  /**
   * Get default email template
   * @param {Object} data - Template data
   * @returns {string} - HTML content
   */
  getDefaultTemplate(data) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>PG Maintenance System</title>
          <style>
            body { font-family: "Inter", sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>PG Maintenance System</h1>
            </div>
            <div class="content">
              ${data.content || 'Email content goes here'}
            </div>
            <div class="footer">
              <p>© 2025 PG Maintenance System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Send email
   * @param {Object} options - Email options
   * @returns {Promise<Object>} - Email result
   */
  async sendEmail(options) {
    try {
      if (!this.transporter) {
        await this.initializeTransporter();
      }

      const mailOptions = {
        from: `"PG Maintenance System" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email
   * @param {Object} user - User object
   * @returns {Promise<Object>} - Email result
   */
  async sendWelcomeEmail(user) {
    const data = {
      name: user.firstName,
      email: user.email,
      password: user.plainPassword, // Store the plain password temporarily
      loginUrl: `${process.env.FRONTEND_URL}/login`
    };

    const html = await this.loadTemplate('welcome', data);
    
    return this.sendEmail({
      to: user.email,
      subject: 'Welcome to PG Maintenance System',
      html: html,
      text: `Welcome ${user.firstName}! Thank you for registering with PG Maintenance System. You can now login at: ${data.loginUrl}`
    });
  }

  /**
   * Send password reset email
   * @param {Object} user - User object
   * @param {string} resetToken - Password reset token
   * @returns {Promise<Object>} - Email result
   */
  async sendPasswordResetEmail(user, resetToken) {
    const data = {
      name: user.firstName,
      resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
      expiryTime: '10 minutes'
    };

    const html = await this.loadTemplate('password-reset', data);
    
    return this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request - PG Maintenance System',
      html: html,
      text: `Hello ${user.firstName}, you requested a password reset. Click this link to reset your password: ${data.resetUrl}. This link expires in ${data.expiryTime}.`
    });
  }

  /**
   * Send email verification email
   * @param {Object} user - User object
   * @param {string} verificationToken - Email verification token
   * @returns {Promise<Object>} - Email result
   */
  async sendEmailVerificationEmail(user, verificationToken) {
    const data = {
      name: user.firstName,
      verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`,
      expiryTime: '24 hours'
    };

    const html = await this.loadTemplate('email-verification', data);
    
    return this.sendEmail({
      to: user.email,
      subject: 'Verify Your Email - PG Maintenance System',
      html: html,
      text: `Hello ${user.firstName}, please verify your email by clicking this link: ${data.verificationUrl}. This link expires in ${data.expiryTime}.`
    });
  }

  /**
   * Send account locked email
   * @param {Object} user - User object
   * @returns {Promise<Object>} - Email result
   */
  async sendAccountLockedEmail(user) {
    const data = {
      name: user.firstName,
      unlockTime: new Date(user.lockUntil).toLocaleString(),
      supportEmail: process.env.SUPPORT_EMAIL || 'support@pgmaintenance.com'
    };

    const html = await this.loadTemplate('account-locked', data);
    
    return this.sendEmail({
      to: user.email,
      subject: 'Account Temporarily Locked - PG Maintenance System',
      html: html,
      text: `Hello ${user.firstName}, your account has been temporarily locked due to multiple failed login attempts. It will be unlocked at ${data.unlockTime}. Contact support if you need assistance.`
    });
  }

  /**
   * Send login notification email
   * @param {Object} user - User object
   * @param {Object} loginInfo - Login information
   * @returns {Promise<Object>} - Email result
   */
  async sendLoginNotificationEmail(user, loginInfo) {
    const data = {
      name: user.firstName,
      loginTime: new Date().toLocaleString(),
      ipAddress: loginInfo.ipAddress || 'Unknown',
      userAgent: loginInfo.userAgent || 'Unknown',
      location: loginInfo.location || 'Unknown'
    };

    const html = await this.loadTemplate('login-notification', data);
    
    return this.sendEmail({
      to: user.email,
      subject: 'New Login Detected - PG Maintenance System',
      html: html,
      text: `Hello ${user.firstName}, a new login was detected on your account at ${data.loginTime}. If this wasn't you, please contact support immediately.`
    });
  }

  /**
   * Send PG Admin Welcome Email
   * @param {Object} userData - User data including email, name, PG details, and credentials
   */
  async sendPGAdminWelcomeEmail(userData) {
    try {
      const { email, firstName, lastName, pgName, password, loginUrl } = userData;

      const emailData = {
        firstName,
        lastName,
        pgName,
        email,
        password,
        loginUrl,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@pgmaintenance.com',
        companyName: 'PG Maintenance System'
      };

      const htmlContent = await this.loadTemplate('pg-admin-welcome.html', emailData);

      const mailOptions = {
        from: `"${process.env.FROM_NAME || 'PG Maintenance'}" <${process.env.FROM_EMAIL}>`,
        to: email,
        subject: `Welcome to PG Maintenance - Admin Access for ${pgName}`,
        html: htmlContent,
        text: `Welcome to PG Maintenance System!
        
Your PG "${pgName}" has been successfully registered in our system.

Admin Login Credentials:
- Email: ${email}
- Password: ${password}
- Login URL: ${loginUrl}

Please login and change your password for security.

Best regards,
PG Maintenance Team`
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('PG Admin welcome email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending PG admin welcome email:', error);
      throw new Error(`Failed to send PG admin welcome email: ${error.message}`);
    }
  }

  /**
   * Send Support Staff Welcome Email
   * @param {Object} user - Support staff user data
   */
  async sendSupportWelcomeEmail(user) {
    try {
      const { email, firstName, lastName, plainPassword } = user;

      const emailData = {
        firstName,
        lastName,
        email,
        password: plainPassword || 'Support@123',
        loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/support-login`,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@pgmaintenance.com',
        companyName: 'PG Maintenance System'
      };

      const htmlContent = await this.loadTemplate('support-welcome.html', emailData);

      const mailOptions = {
        from: `"${process.env.FROM_NAME || 'PG Maintenance'}" <${process.env.FROM_EMAIL}>`,
        to: email,
        subject: 'Welcome to PG Maintenance - Support Staff Access',
        html: htmlContent,
        text: `Welcome to PG Maintenance System!
        
You have been registered as a Support Staff member.

Login Credentials:
- Email: ${email}
- Password: ${emailData.password}
- Login URL: ${emailData.loginUrl}

Please login and change your password for security.

Best regards,
PG Maintenance Team`
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Support staff welcome email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending support staff welcome email:', error);
      throw new Error(`Failed to send support staff welcome email: ${error.message}`);
    }
  }
}

module.exports = new EmailService(); 