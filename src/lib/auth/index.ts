// Export the auth function from NextAuth
import { auth } from "@/app/api/auth/[...nextauth]/route";

// This file serves as a single point of export for NextAuth authentication
export { auth };

// Re-export auth as authOptions for backward compatibility
export const authOptions = auth;
