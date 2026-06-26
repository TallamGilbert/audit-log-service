// The shape of an incoming event (before server processing)
export interface AuditEventInput {
  actor_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  before_state?: Record<string, unknown>;
  after_state?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

// The shape of a stored event (after server processing)
export interface AuditEvent extends AuditEventInput {
  id: string;
  timestamp: string;
}

// Error shape for structured responses
export interface ApiError {
  field: string;
  message: string;
  code: string;
}

// Success response shape
export interface ApiResponse<T = unknown> {
  ok: boolean;
  event?: T | null;
  errors?: ApiError[];
}
