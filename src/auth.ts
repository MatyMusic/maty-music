// src/auth.ts
import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // מילוי פרטים מהפרופיל בחיבור ראשון
      if (account && profile) {
        token.name = (profile as any).name ?? token.name;
        token.picture = (profile as any).picture ?? token.picture;
        token.email = (profile as any).email ?? token.email;
      }
      // קביעת ROLE לפי ADMIN_EMAILS
      const admins = (process.env.ADMIN_EMAILS ?? "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const email = (token.email ?? "") as string;
      (token as any).role = admins.includes(email.toLowerCase())
        ? "admin"
        : "user";
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = (token.name as string) ?? session.user.name;
        // @ts-ignore
        session.user.image = (token.picture as string) ?? session.user.image;
        // מזהה (sub מגוגל)
        // @ts-ignore
        session.user.id = token.sub as string;
        // ROLE
        // @ts-ignore
        session.user.role = (token as any).role ?? "user";
      }
      return session;
    },
  },
};

// מייצא גם handlers לנתיב ה־API וגם auth/signIn/signOut לשימוש בפרויקט
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
