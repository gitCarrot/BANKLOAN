'use server';

import { prisma } from '@/lib/prisma';
import { BadRequestException, NotFoundException, UnprocessableException } from '@/lib/api-response';
import { Contract, ContractCreateRequest, ContractResponse, ContractUpdateRequest } from '@/types';
import { createBalance } from './balances';

/**
 * Create a loan contract
 */
export async function createContract(contractRequest: ContractCreateRequest): Promise<ContractResponse> {
  try {
    // Validate required fields
    const { applicationId, judgmentId, amount, interestRate, term } = contractRequest;
    
    if (!applicationId || !judgmentId || amount === undefined || interestRate === undefined || term === undefined) {
      throw new BadRequestException('ApplicationId, judgmentId, amount, interestRate, and term are required');
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
    
    // Check if judgment exists
    const judgment = await prisma.judgment.findFirst({
      where: {
        judgmentId,
        isDeleted: false
      }
    });
    
    if (!judgment) {
      throw new NotFoundException('Judgment not found');
    }
    
    // Check if contract already exists for this application
    const existingContract = await (prisma as any).contract.findFirst({
      where: {
        applicationId,
        isDeleted: false
      }
    });
    
    if (existingContract) {
      throw new BadRequestException('Contract already exists for this application');
    }
    
    // Get the next contract ID (MongoDB doesn't auto-increment)
    const lastContract = await (prisma as any).contract.findFirst({
      orderBy: {
        contractId: 'desc'
      }
    });
    const nextContractId = lastContract ? lastContract.contractId + 1 : 1;
    
    // Create contract
    const contract = await (prisma as any).contract.create({
      data: {
        contractId: nextContractId,
        applicationId,
        judgmentId,
        amount,
        interestRate,
        term,
        status: 'pending'
      }
    });
    
    return {
      contractId: contract.contractId,
      applicationId,
      judgmentId,
      amount: contract.amount,
      interestRate: contract.interestRate,
      term: contract.term,
      status: contract.status as 'pending' | 'signed' | 'active' | 'completed' | 'cancelled',
      signedAt: contract.signedAt || undefined,
      activatedAt: contract.activatedAt || undefined,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
      isDeleted: contract.isDeleted
    };
  } catch (error) {
    console.error('Error creating contract:', error);
    throw error;
  }
}

/**
 * Get all loan contracts
 */
export async function getContracts(): Promise<ContractResponse[]> {
  try {
    const contracts = await (prisma as any).contract.findMany({
      where: {
        isDeleted: false
      },
      include: {
        application: true,
        judgment: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return contracts.map((contract: any) => ({
      contractId: contract.contractId,
      applicationId: contract.applicationId,
      judgmentId: contract.judgmentId,
      amount: contract.amount,
      interestRate: contract.interestRate,
      term: contract.term,
      status: contract.status as 'pending' | 'signed' | 'active' | 'completed' | 'cancelled',
      signedAt: contract.signedAt || undefined,
      activatedAt: contract.activatedAt || undefined,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
      isDeleted: contract.isDeleted
    }));
  } catch (error) {
    console.error('Error fetching contracts:', error);
    throw error;
  }
}

/**
 * Get a loan contract by ID
 */
export async function getContractById(contractId: string): Promise<ContractResponse | null> {
  try {
    // MongoDB uses numeric contractId field
    const contractIdNum = parseInt(contractId);
    
    const contract = await (prisma as any).contract.findFirst({
      where: {
        contractId: contractIdNum,
        isDeleted: false
      },
      include: {
        application: true,
        judgment: true
      }
    });
    
    if (!contract) {
      return null;
    }
    
    return {
      contractId: contract.contractId,
      applicationId: contract.applicationId,
      judgmentId: contract.judgmentId,
      amount: contract.amount,
      interestRate: contract.interestRate,
      term: contract.term,
      status: contract.status as 'pending' | 'signed' | 'active' | 'completed' | 'cancelled',
      signedAt: contract.signedAt || undefined,
      activatedAt: contract.activatedAt || undefined,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
      isDeleted: contract.isDeleted
    };
  } catch (error) {
    console.error(`Error fetching contract with ID ${contractId}:`, error);
    throw error;
  }
}

/**
 * Get a loan contract by application ID
 */
export async function getContractByApplicationId(applicationId: number): Promise<ContractResponse | null> {
  try {
    const contract = await (prisma as any).contract.findFirst({
      where: {
        applicationId,
        isDeleted: false
      },
      include: {
        application: true,
        judgment: true
      }
    });
    
    if (!contract) {
      return null;
    }
    
    return {
      contractId: contract.contractId,
      applicationId: contract.applicationId,
      judgmentId: contract.judgmentId,
      amount: contract.amount,
      interestRate: contract.interestRate,
      term: contract.term,
      status: contract.status as 'pending' | 'signed' | 'active' | 'completed' | 'cancelled',
      signedAt: contract.signedAt || undefined,
      activatedAt: contract.activatedAt || undefined,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
      isDeleted: contract.isDeleted
    };
  } catch (error) {
    console.error(`Error fetching contract for application ID ${applicationId}:`, error);
    throw error;
  }
}

/**
 * Update a loan contract
 */
export async function updateContract(contractId: string, data: ContractUpdateRequest): Promise<ContractResponse> {
  try {
    // MongoDB uses numeric contractId field
    const contractIdNum = parseInt(contractId);
    
    const contract = await (prisma as any).contract.update({
      where: {
        contractId: contractIdNum
      },
      data: {
        status: data.status,
        signedAt: data.signedAt,
        activatedAt: data.activatedAt
      },
      include: {
        application: true,
        judgment: true
      }
    });
    
    // If contract is activated, update the application's contractedAt field
    if (data.status === 'active' && data.activatedAt) {
      // Update application's contractedAt field
      await prisma.application.update({
        where: {
          applicationId: contract.applicationId
        },
        data: {
          contractedAt: data.activatedAt
        }
      });
      
      // Create initial balance record for the application
      try {
        // Check if balance already exists
        const existingBalance = await prisma.balance.findFirst({
          where: {
            applicationId: contract.applicationId,
            isDeleted: false
          }
        });
        
        // Only create balance if it doesn't exist
        if (!existingBalance) {
          await createBalance(contract.applicationId.toString(), contract.amount);
          console.log(`Created initial balance of ${contract.amount} for application ${contract.applicationId}`);
        }
      } catch (error) {
        console.error(`Error creating initial balance for application ${contract.applicationId}:`, error);
        // Don't throw error here to avoid failing the contract activation
      }
    }
    
    return {
      contractId: contract.contractId,
      applicationId: contract.applicationId,
      judgmentId: contract.judgmentId,
      amount: contract.amount,
      interestRate: contract.interestRate,
      term: contract.term,
      status: contract.status as 'pending' | 'signed' | 'active' | 'completed' | 'cancelled',
      signedAt: contract.signedAt || undefined,
      activatedAt: contract.activatedAt || undefined,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
      isDeleted: contract.isDeleted
    };
  } catch (error) {
    console.error(`Error updating contract with ID ${contractId}:`, error);
    throw error;
  }
}

/**
 * Delete a loan contract (soft delete)
 */
export async function deleteContract(contractId: string): Promise<void> {
  try {
    // MongoDB uses numeric contractId field
    const contractIdNum = parseInt(contractId);
    
    await (prisma as any).contract.update({
      where: {
        contractId: contractIdNum
      },
      data: {
        isDeleted: true
      }
    });
  } catch (error) {
    console.error(`Error deleting contract with ID ${contractId}:`, error);
    throw error;
  }
} 