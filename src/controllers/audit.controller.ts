import { Request, Response } from "express";
import { auditService } from "../services/audit.service";
import { auditRepository } from "../repositories/audit.repository";

// Helper to format DB event to API response shape
function formatEvent(event: any) {
  return {
    id: event.id,
    timestamp: event.createdAt,
    actor_id: event.actorId,
    action: event.action,
    resource_type: event.resourceType,
    resource_id: event.resourceId,
    before_state: event.beforeState,
    after_state: event.afterState,
    ip_address: event.ipAddress,
    user_agent: event.userAgent,
  };
}

export class AuditController {
  /**
   * POST /events
   */
  async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const event = await auditService.recordEvent(req.body);

      res.status(201).json({
        ok: true,
        event: formatEvent(event),
      });
    } catch (error) {
      // Log the actual error for debugging
      console.error("Error creating event:", error);

      res.status(500).json({
        ok: false,
        event: null,
        errors: [
          {
            field: null,
            message: "An internal error occurred while recording the event.",
            code: "INTERNAL_ERROR",
          },
        ],
      });
    }
  }

  /**
   * GET /events/:id
   */
  async getEvent(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      console.log(`Looking for event with id: ${id}`); // Debug log

      const event = await auditRepository.findById(id);

      if (!event) {
        res.status(404).json({
          ok: false,
          event: null,
          errors: [
            {
              field: "id",
              message: `Event with id '${id}' not found.`,
              code: "NOT_FOUND",
            },
          ],
        });
        return;
      }

      res.status(200).json({
        ok: true,
        event: formatEvent(event),
      });
    } catch (error) {
      // Log the full error to see what's happening
      console.error("Error getting event:", error);

      res.status(500).json({
        ok: false,
        event: null,
        errors: [
          {
            field: null,
            message:
              error instanceof Error
                ? error.message
                : "An internal error occurred.",
            code: "INTERNAL_ERROR",
          },
        ],
      });
    }
  }
}

export const auditController = new AuditController();
