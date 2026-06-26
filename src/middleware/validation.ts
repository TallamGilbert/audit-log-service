import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../types/event";

// Define the event schema with Zod
export const eventSchema = z.object({
  actor_id: z
    .string({
      required_error: "actor_id is required.",
      invalid_type_error: "actor_id must be a string.",
    })
    .min(1, "actor_id is required."),

  action: z
    .string({
      required_error: "action is required.",
      invalid_type_error: "action must be a string.",
    })
    .min(1, "action is required."),

  resource_type: z
    .string({
      required_error: "resource_type is required.",
      invalid_type_error: "resource_type must be a string.",
    })
    .min(1, "resource_type is required."),

  resource_id: z
    .string({
      required_error: "resource_id is required.",
      invalid_type_error: "resource_id must be a string.",
    })
    .min(1, "resource_id is required."),

  before_state: z.record(z.unknown()).optional(),
  after_state: z.record(z.unknown()).optional(),
  ip_address: z
    .string()
    .ip("ip_address must be a valid IP address.")
    .optional(),
  user_agent: z.string().optional(),
});

// Transform Zod errors into our API error format
function formatZodErrors(error: z.ZodError): ApiError[] {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
    code: getErrorCode(issue.message),
  }));
}

// Map error messages to machine-readable codes
function getErrorCode(message: string): string {
  if (message.includes("required")) return "MISSING_FIELD";
  if (message.includes("must be a string")) return "INVALID_TYPE";
  if (message.includes("IP address")) return "INVALID_FORMAT";
  return "VALIDATION_ERROR";
}

// Middleware factory for validation
export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = formatZodErrors(result.error);

      return res.status(400).json({
        ok: false,
        event: null,
        errors,
      });
    }

    // Replace request body with validated and typed data
    req.body = result.data;
    next();
  };
}
