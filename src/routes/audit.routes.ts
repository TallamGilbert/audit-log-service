import { Router } from "express";
import { AuditController } from "../controllers/audit.controller";
import { validateBody } from "../middleware/validation";
import { eventSchema } from "../middleware/validation";

const router = Router();
const controller = new AuditController();

// POST /events - Record an event
router.post("/events", validateBody(eventSchema), controller.createEvent);

// GET /events/:id - Get a specific event
router.get("/events/:id", controller.getEvent);

// Note: No PUT, PATCH, or DELETE routes!
// This enforces REQ-007

export default router;
