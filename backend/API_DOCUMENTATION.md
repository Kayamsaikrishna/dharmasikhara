# DharmaSikhara API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Users](#users)
3. [AI Services](#ai-services)
4. [Scenarios](#scenarios)
5. [Analytics](#analytics)
6. [Multiplayer](#multiplayer)
7. [Content Management](#content-management)

## Authentication

### Register a new user
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "client|contractor" // Optional, defaults to "client"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "string",
      "email": "string",
      "role": "client|contractor"
    },
    "token": "jwt_token"
  }
}
```

### Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "string",
      "email": "string",
      "role": "client|contractor"
    },
    "token": "jwt_token"
  }
}
```

### Logout
**POST** `/api/auth/logout`

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## Users

### Get user by ID
**GET** `/api/users/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "institution": "string",
    "year": "string",
    "specialization": "string",
    "role": "client|contractor",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

### Get all users
**GET** `/api/users`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "string",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "institution": "string",
      "year": "string",
      "specialization": "string",
      "role": "client|contractor"
    }
  ]
}
```

### Update user
**PUT** `/api/users/:id`

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "institution": "string",
  "year": "string",
  "specialization": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "firstName": "string",
    "lastName": "string",
    "institution": "string",
    "year": "string",
    "specialization": "string"
  }
}
```

### Delete user
**DELETE** `/api/users/:id`

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Update user role
**PUT** `/api/users/:id/role`

**Request Body:**
```json
{
  "role": "client|contractor"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User role updated to client|contractor",
  "data": {
    "id": 1,
    "role": "client|contractor"
  }
}
```

### Get user progress
**GET** `/api/users/:id/progress`

**Response:**
```json
{
  "success": true,
  "data": {
    "completedScenarios": 12,
    "totalScenarios": 45,
    "currentStreak": 5,
    "lastActive": "2025-10-18T14:30:00Z",
    "skillLevels": {
      "Client Interaction": 75,
      "Legal Research": 82,
      "Document Drafting": 68,
      "Oral Advocacy": 70,
      "Negotiation": 65,
      "Ethics & Professionalism": 90,
      "Time Management": 78,
      "Critical Thinking": 85
    }
  }
}
```

### Get user analytics
**GET** `/api/users/:id/analytics`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTimeSpent": 1250,
    "scenariosCompleted": 12,
    "averageScore": 82.5,
    "skillImprovement": {
      "Client Interaction": 15,
      "Legal Research": 12,
      "Document Drafting": 8,
      "Oral Advocacy": 10,
      "Negotiation": 7,
      "Ethics & Professionalism": 5,
      "Time Management": 11,
      "Critical Thinking": 13
    },
    "preferredPracticeAreas": [
      "Corporate Law",
      "Criminal Law",
      "Contract Law"
    ]
  }
}
```

## AI Services

### Check AI status
**GET** `/api/ai/status`

**Response:**
```json
{
  "success": true,
  "data": {
    "modelAvailable": true
  }
}
```

### Analyze legal document
**POST** `/api/ai/analyze-document`

**Request Body:**
```json
{
  "documentText": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "document_length": 1234,
    "token_count": 256,
    "document_type": "Contract",
    "key_terms": ["contract", "liability", "negligence"],
    "summary": "This is a summary of the document..."
  }
}
```

### Stream legal document analysis
**GET** `/api/ai/stream-analysis?document=text`

**Response (Server-Sent Events):**
```
data: {"type": "info", "content": "Starting analysis..."}

data: {"type": "token", "content": "Analyzing "}

data: {"type": "token", "content": "document "}

data: {"type": "result", "content": {"document_length": 1234, "token_count": 256, ...}}

data: {"type": "done", "content": "Analysis complete"}
```

### Get NPC response
**POST** `/api/ai/npc-response`

**Request Body:**
```json
{
  "conversationContext": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "I understand your concern...",
    "emotion": "neutral",
    "confidence": 0.85
  }
}
```

### Classify legal document
**POST** `/api/ai/classify-document`

**Request Body:**
```json
{
  "documentText": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documentType": "Contract",
    "confidence": 0.9,
    "keyTerms": ["contract", "liability", "negligence"]
  }
}
```

## Scenarios

### Get all scenarios
**GET** `/api/scenarios`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "string",
      "description": "string",
      "category": "civil|criminal|corporate|family|constitutional|contract",
      "difficulty": "beginner|intermediate|advanced|expert",
      "estimatedTime": 30,
      "courtType": "district|high|supreme|magistrate|family",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### Get scenario by ID
