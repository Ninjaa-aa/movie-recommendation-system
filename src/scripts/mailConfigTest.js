const { google } = require('googleapis');
const dns = require('dns');
require('dotenv').config();

class MailConfigTest {
  static async testConnection(host) {
    try {
      const addresses = await dns.promises.resolve4(host);
      return { success: true, addresses };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async testOAuthConfig() {
    const results = {
      envVars: {},
      networkConnectivity: {},
      oauth: null,
      gmailApi: null,
      overall: false
    };

    console.log('\n🔍 Testing Gmail API Configuration...\n');

    // 1. Environment Variables Check
    console.log('1️⃣ Checking Environment Variables:');
    const requiredVars = [
      'GMAIL_CLIENT_ID',
      'GMAIL_CLIENT_SECRET',
      'GMAIL_REFRESH_TOKEN',
      'GMAIL_EMAIL'
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

    // 2. Network Connectivity Test
    console.log('2️⃣ Testing Network Connectivity:');
    
    // DNS Resolution Test for Gmail API
    const googleApis = ['gmail.googleapis.com', 'oauth2.googleapis.com'];
    for (const host of googleApis) {
      const result = await this.testConnection(host);
      results.networkConnectivity[host] = result;
      console.log(`  ${result.success ? '✅' : '❌'} ${host} Resolution: ${result.success ? result.addresses[0] : result.error}`);
    }
    console.log();

    if (allEnvVarsPresent) {
      // 3. OAuth2 Test
      console.log('3️⃣ Testing OAuth2 Configuration:');
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
        results.oauth = { success: true, token: !!token };
        console.log('  ✅ OAuth2 configuration successful');

        // 4. Test Gmail API
        console.log('\n4️⃣ Testing Gmail API:');
        try {
          const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
          
          // Test by getting user profile
          const profile = await gmail.users.getProfile({
            userId: 'me'
          });

          // Test sending a test email
          const testEmail = {
            raw: Buffer.from(
              `From: ${process.env.GMAIL_EMAIL}\r\n` +
              `To: ${process.env.GMAIL_EMAIL}\r\n` +
              'Subject: Gmail API Test\r\n\r\n' +
              'This is a test email from the Gmail API configuration test.'
            ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
          };

          const sentEmail = await gmail.users.messages.send({
            userId: 'me',
            requestBody: testEmail
          });

          results.gmailApi = { 
            success: true, 
            emailAddress: profile.data.emailAddress,
            messagesTotal: profile.data.messagesTotal,
            testEmailId: sentEmail.data.id
          };

          console.log('  ✅ Gmail API connection successful');
          console.log(`  ✅ Connected as: ${profile.data.emailAddress}`);
          console.log(`  ✅ Test email sent successfully (ID: ${sentEmail.data.id})`);
        } catch (apiError) {
          console.log('  ❌ Gmail API failed:', apiError.message);
          results.gmailApi = { 
            success: false, 
            error: apiError.message 
          };
        }
      } catch (error) {
        results.oauth = { success: false, error: error.message };
        console.log(`  ❌ OAuth2 configuration failed: ${error.message}`);
      }
    }

    // Overall status
    results.overall = results.oauth?.success && results.gmailApi?.success;

    console.log('\n📊 Test Summary:');
    console.log(`  • Environment Variables: ${allEnvVarsPresent ? '✅' : '❌'}`);
    console.log(`  • Network Connectivity: ${Object.values(results.networkConnectivity).every(r => r.success) ? '✅' : '❌'}`);
    console.log(`  • OAuth2 Configuration: ${results.oauth?.success ? '✅' : '❌'}`);
    console.log(`  • Gmail API Connection: ${results.gmailApi?.success ? '✅' : '❌'}`);
    console.log(`\n🎯 Overall Status: ${results.overall ? '✅ PASSED' : '❌ FAILED'}`);

    if (!results.overall) {
      console.log('\n🔧 Troubleshooting Recommendations:');
      if (!Object.values(results.networkConnectivity).every(r => r.success)) {
        console.log('  • Check your internet connection');
        console.log('  • Verify access to Google APIs');
        console.log('  • Check if any firewall is blocking Google API access');
      }
      if (!results.oauth?.success) {
        console.log('  • Verify your Google Cloud Project settings');
        console.log('  • Check if Gmail API is enabled in Google Cloud Console');
        console.log('  • Regenerate your OAuth credentials');
      }
      if (!results.gmailApi?.success) {
        console.log('  • Verify Gmail API scopes in OAuth consent screen');
        console.log('  • Check if your Google account has Gmail API access');
        console.log('  • Try refreshing your OAuth tokens');
      }
    }

    return results;
  }

  // Method to send a test email using Gmail API
  static async sendTestEmail({ to, subject, body }) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        'https://developers.google.com/oauthplayground'
      );

      oauth2Client.setCredentials({
        refresh_token: process.env.GMAIL_REFRESH_TOKEN
      });

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      const email = {
        raw: Buffer.from(
          `From: ${process.env.GMAIL_EMAIL}\r\n` +
          `To: ${to}\r\n` +
          `Subject: ${subject}\r\n\r\n` +
          body
        ).toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '')
      };

      const result = await gmail.users.messages.send({
        userId: 'me',
        requestBody: email
      });

      return {
        success: true,
        messageId: result.data.id
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Auto-run test if this file is run directly
if (require.main === module) {
  MailConfigTest.testOAuthConfig()
    .then(async (results) => {
      if (results.overall) {
        console.log('\n📧 Sending test email...');
        const testResult = await MailConfigTest.sendTestEmail({
          to: process.env.GMAIL_EMAIL,
          subject: 'Gmail API Test Email',
          body: 'This is a test email sent using the Gmail API.'
        });
        console.log(testResult.success ? 
          `✅ Test email sent successfully (ID: ${testResult.messageId})` : 
          `❌ Failed to send test email: ${testResult.error}`
        );
      }
    })
    .catch(console.error);
}

module.exports = MailConfigTest;