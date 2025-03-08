export class BaseException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundException extends BaseException {
  constructor(message: string = 'The requested resource was not found.') {
    super(message);
  }
}

export class BadRequestException extends BaseException {
  constructor(message: string = 'Invalid request.') {
    super(message);
  }
}

export class UnauthorizedException extends BaseException {
  constructor(message: string = 'Authentication required.') {
    super(message);
  }
}

export class ForbiddenException extends BaseException {
  constructor(message: string = 'Access denied.') {
    super(message);
  }
}

export class InternalServerErrorException extends BaseException {
  constructor(message: string = 'Internal server error occurred.') {
    super(message);
  }
} 