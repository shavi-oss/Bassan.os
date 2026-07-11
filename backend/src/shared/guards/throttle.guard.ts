import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request } from "express";

/**
 * Lightweight in-memory rate limiter (MVP).
 *
 * Limits repeated requests per IP + route within a sliding window.
 * NOTE: not distributed — on multi-instance deployments replace with
 * @nestjs/throttler backed by Redis.
 */
@Injectable()
export class ThrottleGuard implements CanActivate {
  private readonly hits = new Map<string, { count: number; resetAt: number }>();
  private readonly limit = 5; // max requests
  private readonly windowMs = 60_000; // per 60s

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const entry = this.hits.get(key);

    if (!entry || now > entry.resetAt) {
      this.hits.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    entry.count += 1;
    if (entry.count > this.limit) {
      throw new HttpException(
        "Too Many Requests",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
