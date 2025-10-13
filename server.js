const express         = require("express");
const cors            = require("cors");
const compression     = require("compression");
const expressWinston  = require("express-winston");

const model           = require("./models/index");
const CONFIG          = require("./config/config");
const v1              = require("./routes/v1");
const logger          = require("./utils/logger.service");

const app = express();

// ────── GLOBAL MIDDLEWARE ────────────────────────────────────────────
// Body parsing
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Gzip compression
app.use(compression());

// CORS: fully permissive
app.use(cors({
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: "*",
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.options("*", cors());

// ────── DATABASE SYNC ────────────────────────────────────────────────
model.sequelize
  .sync()
  .then(() => logger.info("sequelize: Database Sync Success"))
  .catch(err => logger.error("sequelize: Database Sync Failed", err));

// ────── API ROUTES ───────────────────────────────────────────────────
app.use("/api/v1", v1);

// Health check
app.use("/api/healthz", async (req, res) => {
  try {
    const result = await model.sequelize.query(
      "SELECT 1+1 AS result",
      { type: model.sequelize.QueryTypes.SELECT }
    );
    return result[0].result === 2
      ? res.status(200).send("OK")
      : res.status(500).send("Database Error");
  } catch {
    return res.status(500).send("Database Error");
  }
});

// ────── LOGGING ─────────────────────────────────────────────────────
// Log requests (skip healthz)
app.use(
  expressWinston.logger({
    winstonInstance: logger,
    expressFormat: true,
    ignoreRoute: req => req.path === "/api/healthz"
  })
);

// Log errors
app.use(
  expressWinston.errorLogger({
    winstonInstance: logger,
    expressFormat: true
  })
);

// ────── START SERVER ────────────────────────────────────────────────
app.listen(CONFIG.port, () =>
  logger.info(`express: Listening on port ${CONFIG.port}`)
);

module.exports = app;
