// // src/config/config.js
// require('dotenv').config();

// const config = {
//   email: {
//     // Mailtrap configuration
//     host: 'sandbox.smtp.mailtrap.io',
//     port: 2525,
//     secure: false,
//     auth: {
//       user: process.env.MAILTRAP_USER,
//       pass: process.env.MAILTRAP_PASSWORD
//     }
//   },
//   frontend: {
//     url: process.env.FRONTEND_URL || 'http://localhost:3000'
//   }
// };

// module.exports = config;

// // // src/config/config.js
// // require('dotenv').config();

// // const config = {
// //   email: {
// //     host: 'smtp.gmail.com',
// //     port: 465, // Changed to 465 for SSL
// //     secure: true, // Changed to true for SSL
// //     auth: {
// //       user: process.env.EMAIL_USER,
// //       pass: process.env.EMAIL_APP_PASSWORD
// //     },
// //     tls: {
// //       rejectUnauthorized: false // Only for testing
// //     },
// //     // Add timeout settings
// //     connectionTimeout: 10000, // 10 seconds
// //     greetingTimeout: 10000
// //   },
// //   frontend: {
// //     url: process.env.FRONTEND_URL || 'http://localhost:3000'
// //   }
// // };

// // module.exports = config;


// src/config/config.js
require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  email: {
    // We'll set these dynamically in the email service
    host: null,
    port: null,
    secure: false,
    auth: {
      user: null,
      pass: null
    }
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000'
  }
};

module.exports = config;