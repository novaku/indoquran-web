// filepath: /Users/novaherdi/Documents/GitHub/indoquran-web/src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";

export const runtime = "nodejs";

// Export the auth handlers for Next.js API routes
export const { GET, POST } = handlers;
