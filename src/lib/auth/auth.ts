import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "./db-utils";

// Define a type for the user object returned by your database query
type DbUserType = {
  user_id: number | string;
  username: string;
  email: string;
  password?: string;
}

// Create and export the auth options and helper functions
export const {
  handlers,
  auth,
  signIn,
  signOut
} = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        action: { label: "Action", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) {
          console.log("No credentials provided");
          return null;
        }
        
        // Explicitly cast credentials to strings to resolve type issues
        const email = credentials.email as string;
        const password = credentials.password as string;
        
        if (!email || !password) {
          console.log("Email or password missing");
          return null;
        }
        
        console.log(`Attempting login for email: ${email}`);
        try {
          const userFromDb = await getUserByEmail(email);
          
          if (!userFromDb) {
            console.log(`User not found: ${email}`);
            return null;
          }
          
          if (!userFromDb.password) {
            console.log(`User found but password hash is missing: ${email}`);
            return null;
          }
          
          const isPasswordValid = await bcrypt.compare(
            password,
            userFromDb.password
          );
          
          if (!isPasswordValid) {
            console.log(`Invalid password for: ${email}`);
            return null;
          }
          
          console.log(`Login successful for: ${email}, ID: ${userFromDb.user_id}`);
          return {
            id: userFromDb.user_id.toString(),
            name: userFromDb.username,
            email: userFromDb.email
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // All users have the same role since admin functionality has been removed
        token.role = 'user';
      }
      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        // Add the role to the session if it exists in the token
        if (token.role) {
          session.user.role = token.role;
        }
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
});