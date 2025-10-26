# DharmaSikhara Testing Plan

## Table of Contents
1. [Test Environment Setup](#test-environment-setup)
2. [Test Scenarios](#test-scenarios)
3. [Automated Testing](#automated-testing)
4. [Manual Testing](#manual-testing)
5. [Performance Testing](#performance-testing)
6. [Security Testing](#security-testing)
7. [User Acceptance Testing](#user-acceptance-testing)

## Test Environment Setup

### Prerequisites
1. Docker and Docker Compose installed
2. Node.js v14+ and npm installed
3. Python 3.9+ with pip installed
4. Access to InCaseLawBERT Hugging Face model

### Setup Instructions
1. Clone the repository
2. Run `docker-compose up -d` to start all services
3. Wait for services to initialize (approximately 2-3 minutes)
4. Verify all services are running with `docker-compose ps`

## Test Scenarios

### Authentication Tests

#### 1. User Registration
- **Test Case**: Register a new client user
- **Expected Result**: User is created with client role and JWT token is returned
- **Test Steps**:
  1. Send POST request to `/api/auth/register` with client role
  2. Verify response contains user data and token
  3. Verify user can login with credentials

#### 2. Contractor Registration
- **Test Case**: Register a new contractor user
- **Expected Result**: User is created with contractor role and JWT token is returned
- **Test Steps**:
  1. Send POST request to `/api/auth/register` with contractor role
  2. Verify response contains user data with contractor role
  3. Verify contractor can access contractor-only features

#### 3. User Login
- **Test Case**: Login with valid credentials
- **Expected Result**: JWT token is returned
- **Test Steps**:
  1. Send POST request to `/api/auth/login` with valid credentials
  2. Verify response contains token and user data

#### 4. Invalid Login
- **Test Case**: Login with invalid credentials
- **Expected Result**: Error response with 401 status
- **Test Steps**:
  1. Send POST request to `/api/auth/login` with invalid credentials
  2. Verify response contains error message

### AI Service Tests

#### 1. AI Status Check
- **Test Case**: Check if AI model is available
- **Expected Result**: Response indicating model availability
- **Test Steps**:
  1. Send GET request to `/api/ai/status`
  2. Verify response indicates model is available

#### 2. Document Analysis
- **Test Case**: Analyze a legal document
- **Expected Result**: Analysis results with document metrics
- **Test Steps**:
  1. Send POST request to `/api/ai/analyze-document` with document text
  2. Verify response contains analysis data

#### 3. Streaming Analysis
- **Test Case**: Stream analysis of a legal document
- **Expected Result**: Server-Sent Events with analysis tokens
- **Test Steps**:
  1. Connect to `/api/ai/stream-analysis` endpoint
  2. Verify streaming response with tokens and final result

### Scenario Management Tests

#### 1. Get All Scenarios
- **Test Case**: Retrieve all available scenarios
- **Expected Result**: List of scenarios
- **Test Steps**:
  1. Send GET request to `/api/scenarios`
  2. Verify response contains scenario data

#### 2. Get Scenario by ID
- **Test Case**: Retrieve a specific scenario
- **Expected Result**: Detailed scenario information
- **Test Steps**:
  1. Send GET request to `/api/scenarios/{id}`
  2. Verify response contains scenario details

#### 3. Create Scenario (Contractor Only)
- **Test Case**: Create a new scenario as contractor
- **Expected Result**: Scenario is created successfully
- **Test Steps**:
  1. Login as contractor
  2. Send POST request to `/api/scenarios` with scenario data
  3. Verify response indicates successful creation

#### 4. Create Scenario (Client)
- **Test Case**: Attempt to create scenario as client
- **Expected Result**: 403 Forbidden error
- **Test Steps**:
  1. Login as client
  2. Send POST request to `/api/scenarios` with scenario data
  3. Verify response is 403 Forbidden

#### 5. Update Scenario (Contractor)
- **Test Case**: Update existing scenario as contractor
- **Expected Result**: Scenario is updated successfully
- **Test Steps**:
  1. Login as contractor
  2. Send PUT request to `/api/scenarios/{id}` with updated data
  3. Verify response indicates successful update

#### 6. Delete Scenario (Contractor)
- **Test Case**: Delete existing scenario as contractor
- **Expected Result**: Scenario is deleted successfully
- **Test Steps**:
  1. Login as contractor
  2. Send DELETE request to `/api/scenarios/{id}`
  3. Verify response indicates successful deletion

### User Management Tests

#### 1. Get User Profile
- **Test Case**: Retrieve user profile information
- **Expected Result**: User profile data
- **Test Steps**:
  1. Login as user
  2. Send GET request to `/api/users/{id}`
  3. Verify response contains user data

#### 2. Update User Profile
- **Test Case**: Update user profile information
- **Expected Result**: User profile is updated successfully
- **Test Steps**:
  1. Login as user
  2. Send PUT request to `/api/users/{id}` with updated data
  3. Verify response indicates successful update

#### 3. Get User Progress
- **Test Case**: Retrieve user progress information
- **Expected Result**: User progress data
- **Test Steps**:
  1. Login as user
  2. Send GET request to `/api/users/{id}/progress`
  3. Verify response contains progress data

#### 4. Get User Analytics
- **Test Case**: Retrieve user analytics information
- **Expected Result**: User analytics data
- **Test Steps**:
  1. Login as user
  2. Send GET request to `/api/users/{id}/analytics`
  3. Verify response contains analytics data

### Multiplayer Tests

#### 1. Create Multiplayer Session
- **Test Case**: Create a new multiplayer session
- **Expected Result**: Session is created successfully
- **Test Steps**:
  1. Login as user
  2. Send POST request to `/api/multiplayer/sessions` with session data
  3. Verify response contains session information

#### 2. Join Multiplayer Session
- **Test Case**: Join an existing multiplayer session
- **Expected Result**: User joins session successfully
- **Test Steps**:
  1. Login as user
  2. Send POST request to `/api/multiplayer/sessions/{sessionId}/join`
  3. Verify response indicates successful join

#### 3. Leave Multiplayer Session
- **Test Case**: Leave a multiplayer session
- **Expected Result**: User leaves session successfully
- **Test Steps**:
  1. Login as user
  2. Send POST request to `/api/multiplayer/sessions/{sessionId}/leave`
  3. Verify response indicates successful leave

### Content Management Tests

#### 1. Get All Content
- **Test Case**: Retrieve all educational content
- **Expected Result**: List of content items
- **Test Steps**:
  1. Send GET request to `/api/content`
  2. Verify response contains content data

#### 2. Get Content by ID
- **Test Case**: Retrieve specific content item
- **Expected Result**: Detailed content information
- **Test Steps**:
  1. Send GET request to `/api/content/{id}`
  2. Verify response contains content details

#### 3. Create Content (Contractor Only)
- **Test Case**: Create new educational content as contractor
- **Expected Result**: Content is created successfully
- **Test Steps**:
  1. Login as contractor
  2. Send POST request to `/api/content` with content data
  3. Verify response indicates successful creation

#### 4. Update Content (Contractor)
- **Test Case**: Update existing content as contractor
- **Expected Result**: Content is updated successfully
- **Test Steps**:
  1. Login as contractor
  2. Send PUT request to `/api/content/{id}` with updated data
  3. Verify response indicates successful update

#### 5. Delete Content (Contractor)
- **Test Case**: Delete existing content as contractor
- **Expected Result**: Content is deleted successfully
- **Test Steps**:
  1. Login as contractor
  2. Send DELETE request to `/api/content/{id}`
  3. Verify response indicates successful deletion

## Automated Testing

### Backend API Tests

Create test files in `backend/tests/` directory:

#### Authentication Tests (`auth.test.js`)
```javascript
const request = require('supertest');
const app = require('../src/app');

describe('Authentication API', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'client'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toHaveProperty('id');
    expect(res.body.data.user.role).toBe('client');
  });

  it('should login a user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
  });
});
```

#### Scenario Tests (`scenarios.test.js`)
```javascript
const request = require('supertest');
const app = require('../src/app');

describe('Scenarios API', () => {
  let token;
  
  beforeAll(async () => {
    // Login to get auth token
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    token = res.body.data.token;
  });

  it('should get all scenarios', async () => {
    const res = await request(app)
      .get('/api/scenarios');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });

  it('should create a scenario (contractor only)', async () => {
    // First register a contractor
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'contractor',
        email: 'contractor@example.com',
        password: 'password123',
        role: 'contractor'
      });
    
    const contractorToken = registerRes.body.data.token;
    
    const res = await request(app)
      .post('/api/scenarios')
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({
        title: 'Test Scenario',
        description: 'A test scenario',
        category: 'civil',
        difficulty: 'beginner'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
  });
});
```

### Frontend Tests

Create test files in `frontend/src/__tests__/` directory:

#### Login Component Tests (`Login.test.tsx`)
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../pages/Login';
import { UserProvider } from '../contexts/UserContext';
import { BrowserRouter } from 'react-router-dom';

describe('Login Component', () => {
  it('renders login form', () => {
    render(
      <UserProvider>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </UserProvider>
    );
    
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('switches to signup form', () => {
    render(
      <UserProvider>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </UserProvider>
    );
    
    const signupLink = screen.getByText(/sign up/i);
    fireEvent.click(signupLink);
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/account type/i)).toBeInTheDocument();
  });
});
```

#### Legal Analysis Component Tests (`LegalAnalysis.test.tsx`)
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LegalAnalysis from '../pages/LegalAnalysis';
import { UserProvider } from '../contexts/UserContext';
import { BrowserRouter } from 'react-router-dom';

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      success: true,
      data: {
        modelAvailable: true
      }
    })
  })
) as jest.Mock;

describe('Legal Analysis Component', () => {
  it('renders analysis form', () => {
    render(
      <UserProvider>
        <BrowserRouter>
          <LegalAnalysis />
        </BrowserRouter>
      </UserProvider>
    );
    
    expect(screen.getByLabelText(/document text/i)).toBeInTheDocument();
    expect(screen.getByText(/analyze document/i)).toBeInTheDocument();
  });

  it('shows AI status', async () => {
    render(
      <UserProvider>
        <BrowserRouter>
          <LegalAnalysis />
        </BrowserRouter>
      </UserProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/ai model is ready for analysis/i)).toBeInTheDocument();
    });
  });
});
```

## Manual Testing

### Frontend Manual Tests

#### 1. User Registration and Login
1. Navigate to `/login`
2. Click "Sign up" link
3. Fill in registration form with username, email, password, and select "Client" role
4. Submit form and verify successful registration
5. Test login with registered credentials
6. Verify user is redirected to home page
7. Repeat steps 3-6 with "Contractor" role

#### 2. Navigation and Role-Based Access
1. Login as client user
2. Verify client dashboard is displayed
3. Navigate to "Create Scenario" page
4. Verify access is denied (redirected to dashboard)
5. Logout and login as contractor
6. Verify contractor dashboard is displayed
7. Navigate to "Create Scenario" page
8. Verify access is granted

#### 3. Legal Document Analysis
1. Navigate to "Legal Analysis" page
2. Paste sample legal document text
3. Click "Analyze Document" button
4. Verify streaming response is displayed
5. Verify final analysis results are shown

#### 4. Scenario Management
1. Login as contractor
2. Navigate to "Create Scenario" page
3. Fill in scenario creation form
4. Submit form and verify success message
5. Navigate to scenarios list
6. Verify new scenario appears in list
7. Edit scenario and verify update works
8. Delete scenario and verify removal

#### 5. Dashboard Functionality
1. Login as client
2. Navigate to dashboard
3. Verify performance metrics are displayed
4. Check achievements and recent activity
5. Logout and login as contractor
6. Navigate to dashboard
7. Verify contractor-specific metrics are displayed
8. Check portfolio items and client projects

### Backend Manual Tests

#### 1. API Endpoint Testing
1. Use Postman or curl to test all API endpoints
2. Verify correct HTTP status codes
3. Verify response structure and data
4. Test authentication requirements
5. Test role-based access control

#### 2. Database Operations
1. Verify data is correctly stored in databases
2. Check PostgreSQL for user and scenario data
3. Check MongoDB for session and content data
4. Verify Redis caching is working
5. Check Elasticsearch indexing

#### 3. AI Model Integration
1. Verify InCaseLawBERT model loads correctly
2. Test document analysis functionality
3. Verify streaming responses work
4. Check error handling for model issues

## Performance Testing

### Load Testing
1. Use tools like Apache Bench or JMeter
2. Test concurrent user scenarios
3. Measure response times under load
4. Identify bottlenecks

### Stress Testing
1. Gradually increase load until failure
2. Monitor resource usage (CPU, memory, disk)
3. Verify graceful degradation
4. Test recovery procedures

### Scalability Testing
1. Test horizontal scaling of services
2. Verify load balancing works
3. Test database connection pooling
4. Verify caching effectiveness

## Security Testing

### Authentication Security
1. Test password strength requirements
2. Verify JWT token expiration
3. Test brute force protection
4. Verify secure password storage

### API Security
1. Test rate limiting
2. Verify input validation
3. Test SQL injection prevention
4. Verify CORS configuration

### Data Security
1. Verify data encryption at rest
2. Test secure communication (HTTPS)
3. Verify proper data access controls
4. Test data backup and recovery

## User Acceptance Testing

### Client User Journey
1. Registration and onboarding
2. Dashboard exploration
3. Scenario selection and completion
4. Progress tracking and analytics
5. Legal document analysis
6. Multiplayer session participation

### Contractor User Journey
1. Registration and profile setup
2. Dashboard exploration
3. Scenario creation and management
4. Content creation and management
5. Client project management
6. Portfolio management

### Cross-Browser Testing
1. Test on Chrome, Firefox, Safari, Edge
2. Verify responsive design on mobile devices
3. Test accessibility features
4. Verify performance across browsers

### Usability Testing
1. Conduct user interviews
2. Gather feedback on user interface
3. Test user workflow efficiency
4. Identify pain points and improvements

## Test Execution

### Running Automated Tests

#### Backend Tests
```bash
cd backend
npm test
```

#### Frontend Tests
```bash
cd frontend
npm test
```

### Continuous Integration
1. Set up CI pipeline with GitHub Actions
2. Run tests on every commit
3. Generate test reports
4. Block deployments on test failures

## Test Reporting

### Test Results Dashboard
1. Track test coverage metrics
2. Monitor pass/fail rates
3. Identify flaky tests
4. Generate historical reports

### Defect Management
1. Log issues in issue tracker
2. Prioritize based on severity
3. Track resolution progress
4. Verify fixes with regression tests

## Test Maintenance

### Test Data Management
1. Maintain test data fixtures
2. Clean up test data regularly
3. Version control test data
4. Ensure data privacy compliance

### Test Environment Management
1. Automate test environment setup
2. Maintain environment consistency
3. Monitor environment health
4. Document environment dependencies