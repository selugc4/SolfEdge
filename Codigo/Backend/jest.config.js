module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'routes/**/*.js'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ],
  testMatch: [
    '**/test/**/*.test.js'
  ],
  setupFiles: ['dotenv/config']
};
