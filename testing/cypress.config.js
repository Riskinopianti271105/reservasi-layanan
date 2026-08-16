const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    specPattern: 'e2e/**/*.cy.js',
    supportFile: 'support/commands.js',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'reports',
      overwrite: false,
      html: true,
      json: true,
    },
    env: {
      apiUrl: 'http://localhost:3000/api',
      validUser: { username: 'user1', password: 'password' },
      adminUser: { username: 'admin', password: 'password' },
    },
  },
});
