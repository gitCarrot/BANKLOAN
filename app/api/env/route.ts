import { NextResponse } from 'next/server';

export async function GET() {
  console.log('API 라우트 호출됨: /api/env');
  
  // 민감한 정보는 마스킹 처리
  const maskedDatabaseUrl = process.env.DATABASE_URL 
    ? `${process.env.DATABASE_URL.substring(0, 15)}...${process.env.DATABASE_URL.substring(process.env.DATABASE_URL.length - 10)}`
    : undefined;
  
  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    databaseUrlExists: !!process.env.DATABASE_URL,
    databaseUrlMasked: maskedDatabaseUrl,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    nextPublicApiUrl: process.env.NEXT_PUBLIC_API_URL,
    amplifyBranch: process.env.AWS_BRANCH,
    amplifyRegion: process.env.AWS_REGION,
  });
} 