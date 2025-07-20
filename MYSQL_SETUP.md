# MySQL Database Setup for Render Deployment

## Option 1: PlanetScale (Recommended - Free)

### Step 1: Create PlanetScale Account
1. Go to [https://planetscale.com](https://planetscale.com)
2. Sign up for a free account
3. Create a new database named `bbb-dashboard`

### Step 2: Get Connection Details
1. In your PlanetScale dashboard, go to your database
2. Click "Connect" button
3. Select "Node.js" as the framework
4. Copy the connection string (it will look like this):
   ```
   mysql://username:password@host:3306/database_name?ssl={"rejectUnauthorized":true}
   ```

### Step 3: Configure Environment Variables
Create a `.env` file in your server directory with:
```env
# Database Configuration
DB_HOST=your_planetscale_host
DB_USER=your_planetscale_username
DB_PASSWORD=your_planetscale_password
DB_NAME=bbb-dashboard
DB_PORT=3306

# Server Configuration
PORT=4901
NODE_ENV=production
```

### Step 4: Update Render Environment Variables
In your Render dashboard:
1. Go to your service settings
2. Add these environment variables:
   - `DB_HOST`: Your PlanetScale host
   - `DB_USER`: Your PlanetScale username  
   - `DB_PASSWORD`: Your PlanetScale password
   - `DB_NAME`: bbb-dashboard
   - `DB_PORT`: 3306

---

## Option 2: Railway MySQL

### Step 1: Create Railway Account
1. Go to [https://railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project

### Step 2: Add MySQL Service
1. Click "Add Service" → "Database" → "MySQL"
2. Wait for deployment to complete
3. Click on the MySQL service to get connection details

### Step 3: Get Connection String
Copy the connection details from Railway dashboard:
- Host, Username, Password, Database name, Port

---

## Option 3: FreeSQLDatabase.com (Free)

### Step 1: Create Account
1. Go to [https://www.freesqldatabase.com](https://www.freesqldatabase.com)
2. Sign up for free account
3. Create a new MySQL database

### Step 2: Get Connection Details
You'll receive connection details via email:
- Server/Host
- Database Name
- Username  
- Password
- Port (usually 3306)

---

## Testing Your Connection

Once you have your database credentials, test the connection:

```bash
# In your server directory
npm run setup
```

This will:
1. Create the required tables (bookings, billings, backlog)
2. Migrate your Excel data to MySQL
3. Test the connection

## Deploy to Render

After setting up the database:
1. Push your code to GitHub
2. In Render, trigger a new deployment
3. Your app will now use MySQL instead of Excel files

## Switching APIs

Your app now supports both:
- **Excel API**: `/api/dashboard` (current)
- **MySQL API**: `/api/mysql/dashboard` (new)

To switch your frontend to use MySQL, update the API base URL in your React app from:
```javascript
// Old Excel-based API
const API_BASE = '/api/dashboard'

// New MySQL-based API  
const API_BASE = '/api/mysql/dashboard'
```
