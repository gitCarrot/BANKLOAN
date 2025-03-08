'use server';

import { prisma } from '@/lib/prisma';
import { BadRequestException, NotFoundException } from '@/lib/api-response';
import { Balance, BalanceResponse } from '@/types';

/**
 * Get the loan balance
 */
export async function getBalance(applicationId: string): Promise<BalanceResponse | null> {
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
    
    const balance = await prisma.balance.findFirst({
      where: {
        applicationId: appId, // Use numeric applicationId instead of MongoDB ObjectId
        isDeleted: false
      }
    });
    
    if (!balance) {
      return null;
    }
    
    return {
      balanceId: balance.balanceId,
      applicationId: appId,
      balance: balance.balance,
      createdAt: balance.createdAt,
      updatedAt: balance.updatedAt,
      isDeleted: balance.isDeleted
    };
  } catch (error) {
    console.error(`Error fetching balance for application with ID ${applicationId}:`, error);
    throw error;
  }
}

/**
 * Create a loan balance
 */
export async function createBalance(applicationId: string, balance: number): Promise<BalanceResponse> {
  try {
    const appId = parseInt(applicationId);
    
    if (balance < 0) {
      throw new BadRequestException('Balance cannot be negative');
    }
    
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
    
    // Check if balance already exists
    const existingBalance = await prisma.balance.findFirst({
      where: {
        applicationId: appId, // Use numeric applicationId instead of MongoDB ObjectId
        isDeleted: false
      }
    });
    
    if (existingBalance) {
      throw new BadRequestException('Balance already exists for this application');
    }
    
    // Get the next balance ID (MongoDB doesn't auto-increment)
    const lastBalance = await prisma.balance.findFirst({
      orderBy: {
        balanceId: 'desc'
      }
    });
    const nextBalanceId = lastBalance ? lastBalance.balanceId + 1 : 1;
    
    // Create balance
    const newBalance = await prisma.balance.create({
      data: {
        balanceId: nextBalanceId,
        applicationId: appId, // Use numeric applicationId instead of MongoDB ObjectId
        balance
      }
    });
    
    return {
      balanceId: newBalance.balanceId,
      applicationId: appId,
      balance: newBalance.balance,
      createdAt: newBalance.createdAt,
      updatedAt: newBalance.updatedAt,
      isDeleted: newBalance.isDeleted
    };
  } catch (error) {
    console.error(`Error creating balance for application with ID ${applicationId}:`, error);
    throw error;
  }
}

/**
 * Update a loan balance
 */
export async function updateBalance(applicationId: string, newBalance: number): Promise<BalanceResponse> {
  try {
    const appId = parseInt(applicationId);
    
    if (newBalance < 0) {
      throw new BadRequestException('Balance cannot be negative');
    }
    
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
    
    // Check if balance exists
    const existingBalance = await prisma.balance.findFirst({
      where: {
        applicationId: appId, // Use numeric applicationId instead of MongoDB ObjectId
        isDeleted: false
      }
    });
    
    if (!existingBalance) {
      throw new NotFoundException('Balance not found for this application');
    }
    
    // Update balance
    const updatedBalance = await prisma.balance.update({
      where: {
        balanceId: existingBalance.balanceId
      },
      data: {
        balance: newBalance
      }
    });
    
    return {
      balanceId: updatedBalance.balanceId,
      applicationId: appId,
      balance: updatedBalance.balance,
      createdAt: updatedBalance.createdAt,
      updatedAt: updatedBalance.updatedAt,
      isDeleted: updatedBalance.isDeleted
    };
  } catch (error) {
    console.error(`Error updating balance for application with ID ${applicationId}:`, error);
    throw error;
  }
}

/**
 * Delete a loan balance (soft delete)
 */
export async function deleteBalance(applicationId: string): Promise<void> {
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
    
    // Check if balance exists
    const existingBalance = await prisma.balance.findFirst({
      where: {
        applicationId: appId, // Use numeric applicationId instead of MongoDB ObjectId
        isDeleted: false
      }
    });
    
    if (!existingBalance) {
      throw new NotFoundException('Balance not found for this application');
    }
    
    // Soft delete balance
    await prisma.balance.update({
      where: {
        balanceId: existingBalance.balanceId
      },
      data: {
        isDeleted: true
      }
    });
  } catch (error) {
    console.error(`Error deleting balance for application with ID ${applicationId}:`, error);
    throw error;
  }
} 