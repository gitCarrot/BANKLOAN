'use server';

import { prisma } from '@/lib/prisma';
import { BadRequestException, NotFoundException, UnprocessableException } from '@/lib/api-response';
import { Repayment, RepaymentResponse } from '@/types';
import { PrismaClient, Prisma } from '@prisma/client';

/**
 * Create a loan repayment
 * Also updates the balance when a repayment is created
 */
export async function createRepayment(applicationId: string, repaymentAmount: number): Promise<RepaymentResponse> {
  try {
    const appId = parseInt(applicationId);
    
    if (repaymentAmount <= 0) {
      throw new BadRequestException('Repayment amount must be greater than 0');
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
    
    // Get the next repayment ID (MongoDB doesn't auto-increment)
    const lastRepayment = await prisma.repayment.findFirst({
      orderBy: {
        repaymentId: 'desc'
      }
    });
    const nextRepaymentId = lastRepayment ? lastRepayment.repaymentId + 1 : 1;
    
    // Start a transaction to ensure data consistency
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Check if balance exists and has sufficient funds
      const balance = await tx.balance.findFirst({
        where: {
          applicationId: appId, // Use numeric applicationId instead of MongoDB ObjectId
          isDeleted: false
        }
      });
      
      if (!balance) {
        throw new UnprocessableException('No balance found for this application');
      }
      
      if (balance.balance < repaymentAmount) {
        throw new BadRequestException('Insufficient balance for repayment');
      }
      
      // Create repayment record
      const repayment = await tx.repayment.create({
        data: {
          repaymentId: nextRepaymentId,
          applicationId: appId, // Use numeric applicationId instead of MongoDB ObjectId
          repaymentAmount
        }
      });
      
      // Update balance
      await tx.balance.update({
        where: {
          balanceId: balance.balanceId
        },
        data: {
          balance: balance.balance - repaymentAmount
        }
      });
      
      return {
        repaymentId: repayment.repaymentId,
        applicationId: appId,
        repaymentAmount: repayment.repaymentAmount,
        createdAt: repayment.createdAt,
        updatedAt: repayment.updatedAt,
        isDeleted: repayment.isDeleted
      };
    });
  } catch (error) {
    console.error(`Error creating repayment for application with ID ${applicationId}:`, error);
    throw error;
  }
}

/**
 * Get all repayments for an application
 */
export async function getRepayments(applicationId: string): Promise<RepaymentResponse[]> {
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
    
    // Get all repayments for this application
    const repayments = await prisma.repayment.findMany({
      where: {
        applicationId: appId, // Use numeric applicationId instead of MongoDB ObjectId
        isDeleted: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return repayments.map(repayment => ({
      repaymentId: repayment.repaymentId,
      applicationId: appId,
      repaymentAmount: repayment.repaymentAmount,
      createdAt: repayment.createdAt,
      updatedAt: repayment.updatedAt,
      isDeleted: repayment.isDeleted
    }));
  } catch (error) {
    console.error(`Error fetching repayments for application with ID ${applicationId}:`, error);
    throw error;
  }
}

/**
 * Get a repayment by ID
 */
export async function getRepaymentById(repaymentId: string): Promise<RepaymentResponse | null> {
  try {
    // MongoDB uses numeric repaymentId field
    const repaymentIdNum = parseInt(repaymentId);
    
    const repayment = await prisma.repayment.findFirst({
      where: {
        repaymentId: repaymentIdNum,
        isDeleted: false
      },
      include: {
        application: true
      }
    });
    
    if (!repayment) {
      return null;
    }
    
    return {
      repaymentId: repayment.repaymentId,
      applicationId: repayment.application.applicationId,
      repaymentAmount: repayment.repaymentAmount,
      createdAt: repayment.createdAt,
      updatedAt: repayment.updatedAt,
      isDeleted: repayment.isDeleted
    };
  } catch (error) {
    console.error(`Error fetching repayment with ID ${repaymentId}:`, error);
    throw error;
  }
}

/**
 * Delete a repayment (soft delete)
 */
export async function deleteRepayment(repaymentId: string): Promise<void> {
  try {
    // MongoDB uses numeric repaymentId field
    const repaymentIdNum = parseInt(repaymentId);
    
    await prisma.repayment.update({
      where: {
        repaymentId: repaymentIdNum
      },
      data: {
        isDeleted: true
      }
    });
  } catch (error) {
    console.error(`Error deleting repayment with ID ${repaymentId}:`, error);
    throw error;
  }
} 