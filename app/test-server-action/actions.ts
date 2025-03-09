'use server';

import { MongoClient } from 'mongodb';
import { PrismaClient } from '@prisma/client';
// package.json에서 버전 정보를 가져오기 위한 import
import { version as prismaVersion } from '@prisma/client/package.json';

// 서버 액션 테스트 함수
export async function testServerAction() {
  // 타입 정의
  interface MongoDbTestResult {
    success: boolean;
    databases?: string[];
    collections?: string[];
    error?: string;
  }
  
  interface PrismaTestResult {
    success: boolean;
    counselCount?: number;
    error?: string;
    stack?: string;
  }
  
  interface ServerInfo {
    nodeEnv: string | undefined;
    nodeVersion: string;
    platform: string;
    arch: string;
    amplifyBranch: string | undefined;
    amplifyRegion: string | undefined;
    prismaVersion: string;
  }
  
  // 결과 객체 초기화
  const results: {
    mongoDbTest: MongoDbTestResult | null;
    prismaTest: PrismaTestResult | null;
    serverInfo: ServerInfo | null;
  } = {
    mongoDbTest: null,
    prismaTest: null,
    serverInfo: null,
  };
  
  try {
    console.log('서버 액션 실행 시작');
    
    // 환경 변수 확인
    const databaseUrl = process.env.DATABASE_URL;
    console.log('DATABASE_URL 환경 변수:', databaseUrl ? '설정됨' : '설정되지 않음');
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL 환경 변수가 설정되지 않았습니다.');
    }
    
    // 1. MongoDB 직접 연결 테스트
    try {
      console.log('MongoDB 직접 연결 테스트 시작...');
      const client = new MongoClient(databaseUrl);
      await client.connect();
      console.log('MongoDB 직접 연결 성공!');
      
      // 데이터베이스 목록 가져오기
      const adminDb = client.db('admin');
      const dbs = await adminDb.admin().listDatabases();
      const dbList = dbs.databases.map(db => db.name);
      
      // 컬렉션 목록 가져오기
      const db = client.db('carrotloan');
      const collections = await db.listCollections().toArray();
      const collectionList = collections.map(col => col.name);
      
      await client.close();
      console.log('MongoDB 직접 연결 테스트 종료');
      
      results.mongoDbTest = {
        success: true,
        databases: dbList,
        collections: collectionList,
      };
    } catch (mongoError) {
      console.error('MongoDB 연결 테스트 실패:', mongoError);
      results.mongoDbTest = {
        success: false,
        error: mongoError instanceof Error ? mongoError.message : String(mongoError),
      };
    }
    
    // 2. Prisma 연결 테스트
    try {
      console.log('Prisma 연결 테스트 시작...');
      const prisma = new PrismaClient();
      
      // 간단한 쿼리 실행
      const counselCount = await prisma.counsel.count();
      console.log(`Counsel 테이블 레코드 수: ${counselCount}`);
      
      await prisma.$disconnect();
      console.log('Prisma 연결 테스트 종료');
      
      results.prismaTest = {
        success: true,
        counselCount,
      };
    } catch (prismaError) {
      console.error('Prisma 연결 테스트 실패:', prismaError);
      results.prismaTest = {
        success: false,
        error: prismaError instanceof Error ? prismaError.message : String(prismaError),
        stack: prismaError instanceof Error ? prismaError.stack : undefined,
      };
    }
    
    // 3. 서버 환경 정보 수집
    results.serverInfo = {
      nodeEnv: process.env.NODE_ENV,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      amplifyBranch: process.env.AWS_BRANCH,
      amplifyRegion: process.env.AWS_REGION,
      prismaVersion,
    };
    
    return {
      success: results.mongoDbTest?.success === true || results.prismaTest?.success === true,
      message: '서버 액션이 실행되었습니다.',
      results,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('서버 액션 실행 중 오류 발생:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      results,
      timestamp: new Date().toISOString(),
    };
  }
} 