const mongoose = require('mongoose');
const { Pool } = require('pg');
const redis = require('redis');
const elasticsearch = require('elasticsearch');
const config = require('../config/database');

class DatabaseService {
  constructor() {
    this.mongodb = null;
    this.postgres = null;
    this.redis = null;
    this.elasticsearch = null;
  }

  async connectMongoDB() {
    try {
      this.mongodb = await mongoose.connect(config.mongodb.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB connected successfully');
      return this.mongodb;
    } catch (error) {
      console.error('MongoDB connection error:', error.message);
      console.log('Continuing without MongoDB connection');
      this.mongodb = null;
      return null;
    }
  }

  async connectPostgreSQL() {
    try {
      this.postgres = new Pool({
        host: config.postgres.host,
        port: config.postgres.port,
        database: config.postgres.database,
        user: config.postgres.username,
        password: config.postgres.password,
      });
      
      // Test the connection
      const client = await this.postgres.connect();
      console.log('PostgreSQL connected successfully');
      client.release();
      return this.postgres;
    } catch (error) {
      console.error('PostgreSQL connection error:', error.message);
      console.log('Continuing without PostgreSQL connection');
      this.postgres = null;
      return null;
    }
  }

  async connectRedis() {
    try {
      this.redis = redis.createClient({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
      });
      
      await this.redis.connect();
      console.log('Redis connected successfully');
      return this.redis;
    } catch (error) {
      console.error('Redis connection error:', error.message);
      console.log('Continuing without Redis connection');
      this.redis = null;
      return null;
    }
  }

  async connectElasticsearch() {
    try {
      this.elasticsearch = new elasticsearch.Client({
        node: config.elasticsearch.node,
      });
      
      // Test the connection
      await this.elasticsearch.ping();
      console.log('Elasticsearch connected successfully');
      return this.elasticsearch;
    } catch (error) {
      console.error('Elasticsearch connection error:', error.message);
      console.log('Continuing without Elasticsearch connection');
      this.elasticsearch = null;
      return null;
    }
  }

  async connectAll() {
    try {
      await this.connectMongoDB();
      await this.connectPostgreSQL();
      await this.connectRedis();
      await this.connectElasticsearch();
      console.log('Database connection attempts completed');
    } catch (error) {
      console.error('Database connection error:', error.message);
      console.log('Continuing with available database connections');
    }
  }

  getMongoDB() {
    return this.mongodb;
  }

  getPostgreSQL() {
    return this.postgres;
  }

  getRedis() {
    return this.redis;
  }

  getElasticsearch() {
    return this.elasticsearch;
  }
}

module.exports = new DatabaseService();