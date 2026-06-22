import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import {
  RecordNotFoundException,
  DatabaseException,
  UniqueViolationException,
  ForeignKeyViolationException,
  NotNullViolationException,
  CheckViolationException,
  InvalidInputException,
  InvalidCredentialsException,
  ForbiddenException
} from "../utils/exceptions";

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

function buildErrorResponse(
  code: string,
  message: string,
  details?: unknown
): ErrorResponse {
  return { error: { code, message, ...(details ? { details } : {}) } };
}

export async function errorMiddleware(c: Context, next: Next): Promise<void> {
  try {
    await next();
  } catch (err) {

    if (err instanceof InvalidCredentialsException) {
      c.res = c.json(
        buildErrorResponse("INVALID_CREDENTIALS", err.message),
        401 as never
      );
      return;
    }

    if (err instanceof ForbiddenException) {
      c.res = c.json(
        buildErrorResponse("FORBIDDEN", err.message),
        403 as never
      );
      return;
    }

    if (err instanceof RecordNotFoundException) {
      c.res = c.json(
        buildErrorResponse("NOT_FOUND", err.message),
        404 as never
      );
      return;
    }

    if (err instanceof UniqueViolationException) {
      c.res = c.json(
        buildErrorResponse("DUPLICATE_RECORD", err.message),
        409 as never
      );
      return;
    }

    if (err instanceof ForeignKeyViolationException) {
      c.res = c.json(
        buildErrorResponse("FOREIGN_KEY_VIOLATION", err.message),
        400 as never
      );
      return;
    }

    if (err instanceof NotNullViolationException) {
      c.res = c.json(
        buildErrorResponse("NULL_VIOLATION", err.message),
        400 as never
      );
      return;
    }

    if (err instanceof CheckViolationException) {
      c.res = c.json(
        buildErrorResponse("CHECK_VIOLATION", err.message),
        400 as never
      );
      return;
    }

    if (err instanceof InvalidInputException) {
      c.res = c.json(
        buildErrorResponse("INVALID_INPUT", err.message),
        400 as never
      );
      return;
    }

    if (err instanceof DatabaseException) {
      console.error("[DatabaseException]", err);
      c.res = c.json(
        buildErrorResponse("DATABASE_ERROR", "Error interno de base de datos."),
        500 as never
      );
      return;
    }

    if (err instanceof HTTPException) {
      c.res = c.json(
        buildErrorResponse("HTTP_ERROR", err.message),
        err.status as never
      );
      return;
    }

    if (err instanceof ZodError) {
      c.res = c.json(
        buildErrorResponse(
          "VALIDATION_ERROR",
          "Error de validación.",
          err.flatten().fieldErrors
        ),
        422 as never
      );
      return;
    }

    console.error("[Unhandled Error]", err);

    const isDev = process.env.Environment === "development";

    c.res = c.json(
      buildErrorResponse(
        "INTERNAL_SERVER_ERROR",
        "Error interno del servidor.",
        isDev && err instanceof Error ? err.stack : undefined
      ),
      500 as never
    );
  }
}