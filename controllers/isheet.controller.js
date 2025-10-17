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

const getC1ScheduledByUser = async (req, res) => {
  try {
    const userId = req.query.userId || req.params.userId;
    if (!userId) return ReE(res, "userId is required", 400);

    // Fetch the user safely
    let user;
    try {
      user = await model.User.findOne({
        where: { id: userId },
        attributes: ["id", "firstName", "lastName", "email", "mobileNumber"],
        raw: true,
      });
    } catch (err) {
      console.warn("⚠️ mobileNumber column missing in User table, skipping it...");
      user = await model.User.findOne({
        where: { id: userId },
        attributes: ["id", "firstName", "lastName", "email"],
        raw: true,
      });
    }

    if (!user) return ReE(res, "User not found", 404);

    const userName = `${user.firstName} ${user.lastName}`.trim();

    // Fetch ASheet records for that user where meetingStatus includes "C1 Scheduled"
    const aSheetData = await model.ASheet.findAll({
      where: {
        sourcedBy: { [Op.iLike]: userName },
        meetingStatus: { [Op.iLike]: "%C1 Scheduled%" }, // extra filter
      },
      order: [["dateOfConnect", "ASC"]],
      raw: true,
      attributes: [
        "id",
        "sr",
        "sourcedFrom",
        "sourcedBy",
        "dateOfConnect",
        "businessName",
        "contactPersonName",
        "mobileNumber",
        "address",
        "email",
        "businessSector",
        "zone",
        "landmark",
        "existingWebsite",
        "smmPresence",
        "meetingStatus",
        "userId",

        // 🔹 Newly added C1-C4 tracking fields
        "dateOfC1Connect",
        "c1Status",
        "c1Comment",
        "dateOfC2Clarity",
        "c2Status",
        "c2Comment",
        "dateOfC3Clarity",
        "c3Status",
        "c3Comment",
        "dateOfC4Customer",
        "c4Status",
        "c4Comment",

        "createdAt",
        "updatedAt",
      ],
    });

    // Fetch all registered users
    const allUsers = await model.User.findAll({
      where: { isDeleted: false },
      attributes: ["id", "firstName", "lastName", "email"],
      raw: true,
    });

    const allUsersWithName = allUsers.map(u => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      name: `${u.firstName} ${u.lastName}`.trim(),
    }));

    return ReS(res, {
      success: true,
      userId: user.id,
      userName,
      totalRecords: aSheetData.length,
      data: aSheetData,
      users: allUsersWithName,
    });
  } catch (error) {
    console.error("Get C1 Scheduled By User Error:", error);
    return ReE(res, error.message, 500);
  }
};

module.exports.getC1ScheduledByUser = getC1ScheduledByUser;

const getAllFollowUps = async (req, res) => {
  try {
    // 🔹 Fetch all ASheet records where any of c1–c4 status includes "Follow Up"
    const aSheetData = await model.ASheet.findAll({
      where: {
        [Op.or]: [
          { c1Status: { [Op.iLike]: "%Follow Up%" } },
          { c2Status: { [Op.iLike]: "%Follow Up%" } },
          { c3Status: { [Op.iLike]: "%Follow Up%" } },
          { c4Status: { [Op.iLike]: "%Follow Up%" } },
        ],
      },
      order: [["dateOfConnect", "ASC"]],
      raw: true,
      attributes: [
        "id",
        "sr",
        "sourcedFrom",
        "sourcedBy",
        "dateOfConnect",
        "businessName",
        "contactPersonName",
        "mobileNumber",
        "address",
        "email",
        "businessSector",
        "zone",
        "landmark",
        "existingWebsite",
        "smmPresence",
        "meetingStatus",
        "userId",

        // 🔹 C1–C4 tracking fields
        "dateOfC1Connect",
        "c1Status",
        "c1Comment",
        "dateOfC2Clarity",
        "c2Status",
        "c2Comment",
        "dateOfC3Clarity",
        "c3Status",
        "c3Comment",
        "dateOfC4Customer",
        "c4Status",
        "c4Comment",

        "createdAt",
        "updatedAt",
      ],
    });

    return ReS(res, {
      success: true,
      totalRecords: aSheetData.length,
      data: aSheetData,
    });
  } catch (error) {
    console.error("Get All Follow Ups Error:", error);
    return ReE(res, error.message, 500);
  }
};

module.exports.getAllFollowUps = getAllFollowUps;

const getAllNotintrested = async (req, res) => {
  try {
    // 🔹 Fetch all ASheet records where any of c1–c4 status includes "Follow Up"
    const aSheetData = await model.ASheet.findAll({
      where: {
        [Op.or]: [
          { c1Status: { [Op.iLike]: "%Not Intrested%" } },
          { c2Status: { [Op.iLike]: "%Not Intrested%" } },
          { c3Status: { [Op.iLike]: "%Not Intrested%" } },
          { c4Status: { [Op.iLike]: "%Not Intrested%" } },
        ],
      },
      order: [["dateOfConnect", "ASC"]],
      raw: true,
      attributes: [
        "id",
        "sr",
        "sourcedFrom",
        "sourcedBy",
        "dateOfConnect",
        "businessName",
        "contactPersonName",
        "mobileNumber",
        "address",
        "email",
        "businessSector",
        "zone",
        "landmark",
        "existingWebsite",
        "smmPresence",
        "meetingStatus",
        "userId",

        // 🔹 C1–C4 tracking fields
        "dateOfC1Connect",
        "c1Status",
        "c1Comment",
        "dateOfC2Clarity",
        "c2Status",
        "c2Comment",
        "dateOfC3Clarity",
        "c3Status",
        "c3Comment",
        "dateOfC4Customer",
        "c4Status",
        "c4Comment",

        "createdAt",
        "updatedAt",
      ],
    });

    return ReS(res, {
      success: true,
      totalRecords: aSheetData.length,
      data: aSheetData,
    });
  } catch (error) {
    console.error("Get All Follow Ups Error:", error);
    return ReE(res, error.message, 500);
  }
};

module.exports.getAllNotintrested = getAllNotintrested;