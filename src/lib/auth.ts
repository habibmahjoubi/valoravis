import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { checkRateLimit } from "./rate-limit";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const rl = await checkRateLimit(`login:${credentials.email}`, { maxAttempts: 5, windowMs: 15 * 60 * 1000 });
        if (!rl.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        // Always run bcrypt to prevent timing-based email enumeration
        const dummyHash = "$2b$12$000000000000000000000uGWGmhFBiGFCkT9OJkwROmkAR.gzZXa";
        const hashToCheck = user?.password || dummyHash;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          hashToCheck
        );

        if (!user || !user.password || !isValid) return null;

        // Bloquer le login si l'email n'est pas vérifié
        if (!user.emailVerified) return null;
        if (user.isSuspended) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (!token?.id) return session;

      // Revérifier à chaque lecture de session que le compte existe toujours et
      // n'est pas suspendu — un JWT reste sinon valide 7 jours après révocation.
      const user = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { id: true, isSuspended: true, isAdmin: true },
      });

      if (!user || user.isSuspended) {
        // Session invalidée : ne pas exposer d'id → traité comme non authentifié.
        return { ...session, user: { ...session.user, id: undefined as unknown as string } };
      }

      session.user.id = user.id;
      return session;
    },
  },
});
