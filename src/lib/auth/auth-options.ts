// Import only the types from next-auth, not the providers
// We'll define the provider configs directly to avoid typing issues

/**
 * Auth options without Node.js specifics that can be shared
 * This file only contains the basic configuration
 * The actual authentication logic is implemented in the API route
 */
export const authOptions = {
  providers: [],  // We'll populate providers in the route.ts file
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};
