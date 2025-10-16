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

      // Duplicate check: only mobileNumber or email
      const whereClause = {};
      if (payload.mobileNumber) whereClause.mobileNumber = payload.mobileNumber;
      if (payload.email) whereClause.email = payload.email;

      let existing = null;
      if (Object.keys(whereClause).length) {
        existing = await model.ASheet.findOne({ where: whereClause });
      }

      if (existing) {
        // Skip duplicates
        continue;
      }

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

    // Determine userId (if updating userId)
    if (req.body.userId !== undefined) {
      const userExists = await model.User.findByPk(req.body.userId);
      if (!userExists) return ReE(res, `User with id ${req.body.userId} does not exist`, 400);
    }

    // Prepare payload with all fields from body, store nulls as null
    const payload = {
      sr: req.body.sr ?? null,
      sourcedFrom: req.body.sourcedFrom ?? null,
      sourcedBy: req.body.sourcedBy ?? null,
      dateOfConnect: req.body.dateOfConnect ?? null,
      businessName: req.body.businessName ?? null,
      contactPersonName: req.body.contactPersonName ?? null,
      mobileNumber: req.body.mobileNumber ? String(req.body.mobileNumber) : null,
      address: req.body.address ?? null,
      email: req.body.email ?? null,
      businessSector: req.body.businessSector ?? null,
      zone: req.body.zone ?? null,
      landmark: req.body.landmark ?? null,
      existingWebsite: req.body.existingWebsite ?? null,
      smmPresence: req.body.smmPresence ?? null,
      meetingStatus: req.body.meetingStatus ?? null,
      userId: req.body.userId ?? record.userId,
    };

    await record.update(payload);

    return ReS(res, { success: true, data: record }, 200);
  } catch (error) {
    console.error("ASheet Update Error:", error);
    return ReE(res, error.message, 500);
  }
};

module.exports.updateASheetFields = updateASheetFields;

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
      where: { isDeleted: false },
      attributes: ["id", "firstName", "lastName", "email"],
      raw: true,
    });

    // Add virtual 'name' field
    const usersWithName = users.map((u) => ({
      ...u,
      name: `${u.firstName} ${u.lastName}`.trim(),
    }));

    // Return response
    return ReS(
      res,
      {
        success: true,
        total: records.length,
        data: records,
        users: usersWithName,
      },
      200
    );
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
