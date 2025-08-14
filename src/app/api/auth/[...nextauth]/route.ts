// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authConfig } from "@/auth-config";

// חשוב: לא לרוץ על Edge – מנהל המונגו לא תומך
export const runtime = "nodejs";

const handler = NextAuth(authConfig);
export { handler as GET, handler as POST };
