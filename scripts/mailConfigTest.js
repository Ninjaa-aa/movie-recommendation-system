// src/utils/mailConfigTest.js
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
require('dotenv').config(); // Add this to load environment variables

class MailConfigTest {
  static async getIPv4Address() {
    try {
      // Force IPv4 lookup
      const addresses = await dns.resolve4('smtp.gmail.com');
      return addresses[0]; // Get first IPv4 address
    } catch (error) {
      // logger.warn('IPv4 resolution failed:', error);
      return null;
    }
  }
  static async testOAuthConfig() {
    const results = {
      envVars: {},
      oauth: null,
      smtp: null,
      overall: false
    };

    console.log('\n🔍 Testing Mail Configuration...\n');

    // 1. Check environment variables
    console.log('1️⃣ Checking Environment Variables:');
    const requiredVars = [
      'GMAIL_CLIENT_ID',
      'GMAIL_CLIENT_SECRET',
      'GMAIL_REFRESH_TOKEN',
      'GMAIL_EMAIL',
      'GMAIL_APP_PASSWORD'
    ];

    let allEnvVarsPresent = true;
    requiredVars.forEach(varName => {
      const exists = !!process.env[varName];
      const valid = process.env[varName]?.length > 0;
      results.envVars[varName] = { exists, valid };
      
      console.log(`  ${exists && valid ? '✅' : '❌'} ${varName}: ${exists ? (valid ? 'Valid' : 'Empty') : 'Missing'}`);
      if (!exists || !valid) allEnvVarsPresent = false;
    });
    console.log();

    // Only proceed with OAuth and SMTP tests if environment variables are present
    if (allEnvVarsPresent) {
      // 2. Test OAuth2 Configuration
      console.log('2️⃣ Testing OAuth2 Configuration:');
      try {
        const oauth2Client = new google.auth.OAuth2(
          process.env.GMAIL_CLIENT_ID,
          process.env.GMAIL_CLIENT_SECRET,
          'https://developers.google.com/oauthplayground'
        );

        oauth2Client.setCredentials({
          refresh_token: process.env.GMAIL_REFRESH_TOKEN
        });

        const { token } = await oauth2Client.getAccessToken();
        results.oauth = {
          success: true,
          token: !!token,
          error: null
        };
        console.log('  ✅ OAuth2 configuration successful');
      } catch (error) {
        results.oauth = {
          success: false,
          token: false,
          error: error.message
        };
        console.log(`  ❌ OAuth2 configuration failed: ${error.message}`);
      }
      console.log();

      // 3. Test SMTP Connection
      // Get IPv4 address
      const ipv4Address = await this.getIPv4Address();
      console.log('3️⃣ Testing SMTP Connection:');
      try {
        const transport = nodemailer.createTransport({
          host: ipv4Address || 'smtp.gmail.com',
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
        });

        await transport.verify();
        results.smtp = {
          success: true,
          error: null
        };
        console.log('  ✅ SMTP connection successful');
      } catch (error) {
        results.smtp = {
          success: false,
          error: error.message
        };
        console.log(`  ❌ SMTP connection failed: ${error.message}`);
      }
      console.log();
    }

    // Overall status
    results.overall = results.oauth?.success || results.smtp?.success;

    // Display configuration advice if there are issues
    if (!results.overall) {
      console.log('📋 Configuration Advice:');
      const advice = this.getConfigurationAdvice(results);
      advice.forEach(tip => console.log(`  • ${tip}`));
      console.log();
    }

    console.log(`🎯 Overall Status: ${results.overall ? '✅ PASSED' : '❌ FAILED'}`);
    return results;
  }

  static getConfigurationAdvice(results) {
    const advice = [];

    // Environment Variables Advice
    Object.entries(results.envVars).forEach(([varName, status]) => {
      if (!status.exists || !status.valid) {
        advice.push(`${varName} is ${!status.exists ? 'missing' : 'empty'}. Please set this environment variable.`);
      }
    });

    // OAuth Advice
    if (!results.oauth?.success) {
      advice.push('OAuth configuration failed. Please verify:');
      advice.push('  - Your Google Cloud Console project is active');
      advice.push('  - OAuth2 credentials are correct');
      advice.push('  - Gmail API is enabled in your project');
      advice.push('  - Refresh token is valid and not expired');
    }

    // SMTP Advice
    if (!results.smtp?.success) {
      advice.push('SMTP connection failed. Please verify:');
      advice.push('  - Your network allows outbound connections to smtp.gmail.com:465');
      advice.push('  - Your Gmail account has App Password set up correctly');
      advice.push('  - Your Gmail account is not blocked or requiring additional verification');
    }

    return advice;
  }
}

// Auto-run test if this file is run directly
if (require.main === module) {
  MailConfigTest.testOAuthConfig().catch(console.error);
}

module.exports = MailConfigTest;