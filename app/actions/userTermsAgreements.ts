'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { UserTermsAgreementRequest } from '@/types';
import { NotFoundException, BadRequestException } from '@/lib/exceptions';

export async function createUserTermsAgreement(data: UserTermsAgreementRequest) {
  try {
    // Validation
    if (!data.userId) {
      throw new BadRequestException('User ID is required');
    }

    if (!data.termsIds || data.termsIds.length === 0) {
      throw new BadRequestException('At least one terms ID is required');
    }

    // Find existing agreements
    const existingAgreements = await prisma.userTermsAgreement.findMany({
      where: {
        userId: data.userId,
        isDeleted: false,
      },
    });

    // Mark them as deleted
    for (const agreement of existingAgreements) {
      await prisma.userTermsAgreement.update({
        where: { id: agreement.id },
        data: { isDeleted: true },
      });
    }

    // Get next agreementId
    const lastAgreement = await prisma.userTermsAgreement.findFirst({
      orderBy: {
        agreementId: 'desc',
      },
    });
    
    const nextAgreementId = lastAgreement ? lastAgreement.agreementId + 1 : 1;

    // Create new agreements
    const agreements = [];
    for (let i = 0; i < data.termsIds.length; i++) {
      const termsId = data.termsIds[i];
      
      // Check if terms exists
      const termsResult = await prisma.terms.findFirst({
        where: {
          termsId,
          isDeleted: false,
        },
      });

      if (!termsResult) {
        throw new NotFoundException(`Terms with ID ${termsId} not found`);
      }

      // Create agreement
      const agreement = await prisma.userTermsAgreement.create({
        data: {
          agreementId: nextAgreementId + i,
          userId: data.userId,
          termsId,
        },
      });
      
      agreements.push(agreement);
    }

    revalidatePath('/terms');
    revalidatePath('/admin/terms');

    return { success: true, agreements };
  } catch (error: unknown) {
    console.error('Error creating user terms agreement:', error);
    if (error instanceof BadRequestException || error instanceof NotFoundException) {
      return { error: error.message };
    }
    return { error: 'Failed to save terms agreements. Please try again.' };
  }
}

export async function getUserTermsAgreements(userId: string) {
  try {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const agreements = await prisma.userTermsAgreement.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      include: {
        terms: true,
      },
    });

    return agreements.map((agreement) => ({
      agreementId: agreement.agreementId,
      userId: agreement.userId,
      termsId: agreement.termsId,
      createdAt: agreement.createdAt,
      updatedAt: agreement.updatedAt,
      isDeleted: agreement.isDeleted,
      terms: {
        termsId: agreement.terms.termsId,
        name: agreement.terms.name,
        termsDetailUrl: agreement.terms.termsDetailUrl,
        content: agreement.terms.content || undefined,
        version: agreement.terms.version || undefined,
        isRequired: agreement.terms.isRequired,
        createdAt: agreement.terms.createdAt,
        updatedAt: agreement.terms.updatedAt,
        isDeleted: agreement.terms.isDeleted,
      },
    }));
  } catch (error: unknown) {
    console.error('Error getting user terms agreements:', error);
    if (error instanceof BadRequestException) {
      return { error: error.message };
    }
    return { error: 'Failed to retrieve terms agreements. Please try again.' };
  }
}

export async function checkUserTermsAgreements(userId: string) {
  try {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    // Get all terms
    const allTerms = await prisma.terms.findMany({
      where: {
        isDeleted: false,
      },
    });

    // Filter required terms
    const requiredTerms = allTerms.filter(term => term.isRequired);

    // Get user agreements
    const userAgreements = await prisma.userTermsAgreement.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      select: {
        termsId: true,
      },
    });

    const agreedTermsIds = userAgreements.map((agreement) => agreement.termsId);
    
    // Check for missing required terms
    const missingRequiredTerms = requiredTerms.filter(
      (term) => !agreedTermsIds.includes(term.termsId)
    );

    return {
      hasAgreedToAllRequired: missingRequiredTerms.length === 0,
      missingRequiredTerms: missingRequiredTerms.map((term) => ({
        termsId: term.termsId,
        name: term.name,
      })),
    };
  } catch (error: unknown) {
    console.error('Error checking user terms agreements:', error);
    if (error instanceof BadRequestException) {
      return { error: error.message };
    }
    return { error: 'Failed to check terms agreements. Please try again.' };
  }
} 