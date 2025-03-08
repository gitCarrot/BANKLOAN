// Migration script for PostgreSQL to MongoDB
const { PrismaClient: PgPrisma } = require('@prisma/client');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  console.log('Starting migration from PostgreSQL to MongoDB...');

  // Connect to PostgreSQL
  const pgPrisma = new PgPrisma({
    datasourceUrl: process.env.PG_DATABASE_URL
  });

  // Connect to MongoDB
  const mongoClient = new MongoClient(process.env.DATABASE_URL);
  await mongoClient.connect();
  const db = mongoClient.db('bankloan');

  try {
    // Migrate counsels
    console.log('Migrating counsels...');
    const counsels = await pgPrisma.counsel.findMany();
    if (counsels.length > 0) {
      // Add MongoDB-specific IDs and prepare data
      const counselsWithIds = counsels.map(counsel => ({
        ...counsel,
        counselId: counsel.counselId,
      }));
      await db.collection('counsels').insertMany(counselsWithIds);
      console.log(`Migrated ${counsels.length} counsels`);
    } else {
      console.log('No counsels to migrate');
    }

    // Migrate terms
    console.log('Migrating terms...');
    const terms = await pgPrisma.terms.findMany();
    if (terms.length > 0) {
      const termsWithIds = terms.map(term => ({
        ...term,
        termsId: term.termsId,
      }));
      await db.collection('terms').insertMany(termsWithIds);
      console.log(`Migrated ${terms.length} terms`);
    } else {
      console.log('No terms to migrate');
    }

    // Migrate applications
    console.log('Migrating applications...');
    const applications = await pgPrisma.application.findMany();
    if (applications.length > 0) {
      const applicationsWithIds = applications.map(app => ({
        ...app,
        applicationId: app.applicationId,
      }));
      await db.collection('applications').insertMany(applicationsWithIds);
      console.log(`Migrated ${applications.length} applications`);
    } else {
      console.log('No applications to migrate');
    }

    // Migrate acceptTerms
    console.log('Migrating acceptTerms...');
    const acceptTerms = await pgPrisma.acceptTerms.findMany();
    if (acceptTerms.length > 0) {
      const acceptTermsWithIds = acceptTerms.map(at => ({
        ...at,
        acceptTermsId: at.acceptTermsId,
        applicationId: at.applicationId,
        termsId: at.termsId,
      }));
      await db.collection('accept_terms').insertMany(acceptTermsWithIds);
      console.log(`Migrated ${acceptTerms.length} acceptTerms`);
    } else {
      console.log('No acceptTerms to migrate');
    }

    // Migrate judgments
    console.log('Migrating judgments...');
    const judgments = await pgPrisma.judgment.findMany();
    if (judgments.length > 0) {
      const judgmentsWithIds = judgments.map(judgment => ({
        ...judgment,
        judgmentId: judgment.judgmentId,
        applicationId: judgment.applicationId,
      }));
      await db.collection('judgments').insertMany(judgmentsWithIds);
      console.log(`Migrated ${judgments.length} judgments`);
    } else {
      console.log('No judgments to migrate');
    }

    // Migrate entries
    console.log('Migrating entries...');
    const entries = await pgPrisma.entry.findMany();
    if (entries.length > 0) {
      const entriesWithIds = entries.map(entry => ({
        ...entry,
        entryId: entry.entryId,
        applicationId: entry.applicationId,
      }));
      await db.collection('entries').insertMany(entriesWithIds);
      console.log(`Migrated ${entries.length} entries`);
    } else {
      console.log('No entries to migrate');
    }

    // Migrate balances
    console.log('Migrating balances...');
    const balances = await pgPrisma.balance.findMany();
    if (balances.length > 0) {
      const balancesWithIds = balances.map(balance => ({
        ...balance,
        balanceId: balance.balanceId,
        applicationId: balance.applicationId,
      }));
      await db.collection('balances').insertMany(balancesWithIds);
      console.log(`Migrated ${balances.length} balances`);
    } else {
      console.log('No balances to migrate');
    }

    // Migrate repayments
    console.log('Migrating repayments...');
    const repayments = await pgPrisma.repayment.findMany();
    if (repayments.length > 0) {
      const repaymentsWithIds = repayments.map(repayment => ({
        ...repayment,
        repaymentId: repayment.repaymentId,
        applicationId: repayment.applicationId,
      }));
      await db.collection('repayments').insertMany(repaymentsWithIds);
      console.log(`Migrated ${repayments.length} repayments`);
    } else {
      console.log('No repayments to migrate');
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close connections
    await pgPrisma.$disconnect();
    await mongoClient.close();
  }
}

migrate().catch(console.error); 