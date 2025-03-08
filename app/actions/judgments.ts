'use server';

import { prisma } from '@/lib/prisma';
import { BadRequestException, NotFoundException } from '@/lib/api-response';
import { Judgment, JudgmentCreateRequest, JudgmentResponse } from '@/types';

/**
 * 대출 심사 결과를 생성합니다.
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
        applicationId, // Use numeric applicationId instead of MongoDB ObjectId
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
    
    // Create judgment
    const judgment = await prisma.judgment.create({
      data: {
        judgmentId: nextJudgmentId,
        applicationId, // Use numeric applicationId instead of MongoDB ObjectId
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
      reason: judgment.reason || undefined, // Convert null to undefined
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
 * 모든 대출 심사 결과를 조회합니다.
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
      reason: judgment.reason || undefined, // Convert null to undefined
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
 * 특정 대출 심사 결과를 ID로 조회합니다.
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
      reason: judgment.reason || undefined, // Convert null to undefined
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
 * 특정 신청서의 대출 심사 결과를 조회합니다.
 */
export async function getJudgmentByApplicationId(applicationId: number): Promise<JudgmentResponse | null> {
  try {
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
      applicationId: judgment.applicationId,
      name: judgment.name,
      approvalAmount: judgment.approvalAmount,
      approvalInterestRate: judgment.approvalInterestRate,
      reason: judgment.reason || undefined, // Convert null to undefined
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
 * 대출 심사 결과를 삭제합니다 (소프트 삭제).
 */
export async function deleteJudgment(judgmentId: string): Promise<void> {
  try {
    const id = parseInt(judgmentId);
    
    if (isNaN(id)) {
      throw new BadRequestException('Invalid judgment ID');
    }
    
    await prisma.judgment.update({
      where: {
        judgmentId: id
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
 * 대출 심사 결과를 수정합니다.
 */
export async function updateJudgment(judgmentId: string, data: Partial<JudgmentCreateRequest>): Promise<JudgmentResponse> {
  try {
    // MongoDB uses numeric judgmentId field
    const judgmentIdNum = parseInt(judgmentId);
    
    const judgment = await prisma.judgment.update({
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
      reason: judgment.reason || undefined, // Convert null to undefined
      createdAt: judgment.createdAt,
      updatedAt: judgment.updatedAt,
      isDeleted: judgment.isDeleted
    };
  } catch (error) {
    console.error(`Error updating judgment with ID ${judgmentId}:`, error);
    throw error;
  }
} 