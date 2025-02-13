export const UNKNOWN_ERROR = "unknown.error";
export const INVALID_DATA = "invalid.data";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly context?: Record<string, unknown>;

  constructor(
    code?: string,
    statusCode?: number,
    context?: Record<string, unknown>
  ) {
    super(code ?? UNKNOWN_ERROR);

    this.statusCode = statusCode ?? 500;

    if (context) {
      this.context = context;
    }
  }

  get code() {
    return this.message;
  }
}

const makeErrorHelper =
  (statusCode: number) => (code: string, metadata?: Record<string, unknown>) =>
    new AppError(code, statusCode, metadata);

export const badRequest = makeErrorHelper(400);
export const unauthorized = makeErrorHelper(401);
export const forbidden = makeErrorHelper(403);
export const notFound = makeErrorHelper(404);
export const conflict = makeErrorHelper(409);
export const unprocessableContent = makeErrorHelper(422);
export const tooManyRequests = makeErrorHelper(429);
export const serverError = makeErrorHelper(500);
export const serviceUnavailable = makeErrorHelper(503);

export const extractErrorCode = (error: unknown) => {
  if (error instanceof AppError) {
    return error.code;
  }
  return UNKNOWN_ERROR;
};

export const extractErrorStatus = (error: unknown) => {
  if (error instanceof AppError) {
    return error.statusCode;
  }
  return 500;
};
