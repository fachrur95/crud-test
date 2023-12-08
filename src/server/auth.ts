import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type DefaultUser,
  type NextAuthOptions,
  type User,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { type AdapterUser } from "next-auth/adapters";
import type { JWT } from "next-auth/jwt";

import { env } from "@/env";
import type { ApiCatchError, ITokenUser } from "@/types/api-response";
import axios from "axios";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      // ...other properties
      // role: UserRole;
    };
    accessToken: string;
  }

  interface User extends DefaultUser {
    accessToken: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
      accessToken: token.accessToken,
    }),
    async jwt(
      { token, user }:
        {
          token: JWT,
          user: User | AdapterUser,
        }) {

      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
      }
      return token;
    },
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: {
          label: "Username/ Email",
          type: "text",
          placeholder: "Username",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("An error occurred");
        }

        const checkLogin = await axios.post<ITokenUser>(
          `${env.BACKEND_URL}/api/v1/login`,
          {
            username: credentials.email,
            password: credentials.password,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          },
        )
          .then((response) => response.data)
          .catch((error) => {
            throw new Error((error as ApiCatchError).response?.data?.message ?? (error as ApiCatchError).message ?? "An error occurred");
          });

        if (!checkLogin) {
          throw new Error("An error occurred");
        }

        const user = checkLogin.data.user;

        return {
          id: String(user.id),
          name: user.username,
          email: user.username,
          image: null,
          accessToken: checkLogin.data.token,
        };
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  session: {
    strategy: "jwt",
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
