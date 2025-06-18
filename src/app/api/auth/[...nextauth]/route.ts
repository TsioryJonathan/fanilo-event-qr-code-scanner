import NextAuth, { Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma"; // Ton client Prisma

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword) return null;

        const isValid = await compare(
          credentials.password,
          user.hashedPassword
        );
        if (!isValid) return null;

        // Retourne l’objet qui sera dans le token
        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt", // ✅ session persistante par JWT
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  callbacks: {
    async jwt({ token, user }) {
      // Quand on vient d’autoriser un utilisateur
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        if (session.user) {
          (session.user as Session["user"] & { id: string }).id =
            token.id as string;
        }
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET, // Assure-toi que c’est défini
});

export { handler as GET, handler as POST };
