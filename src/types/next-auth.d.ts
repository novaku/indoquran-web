// Declaration for NextAuth to include additional fields in sessions and tokens
import { DefaultSession } from "next-auth"
import { JWT as DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Extending the built-in session types
   */
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"]
  }

  /**
   * Extending user type
   */
  interface User {
    id?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extending the built-in JWT token types
   */
  interface JWT extends DefaultJWT {
    id?: string;
  }
}
