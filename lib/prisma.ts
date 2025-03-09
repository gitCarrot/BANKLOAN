import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 환경 변수 확인
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL 환경 변수가 설정되지 않았습니다.');
  // 프로덕션 환경에서는 오류를 발생시키고, 개발 환경에서는 경고만 표시
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL 환경 변수가 필요합니다.');
  }
}

// Create a new PrismaClient instance
export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Disable transactions for MongoDB
  transactionOptions: {
    maxWait: 2000,
    timeout: 5000,
  },
  // Enable logging in development
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;