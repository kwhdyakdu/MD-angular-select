module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '^client/(.*)$': '<rootDir>/src/client/$1',
    '^pages/(.*)$': '<rootDir>/src/pages/$1',
    '^server/(.*)$': '<rootDir>/src/server/$1',
    '^types/(.*)$': '<rootDir>/src/types/$1',
    '^utils/(.*)$': '<rootDir>/src/utils/$1'
  },
  testPathIgnorePatterns: ['/node_modules/', '/wordpress/']
}
