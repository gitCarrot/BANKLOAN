'use server';

import { MongoClient } from 'mongodb';
import { PrismaClient } from '@prisma/client';

// 서버 액션 테스트 함수
export async function testServerAction() {
  try {
    console.log('서버 액션 실행 시작');
    
    // 환경 변수 확인
    const databaseUrl = process.env.DATABASE_URL;
    console.log('DATABASE_URL 환경 변수:', databaseUrl ? '설정됨' : '설정되지 않음');
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL 환경 변수가 설정되지 않았습니다.');
    }
    
    // 1. MongoDB 직접 연결 테스트
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
    
    // 2. Prisma 연결 테스트
    console.log('Prisma 연결 테스트 시작...');
    const prisma = new PrismaClient();
    
    // 간단한 쿼리 실행
    const counselCount = await prisma.counsel.count();
    console.log(`Counsel 테이블 레코드 수: ${counselCount}`);
    
    await prisma.$disconnect();
    console.log('Prisma 연결 테스트 종료');
    
    // 3. 서버 환경 정보 수집
    const serverInfo = {
      nodeEnv: process.env.NODE_ENV,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      amplifyBranch: process.env.AWS_BRANCH,
      amplifyRegion: process.env.AWS_REGION,
    };
    
    return {
      success: true,
      message: '서버 액션이 성공적으로 실행되었습니다.',
      databases: dbList,
      collections: collectionList,
      counselCount,
      serverInfo,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('서버 액션 실행 중 오류 발생:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    };
  }
} 