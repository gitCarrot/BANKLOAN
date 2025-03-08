'use server';

import { prisma } from '@/lib/prisma';
import { BadRequestException, NotFoundException } from '@/lib/api-response';

interface AcceptTermsResult {
  applicationId: number;
  acceptedTerms: {
    acceptTermsId: number;
    termsId: number;
  }[];
}

/**
 * Add terms acceptance to a loan application
 */
export async function acceptApplicationTerms(applicationId: string, acceptTermsIds: number[]): Promise<AcceptTermsResult> {
  try {
    const appId = parseInt(applicationId);
    
    if (!acceptTermsIds || !Array.isArray(acceptTermsIds) || acceptTermsIds.length === 0) {
      throw new BadRequestException('Terms IDs are required');
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
    
    // Check if all terms exist
    const terms = await prisma.terms.findMany({
      where: {
        termsId: {
          in: acceptTermsIds
        },
        isDeleted: false
      }
    });
    
    if (terms.length !== acceptTermsIds.length) {
      throw new BadRequestException('One or more terms do not exist');
    }
    
    // Get the next acceptTerms ID (MongoDB doesn't auto-increment)
    const lastAcceptTerms = await prisma.acceptTerms.findFirst({
      orderBy: {
        acceptTermsId: 'desc'
      }
    });
    let nextAcceptTermsId = lastAcceptTerms ? lastAcceptTerms.acceptTermsId + 1 : 1;
    
    // Create accept terms records
    const acceptTerms = await Promise.all(
      terms.map(term => {
        const acceptTermsId = nextAcceptTermsId++;
        return prisma.acceptTerms.create({
          data: {
            acceptTermsId,
            applicationId: appId, // Use numeric applicationId instead of MongoDB ObjectId
            termsId: term.termsId // Use numeric termsId instead of MongoDB ObjectId
          }
        });
      })
    );
    
    return {
      applicationId: appId,
      acceptedTerms: acceptTerms.map(term => ({
        acceptTermsId: term.acceptTermsId,
        termsId: term.termsId
      }))
    };
  } catch (error) {
    console.error(`Error accepting terms for application with ID ${applicationId}:`, error);
    throw error;
  }
} 