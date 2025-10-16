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