**GET** `/api/scenarios/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "string",
    "description": "string",
    "category": "civil|criminal|corporate|family|constitutional|contract",
    "difficulty": "beginner|intermediate|advanced|expert",
    "estimatedTime": 30,
    "learningObjectives": "string",
    "courtType": "district|high|supreme|magistrate|family",
    "parties": [
      {
        "role": "plaintiff|defendant|witness|expert|judge|lawyer",
        "name": "string"
      }
    ],
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

### Create scenario
**POST** `/api/scenarios`

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "category": "civil|criminal|corporate|family|constitutional|contract",
  "difficulty": "beginner|intermediate|advanced|expert",
  "estimatedTime": 30,
  "learningObjectives": "string",
  "courtType": "district|high|supreme|magistrate|family",
  "parties": [
    {
      "role": "plaintiff|defendant|witness|expert|judge|lawyer",
      "name": "string"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Scenario created successfully",
  "data": {
    "id": 1,
    "title": "string",
    "description": "string",
    "category": "civil|criminal|corporate|family|constitutional|contract",
    "difficulty": "beginner|intermediate|advanced|expert",
    "estimatedTime": 30,
    "learningObjectives": "string",
    "courtType": "district|high|supreme|magistrate|family",
    "parties": [
      {
        "role": "plaintiff|defendant|witness|expert|judge|lawyer",
        "name": "string"
      }
    ],
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

### Update scenario
**PUT** `/api/scenarios/:id`

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "category": "civil|criminal|corporate|family|constitutional|contract",
  "difficulty": "beginner|intermediate|advanced|expert",
  "estimatedTime": 30,
  "learningObjectives": "string",
  "courtType": "district|high|supreme|magistrate|family",
  "parties": [
    {
      "role": "plaintiff|defendant|witness|expert|judge|lawyer",
      "name": "string"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Scenario updated successfully",
  "data": {
    "id": 1,
    "title": "string",
    "description": "string",
    "category": "civil|criminal|corporate|family|constitutional|contract",
    "difficulty": "beginner|intermediate|advanced|expert",
    "estimatedTime": 30,
    "learningObjectives": "string",
    "courtType": "district|high|supreme|magistrate|family",
    "parties": [
      {
        "role": "plaintiff|defendant|witness|expert|judge|lawyer",
        "name": "string"
      }
    ],
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

### Delete scenario
**DELETE** `/api/scenarios/:id`

**Response:**
```json
{
  "success": true,
  "message": "Scenario deleted successfully"
}
```

## Analytics

### Get system analytics
**GET** `/api/analytics/system`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 245,
    "activeUsers": 178,
    "totalScenarios": 45,
    "completedScenarios": 1250,
    "averageCompletionTime": 45.2,
    "averageUserScore": 79.2
  }
}
```

### Get user skills
**GET** `/api/analytics/users/:id/skills`

**Response:**
```json
{
  "success": true,
  "data": {
    "skills": {
      "Client Interaction": 75,
      "Legal Research": 82,
      "Document Drafting": 68,
      "Oral Advocacy": 70,
      "Negotiation": 65,
      "Ethics & Professionalism": 90,
      "Time Management": 78,
      "Critical Thinking": 85
    }
  }
}
```

### Update user skills
**PUT** `/api/analytics/users/:id/skills`

**Request Body:**
```json
{
  "skills": {
    "Client Interaction": 75,
    "Legal Research": 82,
    "Document Drafting": 68,
    "Oral Advocacy": 70,
    "Negotiation": 65,
    "Ethics & Professionalism": 90,
    "Time Management": 78,
    "Critical Thinking": 85
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "User skills updated successfully",
  "data": {
    "skills": {
      "Client Interaction": 75,
      "Legal Research": 82,
      "Document Drafting": 68,
      "Oral Advocacy": 70,
      "Negotiation": 65,
      "Ethics & Professionalism": 90,
      "Time Management": 78,
      "Critical Thinking": 85
    }
  }
}
```

### Generate user report
**GET** `/api/analytics/users/:id/report`

**Response:**
```json
{
  "success": true,
  "data": {
    "reportType": "User Performance",
    "generatedAt": "2025-10-18T14:30:00Z",
    "content": "string"
  }
}
```

## Multiplayer

### Create multiplayer session
**POST** `/api/multiplayer/sessions`

**Request Body:**
```json
{
  "scenarioId": 1,
  "maxPlayers": 4
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "string",
    "scenarioId": 1,
    "hostId": 1,
    "maxPlayers": 4,
    "currentPlayers": 1,
    "status": "waiting",
    "createdAt": "2025-10-18T14:30:00Z"
  }
}
```

### Join multiplayer session
**POST** `/api/multiplayer/sessions/:sessionId/join`

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "string",
    "userId": 1,
    "joinedAt": "2025-10-18T14:30:00Z"
  }
}
```

### Leave multiplayer session
**POST** `/api/multiplayer/sessions/:sessionId/leave`

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "string",
    "userId": 1,
    "leftAt": "2025-10-18T14:30:00Z"
  }
}
```

### Start multiplayer session
**POST** `/api/multiplayer/sessions/:sessionId/start`

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "string",
    "status": "active",
    "startedAt": "2025-10-18T14:30:00Z"
  }
}
```

### End multiplayer session
**POST** `/api/multiplayer/sessions/:sessionId/end`

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "string",
    "status": "completed",
    "endedAt": "2025-10-18T14:30:00Z",
    "results": {}
  }
}
```

## Content Management

### Get all content
**GET** `/api/content`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "string",
      "type": "article|video|document",
      "category": "string",
      "content": "string",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### Get content by ID
**GET** `/api/content/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "string",
    "type": "article|video|document",
    "category": "string",
    "content": "string",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

### Create content
**POST** `/api/content`

**Request Body:**
```json
{
  "title": "string",
  "type": "article|video|document",
  "category": "string",
  "content": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Content created successfully",
  "data": {
    "id": 1,
    "title": "string",
    "type": "article|video|document",
    "category": "string",
    "content": "string",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

### Update content
**PUT** `/api/content/:id`

**Request Body:**
```json
{
  "title": "string",
  "type": "article|video|document",
  "category": "string",
  "content": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Content updated successfully",
  "data": {
    "id": 1,
    "title": "string",
    "type": "article|video|document",
    "category": "string",
    "content": "string",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

### Delete content
**DELETE** `/api/content/:id`

**Response:**
```json
{
  "success": true,
  "message": "Content deleted successfully"
}
```