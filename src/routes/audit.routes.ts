import { Router } from "express";
import { auditController } from "../controllers/audit.controller";
import { validateBody } from "../middleware/validation";
import { eventSchema } from "../middleware/validation";

const router = Router();

// POST /events - Record an event
router.post("/events", validateBody(eventSchema), (req, res) => {
  auditController.createEvent(req, res);
});

// GET /events - Query events (MUST be before /:id to avoid conflict)
router.get("/events", (req, res) => {
  auditController.queryEvents(req, res);
});

// GET /events/:id - Get a specific event
router.get("/events/:id", (req, res) => {
  auditController.getEvent(req, res);
});

// Note: No PUT, PATCH, or DELETE routes!

export default router;
