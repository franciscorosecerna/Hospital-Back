import { getAuditLogById, type AuditLogFilters, type AuditLog, getAuditLogs, createAuditLog, type NewAuditLog} from "./auditLogRepository"

export async function getById(id: string): Promise<AuditLog> {
    return getAuditLogById(id);
}

export async function getAll(
    filters: AuditLogFilters = {},
    limit: number = 50,
    page: number = 0
): Promise<AuditLog[]> {
    const offset = (page - 1) * limit;
    return getAuditLogs(filters, limit, offset);
}

export async function create(data: NewAuditLog): Promise<AuditLog> {
    return createAuditLog(data);
}