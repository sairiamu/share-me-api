# Supabase Table Setup Guide

## Option 1: Quick Setup (Recommended for beginners)

Use `migrations/001_create_tables_quickstart.sql`:

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `001_create_tables_quickstart.sql`
5. Click **Run**

This creates:
- ✅ `users` table (email, name, password, phone)
- ✅ `notes` table (title, file_url, file_type, uploaded_by)
- ✅ Indexes for performance
- ✅ Foreign key relationships

---

## Option 2: Full Setup with Advanced Features

Use `migrations/001_create_tables.sql`:

This includes everything from Option 1 plus:
- 📊 Audit logging table for tracking changes
- 🔒 Row Level Security (RLS) policies
- ⏰ Automatic timestamp updates via triggers
- 📈 Helper views for analytics
- 🔍 Optimized indexes

**Note**: RLS policies require proper Supabase auth integration.

---

## Table Schema Reference

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id` - Auto-incrementing user ID
- `email` - Unique email address (used for login)
- `name` - User's full name
- `password` - Hashed password
- `phone` - Contact phone number
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

**Indexes:**
- `idx_users_email` - Fast email lookups for authentication

---

### Notes Table
```sql
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  uploaded_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id` - Auto-incrementing note ID
- `title` - Note title
- `file_url` - Cloudinary URL to the uploaded file
- `file_type` - File type (pdf, doc, etc.)
- `uploaded_by` - User email (foreign key to users)
- `created_at` - Upload timestamp
- `updated_at` - Last modification timestamp

**Indexes:**
- `idx_notes_uploaded_by` - Fast user note lookup
- `idx_notes_id` - Fast note retrieval
- `idx_notes_uploaded_by_created_at` - Fast sorted user notes

---

## Advanced Features (Optional)

### Audit Logs Table
Tracks all changes to data for compliance and debugging:

```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255),
  action VARCHAR(100),          -- INSERT, UPDATE, DELETE
  entity_type VARCHAR(50),      -- users, notes
  entity_id INTEGER,
  old_values JSONB,             -- Previous values
  new_values JSONB,             -- New values
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Row Level Security (RLS)
Ensures users can only access their own data:

- Users can only view their own profile
- Users can only view/delete their own notes
- Users can only create notes as themselves

**Enable with:**
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
```

### Automatic Timestamp Updates
Triggers automatically update `updated_at` on changes:

```sql
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Helper Views
Pre-built queries for common operations:

- `user_notes_summary` - User's notes with uploader info
- `user_stats` - User statistics (note count, last activity)

---

## Verification Queries

After creating tables, verify the setup:

```sql
-- Check users table
SELECT * FROM users LIMIT 1;

-- Check notes table
SELECT * FROM notes LIMIT 1;

-- Check table structure
\d users
\d notes

-- Check indexes
SELECT * FROM pg_indexes WHERE tablename IN ('users', 'notes');
```

---

## Data Migration (If Migrating from MySQL)

### Step 1: Export from MySQL
```bash
mysqldump -u root -p share_me users notes > backup.sql
```

### Step 2: Transform SQL
- Change `AUTO_INCREMENT` to `SERIAL`
- Change backticks to double quotes
- Update datetime functions

### Step 3: Import to Supabase
```bash
psql -h db.igwldanfblrbcrrsbgec.supabase.co \
     -U postgres \
     -d postgres \
     -f backup_transformed.sql
```

Or paste in Supabase SQL Editor.

---

## Connection String

Your Node.js app uses this connection string (already in `.env`):

```
postgres://postgres.igwldanfblrbcrrsbgec:PASSWORD@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

---

## Testing the Connection

After creating tables, test your API:

```bash
# Test signup
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123",
    "phone": "1234567890"
  }'

# Verify in Supabase
SELECT * FROM users WHERE email = 'test@example.com';
```

---

## Troubleshooting

### Tables not showing in Supabase
- Refresh the page
- Check you're in the correct database (should be `postgres`)
- Verify SQL had no syntax errors

### Foreign key constraint error
- Ensure `users` table exists before creating `notes`
- Check email in `notes.uploaded_by` matches a user email

### Connection errors
- Verify `POSTGRES_URL` in `.env`
- Check IP is whitelisted in Supabase network settings
- Ensure SSL mode is enabled

### Query timeouts
- Check indexes are created
- Monitor query performance in Supabase dashboard
- Consider adding more indexes for slow queries

---

## Related Files

- `MIGRATION_GUIDE.md` - Detailed migration instructions
- `MIGRATION_SUMMARY.md` - Change summary
- `001_create_tables.sql` - Full schema with RLS
- `001_create_tables_quickstart.sql` - Minimal schema
- `config/mysql-sch.js` - Node.js database connection
