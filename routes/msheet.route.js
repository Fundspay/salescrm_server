"use strict";
const express = require("express");
const router = express.Router();
const MSheetController = require("../controllers/msheet.controller");

router.post("/upsert", MSheetController.upsertMSheet);

module.exports = router;
