'use server';

import { prisma } from '@/lib/prisma';
import { BadRequestException, NotFoundException } from '@/lib/api-response';
import { saveFile } from '@/lib/file-storage';
import { FileInfo } from '@/types';

/**
 * Upload a file for a loan application
 */
export async function uploadApplicationFile(applicationId: string, file: File): Promise<FileInfo> {
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
    
    // Process file upload
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    
    const fileInfo = await saveFile(appId, file);
    return fileInfo;
  } catch (error) {
    console.error(`Error uploading file for application with ID ${applicationId}:`, error);
    throw error;
  }
}

/**
 * Download a file for a loan application
 */
export async function downloadApplicationFile(fileId: string) {
  try {
    const fileIdNum = parseInt(fileId);
    if (isNaN(fileIdNum)) {
      return { error: "Invalid file ID" };
    }

    const file = await prisma.applicationFile.findUnique({
      where: { applicationFileId: fileIdNum },
    });

    if (!file) {
      return { error: "File not found" };
    }

    // MongoDB stores binary data as Buffer
    // Create a Blob from the Buffer for client-side handling
    const blob = new Blob([file.data as Buffer], { type: file.contentType });

    return {
      success: true,
      file: {
        id: file.applicationFileId,
        name: file.fileName,
        contentType: file.contentType,
        data: blob,
      },
    };
  } catch (error) {
    console.error("Error downloading file:", error);
    return { error: "Failed to download file" };
  }
}

/**
 * Delete all files for a loan application
 */
export async function deleteApplicationFiles(applicationId: string) {
  try {
    const appId = parseInt(applicationId);
    if (isNaN(appId)) {
      return { error: "Invalid application ID", deleted: false };
    }

    // Check if application exists
    const application = await prisma.application.findFirst({
      where: {
        applicationId: appId,
        isDeleted: false
      }
    });
    
    if (!application) {
      return { error: "Application not found", deleted: false };
    }
    
    // Delete all files for this application
    await prisma.applicationFile.deleteMany({
      where: {
        applicationId: appId // 숫자 ID 사용
      }
    });
    
    return { 
      success: true, 
      deleted: true,
      message: "All files deleted successfully" 
    };
  } catch (error) {
    console.error(`Error deleting files for application with ID ${applicationId}:`, error);
    return { 
      error: "Failed to delete files", 
      deleted: false 
    };
  }
} 