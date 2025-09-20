import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";
import { loginSchema, type DbUser, type ExtendedUser } from "@/lib/types";

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
  interface User extends ExtendedUser {
    id: string;
    email: string;
    role?: string;
    phone?: string | null;
    email_verified?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    phone?: string | null;
    email_verified?: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }
        const { email, password } = parsed.data;
        const res = await query("SELECT * FROM users WHERE email = $1", [email]);
        const user: DbUser = res.rows[0];
        if (user && await bcrypt.compare(password, user.password)) {
          return {
            id: user.id.toString(),
            email: user.email,
            role: user.role,
            phone: user.phone,
            email_verified: user.email_verified
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.phone = user.phone;
        token.email_verified = user.email_verified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.phone = token.phone;
        session.user.email_verified = token.email_verified;
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: '/auth/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };