// src/services/email.service.js
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      throw new Error('Email credentials not configured. Please check your .env file.');
    }

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587, // Change to port 587 for TLS
      secure: false, // Use TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      },
      timeout: 10000, // Set timeout to 10 seconds
      debug: true,
      logger: true
    });

    // Test configuration
    this.testConnection();
  }

  async testConnection() {
    try {
      const verifyResult = await this.transporter.verify();
      if (verifyResult) {
        logger.info('SMTP connection configured successfully');
      }
    } catch (error) {
      logger.error('SMTP configuration error:', error);
      // Try alternative configuration if first one fails
      this.setupAlternativeTransport();
    }
  }

  setupAlternativeTransport() {
    logger.info('Attempting alternative SMTP configuration...');
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      },
      debug: true,
      logger: true
    });
  }

  async sendMail(options) {
    try {
      const info = await this.transporter.sendMail({
        ...options,
        from: `"Movie Reminder" <${process.env.EMAIL_USER}>`,
        to: "hammadzahid254@gmail.com" // Always send to this email
      });
      logger.info(`Email sent successfully: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Failed to send email:', error);
      // Try with alternative configuration if first attempt fails
      try {
        this.setupAlternativeTransport();
        const info = await this.transporter.sendMail({
          ...options,
          from: `"Movie Reminder" <${process.env.EMAIL_USER}>`,
          to: "hammadzahid254@gmail.com"
        });
        logger.info(`Email sent successfully with alternative config: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
      } catch (retryError) {
        logger.error('Failed to send email with alternative config:', retryError);
        return { success: false, error: retryError.message };
      }
    }
  }

  async sendReleaseReminder(user, movie) {
    return this.sendMail({
      subject: `🎬 "${movie.title}" - Reminder Set!`,
      html: this._getReleaseEmailTemplate(user.name, movie)
    });
  }

  async sendTrailerNotification(user, movie) {
    return this.sendMail({
      subject: `🎥 New trailer for "${movie.title}"!`,
      html: this._getTrailerEmailTemplate(user.name, movie)
    });
  }

  async sendGenericNotification(user, notification) {
    return this.sendMail({
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