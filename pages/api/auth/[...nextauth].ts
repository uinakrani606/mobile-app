import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from 'axios';

const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt'
  },
  providers: [
    CredentialsProvider({
      type: 'credentials',
      credentials: {},
      async authorize(credentials, req) {
        const { email, password } = credentials as { email: string, password: string };
        let user = {
          id: '',
          message: ''
        };
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/token`, {
          username: email,
          password: password
        },
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          })
          .then(function (response: any) {
            user = response.data;
          })

        if (user && user.message == "User not found" || user.message == "Incorrect password") {
          throw new Error("Invalid Credentials")
        }

        return user;
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
  },
  pages: {
    signIn: "/login",
    signOut: "/login"
  }
}

export default NextAuth(authOptions);
