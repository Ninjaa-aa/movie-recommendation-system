const { google } = require('googleapis');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.validateEnvironmentVars();
    this.retryAttempts = 3;
    this.retryDelay = 2000;
    this.initializeGmail();
  }

  validateEnvironmentVars() {
    const requiredVars = [
      'GMAIL_CLIENT_ID',
      'GMAIL_CLIENT_SECRET',
      'GMAIL_REFRESH_TOKEN',
      'GMAIL_EMAIL'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }

  initializeGmail() {
    try {
      this.oauth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        'https://developers.google.com/oauthplayground'
      );

      this.oauth2Client.setCredentials({
        refresh_token: process.env.GMAIL_REFRESH_TOKEN
      });

      this.gmail = google.gmail({ 
        version: 'v1', 
        auth: this.oauth2Client 
      });

      logger.info('Gmail API service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Gmail API service:', error);
      throw error;
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  createMimeMessage(options) {
    const boundary = '____boundary____';
    
    const mimeHeaders = [
      `From: ${options.fromName || 'Movie Reminder'} <${process.env.GMAIL_EMAIL}>`,
      `To: ${options.to}`,
      `Subject: ${options.subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      options.text || 'Please view this email in an HTML-compatible email client.',
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      options.html,
      '',
      `--${boundary}--`
    ].join('\r\n');

    return Buffer.from(mimeHeaders)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  async sendMailWithRetry(emailOptions, attempt = 1) {
    try {
      const raw = this.createMimeMessage(emailOptions);
      
      const result = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw }
      });

      logger.info(`Email sent successfully: ${result.data.id}`);
      return { 
        success: true, 
        messageId: result.data.id 
      };
    } catch (error) {
      logger.warn(`Email sending failed (attempt ${attempt}):`, error);

      if (attempt < this.retryAttempts) {
        logger.info(`Retrying... Attempt ${attempt + 1} of ${this.retryAttempts}`);
        await this.sleep(this.retryDelay * attempt);
        return this.sendMailWithRetry(emailOptions, attempt + 1);
      }

      logger.error('All email sending attempts failed');
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  async sendMail(options) {
    const emailOptions = {
      ...options,
      fromName: options.fromName || 'Movie Reminder',
      to: options.to
    };

    return this.sendMailWithRetry(emailOptions);
  }

  async sendReleaseReminder(user, movie) {
    return this.sendMail({
      to: user.email,
      subject: `🎬 "${movie.title}" - Reminder Set!`,
      html: this._getReleaseEmailTemplate(user.name, movie)
    });
  }

  async sendTrailerNotification(user, movie) {
    return this.sendMail({
      to: user.email,
      subject: `🎥 New trailer for "${movie.title}"!`,
      html: this._getTrailerEmailTemplate(user.name, movie)
    });
  }

  async sendGenericNotification(user, notification) {
    return this.sendMail({
      to: user.email,
      subject: notification.title,
      html: this._getGenericNotificationTemplate(user.name, notification)
    });
  }

  _getReleaseEmailTemplate(userName, movie) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">New Movie Reminder Set!</h2>
          <p style="color: #666;">Hello ${userName}!</p>
          <p style="color: #666;">A new reminder has been set for the movie:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #1a73e8; margin: 0;">${movie.title}</h3>
            <p style="color: #666; margin: 10px 0;">Release Date: ${new Date(movie.releaseDate).toLocaleDateString()}</p>
            ${movie.genre ? `<p style="color: #666; margin: 5px 0;">Genre: ${movie.genre.join(', ')}</p>` : ''}
            ${movie.director ? `<p style="color: #666; margin: 5px 0;">Director: ${movie.director}</p>` : ''}
          </div>

          ${movie.coverPhoto ? `
            <div style="text-align: center; margin: 20px 0;">
              <img src="${movie.coverPhoto}" alt="${movie.title}" 
                   style="max-width: 300px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);"/>
            </div>
          ` : ''}

          ${movie.synopsis ? `
            <div style="margin: 20px 0;">
              <h4 style="color: #333;">Synopsis:</h4>
              <p style="color: #666;">${movie.synopsis}</p>
            </div>
          ` : ''}

          <div style="margin-top: 30px; padding: 15px; background-color: #e8f0fe; border-radius: 5px;">
            <p style="color: #1a73e8; margin: 0;">
              You will receive another notification one day before the release.
            </p>
          </div>

          <div style="margin-top: 20px; text-align: center;">
            <a href="http://localhost:3000/movies/${movie._id}" 
               style="display: inline-block; padding: 10px 20px; background-color: #1a73e8; color: white; text-decoration: none; border-radius: 5px;">
               View Movie Details
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>This is an automated notification from Movie Reminder System</p>
        </div>
      </div>
    `;
  }

  _getTrailerEmailTemplate(userName, movie) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <h2 style="color: #333;">Hi ${userName}!</h2>
        <p>Check out the new trailer for "${movie.title}"!</p>
        <div style="margin: 20px 0;">
          ${movie.coverPhoto ? `<img src="${movie.coverPhoto}" alt="${movie.title}" style="max-width: 300px; border-radius: 8px;"/>` : ''}
        </div>
        <p style="color: #666;">${movie.synopsis || ''}</p>
        <a href="http://localhost:3000/movies/${movie._id}/trailer" 
           style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">
           Watch Trailer
        </a>
      </div>
    `;
  }

  _getGenericNotificationTemplate(userName, notification) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <h2 style="color: #333;">Hello ${userName}!</h2>
        <h3 style="color: #1a73e8;">${notification.title}</h3>
        <p style="color: #666;">${notification.message}</p>
        <div style="margin-top: 20px;">
          <a href="http://localhost:3000/notifications" 
             style="display: inline-block; padding: 10px 20px; background-color: #1a73e8; color: white; text-decoration: none; border-radius: 5px;">
             View Details
          </a>
        </div>
      </div>
    `;
  }
}

module.exports = new EmailService();