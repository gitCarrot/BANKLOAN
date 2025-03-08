// 이메일 연결 문제를 해결하기 위한 스크립트
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUserAccounts() {
  try {
    console.log('Starting to fix user accounts...');
    console.log('Database URL:', process.env.DATABASE_URL);
    
    // 모든 사용자 조회
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users`);
    
    // 각 사용자의 이메일 인증 상태 업데이트
    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          emailVerified: new Date(),
        }
      });
      console.log(`Updated user: ${user.email}`);
    }
    
    // 계정 연결 문제가 있는 사용자 찾기 (동일한 이메일을 가진 사용자)
    const emails = users.map(user => user.email);
    const duplicateEmails = emails.filter((email, index) => 
      emails.indexOf(email) !== index
    );
    
    if (duplicateEmails.length > 0) {
      console.log(`Found ${duplicateEmails.length} duplicate emails`);
      
      // 중복된 이메일을 가진 사용자 처리
      for (const email of duplicateEmails) {
        const usersWithEmail = await prisma.user.findMany({
          where: { email }
        });
        
        // 첫 번째 사용자를 제외한 나머지 사용자 삭제
        for (let i = 1; i < usersWithEmail.length; i++) {
          await prisma.user.delete({
            where: { id: usersWithEmail[i].id }
          });
          console.log(`Deleted duplicate user: ${usersWithEmail[i].email}`);
        }
      }
    }
    
    console.log('User accounts fixed successfully');
  } catch (error) {
    console.error('Error fixing user accounts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserAccounts(); 