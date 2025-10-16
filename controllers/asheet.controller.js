"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");
const { Op, Sequelize } = require("sequelize");
const XLSX = require("xlsx");

// Create / Upload ASheet (JSON data)
const createASheet = async (req, res) => {
  try {
    const dataArray = Array.isArray(req.body) ? req.body : [req.body];
    if (!dataArray.length) return ReE(res, "No data provided", 400);

    const insertedRecords = [];

    for (const data of dataArray) {
      // Determine userId
      const userId = data.userId ?? req.user?.id;
      if (!userId) return ReE(res, "userId is required", 400);

      // Check if user exists
      const userExists = await model.User.findByPk(userId);
      if (!userExists) return ReE(res, `User with id ${userId} does not exist`, 400);

      const payload = {
        sr: data.sr ?? null,
        sourcedFrom: data.sourcedFrom ?? null,
        sourcedBy: data.sourcedBy ?? null,
        dateOfConnect: data.dateOfConnect ?? null,
        businessName: data.businessName ?? null,
        contactPersonName: data.contactPersonName ?? null,
        mobileNumber: data.mobileNumber ? String(data.mobileNumber) : null,
        address: data.address ?? null,
        email: data.email ?? null,
        businessSector: data.businessSector ?? null,
        zone: data.zone ?? null,
        landmark: data.landmark ?? null,
        existingWebsite: data.existingWebsite ?? null,
        smmPresence: data.smmPresence ?? null,
        meetingStatus: data.meetingStatus ?? null,
        userId: userId,
      };

      // Insert into DB
      const record = await model.ASheet.create(payload);
      insertedRecords.push(record);
    }

    return ReS(res, { success: true, total: insertedRecords.length, data: insertedRecords }, 201);
  } catch (error) {
    console.error("ASheet Create Error:", error);
    return ReE(res, error.message, 500);
  }
};

module.exports.createASheet = createASheet;




// Update ASheet fields
const updateASheetFields = async (req, res) => {
  try {
    const record = await model.ASheet.findByPk(req.params.id);
    if (!record) return ReE(res, "ASheet record not found", 404);

    const allowedFields = [
      "sr", "sourcedFrom", "sourcedBy", "dateOfConnect", "businessName",
      "contactPersonName", "mobileNumber", "address", "email",
      "businessSector", "zone", "landmark", "existingWebsite",
      "smmPresence", "meetingStatus", "userId"
    ];

    const updates = {};
    for (const f of allowedFields) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }

    if (!Object.keys(updates).length) {
      return ReE(res, "No fields to update", 400);
    }

    await record.update(updates);
    return ReS(res, { success: true, data: record }, 200);
  } catch (error) {
    console.error("ASheet Update Error:", error);
    return ReE(res, error.message, 500);
  }
};
module.exports.updateASheetFields = updateASheetFields;

// Get all ASheets
// Get all ASheets
const getASheets = async (req, res) => {
  try {
    // Fetch all ASheet records, including null values
    const records = await model.ASheet.findAll({
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
        "createdAt",
        "updatedAt",
      ],
    });

    // Fetch active users
    const users = await model.User.findAll({
      where: { isDeleted: false }, // or isActive if you have that field
      attributes: ["id", "firstName", "lastName", "email"],
      raw: true,
    });

    // Add virtual 'name' field in JS and sort by it
    const usersWithName = users
      .map((u) => ({
        ...u,
        name: `${u.firstName} ${u.lastName}`.trim(),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return ReS(res, { success: true, data: records, users: usersWithName }, 200);
  } catch (error) {
    console.error("ASheet Fetch All Error:", error);
    return ReE(res, error.message, 500);
  }
};

module.exports.getASheets = getASheets;


// Get single ASheet
const getASheetById = async (req, res) => {
  try {
    const record = await model.ASheet.findByPk(req.params.id);
    if (!record) return ReE(res, "ASheet record not found", 404);
    return ReS(res, { success: true, data: record }, 200);
  } catch (error) {
    console.error("ASheet Fetch Single Error:", error);
    return ReE(res, error.message, 500);
  }
};
module.exports.getASheetById = getASheetById;

const deleteASheet = async (req, res) => {
  try {
    const record = await model.ASheet.findByPk(req.params.id);
    if (!record) return ReE(res, "ASheet record not found", 404);

    await record.destroy();
    return ReS(res, { success: true, message: "ASheet record deleted successfully" }, 200);
  } catch (error) {
    console.error("ASheet Delete Error:", error);
    return ReE(res, error.message, 500);
  }
};

module.exports.deleteASheet = deleteASheet;

const getindividualUserId = async (req, res) => {
  try {
    const userId = req.query.userId || req.params.userId;
    if (!userId) return ReE(res, "userId is required", 400);

    // Find the user
    const user = await model.User.findOne({
      where: { id: userId },
      attributes: ["id", "firstName", "lastName", "email", "mobileNumber"],
      raw: true,
    });

    if (!user) return ReE(res, "User not found", 404);

    // Combine firstName + lastName
    const userName = `${user.firstName} ${user.lastName}`.trim();

    // Find all ASheet rows where sourcedBy matches user's name
    const aSheetData = await model.ASheet.findAll({
      where: {
        sourcedBy: { [Op.iLike]: userName } // case-insensitive match
      },
      order: [["dateOfConnect", "ASC"]],
      raw: true,
    });

    return ReS(res, {
      success: true,
      userId: user.id,
      userName,
      totalRecords: aSheetData.length,
      data: aSheetData,
    });
  } catch (error) {
    console.error("Get ASheet By UserId Error:", error);
    return ReE(res, error.message, 500);
  }
};

module.exports.getindividualUserId = getindividualUserId;