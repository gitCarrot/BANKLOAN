import { NextRequest, NextResponse } from 'next/server';
import { BaseException, ResultType, createApiResponse } from './api-response';

export async function errorHandler(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof BaseException) {
      return createApiResponse(error.resultType, undefined, error.message);
    }
    
    return createApiResponse(
      ResultType.INTERNAL_ERROR,
      undefined,
      error instanceof Error ? error.message : 'An unexpected error occurred'
    );
  }
}