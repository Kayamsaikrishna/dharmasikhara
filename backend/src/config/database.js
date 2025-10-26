// Database configuration
const config = {
  // PostgreSQL configuration for user data
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'dharmasikhara',
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
  },
  
  // MongoDB configuration for scenario content
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dharmasikhara',
  },
  
  // Redis configuration for caching and sessions
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null,
  },
  
  // Elasticsearch configuration for search
  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  }
};

module.exports = config;