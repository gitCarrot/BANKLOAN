import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
  console.log('API 라우트 호출됨: /api/test-db');
  
  try {
    console.log('DATABASE_URL 환경 변수:', process.env.DATABASE_URL ? '설정됨' : '설정되지 않음');
    
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL 환경 변수가 설정되지 않았습니다.');
      return NextResponse.json({ 
        error: 'DATABASE_URL 환경 변수가 설정되지 않았습니다.',
        env: process.env.NODE_ENV
      }, { status: 500 });
    }
    
    console.log('MongoDB 연결 시도 중...');
    const client = new MongoClient(process.env.DATABASE_URL);
    await client.connect();
    console.log('MongoDB 연결 성공!');
    
    // 데이터베이스 목록 가져오기
    const adminDb = client.db('admin');
    const dbs = await adminDb.admin().listDatabases();
    const dbList = dbs.databases.map(db => db.name);
    
    // 컬렉션 목록 가져오기
    const db = client.db('carrotloan');
    const collections = await db.listCollections().toArray();
    const collectionList = collections.map(col => col.name);
    
    await client.close();
    console.log('MongoDB 연결 종료');
    
    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB 연결 성공',
      databases: dbList,
      collections: collectionList,
      env: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('MongoDB 연결 오류:', error);
    
    return NextResponse.json({ 
      error: '데이터베이스 연결 오류', 
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      env: process.env.NODE_ENV
    }, { status: 500 });
  }
} 