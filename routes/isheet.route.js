"use strict";
const express = require("express");
const router = express.Router();
const isheetController = require("../controllers/isheet.controller");

// 🔹 Get all rows where meetingStatus = 'C1 Scheduled'
router.get("/analysis", isheetController.fetchC1ScheduledDetails);

module.exports = router;