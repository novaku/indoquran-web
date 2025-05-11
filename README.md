# IndoQuran Web

## Getting Started

### Environment Setup

This application requires several environment variables to work correctly. Environment files are stored in the `deploy` directory. Create a `.env.local` file in the `deploy` directory with the following variables:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://equran.id/api/v2

# Redis Configuration
REDIS_URL=redis://localhost:6379
# Optional: Redis password if needed
REDIS_PASSWORD=your-redis-password

# Database Configuration
DATABASE_URL=mysql://root:password@localhost:3306/indoquran_db
DB_HOST=localhost
DB_PORT=3306
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

### Docker Deployment

The application supports Docker deployment with persistent storage for MySQL and Redis. All Docker-related files are organized in the `deploy` directory.

#### Docker Management Script

Use the central management script for all Docker-related operations (now located in the deploy directory):

```bash
./deploy/docker.sh [command]
```

Available commands:
- `dev`: Start the application in development mode
- `deploy`: Deploy the application in production mode
- `backup`: Back up the MySQL database
- `monitor`: Monitor the running containers
- `volumes`: Manage Docker volumes
- `scan`: Scan Docker image for security vulnerabilities
- `setup-env`: Create environment files from examples
- `help`: Show help information

#### Environment Setup for Docker

To set up the environment files for Docker deployment:

1. Run the setup-env command:

```bash
./deploy/docker.sh setup-env
```

This will create the `.env.local` file in the `deploy` directory if it doesn't exist, using the `.env.local.example` as a template. 
Edit this file to adjust your local development settings.

For production, create a `.env.production` file in the `deploy` directory:

```bash
cp deploy/.env.production.example deploy/.env.production
# Edit the file with your production settings
```

#### Development Environment

To run the application in a local development environment using Docker:

1. Make sure Docker and Docker Compose are installed on your machine
2. Ensure the environment is set up (as described above)
3. Run the development command:

```bash
./deploy/docker.sh dev
```

This will start the application in development mode with hot-reloading enabled.

#### Production Deployment

For production deployment with Docker:

1. Make sure your `deploy/.env.production` file is configured with your production settings
2. Update OAuth redirect URIs in your OAuth provider dashboards to include your production domain
3. Run the deployment command:

```bash
./deploy/docker.sh deploy
```

This will build the application and deploy it with optimized settings for production. The application will run with environment variables from your `.env.production` file.

#### Persistent Storage

MySQL and Redis data are stored in Docker volumes to ensure data persistence:

- MySQL data: Docker volume `mysql-data`
- Redis data: Docker volume `redis-data`

These volumes are automatically created during deployment and stored outside the Docker containers.

To manage volumes (list, backup, restore), use:

```bash
./deploy/docker.sh volumes
```

#### Database Backup

To back up your MySQL database:

```bash
./deploy/docker.sh backup
```

This creates a compressed SQL backup in the `backups` directory.

#### Monitoring

To monitor the running containers, check health, and view logs:

```bash
./deploy/docker.sh monitor
```

#### Security Scanning

The Docker image can be scanned for security vulnerabilities using:

```bash
./deploy/docker.sh scan
```

This will build the image and scan it for security vulnerabilities using Docker Scout. The scan will identify any critical or high vulnerabilities that need to be addressed.
