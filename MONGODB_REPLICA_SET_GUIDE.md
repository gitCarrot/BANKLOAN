# MongoDB 복제 세트 설정 가이드

이 가이드는 MongoDB를 복제 세트로 설정하는 방법을 설명합니다. Prisma에서 트랜잭션을 사용하려면 MongoDB가 복제 세트로 실행되어야 합니다.

## 1. 로컬 개발 환경에서 복제 세트 설정

### macOS (Homebrew 사용)

1. MongoDB 서비스 중지:
   ```bash
   brew services stop mongodb-community
   ```

2. MongoDB 설정 파일 생성:
   ```bash
   mkdir -p ~/data/db
   touch ~/mongodb.conf
   ```

3. 설정 파일에 다음 내용 추가 (`~/mongodb.conf`):
   ```yaml
   replication:
     replSetName: rs0
   ```

4. 복제 세트로 MongoDB 시작:
   ```bash
   mongod --config ~/mongodb.conf --replSet rs0 --dbpath ~/data/db
   ```

5. 새 터미널에서 MongoDB 쉘 연결:
   ```bash
   mongosh
   ```

6. 복제 세트 초기화:
   ```javascript
   rs.initiate({
     _id: "rs0",
     members: [{ _id: 0, host: "localhost:27017" }]
   })
   ```

7. 복제 세트 상태 확인:
   ```javascript
   rs.status()
   ```

### Windows

1. MongoDB 서비스 중지:
   ```
   net stop MongoDB
   ```

2. MongoDB 설정 파일 생성 (`C:\mongodb.conf`):
   ```yaml
   replication:
     replSetName: rs0
   ```

3. 복제 세트로 MongoDB 시작:
   ```
   "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --config C:\mongodb.conf --replSet rs0 --dbpath C:\data\db
   ```

4. 새 명령 프롬프트에서 MongoDB 쉘 연결:
   ```
   "C:\Program Files\MongoDB\Server\7.0\bin\mongosh.exe"
   ```

5. 복제 세트 초기화:
   ```javascript
   rs.initiate({
     _id: "rs0",
     members: [{ _id: 0, host: "localhost:27017" }]
   })
   ```

### Linux (Ubuntu)

1. MongoDB 서비스 중지:
   ```bash
   sudo systemctl stop mongod
   ```

2. MongoDB 설정 파일 수정:
   ```bash
   sudo nano /etc/mongod.conf
   ```

3. 다음 내용 추가:
   ```yaml
   replication:
     replSetName: rs0
   ```

4. MongoDB 서비스 재시작:
   ```bash
   sudo systemctl start mongod
   ```

5. MongoDB 쉘 연결:
   ```bash
   mongosh
   ```

6. 복제 세트 초기화:
   ```javascript
   rs.initiate({
     _id: "rs0",
     members: [{ _id: 0, host: "localhost:27017" }]
   })
   ```

## 2. 환경 변수 설정

`.env.local` 파일에서 MongoDB 연결 문자열을 복제 세트 형식으로 업데이트합니다:

```
DATABASE_URL="mongodb://localhost:27017/bankloan?replicaSet=rs0"
```

## 3. 애플리케이션 재시작

설정을 완료한 후 애플리케이션을 재시작합니다:

```bash
npm run dev
```

## 4. 트랜잭션 없이 실행하기 (대안)

복제 세트를 설정하기 어려운 경우, Prisma 클라이언트에서 트랜잭션을 비활성화할 수 있습니다. 이 방법은 `lib/prisma.ts` 파일에 이미 적용되어 있습니다.

```typescript
export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // MongoDB에서 트랜잭션을 사용하지 않도록 설정
  transactionOptions: {
    maxWait: 0,
    timeout: 0,
  },
});
```

## 5. 문제 해결

### 복제 세트 상태 확인

MongoDB 쉘에서 다음 명령을 실행하여 복제 세트 상태를 확인할 수 있습니다:

```javascript
rs.status()
```

### 복제 세트 재구성

복제 세트에 문제가 있는 경우 다음 명령으로 재구성할 수 있습니다:

```javascript
rs.reconfig({
  _id: "rs0",
  members: [{ _id: 0, host: "localhost:27017" }]
})
```

### 연결 문자열 확인

연결 문자열이 올바른 형식인지 확인하세요:

```
mongodb://localhost:27017/bankloan?replicaSet=rs0
``` 