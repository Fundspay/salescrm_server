"use strict";
const express = require("express");
const router = express.Router();
const myTargetController = require("../controllers/mytarget.controller");

router.post("/add", myTargetController.handleTargets);
router.get("/fetch", myTargetController.fetchTargets);
router.get("/c1targets", myTargetController.fetchC1Target);

module.exports = router;
