"use strict";
const express = require("express");
const router = express.Router();
const asheetController = require("../controllers/asheet.controller");

router.post("/add", asheetController.createASheet);
router.put("/update/:id", asheetController.updateASheetFields);
router.get("/list", asheetController.getASheets);
router.get("/list/:id", asheetController.getASheetById);
router.delete("/asheet/:id", asheetController.deleteASheet);
router.get("/individual/:userId", asheetController.getindividualUserId);
router.get("/followup", asheetController.fetchFollowUpTarget);

module.exports = router;
