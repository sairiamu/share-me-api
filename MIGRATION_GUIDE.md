# MySQL to Supabase PostgreSQL Migration Guide

This document provides step-by-step instructions for migrating your share-me API from MySQL to Supabase (PostgreSQL).

## Prerequisites

- Supabase account (credentials already in `.env`)
- Node.js installed locally
- Access to existing MySQL database (if migrating existing data)

## Migration Steps

### 1. Create PostgreSQL Tables in Supabase

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to the SQL Editor
3. Create a new query and paste the contents of `migrations/001_create_tables.sql`
4. Execute the query to create the tables

Alternatively, run via SQL Editor:
```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  uploaded_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notes_uploaded_by ON notes(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_notes_id ON notes(id);

-- Add foreign key (optional)
ALTER TABLE notes 
ADD CONSTRAINT fk_notes_user 
FOREIGN KEY (uploaded_by) 
REFERENCES users(email) 
ON DELETE CASCADE;
```

### 2. Update Dependencies

Run the following command to install PostgreSQL client and remove MySQL packages:

```bash
npm install
```

This will update your packages according to the modified `package.json`.

### 3. Verify Environment Variables

Ensure your `.env` file has the Supabase PostgreSQL connection details (should already be there):

```env
POSTGRES_URL="postgres://postgres.igwldanfblrbcrrsbgec:lgBiNEND6fu8I1Eg@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="lgBiNEND6fu8I1Eg"
POSTGRES_HOST="db.igwldanfblrbcrrsbgec.supabase.co"
POSTGRES_DATABASE="postgres"
```

### 4. Data Migration (If Existing Data)

If you have existing data in MySQL:

**Option A: Using Supabase Data Migration Tools**
1. Contact Supabase support for data migration assistance
2. Or use a tool like DBeaver with both database connections

**Option B: Manual Export/Import**
1. Export users from MySQL:
```sql
SELECT email, name, password, phone FROM users;
```

2. Import into Supabase (insert with hashed passwords maintained):
```sql
INSERT INTO users (email, name, password, phone) 
VALUES ('...', '...', '...', '...');
```

### 5. Test the API

1. Start your server:
```bash
npm start
```

2. Test signup endpoint:
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123",
    "phone": "1234567890"
  }'
```

3. Test signin endpoint:
```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Key Changes Made

### Configuration
- **Old**: `config/mysql-sch.js` used MySQL connection pool
- **New**: Uses PostgreSQL (pg) client with Supabase connection string

### Query Syntax
- **Old**: Parameterized queries used `?` placeholders
- **New**: PostgreSQL uses `$1, $2, $3...` placeholders

### Result Handling
- **Old**: MySQL returned `[result]` with `result.insertId`
- **New**: PostgreSQL returns `{ rows }` with need for `RETURNING id` clause

### Error Handling
- **Old**: MySQL error code `ER_DUP_ENTRY` for unique violations
- **New**: PostgreSQL error code `23505` for unique violations

## Modified Files

✅ `package.json` - Updated dependencies
✅ `config/mysql-sch.js` - Now PostgreSQL pool
✅ `controller/auth.js` - Updated queries to PostgreSQL syntax
✅ `controller/notes.js` - Updated queries to PostgreSQL syntax
✅ `services/fileUpload.js` - Updated queries to PostgreSQL syntax
✅ `routes/signup.js` - Converted to ES modules and PostgreSQL syntax
✅ `migrations/001_create_tables.sql` - New migration file

## Rollback (If Needed)

If you need to revert to MySQL:

1. Restore from git:
```bash
git checkout HEAD -- package.json config/mysql-sch.js controller/ services/ routes/signup.js
```

2. Reinstall MySQL packages:
```bash
npm install
```

## Troubleshooting

### Connection Issues
- Verify SSL is enabled for Supabase connections
- Check that your IP is whitelisted in Supabase project settings
- Ensure `POSTGRES_URL` environment variable is correctly set

### Query Errors
- Ensure parameterized placeholders are used ($1, $2, etc.)
- Check column names match PostgreSQL schema
- Verify data types match (especially for timestamps)

### Performance Issues
- Indexes are created on frequently queried columns (email, uploaded_by, id)
- Connection pool is configured with max 10 connections
- Consider enabling query logging in Supabase dashboard

## Next Steps

1. Monitor logs in Supabase dashboard
2. Set up automated backups
3. Consider implementing Row Level Security (RLS) for additional security
4. Evaluate caching strategies for frequently accessed notes

For more information, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js pg Package](https://node-postgres.com/)
