// Common types

export interface BaseDto {
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
}

// Counsel types

export interface Counsel extends BaseDto {
  counselId: number;
  name: string;
  cellPhone: string;
  email: string;
  memo?: string;
  address?: string;
  addressDetail?: string;
  zipCode?: string;
  appliedAt: Date;
}

export interface CounselCreateRequest {
  name: string;
  cellPhone: string;
  email: string;
  memo?: string;
  address?: string;
  addressDetail?: string;
  zipCode?: string;
  counselDateTime?: Date;
  message?: string;
}

export interface CounselUpdateRequest {
  name?: string;
  cellPhone?: string;
  email?: string;
  memo?: string;
  address?: string;
  addressDetail?: string;
  zipCode?: string;
}

export interface CounselResponse extends Counsel {}

// Terms types

export interface Terms extends BaseDto {
  termsId: number;
  name: string;
  termsDetailUrl: string;
  content?: string;
  version?: string;
  isRequired: boolean;
}

export interface TermsCreateRequest {
  name: string;
  termsDetailUrl: string;
  content?: string;
  version?: string;
  isRequired?: boolean;
}

export interface TermsResponse extends Terms {}

// Application types

export interface Application extends BaseDto {
  applicationId: number;
  name: string;
  cellPhone: string;
  email: string;
  interestRate?: number;
  fee?: number;
  maturity?: Date;
  hopeAmount?: number;
  appliedAt: Date;
  approvalAmount?: number;
  contractedAt?: Date;
}

export interface ApplicationCreateRequest {
  name: string;
  cellPhone: string;
  email: string;
  interestRate?: number;
  fee?: number;
  maturity?: Date;
  hopeAmount?: number;
}

export interface ApplicationUpdateRequest {
  name?: string;
  cellPhone?: string;
  email?: string;
  interestRate?: number;
  fee?: number;
  maturity?: Date;
  hopeAmount?: number;
  approvalAmount?: number;
  contractedAt?: Date;
}

export interface ApplicationResponse extends Application {}

export interface AcceptTermsRequest {
  acceptTermsIds: number[];
}

export interface AcceptTerms extends BaseDto {
  acceptTermsId: number;
  applicationId: number;
  termsId: number;
}

// Judgment types

export interface Judgment extends BaseDto {
  judgmentId: number;
  applicationId: number;
  name: string;
  approvalAmount: number;
  approvalInterestRate: number;
  reason?: string;
}

export interface JudgmentCreateRequest {
  applicationId: number;
  name: string;
  approvalAmount: number;
  approvalInterestRate: number;
  reason?: string;
}

export interface JudgmentUpdateRequest {
  name?: string;
  approvalAmount?: number;
  approvalInterestRate?: number;
  reason?: string;
}

export interface JudgmentResponse extends Judgment {}

// Entry types

export interface Entry extends BaseDto {
  entryId: number;
  applicationId: number;
  entryAmount: number;
}

export interface EntryCreateRequest {
  applicationId: number;
  entryAmount: number;
}

export interface EntryUpdateRequest {
  entryAmount?: number;
}

export interface EntryResponse extends Entry {}

// Balance types

export interface Balance extends BaseDto {
  balanceId: number;
  applicationId: number;
  balance: number;
}

export interface BalanceCreateRequest {
  applicationId: number;
  balance: number;
}

export interface BalanceResponse extends Balance {}

// Repayment types

export interface Repayment extends BaseDto {
  repaymentId: number;
  applicationId: number;
  repaymentAmount: number;
}

export interface RepaymentCreateRequest {
  applicationId: number;
  repaymentAmount: number;
}

export interface RepaymentUpdateRequest {
  repaymentAmount?: number;
}

export interface RepaymentResponse extends Repayment {}

// Contract types

export interface Contract extends BaseDto {
  contractId: number;
  applicationId: number;
  judgmentId: number;
  amount: number;
  interestRate: number;
  term: number; // months
  status: 'pending' | 'signed' | 'active' | 'completed' | 'cancelled';
  signedAt?: Date;
  activatedAt?: Date;
}

export interface ContractCreateRequest {
  applicationId: number;
  judgmentId: number;
  amount: number;
  interestRate: number;
  term: number;
}

export interface ContractUpdateRequest {
  status?: 'pending' | 'signed' | 'active' | 'completed' | 'cancelled';
  signedAt?: Date;
  activatedAt?: Date;
}

export interface ContractResponse extends Contract {}

// API Response type

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// File types

export interface FileInfo {
  fileName: string;
  originalName: string;
  size: number;
  contentType: string;
  id?: number;
}

export interface FileResponse {
  name: string;
  data: Buffer;
  contentType: string;
}

export interface UserTermsAgreement extends BaseDto {
  agreementId: number;
  userId: string;
  termsId: number;
  terms?: Terms;
}

export interface UserTermsAgreementRequest {
  userId: string;
  termsIds: number[];
}

export interface UserTermsAgreementResponse extends UserTermsAgreement {}

// User types
export interface User extends BaseDto {
  userId: string;
  name: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  phone?: string;
  role: string;
  status: string;
  googleId?: string;
}

export interface UserCreateRequest {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  status?: string;
  googleId?: string;
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
}

export interface UserResponse extends User {}

// Setting types
export interface Setting extends BaseDto {
  key: string;
  value: string;
  description?: string;
  category: string;
}

export interface SettingCreateRequest {
  key: string;
  value: string;
  description?: string;
  category?: string;
}

export interface SettingUpdateRequest {
  value?: string;
  description?: string;
  category?: string;
}

export interface SettingResponse extends Setting {}

// Auth types
export interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
  };
  expires: string;
}

export interface GoogleUser {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}