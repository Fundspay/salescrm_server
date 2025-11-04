"use strict";
const express = require("express");
const router = express.Router();
const MSheetController = require("../controllers/msheet.controller");

// ✅ Create or update MSheet
router.post("/upsert", MSheetController.upsertMSheet);

router.put("/update/:id", MSheetController.updateMSheet);

// ✅ Fetch a single MSheet by ID
router.get("/:id", MSheetController.fetchMSheetById);

// ✅ Fetch all MSheets for a given user ID
router.get("/user/:userId", MSheetController.fetchMSheetsByUserId);

// ✅ Fetch all MSheets
router.get("/fetchall", MSheetController.fetchAllMSheets);

router.get("/individual/:userId", MSheetController.mgetMSheetsByUserId);

module.exports = router;
