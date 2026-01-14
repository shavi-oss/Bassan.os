import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response } from "express";

/**
 * Global HTTP Exception Filter
 *
 * Ensures ALL errors follow the standard format defined in ERROR_FORMAT.md
 *
 * @security Logs all errors for security audit
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let error = "Internal Server Error";
    let code: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "object") {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || "Error";
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;

      // Extract error code from message if present
      if (message.includes(":")) {
        const parts = message.split(":");
        code = parts[0].trim();
      }
    }

    const errorResponse = {
      statusCode: status,
      error,
      message,
      ...(code && { code }),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Security: Log all errors
    this.logger.error(
      `[ERROR] ${status} ${request.method} ${request.url}: ${message}`,
    );

    response.status(status).json(errorResponse);
  }
}
