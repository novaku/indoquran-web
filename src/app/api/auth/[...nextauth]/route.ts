import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Credentials from "next-auth/providers/credentials";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

async function getUserByEmail(email: string) {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
  });

  try {
    const [rows]: [any[], any] = await conn.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    await conn.end();
    return rows[0] as any;
  } catch (error) {
    console.error('Database query error:', error);
    await conn.end();
    return null;
  }
}

async function createUser(userData: { name: string; email: string; password?: string; provider?: string }) {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
  });

  try {
    const user_id = uuidv4();
    const hashedPassword = userData.password ? await bcrypt.hash(userData.password, 10) : null;
    
    await conn.execute(
      'INSERT INTO users (user_id, username, email, password, provider) VALUES (?, ?, ?, ?, ?)',
      [user_id, userData.name, userData.email, hashedPassword || '', userData.provider || 'credentials']
    );
    
    const [rows]: [any[], any] = await conn.execute(
      'SELECT * FROM users WHERE user_id = ?',
      [user_id]
    );
    
    await conn.end();
    return rows[0] as any;
  } catch (error) {
    console.error('Database query error:', error);
    await conn.end();
    return null;
  }
}

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        action: { label: "Action", type: "text" }  // 'login' or 'register'
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }
        
        // Type assertion to make TypeScript happy
        const email = credentials.email as string;
        const password = credentials.password as string;
        const name = credentials.name as string;
        const action = credentials.action as string;

        try {
          // Registration flow
          if (action === 'register') {
            if (!name) {
              throw new Error("Nama diperlukan untuk pendaftaran");
            }

            // Check if user already exists
            const existingUser = await getUserByEmail(email);
            if (existingUser) {
              throw new Error("Email sudah terdaftar");
            }

            // Create new user
            const newUser = await createUser({
              name: name,
              email: email,
              password: password,
            });

            if (!newUser) {
              throw new Error("Gagal membuat pengguna");
            }

            return {
              id: newUser.user_id,
              name: newUser.username,
              email: newUser.email,
            };
          } 
          // Login flow
          else {
            const user = await getUserByEmail(email);
            
            if (!user) {
              throw new Error("Email tidak terdaftar");
            }

            // For OAuth users who don't have a password set
            if (!user.password) {
              throw new Error("Akun ini menggunakan Google atau Facebook untuk masuk");
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
              throw new Error("Kata sandi salah");
            }

            return {
              id: user.user_id,
              name: user.username,
              email: user.email,
            };
          }
        } catch (error: any) {
          throw new Error(error.message || "Authentication error");
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // For OAuth providers (Google, Facebook)
        if (account && account.provider && (account.provider === "google" || account.provider === "facebook")) {
          if (!user.email) return false;
          
          // Check if user exists by email
          const existingUser = await getUserByEmail(user.email);

          if (!existingUser) {
            // Create new user from OAuth
            await createUser({
              name: user.name || user.email.split('@')[0],
              email: user.email,
              provider: account.provider
            });
          }
        }
        
        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return false;
      }
    },
    async session({ session, user, token }) {
      if (session.user && token.sub) {
        // Use type assertion to add the id property
        (session.user as any).id = token.sub;
        (session.user as any).user_id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },
  session: {
    strategy: "jwt",
  },
});
