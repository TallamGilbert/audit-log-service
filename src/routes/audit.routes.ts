import { Router } from "express";
import { auditController } from "../controllers/audit.controller";
import { validateBody } from "../middleware/validation";
import { eventSchema, bulkEventSchema } from "../middleware/validation";

const router = Router();

// POST /events/bulk - Record multiple events atomically
router.post("/events/bulk", validateBody(bulkEventSchema), (req, res) => {
  auditController.createBulkEvents(req, res);
});

// POST /events - Record a single event
router.post("/events", validateBody(eventSchema), (req, res) => {
  auditController.createEvent(req, res);
});

// GET /events - Query events
router.get("/events", (req, res) => {
  auditController.queryEvents(req, res);
});

// GET /events/:id/verify - Verify event integrity (MUST be before /:id)
router.get("/events/:id/verify", (req, res) => {
  auditController.verifyEvent(req, res);
});

// GET /events/:id - Get a specific event
router.get("/events/:id", (req, res) => {
  auditController.getEvent(req, res);
});

export default router;
