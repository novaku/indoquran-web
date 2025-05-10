This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). The application now features bookmark and favorite functionality that uses a MySQL database.

## Getting Started

### Environment Setup

1. Create a `.env.local` file in the root of the project with the following variables:

```
# Database configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=indoquran_db
DB_PORT=3306

# NextAuth configuration
AUTH_SECRET="your-secret-key-goes-here-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Facebook OAuth
FACEBOOK_CLIENT_ID="your-facebook-client-id"
FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"

# API configuration
NEXT_PUBLIC_API_BASE_URL=https://equran.id/api/v2
```

2. Replace the OAuth credentials with your own from:
   - [Google Cloud Console](https://console.cloud.google.com/) 
   - [Facebook Developer Portal](https://developers.facebook.com/)

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

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
- Password: root
- Database: indoquran_db

To change these settings, modify the values in `.env.local` file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
