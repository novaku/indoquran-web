// Export from NextAuth
import { auth, signIn, signOut, handlers } from "./auth";

// This file serves as a single point of export for NextAuth authentication
export { auth, signIn, signOut, handlers };

// Re-export auth as authOptions for backward compatibility
export const authOptions = auth;
