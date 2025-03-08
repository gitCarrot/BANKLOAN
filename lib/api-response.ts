import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export enum ResultType {
  SUCCESS = 'SUCCESS',
  CREATED = 'CREATED',
  BAD_REQUEST = 'BAD_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  UNPROCESSABLE = 'UNPROCESSABLE',
}

const STATUS_CODE_MAP = {
  [ResultType.SUCCESS]: 200,
  [ResultType.CREATED]: 201,
  [ResultType.BAD_REQUEST]: 400,
  [ResultType.NOT_FOUND]: 404,
  [ResultType.INTERNAL_ERROR]: 500,
  [ResultType.UNPROCESSABLE]: 422,
};

const MESSAGE_MAP = {
  [ResultType.SUCCESS]: 'Request processed successfully',
  [ResultType.CREATED]: 'Resource created successfully',
  [ResultType.BAD_REQUEST]: 'Bad request',
  [ResultType.NOT_FOUND]: 'Resource not found',
  [ResultType.INTERNAL_ERROR]: 'Internal server error',
  [ResultType.UNPROCESSABLE]: 'Unprocessable request',
};

export function createApiResponse<T>(
  resultType: ResultType, 
  data?: T, 
  message?: string
): NextResponse<ApiResponse<T>> {
  const statusCode = STATUS_CODE_MAP[resultType];
  const isSuccess = statusCode < 400;
  
  const response: ApiResponse<T> = {
    success: isSuccess,
  };
  
  if (isSuccess && data) {
    response.data = data;
  } else if (!isSuccess) {
    response.error = {
      code: resultType,
      message: message || MESSAGE_MAP[resultType],
    };
  }
  
  return NextResponse.json(response, { status: statusCode });
}

export class BaseException extends Error {
  resultType: ResultType;
  
  constructor(resultType: ResultType, message?: string) {
    super(message || MESSAGE_MAP[resultType]);
    this.resultType = resultType;
  }
}

export class NotFoundException extends BaseException {
  constructor(message?: string) {
    super(ResultType.NOT_FOUND, message);
  }
}

export class BadRequestException extends BaseException {
  constructor(message?: string) {
    super(ResultType.BAD_REQUEST, message);
  }
}

export class InternalServerException extends BaseException {
  constructor(message?: string) {
    super(ResultType.INTERNAL_ERROR, message);
  }
}

export class UnprocessableException extends BaseException {
  constructor(message?: string) {
    super(ResultType.UNPROCESSABLE, message);
  }
}