'use server';

import { prisma } from '@/lib/prisma';
import { BadRequestException, NotFoundException, UnprocessableException } from '@/lib/api-response';
import { ApplicationResponse } from '@/types';

/**
 * Update a loan application to contracted status
 */
export async function contractApplication(applicationId: string): Promise<ApplicationResponse> {
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
    
    // Check if the application has already been contracted
    if (application.contractedAt) {
      throw new BadRequestException('Application has already been contracted');
    }
    
    // Check if the application has a judgment with approval amount
    const judgment = await prisma.judgment.findFirst({
      where: {
        applicationId: appId,
        isDeleted: false
      }
    });
    
    if (!judgment) {
      throw new UnprocessableException('Application has not been judged yet');
    }
    
    // Update the application as contracted
    const updatedApplication = await prisma.application.update({
      where: {
        applicationId: appId
      },
      data: {
        contractedAt: new Date(),
        approvalAmount: judgment.approvalAmount
      }
    });
    
    return {
      applicationId: updatedApplication.applicationId,
      name: updatedApplication.name,
      cellPhone: updatedApplication.cellPhone,
      email: updatedApplication.email,
      interestRate: updatedApplication.interestRate ?? undefined,
      fee: updatedApplication.fee ?? undefined,
      maturity: updatedApplication.maturity ?? undefined,
      hopeAmount: updatedApplication.hopeAmount ?? undefined,
      appliedAt: updatedApplication.appliedAt,
      approvalAmount: updatedApplication.approvalAmount ?? undefined,
      contractedAt: updatedApplication.contractedAt ?? undefined,
      createdAt: updatedApplication.createdAt,
      updatedAt: updatedApplication.updatedAt,
      isDeleted: updatedApplication.isDeleted
    };
  } catch (error) {
    console.error(`Error contracting application with ID ${applicationId}:`, error);
    throw error;
  }
} 