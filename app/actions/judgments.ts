'use server';

import { prisma } from '@/lib/prisma';
import { BadRequestException, NotFoundException } from '@/lib/api-response';
import { Judgment, JudgmentCreateRequest, JudgmentResponse } from '@/types';
import { Prisma } from '@prisma/client';

// Type assertion for Prisma client
const prismaAny = prisma as any;

/**
 * Create a loan judgment result
 */
export async function createJudgment(judgmentRequest: JudgmentCreateRequest): Promise<JudgmentResponse> {
  try {
    // Validate required fields
    const { applicationId, name, approvalAmount, approvalInterestRate, reason } = judgmentRequest;
    
    if (!applicationId || !name || approvalAmount === undefined || approvalInterestRate === undefined) {
      throw new BadRequestException('ApplicationId, name, approvalAmount, and approvalInterestRate are required');
    }
    
    // Check if application exists
    const application = await prisma.application.findFirst({
      where: {
        applicationId,
        isDeleted: false
      }
    });
    
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    
    // Check if judgment already exists for this application
    const existingJudgment = await prisma.judgment.findFirst({
      where: {
        applicationId,
        isDeleted: false
      }
    });
    
    if (existingJudgment) {
      throw new BadRequestException('Judgment already exists for this application');
    }
    
    // Get the next judgment ID (MongoDB doesn't auto-increment)
    const lastJudgment = await prisma.judgment.findFirst({
      orderBy: {
        judgmentId: 'desc'
      }
    });
    const nextJudgmentId = lastJudgment ? lastJudgment.judgmentId + 1 : 1;
    
    // Create judgment with type assertion
    const judgment = await prismaAny.judgment.create({
      data: {
        judgmentId: nextJudgmentId,
        applicationId,
        name,
        approvalAmount,
        approvalInterestRate,
        reason
      }
    });
    
    return {
      judgmentId: judgment.judgmentId,
      applicationId,
      name: judgment.name,
      approvalAmount: judgment.approvalAmount,
      approvalInterestRate: judgment.approvalInterestRate,
      reason: judgment.reason,
      createdAt: judgment.createdAt,
      updatedAt: judgment.updatedAt,
      isDeleted: judgment.isDeleted
    };
  } catch (error) {
    console.error('Error creating judgment:', error);
    throw error;
  }
}

/**
 * Get all loan judgment results
 */
export async function getJudgments(): Promise<JudgmentResponse[]> {
  try {
    const judgments = await prisma.judgment.findMany({
      where: {
        isDeleted: false
      },
      include: {
        application: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return judgments.map(judgment => ({
      judgmentId: judgment.judgmentId,
      applicationId: judgment.application.applicationId,
      name: judgment.name,
      approvalAmount: judgment.approvalAmount,
      approvalInterestRate: judgment.approvalInterestRate,
      reason: (judgment as any).reason,
      createdAt: judgment.createdAt,
      updatedAt: judgment.updatedAt,
      isDeleted: judgment.isDeleted
    }));
  } catch (error) {
    console.error('Error fetching judgments:', error);
    throw error;
  }
}

/**
 * Get a loan judgment result by ID
 */
export async function getJudgmentById(judgmentId: string): Promise<JudgmentResponse | null> {
  try {
    // MongoDB uses numeric judgmentId field
    const judgmentIdNum = parseInt(judgmentId);
    
    const judgment = await prisma.judgment.findFirst({
      where: {
        judgmentId: judgmentIdNum,
        isDeleted: false
      },
      include: {
        application: true
      }
    });
    
    if (!judgment) {
      return null;
    }
    
    return {
      judgmentId: judgment.judgmentId,
      applicationId: judgment.application.applicationId,
      name: judgment.name,
      approvalAmount: judgment.approvalAmount,
      approvalInterestRate: judgment.approvalInterestRate,
      reason: (judgment as any).reason,
      createdAt: judgment.createdAt,
      updatedAt: judgment.updatedAt,
      isDeleted: judgment.isDeleted
    };
  } catch (error) {
    console.error(`Error fetching judgment with ID ${judgmentId}:`, error);
    throw error;
  }
}

/**
 * Get a loan judgment result by application ID
 */
export async function getJudgmentByApplicationId(applicationId: number): Promise<JudgmentResponse | null> {
  try {
    // Find the application first to get its MongoDB ObjectId
    const application = await prisma.application.findFirst({
      where: {
        applicationId,
        isDeleted: false
      }
    });
    
    if (!application) {
      return null;
    }
    
    const judgment = await prisma.judgment.findFirst({
      where: {
        applicationId,
        isDeleted: false
      }
    });
    
    if (!judgment) {
      return null;
    }
    
    return {
      judgmentId: judgment.judgmentId,
      applicationId,
      name: judgment.name,
      approvalAmount: judgment.approvalAmount,
      approvalInterestRate: judgment.approvalInterestRate,
      reason: (judgment as any).reason,
      createdAt: judgment.createdAt,
      updatedAt: judgment.updatedAt,
      isDeleted: judgment.isDeleted
    };
  } catch (error) {
    console.error(`Error fetching judgment for application ID ${applicationId}:`, error);
    throw error;
  }
}

/**
 * Delete a loan judgment result (soft delete)
 */
export async function deleteJudgment(judgmentId: string): Promise<void> {
  try {
    // MongoDB uses numeric judgmentId field
    const judgmentIdNum = parseInt(judgmentId);
    
    await prisma.judgment.update({
      where: {
        judgmentId: judgmentIdNum
      },
      data: {
        isDeleted: true
      }
    });
  } catch (error) {
    console.error(`Error deleting judgment with ID ${judgmentId}:`, error);
    throw error;
  }
}

/**
 * Update a loan judgment result
 */
export async function updateJudgment(judgmentId: string, data: Partial<JudgmentCreateRequest>): Promise<JudgmentResponse> {
  try {
    // MongoDB uses numeric judgmentId field
    const judgmentIdNum = parseInt(judgmentId);
    
    // Get the judgment to update
    const existingJudgment = await prisma.judgment.findUnique({
      where: {
        judgmentId: judgmentIdNum
      },
      include: {
        application: true
      }
    });
    
    if (!existingJudgment) {
      throw new NotFoundException(`Judgment with ID ${judgmentId} not found`);
    }
    
    // Update judgment with type assertion
    const judgment = await prismaAny.judgment.update({
      where: {
        judgmentId: judgmentIdNum
      },
      data: {
        name: data.name,
        approvalAmount: data.approvalAmount,
        approvalInterestRate: data.approvalInterestRate,
        reason: data.reason
      },
      include: {
        application: true
      }
    });
    
    return {
      judgmentId: judgment.judgmentId,
      applicationId: judgment.application.applicationId,
      name: judgment.name,
      approvalAmount: judgment.approvalAmount,
      approvalInterestRate: judgment.approvalInterestRate,
      reason: judgment.reason,
      createdAt: judgment.createdAt,
      updatedAt: judgment.updatedAt,
      isDeleted: judgment.isDeleted
    };
  } catch (error) {
    console.error(`Error updating judgment with ID ${judgmentId}:`, error);
    throw error;
  }
} 