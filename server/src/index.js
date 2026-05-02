import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import scenarioRouter from "./routes/scenario.js";

const PORT = Number(process.env.PORT || 3001);
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error(
    "[server] MONGODB_URI is not set. Copy .env.example to .env and fill it in."
  );
  process.exit(1);
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn(
    "[server] ANTHROPIC_API_KEY is not set. Agent calls will fail until you add it to .env."
  );
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/scenario", scenarioRouter);

app.use((err, _req, res, _next) => {
  console.error("[server] unhandled error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

async function start() {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: "disasterio" });
    console.log("[server] mongodb connected");
  } catch (err) {
    console.error("[server] mongodb connection failed:", err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
  });
}

start();
