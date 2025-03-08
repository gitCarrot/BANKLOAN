'use server';

import { prisma } from '@/lib/prisma';
import { BadRequestException, NotFoundException, UnprocessableException } from '@/lib/api-response';
import { Entry, EntryCreateRequest, EntryResponse } from '@/types';
import { PrismaClient, Prisma } from '@prisma/client';

/**
 * Create a loan entry (deposit)
 * Also updates the balance when an entry is created
 */
export async function createEntry(applicationId: string, entryAmount: number): Promise<EntryResponse> {
  try {
    const appId = parseInt(applicationId);
    
    if (entryAmount <= 0) {
      throw new BadRequestException('Entry amount must be greater than 0');
    }
    
    // Check if application exists and is contracted
    const application = await prisma.application.findFirst({
      where: {
        applicationId: appId,
        isDeleted: false
      }
    });
    
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    
    if (!application.contractedAt) {
      throw new UnprocessableException('Application has not been contracted yet');
    }
    
    // Get the next entry ID (MongoDB doesn't auto-increment)
    const lastEntry = await prisma.entry.findFirst({
      orderBy: {
        entryId: 'desc'
      }
    });
    const nextEntryId = lastEntry ? lastEntry.entryId + 1 : 1;
    
    // Get the next balance ID if needed
    const lastBalance = await prisma.balance.findFirst({
      orderBy: {
        balanceId: 'desc'
      }
    });
    const nextBalanceId = lastBalance ? lastBalance.balanceId + 1 : 1;
    
    // Start a transaction to ensure data consistency
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create entry record
      const entry = await tx.entry.create({
        data: {
          entryId: nextEntryId,
          applicationId: appId, // Use numeric applicationId instead of MongoDB ObjectId
          entryAmount
        }
      });
      
      // Check if balance exists for this application
      const existingBalance = await tx.balance.findFirst({
        where: {
          applicationId: appId, // Use numeric applicationId instead of MongoDB ObjectId
          isDeleted: false
        }
      });
      
      if (existingBalance) {
        // Update existing balance
        const updatedBalance = await tx.balance.update({
          where: {
            balanceId: existingBalance.balanceId
          },
          data: {
            balance: existingBalance.balance + entryAmount
          }
        });
      } else {
        // Create new balance
        await tx.balance.create({
          data: {
            balanceId: nextBalanceId,
            applicationId: appId, // Use numeric applicationId instead of MongoDB ObjectId
            balance: entryAmount
          }
        });
      }
      
      return {
        entryId: entry.entryId,
        applicationId: appId,
        entryAmount: entry.entryAmount,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
        isDeleted: entry.isDeleted
      };
    });
  } catch (error) {
    console.error(`Error creating entry for application with ID ${applicationId}:`, error);
    throw error;
  }
}

/**
 * Get all entries for an application
 */
export async function getEntries(applicationId: string): Promise<EntryResponse[]> {
  try {
    const appId = parseInt(applicationId);
    
    // Check if application exists
    const application = await prisma.application.findFirst({
      where: {
        applicationId: appId,
        isDeleted: false
      }
    });
    
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    
    // Get all entries for this application
    const entries = await prisma.entry.findMany({
      where: {
        applicationId: appId, // Use numeric applicationId instead of MongoDB ObjectId
        isDeleted: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return entries.map(entry => ({
      entryId: entry.entryId,
      applicationId: appId,
      entryAmount: entry.entryAmount,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      isDeleted: entry.isDeleted
    }));
  } catch (error) {
    console.error(`Error fetching entries for application with ID ${applicationId}:`, error);
    throw error;
  }
}

/**
 * Get an entry by ID
 */
export async function getEntryById(entryId: string): Promise<EntryResponse | null> {
  try {
    // MongoDB uses numeric entryId field
    const entryIdNum = parseInt(entryId);
    
    const entry = await prisma.entry.findFirst({
      where: {
        entryId: entryIdNum,
        isDeleted: false
      },
      include: {
        application: true
      }
    });
    
    if (!entry) {
      return null;
    }
    
    return {
      entryId: entry.entryId,
      applicationId: entry.application.applicationId,
      entryAmount: entry.entryAmount,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      isDeleted: entry.isDeleted
    };
  } catch (error) {
    console.error(`Error fetching entry with ID ${entryId}:`, error);
    throw error;
  }
}

/**
 * Delete an entry (soft delete)
 */
export async function deleteEntry(entryId: string): Promise<void> {
  try {
    // MongoDB uses numeric entryId field
    const entryIdNum = parseInt(entryId);
    
    await prisma.entry.update({
      where: {
        entryId: entryIdNum
      },
      data: {
        isDeleted: true
      }
    });
  } catch (error) {
    console.error(`Error deleting entry with ID ${entryId}:`, error);
    throw error;
  }
} 