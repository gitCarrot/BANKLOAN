This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## MongoDB 설정

이 프로젝트는 MongoDB를 데이터베이스로 사용합니다. MongoDB 설정 방법은 다음과 같습니다:

1. [MongoDB 설치 가이드](./MONGODB_SETUP_GUIDE.md)를 참고하여 MongoDB를 설치합니다.
2. `.env.local` 파일에 MongoDB 연결 문자열을 설정합니다:
   ```
   DATABASE_URL="mongodb://localhost:27017/bankloan"
   ```
3. Prisma 클라이언트를 생성합니다:
   ```bash
   npx prisma generate
   ```
4. 애플리케이션을 실행합니다:
   ```bash
   npm run dev
   ```

### MongoDB 복제 세트 설정 (트랜잭션 사용 시 필요)

Prisma에서 트랜잭션을 사용하려면 MongoDB가 복제 세트로 실행되어야 합니다. 자세한 설정 방법은 [MongoDB 복제 세트 설정 가이드](./MONGODB_REPLICA_SET_GUIDE.md)를 참고하세요.

### PostgreSQL에서 MongoDB로 데이터 마이그레이션

기존 PostgreSQL 데이터베이스에서 MongoDB로 데이터를 마이그레이션하려면:

1. `.env.local` 파일에 PostgreSQL 연결 문자열을 추가합니다:
   ```
   PG_DATABASE_URL="postgresql://username:password@localhost:5432/bankloan"
   ```
2. 마이그레이션 스크립트를 실행합니다:
   ```bash
   npm run migrate-to-mongodb
   ```
