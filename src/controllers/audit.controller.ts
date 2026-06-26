import { Request, Response } from "express";
import { auditService } from "../services/audit.service";
import { auditRepository } from "../repositories/audit.repository";
import { eventSchema } from "../middleware/validation";
import { z } from "zod";

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
   * POST /events/bulk
   * Record multiple events atomically
   */
  async createBulkEvents(req: Request, res: Response): Promise<void> {
    try {
      const { events } = req.body;

      // Validate each event individually to provide position-specific errors
      for (let i = 0; i < events.length; i++) {
        const result = eventSchema.safeParse(events[i]);

        if (!result.success) {
          const errors = result.error.issues.map((issue) => ({
            field: `events[${i}].${issue.path.join(".")}`,
            message: issue.message,
            code: "VALIDATION_ERROR",
          }));

          res.status(400).json({
            ok: false,
            errors,
          });
          return;
        }
      }

      const createdEvents = await auditService.recordBulk(events);

      res.status(201).json({
        ok: true,
        events: createdEvents.map(formatEvent),
        count: createdEvents.length,
      });
    } catch (error) {
      console.error("Error creating bulk events:", error);

      res.status(500).json({
        ok: false,
        errors: [
          {
            field: null,
            message: "An internal error occurred while recording events.",
            code: "INTERNAL_ERROR",
          },
        ],
      });
    }
  }

  /**
   * GET /events
   */
  async queryEvents(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        actorId: req.query.actor_id as string | undefined,
        action: req.query.action as string | undefined,
        resourceType: req.query.resource_type as string | undefined,
        resourceId: req.query.resource_id as string | undefined,
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        offset: req.query.offset
          ? parseInt(req.query.offset as string)
          : undefined,
      };

      if (req.query.limit && (isNaN(filters.limit!) || filters.limit! < 1)) {
        res.status(400).json({
          ok: false,
          errors: [
            {
              field: "limit",
              message: "limit must be a positive integer.",
              code: "INVALID_PARAMETER",
            },
          ],
        });
        return;
      }

      if (req.query.offset && (isNaN(filters.offset!) || filters.offset! < 0)) {
        res.status(400).json({
          ok: false,
          errors: [
            {
              field: "offset",
              message: "offset must be a non-negative integer.",
              code: "INVALID_PARAMETER",
            },
          ],
        });
        return;
      }

      const result = await auditRepository.findAll(filters);

      res.status(200).json({
        ok: true,
        events: result.events.map(formatEvent),
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          has_more: result.offset + result.limit < result.total,
        },
      });
    } catch (error) {
      console.error("Error querying events:", error);

      res.status(500).json({
        ok: false,
        events: [],
        errors: [
          {
            field: null,
            message: "An internal error occurred while querying events.",
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

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (!uuidRegex.test(id)) {
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
      console.error("Error getting event:", error);

      res.status(500).json({
        ok: false,
        event: null,
        errors: [
          {
            field: null,
            message: "An internal error occurred.",
            code: "INTERNAL_ERROR",
          },
        ],
      });
    }
  }
}

export const auditController = new AuditController();
