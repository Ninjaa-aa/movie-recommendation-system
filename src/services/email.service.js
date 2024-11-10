// src/services/email.service.js
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });
  }

  async sendReleaseReminder(user, movie) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `🎬 "${movie.title}" is releasing soon!`,
        html: this._getReleaseEmailTemplate(user.name, movie)
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Release reminder email sent to ${user.email}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Error sending release reminder email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendTrailerNotification(user, movie) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `🎥 New trailer for "${movie.title}"!`,
        html: this._getTrailerEmailTemplate(user.name, movie)
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Trailer notification email sent to ${user.email}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Error sending trailer notification email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendGenreUpdateNotification(user, movies) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: '🍿 New movies in your favorite genres!',
        html: this._getGenreUpdateEmailTemplate(user.name, movies)
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Genre update email sent to ${user.email}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Error sending genre update email:', error);
      return { success: false, error: error.message };
    }
  }

  // Email templates remain the same
  _getReleaseEmailTemplate(userName, movie) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${userName}!</h2>
        <p>Great news! "${movie.title}" is releasing on ${new Date(movie.releaseDate).toLocaleDateString()}.</p>
        <div style="margin: 20px 0;">
          <img src="${movie.coverPhoto.filePath}" alt="${movie.title}" style="max-width: 300px; border-radius: 8px;"/>
        </div>
        <h3>Movie Details:</h3>
        <ul>
          <li>Genre: ${movie.genre.join(', ')}</li>
          <li>Director: ${movie.director}</li>
          <li>Runtime: ${movie.runtime} minutes</li>
        </ul>
        <p>${movie.synopsis}</p>
        <a href="http://localhost:3000/movies/${movie._id}" 
           style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
           View Movie Details
        </a>
      </div>
    `;
  }

  _getTrailerEmailTemplate(userName, movie) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${userName}!</h2>
        <p>Check out the new trailer for "${movie.title}"!</p>
        <div style="margin: 20px 0;">
          <img src="${movie.coverPhoto.filePath}" alt="${movie.title}" style="max-width: 300px; border-radius: 8px;"/>
        </div>
        <p>${movie.synopsis}</p>
        <a href="http://localhost:3000/movies/${movie._id}/trailer" 
           style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">
           Watch Trailer
        </a>
      </div>
    `;
  }

  _getGenreUpdateEmailTemplate(userName, movies) {
    const movieList = movies.map(movie => `
      <li style="margin-bottom: 10px;">
        <strong>${movie.title}</strong> (${new Date(movie.releaseDate).getFullYear()})
        <br>
        Genres: ${movie.genre.join(', ')}
      </li>
    `).join('');

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${userName}!</h2>
        <p>We have new movies in genres you love:</p>
        <ul style="list-style-type: none; padding: 0;">
          ${movieList}
        </ul>
        <a href="http://localhost:3000/movies" 
           style="display: inline-block; padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px;">
           Explore Movies
        </a>
      </div>
    `;
  }
}

module.exports = new EmailService();