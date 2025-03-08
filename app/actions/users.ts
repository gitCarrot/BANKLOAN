'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { User, UserCreateRequest, UserUpdateRequest, UserResponse } from '@/types';
import { NotFoundException, BadRequestException } from '@/lib/exceptions';
import { Prisma } from '@prisma/client';

// Type assertion for Prisma client
const prismaAny = prisma as any;

/**
 * Create a user
 */
export async function createUser(data: UserCreateRequest): Promise<UserResponse> {
  try {
    // Validate required fields
    if (!data.userId || !data.name || !data.email) {
      throw new BadRequestException('User ID, name, and email are required fields');
    }

    // Check if user already exists
    const existingUser = await prismaAny.user.findFirst({
      where: {
        userId: data.userId,
        isDeleted: false,
      },
    });

    if (existingUser) {
      throw new BadRequestException('User with this ID already exists');
    }

    // Create user
    const user = await prismaAny.user.create({
      data: {
        userId: data.userId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role || 'user',
        status: data.status || 'active',
        googleId: data.googleId,
      },
    });

    revalidatePath('/admin/users');

    return {
      userId: user.userId,
      name: user.name,
      email: user.email,
      phone: user.phone || undefined,
      role: user.role,
      status: user.status,
      googleId: user.googleId || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isDeleted: user.isDeleted,
    };
  } catch (error: unknown) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Get all users
 */
export async function getUsers(): Promise<UserResponse[]> {
  try {
    const users = await prismaAny.user.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map((user: any) => ({
      userId: user.userId,
      name: user.name,
      email: user.email,
      phone: user.phone || undefined,
      role: user.role,
      status: user.status,
      googleId: user.googleId || undefined,
      emailVerified: user.emailVerified || undefined,
      image: user.image || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isDeleted: user.isDeleted,
    }));
  } catch (error: unknown) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

/**
 * Get a user by ID
 */
export async function getUserById(userId: string): Promise<UserResponse | null> {
  try {
    const user = await prismaAny.user.findFirst({
      where: {
        userId,
        isDeleted: false,
      },
    });

    if (!user) {
      return null;
    }

    return {
      userId: user.userId,
      name: user.name,
      email: user.email,
      phone: user.phone || undefined,
      role: user.role,
      status: user.status,
      googleId: user.googleId || undefined,
      emailVerified: user.emailVerified || undefined,
      image: user.image || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isDeleted: user.isDeleted,
    };
  } catch (error: unknown) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    throw error;
  }
}

/**
 * Update a user
 */
export async function updateUser(userId: string, data: UserUpdateRequest): Promise<UserResponse> {
  try {
    const user = await prismaAny.user.findFirst({
      where: {
        userId,
        isDeleted: false,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await prismaAny.user.update({
      where: {
        userId,
      },
      data: {
        name: data.name !== undefined ? data.name : user.name,
        email: data.email !== undefined ? data.email : user.email,
        phone: data.phone !== undefined ? data.phone : user.phone,
        role: data.role !== undefined ? data.role : user.role,
        status: data.status !== undefined ? data.status : user.status,
      },
    });

    revalidatePath('/admin/users');

    return {
      userId: updatedUser.userId,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone || undefined,
      role: updatedUser.role,
      status: updatedUser.status,
      googleId: updatedUser.googleId || undefined,
      emailVerified: updatedUser.emailVerified || undefined,
      image: updatedUser.image || undefined,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      isDeleted: updatedUser.isDeleted,
    };
  } catch (error: unknown) {
    console.error(`Error updating user with ID ${userId}:`, error);
    throw error;
  }
}

/**
 * Delete a user (soft delete)
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    const user = await prismaAny.user.findFirst({
      where: {
        userId,
        isDeleted: false,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await prismaAny.user.update({
      where: {
        userId,
      },
      data: {
        isDeleted: true,
      },
    });

    revalidatePath('/admin/users');
  } catch (error: unknown) {
    console.error(`Error deleting user with ID ${userId}:`, error);
    throw error;
  }
}

/**
 * Find or create a user from Google OAuth data
 */
export async function findOrCreateUserFromGoogle(
  googleId: string,
  email: string,
  name: string,
  image?: string
): Promise<UserResponse> {
  try {
    // First try to find user by googleId
    let user = await prismaAny.user.findFirst({
      where: {
        googleId,
      },
    });

    // If not found by googleId, try by email
    if (!user) {
      user = await prismaAny.user.findFirst({
        where: {
          email,
        },
      });

      // If found by email, update with googleId
      if (user) {
        user = await prismaAny.user.update({
          where: { userId: user.userId },
          data: { 
            googleId,
            image: image || user.image,
            name: name || user.name,
            emailVerified: new Date()
          },
        });
        console.log(`Updated existing user with Google ID: ${googleId}`);
      } else {
        // Create new user
        const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        user = await prismaAny.user.create({
          data: {
            userId,
            name,
            email,
            googleId,
            image,
            role: 'user',
            status: 'active',
            emailVerified: new Date()
          },
        });
        console.log(`Created new user with ID: ${userId}`);
      }
    } else {
      // Update existing user info
      user = await prismaAny.user.update({
        where: { userId: user.userId },
        data: { 
          name: name || user.name,
          image: image || user.image,
          email: email || user.email,
          emailVerified: new Date()
        },
      });
      console.log(`Updated existing user: ${user.userId}`);
    }

    return {
      userId: user.userId,
      name: user.name,
      email: user.email,
      phone: user.phone || undefined,
      role: user.role,
      status: user.status,
      googleId: user.googleId || undefined,
      emailVerified: user.emailVerified || undefined,
      image: user.image || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isDeleted: user.isDeleted,
    };
  } catch (error) {
    console.error('Error in findOrCreateUserFromGoogle:', error);
    throw error;
  }
} 