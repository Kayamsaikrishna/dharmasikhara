# DharmaSikhara Backend

This is the backend service for the DharmaSikhara legal practice simulator platform.

## System Architecture

The backend follows a microservices architecture with the following components:

### Application Layer
- **User Service**: User authentication, profiles, and management
- **Scenario Service**: Legal scenario management and delivery
- **AI Service**: AI-powered legal analysis and NPC interactions
- **Analytics Service**: Performance tracking and skill assessment
- **Content Service**: Content marketplace and creator tools
- **Notification Service**: Messaging and notifications
- **Multiplayer Service**: Real-time multiplayer functionality

### Data Layer
- **PostgreSQL**: User data, subscriptions, transactions (ACID compliance)
- **MongoDB**: Scenario content, user responses, flexible schema
- **Redis**: Session management, caching, real-time leaderboards
- **Elasticsearch**: Full-text search for scenarios and legal content

### AI/ML Stack
- **NLP Engine**: 
  - InCaseLawBERT for legal document analysis
  - Sentiment analysis for user responses
  
- **Behavior AI**:
  - Custom decision trees for NPC behavior
  - Reinforcement learning for adaptive difficulty
  - Rule-based system for legal accuracy
  
- **Performance Analytics**:
  - Scikit-learn for skill assessment algorithms
  - TensorFlow for pattern recognition in user behavior
  - Custom scoring algorithms

## Prerequisites

1. Node.js (version 14 or higher)
2. Python (version 3.7 or higher)
3. PostgreSQL
4. MongoDB
5. Redis
6. Elasticsearch

## Installation

1. Install Node.js dependencies:
   ```
   npm install
   ```

2. Install Python dependencies:
   ```
   pip install torch transformers numpy
   ```

3. Set up databases:
   - PostgreSQL
   - MongoDB
   - Redis
   - Elasticsearch

## Environment Variables

Create a `.env` file with the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=dharmasikhara
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

MONGODB_URI=mongodb://localhost:27017/dharmasikhara

REDIS_HOST=localhost
REDIS_PORT=6379

ELASTICSEARCH_NODE=http://localhost:9200

# Authentication
JWT_SECRET=your_jwt_secret_here

# AI Configuration
PYTHON_PATH=python
```

## Running the Backend

### Development Mode
```
npm run dev
```

### Production Mode
```
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh JWT token

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/:id/progress` - Get user progress
- `GET /api/users/:id/analytics` - Get user analytics

### Scenarios
- `GET /api/scenarios` - Get all scenarios
- `GET /api/scenarios/:id` - Get scenario by ID
- `POST /api/scenarios` - Create a new scenario
- `PUT /api/scenarios/:id` - Update scenario
- `DELETE /api/scenarios/:id` - Delete scenario
- `GET /api/scenarios/search` - Search scenarios
- `GET /api/scenarios/recommended` - Get recommended scenarios
- `POST /api/scenarios/:id/start` - Start a scenario
- `POST /api/scenarios/:id/save` - Save scenario progress
- `POST /api/scenarios/:id/complete` - Complete scenario

### AI Service
- `GET /api/ai/status` - Check AI model status
- `POST /api/ai/analyze-document` - Analyze legal document
- `POST /api/ai/npc-response` - Get NPC response
- `POST /api/ai/classify-document` - Classify legal document

### Analytics
- `GET /api/analytics/user/:userId` - Get user analytics
- `GET /api/analytics/scenario/:scenarioId` - Get scenario analytics
- `GET /api/analytics/institution/:institutionId` - Get institution analytics
- `GET /api/analytics/skills/:userId` - Get user skills
- `POST /api/analytics/skills/:userId/update` - Update user skills
- `GET /api/analytics/reports/:userId` - Generate user report
- `GET /api/analytics/reports/institution/:institutionId` - Generate institution report

### Content Marketplace
- `GET /api/content/scenarios` - Get all marketplace scenarios
- `GET /api/content/scenarios/:id` - Get marketplace scenario by ID
- `POST /api/content/scenarios` - Create a new marketplace scenario
- `PUT /api/content/scenarios/:id` - Update marketplace scenario
- `DELETE /api/content/scenarios/:id` - Delete marketplace scenario
- `GET /api/content/creators/:creatorId/scenarios` - Get creator scenarios
- `POST /api/content/creators/:creatorId/scenarios` - Create creator scenario
- `GET /api/content/marketplace/featured` - Get featured scenarios
- `GET /api/content/marketplace/search` - Search marketplace
- `POST /api/content/marketplace/rate/:scenarioId` - Rate scenario

### Multiplayer
- `GET /api/multiplayer/games` - Get active games
- `POST /api/multiplayer/games` - Create a new game
- `GET /api/multiplayer/games/:gameId` - Get game by ID
- `PUT /api/multiplayer/games/:gameId` - Update game
- `DELETE /api/multiplayer/games/:gameId` - Delete game
- `POST /api/multiplayer/matchmaking` - Find match
- `GET /api/multiplayer/matchmaking/status/:userId` - Get matchmaking status
- `POST /api/multiplayer/games/:gameId/chat` - Send chat message
- `POST /api/multiplayer/games/:gameId/action` - Submit action

## Development

### Project Structure
```
src/
├── controllers/     # Request handlers
├── models/         # Data models
├── routes/         # API routes
├── services/       # Business logic
├── middleware/     # Custom middleware
├── utils/          # Utility functions
├── config/         # Configuration files
├── app.js          # Express application
└── server.js       # Server entry point
```

### Adding New Features

1. Create a new controller in `src/controllers/`
2. Create a new route in `src/routes/`
3. Add the route to `src/app.js`
4. Test the new endpoint

## Testing

Run tests with:
```
npm test
```

## Deployment

### Docker Deployment
```
docker-compose up --build
```

### Manual Deployment
1. Set environment variables
2. Install dependencies
3. Start the server

## Monitoring

The backend includes:
- Error logging
- Performance monitoring
- Health check endpoints
- Request/response logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.