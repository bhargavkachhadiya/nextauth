import { connect } from "@/database/mongo.config";
import { User } from "@/model/User";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Welcome Back",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "Enter your email",
        },
        password: { label: "Password", type: "password" },
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async authorize(credentials, req) {
        connect();
        const user = await User.findOne({ email: credentials?.email });

        if (user) {
          return user;
        } else {
          return null;
        }
      },
    }),
  ],
};
