import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { clientIpFromRequest, rateLimit } from "@/lib/rate-limit";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX = 20;

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const ip = clientIpFromRequest(request);
        const limited = rateLimit(`login:${ip}`, LOGIN_MAX, LOGIN_WINDOW_MS);
        if (!limited.ok) {
          return null;
        }

        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const result = await verifyPassword(user.passwordHash, password);
        if (!result.ok) return null;

        if (result.rehash) {
          await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: result.rehash },
          });
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  /**
   * Behind TLS-terminating proxy, NEXTAUTH_URL must be `https://...` so Auth.js
   * sets `Secure` cookies. For local HTTP production builds, omit https URL.
   */
  useSecureCookies:
    process.env.BANANY_BEHIND_HTTPS_PROXY === "1" ||
    (process.env.NEXTAUTH_URL ?? "").startsWith("https:"),
});
