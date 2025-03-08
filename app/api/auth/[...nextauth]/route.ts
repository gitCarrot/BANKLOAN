import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";

// 사용자 정의 타입
interface CustomUser {
  id: string;
  role?: string;
  [key: string]: any;
}

// NextAuth에서 사용할 사용자 정의 타입 확장
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id?: string;
      role?: string;
    } & DefaultSession["user"];
  }
}

// JWT 타입 확장
declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: string;
  }
}

/**
 * NextAuth v5 configuration
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async signIn({ user, account, profile, email }) {
      // 이메일 연결 문제 해결을 위한 로직
      if (email?.verificationRequest) {
        return true;
      }
      
      // 항상 로그인 허용
      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // 타입 단언을 사용하여 user를 CustomUser로 취급
        const customUser = user as CustomUser;
        
        return {
          ...token,
          accessToken: account.access_token,
          userId: customUser.id,
          role: customUser.role || "user"
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Type assertion to avoid TypeScript errors
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  // 이메일 연결 문제 해결을 위한 설정
  events: {
    async linkAccount({ user }) {
      // 계정 연결 시 이벤트 처리
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      });
    }
  }
});

// Export the API route handlers
export const { GET, POST } = handlers; 