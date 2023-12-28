/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  verbose: true,
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', './dist'],
  setupFiles: [],
  setupFilesAfterEnv: ['jest-extended/all']
};
