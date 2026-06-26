import express from "express";
import cors from "cors";
import auditRoutes from "./routes/audit.routes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use(auditRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Handle 405 Method Not Allowed for disallowed methods on event routes
app.all("/events/:id", (req, res, next) => {
  if (["PUT", "PATCH", "DELETE"].includes(req.method)) {
    return res.status(405).json({
      ok: false,
      errors: [
        {
          field: null,
          message:
            "Method not allowed. Events are immutable and can only be created or read.",
          code: "METHOD_NOT_ALLOWED",
        },
      ],
    });
  }
  next();
});

app.all("/events", (req, res, next) => {
  if (["PUT", "PATCH", "DELETE"].includes(req.method)) {
    return res.status(405).json({
      ok: false,
      errors: [
        {
          field: null,
          message: "Method not allowed. Events are immutable.",
          code: "METHOD_NOT_ALLOWED",
        },
      ],
    });
  }
  next();
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
