import express from "express";
import cors from "cors";
import auditRoutes from "./routes/audit.routes";
import { db } from "./db";
import { auditEvents } from "./db/schema";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use(auditRoutes);

// Health check - now verifies database connection
app.get("/health", async (req, res) => {
  try {
    // Test database connection
    await db.select().from(auditEvents).limit(1);

    res.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

// Method not allowed handler
app.all("/events/:id", (req, res) => {
  if (["PUT", "PATCH", "DELETE"].includes(req.method)) {
    return res.status(405).json({
      ok: false,
      errors: [
        {
          field: null,
          message: `Method ${req.method} not allowed. Events are immutable and can only be created or read.`,
          code: "METHOD_NOT_ALLOWED",
        },
      ],
    });
  }
  // If it's GET, this shouldn't happen as it's handled by the route
  res.status(404).json({
    ok: false,
    errors: [
      {
        field: null,
        message: "Route not found.",
        code: "NOT_FOUND",
      },
    ],
  });
});

app.all("/events", (req, res) => {
  if (["PUT", "PATCH", "DELETE"].includes(req.method)) {
    return res.status(405).json({
      ok: false,
      errors: [
        {
          field: null,
          message: `Method ${req.method} not allowed. Events are immutable.`,
          code: "METHOD_NOT_ALLOWED",
        },
      ],
    });
  }
  // If it's POST, this shouldn't happen
  res.status(404).json({
    ok: false,
    errors: [
      {
        field: null,
        message: "Route not found.",
        code: "NOT_FOUND",
      },
    ],
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    errors: [
      {
        field: null,
        message: `Route ${req.method} ${req.path} not found.`,
        code: "NOT_FOUND",
      },
    ],
  });
});

export default app;
