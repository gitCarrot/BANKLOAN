import { MongoClient } from 'mongodb';

// 환경 변수 확인
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL 환경 변수가 설정되지 않았습니다.');
  // 프로덕션 환경에서는 오류를 발생시키고, 개발 환경에서는 경고만 표시
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL 환경 변수가 필요합니다.');
  }
}

// 타입 단언을 사용하여 uri가 string 타입임을 보장
const uri = process.env.DATABASE_URL as string;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // 개발 환경에서는 전역 변수를 사용하여 연결 유지
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // 프로덕션 환경에서는 새 인스턴스 생성
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise; 