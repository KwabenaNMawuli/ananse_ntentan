# Unit Testing Guide for Ananse Ntentan

## 📚 Table of Contents
1. [Overview](#overview)
2. [Running Tests](#running-tests)
3. [Writing New Tests](#writing-new-tests)
4. [Test Coverage Requirements](#test-coverage-requirements)
5. [Security Testing](#security-testing)
6. [CI/CD Integration](#cicd-integration)

---

## Overview

This project uses **Jest** and **React Testing Library** for unit testing. Tests are automatically run in the CI/CD pipeline before any deployment.

### Testing Stack
- **Jest** - Test runner and assertion library
- **React Testing Library** - DOM testing utilities for React
- **jest-dom** - Custom matchers for DOM assertions

---

## Running Tests

### Run All Tests
```powershell
cd ananse_ntentan_frontend
npm test
```

### Run Tests with Coverage
```powershell
npm test -- --coverage --watchAll=false
```

### Run Specific Test File
```powershell
npm test -- Feed.test.js
```

### Run Tests in Watch Mode (Development)
```powershell
npm test -- --watch
```

---

## Writing New Tests

### Test File Naming Convention
- Tests should be placed next to the component they test
- Use the naming pattern: `ComponentName.test.js`
- Example: `Feed.js` → `Feed.test.js`

### Basic Test Structure
```javascript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyComponent from './MyComponent';

// 1. Describe block - groups related tests
describe('MyComponent', () => {
  
  // 2. Setup - runs before each test
  beforeEach(() => {
    // Reset mocks, clear state, etc.
  });

  // 3. Individual test cases
  test('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  test('should handle user interaction', () => {
    render(<MyComponent />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('New State')).toBeInTheDocument();
  });
});
```

### Testing Components with Router
```javascript
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

test('component with routing', () => {
  renderWithRouter(<ComponentWithLinks />);
  expect(screen.getByRole('link')).toHaveAttribute('href', '/expected-path');
});
```

### Testing Async Operations
```javascript
test('fetches and displays data', async () => {
  // Mock the API
  global.fetch = jest.fn().mockResolvedValue({
    json: () => Promise.resolve({ data: 'test' })
  });

  render(<AsyncComponent />);

  // Wait for async operation to complete
  await waitFor(() => {
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});
```

### Mocking API Calls
```javascript
// At the top of your test file
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
});

test('handles API error', async () => {
  fetch.mockRejectedValueOnce(new Error('Network error'));
  
  render(<MyComponent />);
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

---

## Test Coverage Requirements

### Minimum Coverage Thresholds (Recommended)
| Metric     | Minimum | Target |
|------------|---------|--------|
| Statements | 60%     | 80%    |
| Branches   | 50%     | 70%    |
| Functions  | 60%     | 80%    |
| Lines      | 60%     | 80%    |

### What to Test

#### ✅ ALWAYS Test
- User interactions (clicks, typing, form submissions)
- Conditional rendering (loading states, error states)
- API response handling (success and failure)
- Edge cases (empty data, missing fields)
- Security concerns (XSS prevention, input validation)

#### ❌ DON'T Test
- Third-party libraries (they have their own tests)
- CSS styling (unless critical to functionality)
- Implementation details (internal state, private methods)

---

## Security Testing

### XSS Prevention Tests
```javascript
test('should not execute script tags in user content', async () => {
  const maliciousData = '<script>alert("xss")</script>';
  
  render(<ComponentWithUserContent content={maliciousData} />);
  
  // Verify the script is rendered as text, not executed
  expect(screen.getByText(/alert/)).toBeInTheDocument();
});
```

### Input Validation Tests
```javascript
test('rejects invalid email format', () => {
  render(<LoginForm />);
  
  const emailInput = screen.getByLabelText(/email/i);
  fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
  fireEvent.submit(screen.getByRole('button'));
  
  expect(screen.getByText(/valid email/i)).toBeInTheDocument();
});
```

### Authentication Tests
```javascript
test('redirects unauthenticated users', () => {
  // Mock no auth token
  localStorage.getItem.mockReturnValue(null);
  
  render(<ProtectedComponent />);
  
  expect(screen.getByText(/please log in/i)).toBeInTheDocument();
});
```

---

## CI/CD Integration

### How Tests Run in Pipeline
1. **Push to GitHub** → Triggers workflow
2. **Test Job** runs `npm test -- --coverage --watchAll=false`
3. **If tests pass** → Build and Deploy jobs run
4. **If tests fail** → Pipeline stops, deployment blocked

### Enforcing Test Coverage in CI
Add to `package.json`:
```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "statements": 60,
        "branches": 50,
        "functions": 60,
        "lines": 60
      }
    }
  }
}
```

---

## Quick Reference: Common Assertions

```javascript
// Presence
expect(element).toBeInTheDocument();
expect(element).not.toBeInTheDocument();

// Visibility
expect(element).toBeVisible();
expect(element).toBeHidden();

// Content
expect(element).toHaveTextContent('text');
expect(input).toHaveValue('value');

// Attributes
expect(element).toHaveAttribute('href', '/path');
expect(element).toHaveClass('active');
expect(element).toBeDisabled();

// State
expect(checkbox).toBeChecked();
expect(input).toBeRequired();
```

---

## Common Testing Queries

```javascript
// By Text (most common)
screen.getByText('Submit');
screen.getByText(/submit/i); // case-insensitive

// By Role (accessible)
screen.getByRole('button');
screen.getByRole('button', { name: /submit/i });

// By Label (forms)
screen.getByLabelText('Email');

// By Placeholder
screen.getByPlaceholderText('Enter email');

// By Test ID (last resort)
screen.getByTestId('custom-element');
```

---

## Running Your First Test

```powershell
cd ananse_ntentan_frontend
npm test -- --watchAll=false
```

This will run all tests in your project and show you the results!

---


