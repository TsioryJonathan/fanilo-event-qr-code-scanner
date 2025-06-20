import NextAuth, { Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma"; 

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


        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",         
    maxAge: 60 * 60 * 24,    
  },
  

  callbacks: {
    async jwt({ token, user }) {
     
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

  secret: process.env.NEXTAUTH_SECRET, 
});

export { handler as GET, handler as POST };
