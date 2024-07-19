import NextAuth, { SessionStrategy } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
    // Configure one or more authentication providers
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        })
    ],
    callbacks: {
        session: async ({ session, token }: { session: any, token: any }) => {
          if (session?.user) {
            session.user.id = token.sub;
          }
          return session;
        },
        jwt: async ({ user, token }: { user: any, token: any }) => {
          if (user) {
            token.uid = user.id;
          }
          return token;
        },
      },
      session: {
        strategy: 'jwt' as SessionStrategy,
      },
    
}

export default NextAuth(authOptions);