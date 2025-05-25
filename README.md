# IndoQuran Web

## Getting Started

### Environment Setup

This application requires several environment variables to work correctly. Create a `.env.local` file in the root directory with the following variables:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://equran.id/api/v2

# Redis Configuration
# Option 1: Use Redis URL (TCP connection)
REDIS_URL=redis://localhost:6379
# Option 2: Use Redis Socket Path (Unix socket, faster on same host)
# REDIS_SOCKET_PATH=/tmp/redis.sock
# Optional: Redis password if needed
REDIS_PASSWORD=your-redis-password

# Database Configuration
DATABASE_URL=mysql://root:password@localhost:3306/indoquran_db
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=indoquran_db

# Logging Configuration
LOG_LEVEL=INFO           # Options: DEBUG, INFO, WARN, ERROR
LOG_TO_CONSOLE=true      # Set to 'false' to disable console logging
LOG_TO_FILE=false        # Set to 'true' to enable file logging
LOG_FILE_PATH=./logs     # Directory for log files
LOG_FILENAME=indoquran.log
DB_USER=root
DB_PASSWORD=password
DB_NAME=indoquran_db

# Next Auth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# OAuth Provider Credentials
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

### OAuth Configuration

To set up OAuth authentication:

1. **Google OAuth**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Navigate to "APIs & Services" > "Credentials"
   - Create an OAuth client ID (Application type: Web application)
   - Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` for development
   - Copy the Client ID and Client Secret to your `.env.local` file

2. **Facebook OAuth**:
   - Go to [Facebook Developer Portal](https://developers.facebook.com/)
   - Create a new app or select an existing one
   - Add the Facebook Login product to your app
   - Configure the OAuth redirect URI: `http://localhost:3000/api/auth/callback/facebook`
   - Copy the App ID and App Secret to your `.env.local` file

### Database Setup

Before running the application, you need to set up the MySQL database:

1. Make sure MySQL is installed and running on your machine
2. Run the database setup script:

```bash
# Make the script executable if needed
chmod +x setup-database.sh

# Run the setup script
./setup-database.sh
```

Alternatively, you can run the setup through the application:

```bash
npm run dev
```

Then visit: http://localhost:3000/setup

### Running the Development Server

After setting up the database, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a custom font family.

## Features

### Authentication
- User authentication via NextAuth.js
- Multiple authentication methods:
  - Email/password registration and login
  - Google OAuth integration
  - Facebook OAuth integration
- Secured routes and protected profile page
- User session management

### Database Features
- Bookmark functionality to save verses with notes
- Favorite functionality to mark verses as favorites
- User profile page to view and manage bookmarks and favorites

### Database Configuration
The MySQL database connection is configured with:
- Host: localhost
- Port: 3306
- Username: root
- Password: password
- Database: indoquran_db

To change these settings, modify the values in your `.env.local` file.

## Favicon and App Icons

The application includes favicons and app icons in various formats to ensure compatibility across different platforms:

- `favicon.ico` - Multi-size ICO file (16x16, 32x32, 48x48)
- `favicon.svg` - Vector version for modern browsers
- `/icons/icon-192x192.png` and `/icons/icon-512x512.png` - App icons for mobile devices
- `/icons/icon-*x*.svg` - SVG versions of app icons

To regenerate favicon files, run the script:

```bash
./scripts/generate-favicon.sh
```

This requires ImageMagick to be installed on your system:
- On macOS: `brew install imagemagick`
- On Ubuntu/Debian: `sudo apt install imagemagick`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment Options

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

When deploying to Vercel, make sure to:
1. Add all environment variables in the Vercel project settings
2. Configure OAuth redirect URIs for your production domain

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Server Deployment

The application can be deployed on various server environments. An automated deployment script is provided for streamlined production deployment.

#### Automated Production Deployment

For quick and consistent deployment to production:

1. Create a `.env.production` file in the root directory:

```bash
cp .env.production.example .env.production
# Edit the file with your production settings
```

2. Update OAuth redirect URIs in your OAuth provider dashboards to include your production domain.

3. Run the automated deployment script:

```bash
# Deploy the application
./deploy-production.sh

# Or deploy with database setup/updates
./deploy-production.sh --with-db
```

This script will:
- Set up the environment
- Install dependencies
- Build the application
- Optionally run database initialization scripts
- Start the application using PM2

#### Prerequisites

The automated deployment script requires:
- Node.js (v20 or later recommended)
- npm
- MySQL server
- PM2 (`npm install -g pm2`)

#### Manual Database Setup

If you prefer to set up the database manually:

1. Use the schema initialization scripts located in the `mysql-init/` directory:

```bash
mysql -u username -p database_name < mysql-init/01-schema.sql
# Repeat for each script in numerical order
```

2. These scripts should be run in sequence to properly set up the database schema.

#### Database Backup

Regular database backups are recommended for data safety:

1. Set up a cron job or scheduled task to create database backups:

```bash
# Example cron job for daily backups at 2 AM
0 2 * * * mysqldump -u username -ppassword database_name | gzip > /path/to/backups/db-backup-$(date +\%Y\%m\%d).sql.gz
```

2. Store backups in a secure off-server location.

#### Application Monitoring

For production deployments:

- Use PM2 for application process management:
  ```bash
  # View application status
  pm2 status
  
  # View logs
  pm2 logs indoquran-web
  ```

- Consider implementing:
  - Error logging and alerting
  - System resource monitoring
  - Performance tracking

Various third-party services or self-hosted solutions can provide these capabilities.

## Development Tools

### Linting and Code Quality

The project includes several scripts to help maintain code quality by fixing common ESLint issues:

```bash
# Run all linting fixes
npm run fix-all

# Fix specific issue types
npm run fix-eslint     # Fix various ESLint issues
npm run fix-entities   # Fix unescaped entities in JSX
npm run fix-hooks      # Fix React hook dependency issues
```

For more details on linting and code quality tools, see [docs/LINTING.md](docs/LINTING.md).
