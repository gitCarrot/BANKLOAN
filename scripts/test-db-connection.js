// MongoDB 연결 테스트 스크립트
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testConnection() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  try {
    const client = new MongoClient(process.env.DATABASE_URL);
    await client.connect();
    console.log('MongoDB 연결 성공!');
    
    // 데이터베이스 목록 출력
    const adminDb = client.db('admin');
    const dbs = await adminDb.admin().listDatabases();
    console.log('사용 가능한 데이터베이스:');
    dbs.databases.forEach(db => console.log(` - ${db.name}`));
    
    await client.close();
    console.log('MongoDB 연결 종료');
  } catch (error) {
    console.error('MongoDB 연결 오류:', error);
    process.exit(1);
  }
}

testConnection(); 