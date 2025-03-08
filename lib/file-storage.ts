import { FileInfo, FileResponse } from '@/types';
import { BadRequestException, InternalServerException } from './api-response';
import { prisma } from '@/lib/prisma';

export async function saveFile(applicationId: number, file: File): Promise<FileInfo> {
  try {
    // MongoDB에서 애플리케이션 확인
    const application = await prisma.application.findUnique({
      where: { applicationId }
    });

    if (!application) {
      throw new BadRequestException('Application not found');
    }

    // 파일 데이터 준비
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 다음 applicationFileId 생성
    const lastFile = await prisma.applicationFile.findFirst({
      orderBy: { applicationFileId: 'desc' }
    });
    const nextFileId = lastFile ? lastFile.applicationFileId + 1 : 1;
    
    // MongoDB에 파일 저장
    const savedFile = await prisma.applicationFile.create({
      data: {
        applicationFileId: nextFileId,
        applicationId: applicationId, // 숫자 ID 사용
        fileName: file.name,
        contentType: file.type,
        data: buffer,
      }
    });
    
    // 파일 정보 반환
    return {
      fileName: savedFile.fileName,
      originalName: file.name,
      size: buffer.length,
      contentType: file.type,
      id: savedFile.applicationFileId
    };
  } catch (error) {
    console.error('Error saving file:', error);
    throw new InternalServerException('Failed to save file');
  }
}

export async function loadFile(applicationId: number, fileName: string): Promise<FileResponse> {
  try {
    // MongoDB에서 애플리케이션 확인
    const application = await prisma.application.findUnique({
      where: { applicationId }
    });

    if (!application) {
      throw new BadRequestException('Application not found');
    }
    
    // MongoDB에서 파일 찾기
    const file = await prisma.applicationFile.findFirst({
      where: {
        applicationId: applicationId, // 숫자 ID 사용
        fileName
      }
    });
    
    if (!file) {
      throw new BadRequestException('File not found');
    }
    
    return {
      name: file.fileName,
      data: Buffer.from(file.data),
      contentType: file.contentType
    };
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw error;
    }
    console.error('Error loading file:', error);
    throw new InternalServerException('Failed to load file');
  }
}

export async function deleteAllFiles(applicationId: number): Promise<void> {
  try {
    // MongoDB에서 애플리케이션 확인
    const application = await prisma.application.findUnique({
      where: { applicationId }
    });

    if (!application) {
      throw new BadRequestException('Application not found');
    }
    
    // MongoDB에서 모든 파일 삭제
    await prisma.applicationFile.deleteMany({
      where: {
        applicationId: applicationId // 숫자 ID 사용
      }
    });
  } catch (error) {
    console.error('Error deleting files:', error);
    throw new InternalServerException('Failed to delete files');
  }
}

export async function loadAllFileInfo(applicationId: number): Promise<FileInfo[]> {
  try {
    // MongoDB에서 애플리케이션 확인
    const application = await prisma.application.findUnique({
      where: { applicationId }
    });

    if (!application) {
      return [];
    }
    
    // MongoDB에서 모든 파일 정보 가져오기
    const files = await prisma.applicationFile.findMany({
      where: {
        applicationId: applicationId // 숫자 ID 사용
      }
    });
    
    return files.map((file: { 
      fileName: string; 
      data: Uint8Array; 
      contentType: string; 
      applicationFileId: number 
    }) => ({
      fileName: file.fileName,
      originalName: file.fileName,
      size: file.data.length,
      contentType: file.contentType,
      id: file.applicationFileId
    }));
  } catch (error) {
    console.error('Error loading file info:', error);
    throw new InternalServerException('Failed to load file information');
  }
}