# Local Database Setup

This setup uses SQLite to create a fully localized database that stores all data in a single `.db` file. This eliminates the need for external database services like MongoDB Atlas, PostgreSQL, Redis, and Elasticsearch.

## Benefits

1. **No External Dependencies**: Everything runs locally on your machine
2. **Single File Storage**: All data is stored in `backend/dharmasikhara.db`
3. **Easy Backup**: Simply copy the `.db` file to backup your entire database
4. **No Subscription Costs**: No need to pay for database hosting services
5. **Control Panel Friendly**: Works well with shared hosting environments

## Setup Instructions

### 1. Initialize the Database

Run the initialization script to create the database and sample data:

```bash
cd backend
npm run init-db
```

This will:
- Create `dharmasikhara.db` in the backend directory
- Create the necessary tables (users, scenarios, user_progress)
- Add sample data for testing

### 2. Start the Backend

```bash
npm run dev
```

The backend will start on port 5003 and use the local SQLite database.

### 3. Using the Batch Script

For Windows users, you can simply run:

```bash
start_local_backend.bat
```

This script will:
1. Install all dependencies
2. Initialize the database
3. Start the backend server

## Database Structure

The SQLite database contains three main tables:

1. **users**: Stores user account information
2. **scenarios**: Stores legal scenario content
3. **user_progress**: Tracks user progress through scenarios

## File Location

The database file is located at:
```
backend/dharmasikhara.db
```

## Backup and Migration

To backup your data:
1. Simply copy the `dharmasikhara.db` file

To restore your data:
1. Stop the backend server
2. Replace the `dharmasikhara.db` file with your backup
3. Start the backend server

## Limitations

1. **Single Connection**: SQLite handles one write operation at a time
2. **Not Suitable for High Traffic**: Best for development and small-scale deployments
3. **No Advanced Features**: Missing some features of full database servers

## Troubleshooting

### Database Lock Errors

If you encounter database lock errors:
1. Make sure only one process is accessing the database
2. Restart the backend server

### Corrupted Database

If the database becomes corrupted:
1. Delete the `dharmasikhara.db` file
2. Run `npm run init-db` to recreate it
3. Note: This will remove all data

## Customization

To modify the database schema:
1. Edit `backend/src/services/sqliteDatabase.js`
2. Update the `createTables()` method
3. Delete the existing `dharmasikhara.db` file
4. Run `npm run init-db` to recreate the database with your changes