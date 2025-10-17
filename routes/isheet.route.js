"use strict";
const express = require("express");
const router = express.Router();
const isheetController = require("../controllers/isheet.controller");

// 🔹 Get all rows where meetingStatus = 'C1 Scheduled'
router.get("/analysis", isheetController.fetchC1ScheduledDetails);
router.put("/update-followup/:id", isheetController.updateASheetFollowupFields);
router.get("/c1-scheduled/:userId", isheetController.getC1ScheduledByUser);
router.get("/c1status", isheetController.getAllC2Scheduled);
router.get("/c2status", isheetController.getAllC3Scheduled);

module.exports = router;