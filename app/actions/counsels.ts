'use server';

import { prisma } from '@/lib/prisma';
import { BadRequestException } from '@/lib/api-response';
import { Counsel, CounselCreateRequest, CounselResponse } from '@/types';

/**
 * 상담 신청을 생성합니다.
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
 * 모든 상담 신청을 조회합니다.
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
 * 특정 상담 신청을 ID로 조회합니다.
 */
export async function getCounselById(counselId: string): Promise<CounselResponse | null> {
  try {
    const id = parseInt(counselId);
    
    if (isNaN(id)) {
      throw new BadRequestException('Invalid counsel ID');
    }
    
    const counsel = await prisma.counsel.findUnique({
      where: {
        counselId: id,
        isDeleted: false
      }
    });
    
    if (!counsel) {
      return null;
    }
    
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
    console.error(`Error fetching counsel with ID ${counselId}:`, error);
    throw error;
  }
}

/**
 * 상담 신청을 삭제합니다 (소프트 삭제).
 */
export async function deleteCounsel(counselId: string): Promise<void> {
  try {
    const id = parseInt(counselId);
    
    if (isNaN(id)) {
      throw new BadRequestException('Invalid counsel ID');
    }
    
    await prisma.counsel.update({
      where: {
        counselId: id
      },
      data: {
        isDeleted: true
      }
    });
  } catch (error) {
    console.error(`Error deleting counsel with ID ${counselId}:`, error);
    throw error;
  }
}

/**
 * 상담 신청을 수정합니다.
 */
export async function updateCounsel(counselId: string, data: Partial<CounselCreateRequest>): Promise<CounselResponse> {
  try {
    const id = parseInt(counselId);
    
    if (isNaN(id)) {
      throw new BadRequestException('Invalid counsel ID');
    }
    
    // Check if counsel exists
    const existingCounsel = await prisma.counsel.findUnique({
      where: {
        counselId: id,
        isDeleted: false
      }
    });
    
    if (!existingCounsel) {
      throw new BadRequestException('Counsel not found');
    }
    
    // Update counsel
    const counsel = await prisma.counsel.update({
      where: {
        counselId: id
      },
      data
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