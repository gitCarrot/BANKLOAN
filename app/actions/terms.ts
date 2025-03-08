'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { TermsCreateRequest, TermsResponse } from '@/types';
import { NotFoundException, BadRequestException } from '@/lib/exceptions';

/**
 * Create terms and conditions
 */
export async function createTerms(termsRequest: TermsCreateRequest): Promise<TermsResponse> {
  try {
    // Validation
    if (!termsRequest.name) {
      throw new BadRequestException('Name is required');
    }

    if (!termsRequest.termsDetailUrl) {
      throw new BadRequestException('Terms detail URL is required');
    }

    // Get the next terms ID
    const lastTerms = await prisma.terms.findFirst({
      orderBy: {
        termsId: 'desc',
      },
    });

    const nextTermsId = lastTerms ? lastTerms.termsId + 1 : 1;

    // Create terms with all fields
    const terms = await prisma.terms.create({
      data: {
        termsId: nextTermsId,
        name: termsRequest.name,
        termsDetailUrl: termsRequest.termsDetailUrl,
        content: termsRequest.content,
        version: termsRequest.version,
        isRequired: termsRequest.isRequired !== undefined ? termsRequest.isRequired : true
      }
    });

    // Map the returned data to the expected response format
    return {
      termsId: terms.termsId,
      name: terms.name,
      termsDetailUrl: terms.termsDetailUrl,
      content: terms.content || undefined,
      version: terms.version || undefined,
      isRequired: terms.isRequired,
      createdAt: terms.createdAt,
      updatedAt: terms.updatedAt,
      isDeleted: terms.isDeleted
    };
  } catch (error) {
    console.error('Error creating terms:', error);
    
    if (error instanceof BadRequestException) {
      throw error;
    }
    
    throw new Error('Failed to create terms: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Get all terms and conditions
 */
export async function getTerms(): Promise<TermsResponse[]> {
  try {
    const terms = await prisma.terms.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        termsId: 'asc',
      },
    });

    // Map each terms object to the expected response format
    return terms.map(term => ({
      termsId: term.termsId,
      name: term.name,
      termsDetailUrl: term.termsDetailUrl,
      content: term.content || undefined,
      version: term.version || undefined,
      isRequired: term.isRequired,
      createdAt: term.createdAt,
      updatedAt: term.updatedAt,
      isDeleted: term.isDeleted
    }));
  } catch (error) {
    console.error('Error getting terms:', error);
    throw new Error('Failed to get terms: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Get terms and conditions by ID
 */
export async function getTermsById(termsId: string) {
  try {
    const id = parseInt(termsId);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid terms ID');
    }

    const terms = await prisma.terms.findFirst({
      where: {
        termsId: id,
        isDeleted: false,
      },
    });

    if (!terms) {
      throw new NotFoundException(`Terms with ID ${id} not found`);
    }

    // Map the returned data to the expected response format
    return {
      terms: {
        termsId: terms.termsId,
        name: terms.name,
        termsDetailUrl: terms.termsDetailUrl,
        content: terms.content || undefined,
        version: terms.version || undefined,
        isRequired: terms.isRequired,
        createdAt: terms.createdAt,
        updatedAt: terms.updatedAt,
        isDeleted: terms.isDeleted
      } 
    };
  } catch (error) {
    console.error('Error getting terms by id:', error);
    if (error instanceof BadRequestException || error instanceof NotFoundException) {
      throw error;
    }
    throw new Error('Failed to get terms: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Update terms and conditions
 */
export async function updateTerms(termsId: string, data: Partial<TermsCreateRequest>): Promise<TermsResponse> {
  try {
    const id = parseInt(termsId);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid terms ID');
    }

    // Create update data object with all fields
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.termsDetailUrl) updateData.termsDetailUrl = data.termsDetailUrl;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.version !== undefined) updateData.version = data.version;
    if (data.isRequired !== undefined) updateData.isRequired = data.isRequired;

    const terms = await prisma.terms.update({
      where: {
        termsId: id,
      },
      data: updateData,
    });

    // Map the returned data to the expected response format
    return {
      termsId: terms.termsId,
      name: terms.name,
      termsDetailUrl: terms.termsDetailUrl,
      content: terms.content || undefined,
      version: terms.version || undefined,
      isRequired: terms.isRequired,
      createdAt: terms.createdAt,
      updatedAt: terms.updatedAt,
      isDeleted: terms.isDeleted
    };
  } catch (error) {
    console.error('Error updating terms:', error);
    if (error instanceof BadRequestException) {
      throw error;
    }
    throw new Error('Failed to update terms: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Delete terms and conditions (soft delete)
 */
export async function deleteTerms(termsId: string) {
  try {
    const id = parseInt(termsId);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid terms ID');
    }

    const terms = await prisma.terms.update({
      where: {
        termsId: id,
      },
      data: {
        isDeleted: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting terms:', error);
    if (error instanceof BadRequestException) {
      return { error: (error as Error).message };
    }
    return { error: 'Failed to delete terms: ' + (error instanceof Error ? error.message : 'Unknown error') };
  }
} 