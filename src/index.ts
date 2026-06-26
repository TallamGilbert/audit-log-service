import app from "./app";
import { config, validateConfig } from "./config";

// Validate configuration
validateConfig();

// Start server
app.listen(config.port, () => {
  console.log(`Audit Log Service running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Health check: http://localhost:${config.port}/health`);
  console.log(`POST events: http://localhost:${config.port}/events`);
});
