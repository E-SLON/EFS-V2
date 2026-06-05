/**
 * Test setup using mongoose mock
 * No external MongoDB download required
 */
const mongoose = require('mongoose');

// Mock mongoose to use a fake connection for tests
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return actual;
});

process.env.JWT_SECRET        = 'test_jwt_secret_at_least_32_chars_long';
process.env.ADMIN_PASSWORD    = 'testpass123';
process.env.NODE_ENV          = 'test';

// In-process DB store (no real DB needed for unit tests)
const store = {};
global.__testStore = store;
