import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export function sendSuccess<T>(
  reply: FastifyReply,
  data: T,
  statusCode = 200,
  meta?: ApiResponse["meta"]
): void {
  reply.status(statusCode).send({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  } satisfies ApiResponse<T>);
}

export function sendError(
  reply: FastifyReply,
  message: string,
  statusCode = 400,
  error?: string
): void {
  reply.status(statusCode).send({
    success: false,
    message,
    error: error ?? message,
  } satisfies ApiResponse);
}

export function sendPaginated<T>(
  reply: FastifyReply,
  data: T[],
  total: number,
  page: number,
  limit: number
): void {
  reply.status(200).send({
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  } satisfies ApiResponse<T[]>);
}

export function globalErrorHandler(
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply
): void {
  const statusCode = error.statusCode ?? 500;

  if (statusCode >= 500) {
    console.error("[SERVER ERROR]", error);
  }

  reply.status(statusCode).send({
    success: false,
    message:
      statusCode >= 500
        ? "An internal server error occurred"
        : error.message,
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  } satisfies ApiResponse);
}