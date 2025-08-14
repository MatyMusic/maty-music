// src/auth-config.ts
import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import mongoPromise from "@/lib/mongo";

export const authConfig: NextAuthOptions = {
  // שמירת משתמשים/סשנים ב-DB
  adapter: MongoDBAdapter(await mongoPromise),

  // ניהול סשן כ-JWT (נוח ל-App Router)
  session: { strategy: "jwt" },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, account, profile }) {
      // בשלב הלוגין הראשוני העתק פרטים מהפרופיל
      if (account && profile) {
        token.name = (profile as any).name ?? token.name;
        // @ts-ignore
        token.picture = (profile as any).picture ?? token.picture;
        token.email = (profile as any).email ?? token.email;
      }

      // קביעת role לפי ADMIN_EMAILS (רשימה מופרדת בפסיקים)
      const admins = (process.env.ADMIN_EMAILS ?? "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      const email = (token.email ?? "") as string;
      // @ts-ignore – מוסיפים שדה מותאם אישית ל-JWT
      token.role = admins.includes(email.toLowerCase()) ? "admin" : "user";

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.name = (token.name as string) ?? session.user.name;
        // @ts-ignore
        session.user.image = (token.picture as string) ?? session.user.image;
        // @ts-ignore – מזהה המשתמש (sub מה-JWT)
        session.user.id = token.sub as string;
        // @ts-ignore – מעבירים role לקליינט
        session.user.role = (token as any).role ?? "user";
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default authConfig;
