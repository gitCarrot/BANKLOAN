'use server';

import { prisma } from '@/lib/prisma';
import { BadRequestException } from '@/lib/api-response';
import { Application, ApplicationCreateRequest, ApplicationResponse, ApplicationUpdateRequest } from '@/types';

/**
 * Create a loan application
 */
export async function createApplication(applicationRequest: ApplicationCreateRequest): Promise<ApplicationResponse> {
  try {
    // Validate required fields
    const { name, cellPhone, email } = applicationRequest;
    if (!name || !cellPhone || !email) {
      throw new BadRequestException('Name, cellPhone, and email are required');
    }
    
    // Get the next application ID (MongoDB doesn't auto-increment)
    const lastApplication = await prisma.application.findFirst({
      orderBy: {
        applicationId: 'desc'
      }
    });
    const nextApplicationId = lastApplication ? lastApplication.applicationId + 1 : 1;
    
    // Create application
    const application = await prisma.application.create({
      data: {
        applicationId: nextApplicationId,
        name,
        cellPhone,
        email,
        interestRate: applicationRequest.interestRate,
        fee: applicationRequest.fee,
        maturity: applicationRequest.maturity,
        hopeAmount: applicationRequest.hopeAmount,
        appliedAt: new Date()
      }
    });
    
    return {
      applicationId: application.applicationId,
      name: application.name,
      cellPhone: application.cellPhone,
      email: application.email,
      interestRate: application.interestRate ?? undefined,
      fee: application.fee ?? undefined,
      maturity: application.maturity ?? undefined,
      hopeAmount: application.hopeAmount ?? undefined,
      appliedAt: application.appliedAt,
      approvalAmount: application.approvalAmount ?? undefined,
      contractedAt: application.contractedAt ?? undefined,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      isDeleted: application.isDeleted
    };
  } catch (error) {
    console.error('Error creating application:', error);
    throw error;
  }
}

/**
 * Get all loan applications
 */
export async function getApplications(): Promise<ApplicationResponse[]> {
  try {
    const applications = await prisma.application.findMany({
      where: {
        isDeleted: false
      },
      orderBy: {
        appliedAt: 'desc'
      }
    });
    
    return applications.map(application => ({
      applicationId: application.applicationId,
      name: application.name,
      cellPhone: application.cellPhone,
      email: application.email,
      interestRate: application.interestRate ?? undefined,
      fee: application.fee ?? undefined,
      maturity: application.maturity ?? undefined,
      hopeAmount: application.hopeAmount ?? undefined,
      appliedAt: application.appliedAt,
      approvalAmount: application.approvalAmount ?? undefined,
      contractedAt: application.contractedAt ?? undefined,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      isDeleted: application.isDeleted
    }));
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
}

/**
 * Get a loan application by ID
 */
export async function getApplicationById(applicationId: string) {
  try {
    const appId = parseInt(applicationId);
    if (isNaN(appId)) {
      return { error: "Invalid application ID" };
    }

    const application = await prisma.application.findUnique({
      where: { 
        applicationId: appId,
        isDeleted: false
      },
    });

    if (!application) {
      return { error: "Application not found" };
    }

    return { application };
  } catch (error) {
    console.error("Error getting application:", error);
    return { error: "Failed to get application" };
  }
}

/**
 * Update a loan application
 */
export async function updateApplication(applicationId: string, data: Partial<ApplicationUpdateRequest>): Promise<ApplicationResponse> {
  try {
    // MongoDB에서는 applicationId가 숫자 필드이므로 문자열을 숫자로 변환
    const appId = parseInt(applicationId);
    
    const application = await prisma.application.update({
      where: {
        applicationId: appId
      },
      data
    });
    
    return {
      applicationId: application.applicationId,
      name: application.name,
      cellPhone: application.cellPhone,
      email: application.email,
      interestRate: application.interestRate ?? undefined,
      fee: application.fee ?? undefined,
      maturity: application.maturity ?? undefined,
      hopeAmount: application.hopeAmount ?? undefined,
      appliedAt: application.appliedAt,
      approvalAmount: application.approvalAmount ?? undefined,
      contractedAt: application.contractedAt ?? undefined,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      isDeleted: application.isDeleted
    };
  } catch (error) {
    console.error(`Error updating application with ID ${applicationId}:`, error);
    throw error;
  }
}

/**
 * Delete a loan application (soft delete)
 */
export async function deleteApplication(applicationId: string) {
  try {
    const appId = parseInt(applicationId);
    if (isNaN(appId)) {
      return { error: "Invalid application ID" };
    }

    const application = await prisma.application.findUnique({
      where: { 
        applicationId: appId,
        isDeleted: false
      },
    });

    if (!application) {
      return { error: "Application not found" };
    }

    await prisma.application.update({
      where: { applicationId: appId },
      data: { isDeleted: true },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting application:", error);
    return { error: "Failed to delete application" };
  }
} 