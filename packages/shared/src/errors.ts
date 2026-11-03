// Stable error codes over the wire. Client maps these to copy; never show raw text.
export const ErrorCode = {
  AGE_LEVEL_REQUIRED: 'AGE_LEVEL_REQUIRED',
  GATE_DISABLED: 'GATE_DISABLED',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  VIDEO_LIMIT_REACHED: 'VIDEO_LIMIT_REACHED',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  NOT_ENTITLED: 'NOT_ENTITLED',
  CONFLICT: 'CONFLICT',
  INTERNAL: 'INTERNAL',
} as const;
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export type ApiError = {
  code: ErrorCode;
  message: string;
  details?: unknown;
};

export function isApiError(x: unknown): x is ApiError {
  return !!x && typeof x === 'object' && 'code' in x && 'message' in x;
}
