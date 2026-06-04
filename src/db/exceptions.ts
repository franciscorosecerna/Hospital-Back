export const PG_ERROR_CODES = {
  UNIQUE_VIOLATION: "23505",
  FOREIGN_KEY_VIOLATION: "23503",
  NOT_NULL_VIOLATION: "23502",
  CHECK_VIOLATION: "23514",
  EXCLUSION_VIOLATION: "23P01",
  INVALID_TEXT_REPRESENTATION: "22P02",
  STRING_DATA_RIGHT_TRUNCATION: "22001",
} as const;

export class DatabaseException extends Error {
  constructor(
    message: string,
    public readonly pgCode: string,
    public override readonly cause?: unknown
  ) {
    super(message);

    this.name = new.target.name;

    Error.captureStackTrace?.(
      this,
      new.target
    );
  }
}

export class UniqueViolationException extends DatabaseException {
  constructor(
    public readonly table: string,
    public readonly column: string,
    cause?: unknown
  ) {
    super(
      `Duplicate value on "${table}.${column}". A record with that value already exists.`,
      PG_ERROR_CODES.UNIQUE_VIOLATION,
      cause
    );
  }
}

export class ForeignKeyViolationException extends DatabaseException {
  constructor(
    public readonly table: string,
    public readonly column: string,
    cause?: unknown
  ) {
    super(
      `Foreign key violation on "${table}.${column}". The referenced record does not exist.`,
      PG_ERROR_CODES.FOREIGN_KEY_VIOLATION,
      cause
    );
  }
}

export class NotNullViolationException extends DatabaseException {
  constructor(
    public readonly table: string,
    public readonly column: string,
    cause?: unknown
  ) {
    super(
      `Column "${table}.${column}" cannot be null.`,
      PG_ERROR_CODES.NOT_NULL_VIOLATION,
      cause
    );
  }
}

export class CheckViolationException extends DatabaseException {
  constructor(
    public readonly table: string,
    public readonly constraint: string,
    cause?: unknown
  ) {
    super(
      `Check constraint "${constraint}" violated on table "${table}".`,
      PG_ERROR_CODES.CHECK_VIOLATION,
      cause
    );
  }
}

export class InvalidInputException extends DatabaseException {
  constructor(message: string, cause?: unknown) {
    super(message, PG_ERROR_CODES.INVALID_TEXT_REPRESENTATION, cause);
  }
}

export class RecordNotFoundException extends Error {
  constructor(
    public readonly table: string,
    public readonly id: string
  ) {
    super(`No record found in "${table}" with identifier "${id}".`);
  }
}

interface PgError {
  code: string;
  table_name?: string;
  column_name?: string;
  constraint_name?: string;
}

function isPgError(err: unknown): err is PgError {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof (err as Record<string, unknown>).code === "string"
  );
}

export function parsePgError(err: unknown): Error {
  if (!isPgError(err)) return err instanceof Error ? err : new Error(String(err));

  const table = err.table_name ?? "unknown";
  const column = err.column_name ?? "unknown";
  const constraint = err.constraint_name ?? "unknown";

  switch (err.code) {
    case PG_ERROR_CODES.UNIQUE_VIOLATION:
      return new UniqueViolationException(table, column, err);

    case PG_ERROR_CODES.FOREIGN_KEY_VIOLATION:
      return new ForeignKeyViolationException(table, column, err);

    case PG_ERROR_CODES.NOT_NULL_VIOLATION:
      return new NotNullViolationException(table, column, err);

    case PG_ERROR_CODES.CHECK_VIOLATION:
      return new CheckViolationException(table, constraint, err);

    case PG_ERROR_CODES.INVALID_TEXT_REPRESENTATION:
      return new InvalidInputException(
        `Invalid input format (e.g. malformed UUID) on table "${table}".`,
        err
      );

    case PG_ERROR_CODES.STRING_DATA_RIGHT_TRUNCATION:
      return new InvalidInputException(
        `Value too long for column "${column}" on table "${table}".`,
        err
      );

    default:
      return new DatabaseException(`Database error [${err.code}]`, err.code, err);
  }
}