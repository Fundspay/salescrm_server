"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");
const { Op, Sequelize } = require("sequelize");

const fetchC1ScheduledDetails = async (req, res) => {
  try {
    // Fetch all records where meetingStatus contains "C1 Scheduled"
    const c1ScheduledRows = await model.ASheet.findAll({
      where: {
        meetingStatus: { [Op.iLike]: "%C1 Scheduled%" },
      },
      order: [["dateOfConnect", "ASC"]],
      raw: true,
    });

    // Return the results
    return ReS(
      res,
      {
        success: true,
        totalC1Scheduled: c1ScheduledRows.length,
        data: c1ScheduledRows,
      },
      200
    );
  } catch (error) {
    console.error("fetchC1ScheduledDetails Error:", error);
    return ReE(res, error.message, 500);
  }
};

module.exports.fetchC1ScheduledDetails = fetchC1ScheduledDetails;

const updateASheetFollowupFields = async (req, res) => {
  try {
    const record = await model.ASheet.findByPk(req.params.id);
    if (!record) return ReE(res, "ASheet record not found", 404);

    const updateData = req.body;

    // ✅ Only allow updating the newly added fields (C1–C4)
    const allowedFields = [
      "dateOfC1Connect", "c1Status", "c1Comment",
      "dateOfC2Clarity", "c2Status", "c2Comment",
      "dateOfC3Clarity", "c3Status", "c3Comment",
      "dateOfC4Customer", "c4Status", "c4Comment"
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        updates[key] = updateData[key];
      }
    }

    if (!Object.keys(updates).length) {
      return ReE(res, "No valid follow-up fields provided for update", 400);
    }

    // ✅ Perform update
    await record.update(updates);

    return ReS(res, { success: true, message: "Follow-up fields updated successfully", data: record }, 200);
  } catch (error) {
    console.error("updateASheetFollowupFields Error:", error);
    return ReE(res, error.message, 500);
  }
};

module.exports.updateASheetFollowupFields = updateASheetFollowupFields;