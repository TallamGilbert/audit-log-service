import { Request, Response } from "express";
import { auditService } from "../services/audit.service";
import { eventStore } from "../services/storage";

export class AuditController {
  /**
   * POST /events
   * Record a single audit event
   */
  createEvent(req: Request, res: Response): void {
    try {
      const event = auditService.recordEvent(req.body);

      res.status(201).json({
        ok: true,
        event,
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
   * GET /events/:id
   * Get a single event by ID
   */
  getEvent(req: Request, res: Response): void {
    // Fix: Ensure id is a string, not string[]
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const event = eventStore.getById(id);

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
      event,
    });
  }
}
