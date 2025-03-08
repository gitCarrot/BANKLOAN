'use server';

import { createApplication } from './applications';
import { ApplicationCreateRequest } from '@/types';

/**
 * Create an application using form data
 */
export async function createApplicationWithFormData(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const cellPhone = formData.get('cellPhone') as string;
    const hopeAmountStr = formData.get('hopeAmount') as string;
    
    if (!name || !email || !cellPhone) {
      return { 
        success: false, 
        error: 'Name, email, and phone number are required' 
      };
    }
    
    const hopeAmount = hopeAmountStr ? parseInt(hopeAmountStr) : undefined;
    
    const applicationData: ApplicationCreateRequest = {
      name,
      email,
      cellPhone,
      hopeAmount
    };
    
    const result = await createApplication(applicationData);
    
    return { 
      success: true, 
      data: result,
      applicationId: result.applicationId
    };
  } catch (error: any) {
    console.error('Error creating application with form data:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create application' 
    };
  }
} 