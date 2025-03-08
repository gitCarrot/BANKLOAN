'use server';

import { prisma } from '@/lib/prisma';
import { BadRequestException } from '@/lib/api-response';
import { Counsel, CounselCreateRequest, CounselResponse } from '@/types';

/**
 * Create a consultation request
 */
export async function createCounsel(counselRequest: CounselCreateRequest): Promise<CounselResponse> {
  try {
    // Validate required fields
    const { name, cellPhone, email } = counselRequest;
    if (!name || !cellPhone || !email) {
      throw new BadRequestException('Name, cellPhone, and email are required');
    }
    
    // Get the next counsel ID (MongoDB doesn't auto-increment)
    const lastCounsel = await prisma.counsel.findFirst({
      orderBy: {
        counselId: 'desc'
      }
    });
    const nextCounselId = lastCounsel ? lastCounsel.counselId + 1 : 1;
    
    // Create counsel
    const counsel = await prisma.counsel.create({
      data: {
        counselId: nextCounselId,
        name,
        cellPhone,
        email,
        memo: counselRequest.message || counselRequest.memo,
        address: counselRequest.address,
        addressDetail: counselRequest.addressDetail,
        zipCode: counselRequest.zipCode,
        appliedAt: counselRequest.counselDateTime || new Date()
      }
    });
    
    return {
      counselId: counsel.counselId,
      name: counsel.name,
      cellPhone: counsel.cellPhone,
      email: counsel.email,
      memo: counsel.memo || undefined,
      address: counsel.address || undefined,
      addressDetail: counsel.addressDetail || undefined,
      zipCode: counsel.zipCode || undefined,
      appliedAt: counsel.appliedAt,
      createdAt: counsel.createdAt,
      updatedAt: counsel.updatedAt,
      isDeleted: counsel.isDeleted
    };
  } catch (error) {
    console.error('Error creating counsel:', error);
    throw error;
  }
}

/**
 * Get all consultation requests
 */
export async function getCounsels(): Promise<CounselResponse[]> {
  try {
    const counsels = await prisma.counsel.findMany({
      where: {
        isDeleted: false
      },
      orderBy: {
        appliedAt: 'desc'
      }
    });
    
    return counsels.map(counsel => ({
      counselId: counsel.counselId,
      name: counsel.name,
      cellPhone: counsel.cellPhone,
      email: counsel.email,
      memo: counsel.memo || undefined,
      address: counsel.address || undefined,
      addressDetail: counsel.addressDetail || undefined,
      zipCode: counsel.zipCode || undefined,
      appliedAt: counsel.appliedAt,
      createdAt: counsel.createdAt,
      updatedAt: counsel.updatedAt,
      isDeleted: counsel.isDeleted
    }));
  } catch (error) {
    console.error('Error fetching counsels:', error);
    throw error;
  }
}

/**
 * Get a consultation request by ID
 */
export async function getCounselById(counselId: string) {
  try {
    const counselIdNum = parseInt(counselId);
    if (isNaN(counselIdNum)) {
      return { error: "Invalid counsel ID" };
    }

    const counsel = await prisma.counsel.findUnique({
      where: { counselId: counselIdNum },
    });

    if (!counsel) {
      return { error: "Counsel not found" };
    }

    return { counsel };
  } catch (error) {
    console.error("Error getting counsel:", error);
    return { error: "Failed to get counsel" };
  }
}

/**
 * Delete a consultation request (soft delete)
 */
export async function deleteCounsel(counselId: string) {
  try {
    const counselIdNum = parseInt(counselId);
    if (isNaN(counselIdNum)) {
      return { error: "Invalid counsel ID" };
    }

    const counsel = await prisma.counsel.findUnique({
      where: { counselId: counselIdNum },
    });

    if (!counsel) {
      return { error: "Counsel not found" };
    }

    await prisma.counsel.delete({
      where: { counselId: counselIdNum },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting counsel:", error);
    return { error: "Failed to delete counsel" };
  }
}

/**
 * Update a consultation request
 */
export async function updateCounsel(counselId: string, data: Partial<CounselCreateRequest>): Promise<CounselResponse> {
  try {
    // MongoDB uses numeric counselId field
    const counselIdNum = parseInt(counselId);
    
    const counsel = await prisma.counsel.update({
      where: {
        counselId: counselIdNum
      },
      data: {
        name: data.name,
        cellPhone: data.cellPhone,
        email: data.email,
        memo: data.memo || data.message,
        address: data.address,
        addressDetail: data.addressDetail,
        zipCode: data.zipCode
      }
    });
    
    return {
      counselId: counsel.counselId,
      name: counsel.name,
      cellPhone: counsel.cellPhone,
      email: counsel.email,
      memo: counsel.memo || undefined,
      address: counsel.address || undefined,
      addressDetail: counsel.addressDetail || undefined,
      zipCode: counsel.zipCode || undefined,
      appliedAt: counsel.appliedAt,
      createdAt: counsel.createdAt,
      updatedAt: counsel.updatedAt,
      isDeleted: counsel.isDeleted
    };
  } catch (error) {
    console.error(`Error updating counsel with ID ${counselId}:`, error);
    throw error;
  }
} 