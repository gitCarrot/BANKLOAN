'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Setting, SettingCreateRequest, SettingUpdateRequest, SettingResponse } from '@/types';
import { NotFoundException, BadRequestException } from '@/lib/exceptions';
import { Prisma } from '@prisma/client';

// Type assertion for Prisma client
const prismaAny = prisma as any;

/**
 * Create a new system setting
 */
export async function createSetting(data: SettingCreateRequest): Promise<SettingResponse> {
  try {
    // Validate required fields
    if (!data.key || !data.value) {
      throw new BadRequestException('Key and value are required fields');
    }

    // Check if setting already exists
    const existingSetting = await prismaAny.setting.findFirst({
      where: {
        key: data.key,
        isDeleted: false,
      },
    });

    if (existingSetting) {
      throw new BadRequestException('Setting with this key already exists');
    }

    // Create setting
    const setting = await prismaAny.setting.create({
      data: {
        key: data.key,
        value: data.value,
        description: data.description,
        category: data.category || 'general',
      },
    });

    revalidatePath('/admin/settings');

    return {
      key: setting.key,
      value: setting.value,
      description: setting.description || undefined,
      category: setting.category,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
      isDeleted: setting.isDeleted,
    };
  } catch (error: unknown) {
    console.error('Error creating setting:', error);
    throw error;
  }
}

/**
 * Get all system settings
 */
export async function getSettings(): Promise<SettingResponse[]> {
  try {
    const settings = await prismaAny.setting.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        category: 'asc',
      },
    });

    return settings.map((setting: any) => ({
      key: setting.key,
      value: setting.value,
      description: setting.description || undefined,
      category: setting.category,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
      isDeleted: setting.isDeleted,
    }));
  } catch (error: unknown) {
    console.error('Error fetching settings:', error);
    throw error;
  }
}

/**
 * Get settings by category
 */
export async function getSettingsByCategory(category: string): Promise<SettingResponse[]> {
  try {
    const settings = await prismaAny.setting.findMany({
      where: {
        category,
        isDeleted: false,
      },
      orderBy: {
        key: 'asc',
      },
    });

    return settings.map((setting: any) => ({
      key: setting.key,
      value: setting.value,
      description: setting.description || undefined,
      category: setting.category,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
      isDeleted: setting.isDeleted,
    }));
  } catch (error: unknown) {
    console.error(`Error fetching settings for category ${category}:`, error);
    throw error;
  }
}

/**
 * Get a setting by key
 */
export async function getSettingByKey(key: string): Promise<SettingResponse | null> {
  try {
    const setting = await prismaAny.setting.findFirst({
      where: {
        key,
        isDeleted: false,
      },
    });

    if (!setting) {
      return null;
    }

    return {
      key: setting.key,
      value: setting.value,
      description: setting.description || undefined,
      category: setting.category,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
      isDeleted: setting.isDeleted,
    };
  } catch (error: unknown) {
    console.error(`Error fetching setting with key ${key}:`, error);
    throw error;
  }
}

/**
 * Update a setting
 */
export async function updateSetting(key: string, data: SettingUpdateRequest): Promise<SettingResponse> {
  try {
    const setting = await prismaAny.setting.findFirst({
      where: {
        key,
        isDeleted: false,
      },
    });

    if (!setting) {
      throw new NotFoundException('Setting not found');
    }

    const updatedSetting = await prismaAny.setting.update({
      where: {
        key,
      },
      data: {
        value: data.value !== undefined ? data.value : setting.value,
        description: data.description !== undefined ? data.description : setting.description,
        category: data.category !== undefined ? data.category : setting.category,
      },
    });

    revalidatePath('/admin/settings');

    return {
      key: updatedSetting.key,
      value: updatedSetting.value,
      description: updatedSetting.description || undefined,
      category: updatedSetting.category,
      createdAt: updatedSetting.createdAt,
      updatedAt: updatedSetting.updatedAt,
      isDeleted: updatedSetting.isDeleted,
    };
  } catch (error: unknown) {
    console.error(`Error updating setting with key ${key}:`, error);
    throw error;
  }
}

/**
 * Delete a setting (soft delete)
 */
export async function deleteSetting(key: string): Promise<void> {
  try {
    const setting = await prismaAny.setting.findFirst({
      where: {
        key,
        isDeleted: false,
      },
    });

    if (!setting) {
      throw new NotFoundException('Setting not found');
    }

    await prismaAny.setting.update({
      where: {
        key,
      },
      data: {
        isDeleted: true,
      },
    });

    revalidatePath('/admin/settings');
  } catch (error: unknown) {
    console.error(`Error deleting setting with key ${key}:`, error);
    throw error;
  }
} 