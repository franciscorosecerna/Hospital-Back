const now = new Date();

export const softDeletePayload = () => ({
  isActive: false,
  deletedAt: now,
  updatedAt: now,
});

export const withTimestamp = <T extends object>(data: T): T & { updatedAt: Date } => ({
  ...data,
  updatedAt: now,
});