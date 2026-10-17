import { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import prisma from "./prisma";
import {
  cleanupOldThrottles,
  clearLoginFailures,
  getClientIp,
  isEmailThrottled,
  isIpThrottled,
  recordEmailFailure,
  recordIpFailure,
} from "./login-throttle";

// Hash bcrypt dummy: dipakai saat email tidak dikenal agar waktu respons
// setara dengan password salah, sehingga email tidak bisa dienumerasi.
const DUMMY_PASSWORD_HASH =
  "$2b$10$IgJj/TM.IbvMLCNGmtsG8uspdP2VMvqMV8jof9vlz//ZV3N.82XXm";

const SEVEN_DAYS = 7 * 24 * 60 * 60;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const ip = getClientIp(req?.headers);
        const email = credentials.email;

        // Pembersihan oportunistik baris throttle lama (tanpa cron).
        await cleanupOldThrottles();

        // Throttle per-IP (lockout keras).
        const ipCheck = await isIpThrottled(ip);
        if (ipCheck.blocked) {
          const remaining = Math.ceil(ipCheck.retryAfterSeconds / 60);
          console.warn(
            `[auth] lockout ip=${ip} retryAfter=${ipCheck.retryAfterSeconds}s`
          );
          throw new Error(`LOCKOUT:${remaining}`);
        }

        // Throttle per-email (backoff bertambah, bukan lockout total).
        const emailCheck = await isEmailThrottled(email);
        if (emailCheck.blocked) {
          const remaining = Math.ceil(emailCheck.retryAfterSeconds / 60);
          console.warn(
            `[auth] lockout email=${email} ip=${ip} retryAfter=${emailCheck.retryAfterSeconds}s`
          );
          throw new Error(`LOCKOUT:${remaining}`);
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        // Selalu jalankan bcrypt.compare (pakai hash dummy bila user tidak ada)
        // agar waktu respons setara.
        const passwordHash = user?.password ?? DUMMY_PASSWORD_HASH;
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          passwordHash
        );

        if (!user || !user.password || !isPasswordValid) {
          console.warn(`[auth] login gagal email=${email} ip=${ip}`);
          await recordIpFailure(ip);
          await recordEmailFailure(email);
          return null;
        }

        await clearLoginFailures(ip, email);
        console.log(`[auth] login sukses email=${email} ip=${ip}`);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tokenVersion: user.tokenVersion,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: SEVEN_DAYS, // 7 hari
    updateAge: 24 * 60 * 60, // perpanjang maksimal 1x/hari
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: SEVEN_DAYS,
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.tokenVersion = user.tokenVersion;
        return token;
      }

      // Validasi tokenVersion: naikkan nilainya di DB untuk mematikan sesi lama.
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { tokenVersion: true },
        });
        if (!dbUser || dbUser.tokenVersion !== token.tokenVersion) {
          // null = batalkan sesi. Di next-auth v4 runtime, token ini
          // di-invalidasi dan cookie sesi dibersihkan.
          return null as unknown as JWT;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },
};
