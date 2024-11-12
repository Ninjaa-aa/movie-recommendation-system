// src/config/mail.config.js
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const logger = require('../utils/logger');
const dns = require('dns').promises;

class MailService {
  static async getIPv4Address() {
    try {
      // Force IPv4 lookup
      const addresses = await dns.resolve4('smtp.gmail.com');
      return addresses[0]; // Get first IPv4 address
    } catch (error) {
      logger.warn('IPv4 resolution failed:', error);
      return null;
    }
  }

  static async createTransport() {
    try {
      // Get OAuth2 token
      const oauth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        'https://developers.google.com/oauthplayground'
      );

      oauth2Client.setCredentials({
        refresh_token: process.env.GMAIL_REFRESH_TOKEN
      });

      const { token: accessToken } = await oauth2Client.getAccessToken();
      
      // Get IPv4 address
      const ipv4Address = await this.getIPv4Address();

      // Configuration options
      const transportConfig = {
        host: ipv4Address || 'smtp.gmail.com', // Use resolved IPv4 if available
        port: 465,
        secure: true,
        family: 4, // Force IPv4
        auth: {
          type: 'OAuth2',
          user: process.env.GMAIL_EMAIL,
          clientId: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_CLIENT_SECRET,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN,
          accessToken
        },
        pool: true,
        maxConnections: 3,
        maxMessages: 100,
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
        debug: process.env.NODE_ENV !== 'production',
        logger: process.env.NODE_ENV !== 'production',
        tls: {
          rejectUnauthorized: true,
          minVersion: 'TLSv1.2'
        }
      };

      // Create transport
      const transport = nodemailer.createTransport(transportConfig);

      // Verify with timeout
      await Promise.race([
        transport.verify(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        )
      ]);

      logger.info('SMTP connection established successfully');
      return transport;

    } catch (error) {
      logger.warn('OAuth2 transport failed, trying App Password:', error.message);
      
      // Fallback to App Password with IPv4
      const fallbackConfig = {
        host: await this.getIPv4Address() || 'smtp.gmail.com',
        port: 465,
        secure: true,
        family: 4, // Force IPv4
        auth: {
          user: process.env.GMAIL_EMAIL,
          pass: process.env.GMAIL_APP_PASSWORD
        },
        pool: true,
        maxConnections: 3,
        maxMessages: 100,
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
        debug: process.env.NODE_ENV !== 'production',
        logger: process.env.NODE_ENV !== 'production',
        tls: {
          rejectUnauthorized: true,
          minVersion: 'TLSv1.2'
        }
      };

      const transport = nodemailer.createTransport(fallbackConfig);
      await transport.verify();
      return transport;
    }
  }

  static async sendEmail({ to, subject, html, retries = 3 }) {
    let lastError;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const transport = await this.createTransport();
        
        const mailOptions = {
          from: `${process.env.APP_NAME} <${process.env.GMAIL_EMAIL}>`,
          to,
          subject,
          html,
          headers: {
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'Importance': 'high'
          }
        };

        const info = await Promise.race([
          transport.sendMail(mailOptions),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Send timeout')), 15000)
          )
        ]);

        logger.info(`Email sent successfully on attempt ${attempt}:`, info.messageId);
        
        // Close the transport
        await transport.close();
        return info;

      } catch (error) {
        lastError = error;
        logger.error(`Attempt ${attempt} failed:`, error);
        
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`Failed to send email after ${retries} attempts. Last error: ${lastError.message}`);
  }

  // Helper method to test the connection
  static async testConnection() {
    try {
      const transport = await this.createTransport();
      await transport.close();
      return true;
    } catch (error) {
      logger.error('Connection test failed:', error);
      return false;
    }
  }
}

module.exports = MailService;